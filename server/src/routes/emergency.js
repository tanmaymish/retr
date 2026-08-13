import { Router } from 'express';
import { recordAudit } from '../lib/audit.js';
import { newId } from '../lib/crypto.js';
import { badRequest, forbidden, notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { emergencyRequestSchema } from '../schemas.js';
import { categoryLabel } from '../engine/categories.js';

const DAY = 86_400_000;

/**
 * The emergency access protocol.
 *
 * A trustee can ask; only time or the owner answers. Three things make that
 * safe rather than merely slow:
 *
 *  - a trustee cannot request anything for 14 days after accepting the role,
 *    so someone who compromises an invitation cannot use it immediately;
 *  - the waiting period is copied onto the request at initiation, so changing
 *    the setting afterwards cannot shorten a request already running;
 *  - the owner can deny at any point in the window, and every step is written
 *    to the activity log the owner reads.
 */
export function emergencyRoutes(ctx) {
  const { db, access, notifications, vault } = ctx;
  const router = Router();

  router.use(requireAuth);

  /** Vaults this user holds a trustee key for. */
  router.get('/trusteeships', (req, res) => {
    const rows = db
      .prepare(
        `SELECT m.*, u.name AS owner_name, u.email AS owner_email, u.waiting_period_days
           FROM members m JOIN users u ON u.id = m.user_id
          WHERE m.linked_user_id = ? AND m.is_trustee = 1 AND m.status = 'active'
          ORDER BY m.accepted_at`,
      )
      .all(req.user.id);

    const trusteeships = rows.map((row) => {
      const request = latestRequest(db, row.user_id, row.id);
      const settled = request ? access.maturedRequest(request) : null;
      const eligibleAt = row.accepted_at
        ? new Date(new Date(row.accepted_at).getTime() + row.waiting_period_days * DAY).toISOString()
        : null;

      return {
        memberId: row.id,
        ownerId: row.user_id,
        ownerName: row.owner_name,
        acceptedAt: row.accepted_at,
        waitingPeriodDays: row.waiting_period_days,
        categories: JSON.parse(row.trustee_categories_json || '[]').map((c) => ({
          key: c,
          label: categoryLabel(c),
        })),
        // The cooling-off window that follows accepting the role.
        eligibleAt,
        canInitiate: Boolean(eligibleAt && new Date(eligibleAt) <= new Date()) && !isOpen(settled),
        request: settled ? describeRequest(db, settled, notifications) : null,
      };
    });

    res.json({ trusteeships });
  });

  /** Requests against this user's own vault, with anything overdue settled first. */
  router.get('/requests', (req, res) => {
    access.settleRequests(req.user.id);
    const incoming = db
      .prepare(
        `SELECT r.*, m.name AS member_name, m.relationship
           FROM access_requests r JOIN members m ON m.id = r.member_id
          WHERE r.user_id = ? ORDER BY r.initiated_at DESC LIMIT 50`,
      )
      .all(req.user.id)
      .map((row) => ({
        ...describeRequest(db, row, notifications),
        memberName: row.member_name,
        relationship: row.relationship,
      }));

    res.json({ requests: incoming, openCount: incoming.filter((r) => r.status === 'waiting').length });
  });

  router.post('/requests', validateBody(emergencyRequestSchema), (req, res, next) => {
    try {
      const member = db
        .prepare(
          `SELECT m.*, u.waiting_period_days, u.name AS owner_name
             FROM members m JOIN users u ON u.id = m.user_id
            WHERE m.user_id = ? AND m.linked_user_id = ? AND m.is_trustee = 1 AND m.status = 'active'`,
        )
        .get(req.body.ownerId, req.user.id);
      if (!member) throw forbidden('You are not an active trustee for that vault.');

      const eligibleAt = new Date(
        new Date(member.accepted_at).getTime() + member.waiting_period_days * DAY,
      );
      if (eligibleAt > new Date()) {
        throw forbidden(
          `A trustee cannot start this protocol until ${member.waiting_period_days} days after accepting the role. That is ${eligibleAt.toISOString().slice(0, 10)}.`,
        );
      }

      const open = latestRequest(db, member.user_id, member.id);
      if (isOpen(open ? access.maturedRequest(open) : null)) {
        throw badRequest('You already have a request running on this vault.');
      }

      const now = new Date();
      const request = {
        id: newId(),
        user_id: member.user_id,
        member_id: member.id,
        reason: req.body.reason,
        confirmations_json: JSON.stringify(req.body.confirmations),
        waiting_period_days: member.waiting_period_days,
        initiated_at: now.toISOString(),
        unlock_at: new Date(now.getTime() + member.waiting_period_days * DAY).toISOString(),
      };

      db.prepare(
        `INSERT INTO access_requests
           (id, user_id, member_id, status, reason, confirmations_json, waiting_period_days, initiated_at, unlock_at)
         VALUES
           (@id, @user_id, @member_id, 'waiting', @reason, @confirmations_json, @waiting_period_days, @initiated_at, @unlock_at)`,
      ).run(request);

      // The protocol promises continuous notification; this is where that is
      // recorded, on every channel, at initiation.
      notifications.broadcast({
        userId: member.user_id,
        requestId: request.id,
        subject: 'Emergency access requested on your vault',
        body: `${member.name} has started the emergency access protocol. If you are safe, deny this request. Access opens automatically on ${request.unlock_at.slice(0, 10)} unless you act.`,
      });

      recordAudit(ctx, {
        userId: member.user_id,
        actorLabel: member.name,
        event: 'emergency.initiated',
        category: 'trustees',
        summary: `${member.name} initiated emergency access — ${member.waiting_period_days}-day waiting period started`,
        req,
        meta: { requestId: request.id },
      });

      res.status(201).json({
        request: describeRequest(db, { ...request, status: 'waiting' }, notifications),
      });
    } catch (err) {
      next(err);
    }
  });

  /** The owner's answer: "I am safe." Immediate, and it closes the request. */
  router.post('/requests/:id/deny', (req, res, next) => {
    try {
      const row = db
        .prepare('SELECT * FROM access_requests WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);
      if (!row) throw notFound('No such request.');
      if (row.status !== 'waiting') throw badRequest(`This request is already ${row.status}.`);

      const now = new Date().toISOString();
      db.prepare(
        "UPDATE access_requests SET status = 'denied', resolved_at = ?, resolved_by = 'owner' WHERE id = ?",
      ).run(now, row.id);

      const member = db.prepare('SELECT * FROM members WHERE id = ?').get(row.member_id);
      if (member?.linked_user_id) {
        notifications.record({
          userId: member.linked_user_id,
          requestId: row.id,
          channel: 'in_app',
          subject: 'Emergency access denied',
          body: `${req.user.name} confirmed they are safe. The request has been closed.`,
        });
      }
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'emergency.denied',
        category: 'trustees',
        summary: 'Emergency access denied — you confirmed you are safe',
        req,
        meta: { requestId: row.id },
      });

      res.json({ request: describeRequest(db, { ...row, status: 'denied', resolved_at: now }, notifications) });
    } catch (err) {
      next(err);
    }
  });

  /** The trustee withdrawing their own request. */
  router.post('/requests/:id/cancel', (req, res, next) => {
    try {
      const row = db
        .prepare(
          `SELECT r.*, m.linked_user_id, m.name AS member_name
             FROM access_requests r JOIN members m ON m.id = r.member_id
            WHERE r.id = ?`,
        )
        .get(req.params.id);
      if (!row || row.linked_user_id !== req.user.id) throw notFound('No such request.');
      if (row.status !== 'waiting') throw badRequest(`This request is already ${row.status}.`);

      const now = new Date().toISOString();
      db.prepare(
        "UPDATE access_requests SET status = 'cancelled', resolved_at = ?, resolved_by = 'trustee' WHERE id = ?",
      ).run(now, row.id);

      notifications.record({
        userId: row.user_id,
        requestId: row.id,
        channel: 'in_app',
        subject: 'Emergency access request withdrawn',
        body: `${row.member_name} cancelled the emergency access request on your vault.`,
      });
      recordAudit(ctx, {
        userId: row.user_id,
        actorLabel: row.member_name,
        event: 'emergency.cancelled',
        category: 'trustees',
        summary: `${row.member_name} withdrew the emergency access request`,
        req,
        meta: { requestId: row.id },
      });

      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.get('/requests/:id', (req, res, next) => {
    try {
      const row = db
        .prepare(
          `SELECT r.*, m.linked_user_id, m.name AS member_name, u.name AS owner_name
             FROM access_requests r
             JOIN members m ON m.id = r.member_id
             JOIN users u ON u.id = r.user_id
            WHERE r.id = ?`,
        )
        .get(req.params.id);
      if (!row) throw notFound('No such request.');
      if (row.user_id !== req.user.id && row.linked_user_id !== req.user.id) {
        throw notFound('No such request.');
      }

      const settled = access.maturedRequest(row);
      res.json({
        request: {
          ...describeRequest(db, settled, notifications),
          memberName: row.member_name,
          ownerName: row.owner_name,
          viewerRole: row.user_id === req.user.id ? 'owner' : 'trustee',
        },
      });
    } catch (err) {
      next(err);
    }
  });

  /** What a trustee can actually open once the protocol has completed. */
  router.get('/requests/:id/documents', (req, res, next) => {
    try {
      const row = db
        .prepare(
          `SELECT r.*, m.linked_user_id, m.trustee_categories_json
             FROM access_requests r JOIN members m ON m.id = r.member_id
            WHERE r.id = ?`,
        )
        .get(req.params.id);
      if (!row || row.linked_user_id !== req.user.id) throw notFound('No such request.');

      const settled = access.maturedRequest(row);
      if (settled.status !== 'granted') {
        throw forbidden(
          settled.status === 'waiting'
            ? 'The waiting period has not finished. The vault stays encrypted until it does.'
            : `This request was ${settled.status}.`,
        );
      }

      const categories = JSON.parse(row.trustee_categories_json || '[]');
      const documents = vault
        .list(row.user_id, { limit: 200 })
        .filter((doc) => categories.includes(doc.category));

      recordAudit(ctx, {
        userId: row.user_id,
        actorLabel: req.user.name,
        event: 'emergency.vault_listed',
        category: 'trustees',
        summary: `${req.user.name} opened the vault under emergency access`,
        req,
        meta: { requestId: row.id, documents: documents.length },
      });

      res.json({
        documents: documents.map((doc) => ({ ...doc, categoryLabel: categoryLabel(doc.category) })),
        accessExpiresAt: settled.access_expires_at,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function latestRequest(db, ownerId, memberId) {
  return db
    .prepare(
      `SELECT * FROM access_requests WHERE user_id = ? AND member_id = ?
        ORDER BY initiated_at DESC LIMIT 1`,
    )
    .get(ownerId, memberId);
}

const isOpen = (request) => Boolean(request) && (request.status === 'waiting' || request.status === 'granted');

function describeRequest(db, row, notifications) {
  const unlockAt = new Date(row.unlock_at);
  const msRemaining = Math.max(0, unlockAt.getTime() - Date.now());

  return {
    id: row.id,
    status: row.status,
    reason: row.reason,
    waitingPeriodDays: row.waiting_period_days,
    initiatedAt: row.initiated_at,
    unlockAt: row.unlock_at,
    resolvedAt: row.resolved_at ?? null,
    resolvedBy: row.resolved_by ?? null,
    accessExpiresAt: row.access_expires_at ?? null,
    msRemaining: row.status === 'waiting' ? msRemaining : 0,
    remaining:
      row.status === 'waiting'
        ? {
            days: Math.floor(msRemaining / DAY),
            hours: Math.floor((msRemaining % DAY) / 3_600_000),
            minutes: Math.floor((msRemaining % 3_600_000) / 60_000),
          }
        : null,
    notificationCount: notifications.countForRequest(row.id),
    confirmations: JSON.parse(row.confirmations_json || '[]'),
  };
}
