import { Router } from 'express';
import { recordAudit } from '../lib/audit.js';
import { newId } from '../lib/crypto.js';
import { badRequest, conflict, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { acceptInviteSchema, grantSchema, memberPatchSchema, memberSchema } from '../schemas.js';
import { categoryLabel } from '../engine/categories.js';
import { mapMember } from '../services/access.js';

export function familyRoutes(ctx) {
  const { db, access, notifications } = ctx;
  const router = Router();

  router.use(requireAuth);

  router.get('/', (req, res) => {
    const members = access.listMembers(req.user.id).map((member) => decorate(db, member));
    res.json({
      members,
      summary: {
        active: members.filter((m) => m.status === 'active').length,
        pending: members.filter((m) => m.status === 'pending').length,
        trustees: members.filter((m) => m.isTrustee && m.status === 'active').length,
      },
    });
  });

  router.post('/', validateBody(memberSchema), (req, res, next) => {
    try {
      const { name, email, relationship, isTrustee, trusteeCategories, message } = req.body;
      const normalized = email.toLowerCase();

      if (normalized === req.user.email.toLowerCase()) {
        throw badRequest('That is your own address — you already have the vault.');
      }
      const existing = db
        .prepare('SELECT id, status FROM members WHERE user_id = ? AND email_normalized = ?')
        .get(req.user.id, normalized);
      if (existing && existing.status !== 'revoked') {
        throw conflict('That person is already on your family list.');
      }

      const now = new Date().toISOString();
      const id = existing?.id ?? newId();

      if (existing) {
        db.prepare(
          `UPDATE members
              SET name = @name, relationship = @relationship, is_trustee = @isTrustee,
                  trustee_categories_json = @categories, status = 'pending', message = @message,
                  invited_at = @now, revoked_at = NULL, accepted_at = NULL, updated_at = @now
            WHERE id = @id`,
        ).run({
          id, name, relationship,
          isTrustee: isTrustee ? 1 : 0,
          categories: JSON.stringify(trusteeCategories),
          message: message ?? null,
          now,
        });
      } else {
        db.prepare(
          `INSERT INTO members
             (id, user_id, name, email, email_normalized, relationship, is_trustee,
              trustee_categories_json, status, message, invited_at, created_at, updated_at)
           VALUES
             (@id, @userId, @name, @email, @normalized, @relationship, @isTrustee,
              @categories, 'pending', @message, @now, @now, @now)`,
        ).run({
          id,
          userId: req.user.id,
          name,
          email,
          normalized,
          relationship,
          isTrustee: isTrustee ? 1 : 0,
          categories: JSON.stringify(trusteeCategories),
          message: message ?? null,
          now,
        });
      }

      // If the invitee already has an account, attach it now so the invitation
      // appears the next time they sign in.
      const invitee = db.prepare('SELECT id FROM users WHERE email_normalized = ?').get(normalized);
      if (invitee) {
        db.prepare('UPDATE members SET linked_user_id = ? WHERE id = ?').run(invitee.id, id);
        notifications.record({
          userId: invitee.id,
          channel: 'in_app',
          subject: isTrustee ? 'You have been designated as a trustee' : 'You have been invited to a family vault',
          body: `${req.user.name} has invited you${isTrustee ? ' to act as a trustee' : ''}. Open your invitations to respond.`,
        });
      }

      const token = access.issueInviteToken(id);
      recordAudit(ctx, {
        userId: req.user.id,
        event: isTrustee ? 'trustee.invited' : 'member.invited',
        category: 'trustees',
        summary: `${isTrustee ? 'Trustee' : 'Family member'} invited: ${name} (${relationship.replace('_', ' ')})`,
        req,
        meta: { memberId: id },
      });

      res.status(201).json({
        member: decorate(db, access.getMember(req.user.id, id)),
        // Shown to the owner once. No email transport is configured on this
        // deployment, so the owner passes the link on themselves.
        inviteToken: token,
        inviteDelivery: 'manual',
        inviteNotice:
          'No email is sent from this deployment. Copy this link and give it to them yourself — it works once, for them, and expires in 30 days.',
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', validateBody(memberPatchSchema), (req, res, next) => {
    try {
      const member = access.getMember(req.user.id, req.params.id);
      if (!member) throw notFound('That person is not on your family list.');

      const next_ = {
        id: member.id,
        userId: req.user.id,
        name: req.body.name ?? member.name,
        relationship: req.body.relationship ?? member.relationship,
        isTrustee: (req.body.isTrustee ?? member.isTrustee) ? 1 : 0,
        categories: JSON.stringify(req.body.trusteeCategories ?? member.trusteeCategories),
        now: new Date().toISOString(),
      };
      db.prepare(
        `UPDATE members
            SET name = @name, relationship = @relationship, is_trustee = @isTrustee,
                trustee_categories_json = @categories, updated_at = @now
          WHERE id = @id AND user_id = @userId`,
      ).run(next_);

      recordAudit(ctx, {
        userId: req.user.id,
        event: 'member.updated',
        category: 'trustees',
        summary: `Updated access settings for ${next_.name}`,
        req,
        meta: { memberId: member.id },
      });
      res.json({ member: decorate(db, access.getMember(req.user.id, member.id)) });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', (req, res, next) => {
    try {
      const member = access.getMember(req.user.id, req.params.id);
      if (!member) throw notFound('That person is not on your family list.');

      const now = new Date().toISOString();
      const revoke = db.transaction(() => {
        db.prepare(
          "UPDATE members SET status = 'revoked', revoked_at = @now, invite_token_hash = NULL, updated_at = @now WHERE id = @id",
        ).run({ id: member.id, now });
        db.prepare('UPDATE document_shares SET revoked_at = @now WHERE member_id = @id AND revoked_at IS NULL').run({
          id: member.id,
          now,
        });
        db.prepare('DELETE FROM category_grants WHERE member_id = ?').run(member.id);
        // A revoked trustee cannot hold a live emergency request.
        db.prepare(
          `UPDATE access_requests SET status = 'cancelled', resolved_at = @now, resolved_by = 'owner'
            WHERE member_id = @id AND status = 'waiting'`,
        ).run({ id: member.id, now });
      });
      revoke();

      recordAudit(ctx, {
        userId: req.user.id,
        event: 'member.revoked',
        category: 'sharing',
        summary: `Access removed for ${member.name} — every share and grant revoked`,
        req,
        meta: { memberId: member.id },
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/resend', (req, res, next) => {
    try {
      const member = access.getMember(req.user.id, req.params.id);
      if (!member) throw notFound('That person is not on your family list.');
      if (member.status === 'active') throw badRequest('They have already accepted.');

      const token = access.issueInviteToken(member.id);
      db.prepare("UPDATE members SET status = 'pending', invited_at = ?, updated_at = ? WHERE id = ?").run(
        new Date().toISOString(),
        new Date().toISOString(),
        member.id,
      );
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'member.invite_resent',
        category: 'trustees',
        summary: `New invitation link issued for ${member.name} — the previous link stopped working`,
        req,
      });
      res.json({ inviteToken: token });
    } catch (err) {
      next(err);
    }
  });

  /** Replaces the member's standing category access in one call. */
  router.put('/:id/grants', validateBody(grantSchema), (req, res, next) => {
    try {
      const member = access.getMember(req.user.id, req.params.id);
      if (!member) throw notFound('That person is not on your family list.');

      const now = new Date().toISOString();
      const apply = db.transaction(() => {
        db.prepare('DELETE FROM category_grants WHERE member_id = ?').run(member.id);
        const insert = db.prepare(
          `INSERT INTO category_grants (id, user_id, member_id, category, can_download, granted_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
        );
        for (const entry of req.body.categories) {
          insert.run(newId(), req.user.id, member.id, entry.category, entry.canDownload ? 1 : 0, now);
        }
      });
      apply();

      recordAudit(ctx, {
        userId: req.user.id,
        event: 'share.categories_updated',
        category: 'sharing',
        summary: req.body.categories.length
          ? `${member.name} can now see ${req.body.categories.map((c) => categoryLabel(c.category)).join(', ')}`
          : `${member.name}'s standing access removed`,
        req,
        meta: { memberId: member.id },
      });

      res.json({ member: decorate(db, access.getMember(req.user.id, member.id)) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

/**
 * Invitation handling. The preview is public — the token is the only secret —
 * but accepting requires being signed in, so an invitation always binds to a
 * real account rather than to whoever holds the link.
 */
export function inviteRoutes(ctx) {
  const { db, access, notifications } = ctx;
  const router = Router();

  router.get('/:token', (req, res, next) => {
    try {
      const member = access.findByInviteToken(req.params.token);
      if (!member) throw notFound('This invitation has expired or has already been used.');

      res.json({
        invite: {
          memberId: member.id,
          name: member.name,
          email: member.email,
          relationship: member.relationship,
          isTrustee: member.isTrustee,
          status: member.status,
          message: member.message,
          ownerName: member.ownerName,
          trusteeCategories: member.trusteeCategories.map((c) => ({ key: c, label: categoryLabel(c) })),
          waitingPeriodDays: db
            .prepare('SELECT waiting_period_days AS days FROM users WHERE id = ?')
            .get(member.ownerId).days,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/accept', requireAuth, validateBody(acceptInviteSchema), (req, res, next) => {
    try {
      const member = access.findByInviteToken(req.body.token);
      if (!member) throw notFound('This invitation has expired or has already been used.');
      if (member.status === 'active') throw conflict('You have already accepted this invitation.');
      if (member.ownerId === req.user.id) throw badRequest('You cannot accept your own invitation.');

      const now = new Date().toISOString();
      db.prepare(
        `UPDATE members
            SET status = 'active', accepted_at = @now, linked_user_id = @userId,
                invite_token_hash = NULL, last_active_at = @now, updated_at = @now
          WHERE id = @id`,
      ).run({ id: member.id, userId: req.user.id, now });

      notifications.record({
        userId: member.ownerId,
        channel: 'in_app',
        subject: `${member.name} accepted`,
        body: `${member.name} accepted your ${member.isTrustee ? 'trustee designation' : 'family invitation'}.`,
      });
      recordAudit(ctx, {
        userId: member.ownerId,
        actorLabel: req.user.name,
        event: member.isTrustee ? 'trustee.accepted' : 'member.accepted',
        category: 'trustees',
        summary: `${member.name} accepted the ${member.isTrustee ? 'trustee role' : 'family invitation'}`,
        req,
        meta: { memberId: member.id },
      });

      res.json({ ok: true, membership: describeMembership(db, member.id) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/decline', requireAuth, validateBody(acceptInviteSchema), (req, res, next) => {
    try {
      const member = access.findByInviteToken(req.body.token);
      if (!member) throw notFound('This invitation has expired or has already been used.');

      const now = new Date().toISOString();
      db.prepare(
        "UPDATE members SET status = 'declined', invite_token_hash = NULL, updated_at = @now WHERE id = @id",
      ).run({ id: member.id, now });

      notifications.record({
        userId: member.ownerId,
        channel: 'in_app',
        subject: `${member.name} declined`,
        body: `${member.name} declined your ${member.isTrustee ? 'trustee designation' : 'family invitation'}.`,
      });
      recordAudit(ctx, {
        userId: member.ownerId,
        actorLabel: req.user.name,
        event: 'member.declined',
        category: 'trustees',
        summary: `${member.name} declined the invitation`,
        req,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function decorate(db, member) {
  if (!member) return null;
  const grants = db
    .prepare('SELECT category, can_download FROM category_grants WHERE member_id = ?')
    .all(member.id)
    .map((row) => ({
      category: row.category,
      label: categoryLabel(row.category),
      canDownload: Boolean(row.can_download),
    }));

  const documentShares = db
    .prepare('SELECT COUNT(*) AS count FROM document_shares WHERE member_id = ? AND revoked_at IS NULL')
    .get(member.id).count;

  return {
    ...member,
    grants,
    documentShares,
    trusteeCategoryLabels: member.trusteeCategories.map((c) => categoryLabel(c)),
    hasAccount: Boolean(member.linkedUserId),
  };
}

function describeMembership(db, memberId) {
  const row = db
    .prepare(
      `SELECT m.*, u.name AS owner_name FROM members m JOIN users u ON u.id = m.user_id WHERE m.id = ?`,
    )
    .get(memberId);
  return row ? { ...mapMember(row), ownerName: row.owner_name } : null;
}
