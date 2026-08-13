import { Router } from 'express';
import { newId } from '../lib/crypto.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { reminderStateSchema } from '../schemas.js';
import { CATEGORIES, categoryLabel } from '../engine/categories.js';
import { computeReadiness } from '../engine/readiness.js';
import { computeReminders } from '../engine/reminders.js';
import { computeTimeline } from '../engine/timeline.js';

/**
 * Everything the app derives rather than stores: the dashboard, readiness,
 * reminders, the life-journey timeline, and what other people have shared with
 * this user. All of it is recomputed per request from the documents and
 * members as they stand, so nothing here can go stale.
 */
export function overviewRoutes(ctx) {
  const { db, vault, access } = ctx;
  const router = Router();

  router.use(requireAuth);

  router.get('/categories', (req, res) => {
    const counts = db
      .prepare('SELECT category, COUNT(*) AS count FROM documents WHERE user_id = ? GROUP BY category')
      .all(req.user.id);
    const countByKey = new Map(counts.map((row) => [row.category, row.count]));
    const enabled = JSON.parse(
      db.prepare('SELECT categories_json AS c FROM users WHERE id = ?').get(req.user.id).c || '[]',
    );

    res.json({
      categories: CATEGORIES.map((category) => ({
        ...category,
        count: countByKey.get(category.key) ?? 0,
        enabled: enabled.length === 0 || enabled.includes(category.key),
      })),
    });
  });

  router.get('/dashboard', (req, res) => {
    const documents = vault.list(req.user.id, { limit: 200 });
    const members = access.listMembers(req.user.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const enabled = JSON.parse(user.categories_json || '[]');

    const readiness = computeReadiness({ documents, members, enabledCategories: enabled });
    const { reminders, counts } = computeReminders({
      documents,
      states: reminderStates(db, req.user.id),
    });

    // Requests are settled on read so a matured one is never shown as waiting.
    access.settleRequests(req.user.id);
    const openRequests = db
      .prepare(
        `SELECT r.id, r.status, r.unlock_at, r.initiated_at, m.name AS member_name
           FROM access_requests r JOIN members m ON m.id = r.member_id
          WHERE r.user_id = ? AND r.status = 'waiting'
          ORDER BY r.initiated_at DESC`,
      )
      .all(req.user.id);

    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();

    res.json({
      greeting: {
        name: user.name.split(' ')[0],
        headline: 'Your family’s important things are safe.',
      },
      stats: {
        documents: documents.length,
        addedThisWeek: documents.filter((d) => d.createdAt >= weekAgo).length,
        remindersPending: counts.total,
        activeMembers: members.filter((m) => m.status === 'active').length,
        activeTrustees: members.filter((m) => m.isTrustee && m.status === 'active').length,
        categoriesUsed: new Set(documents.map((d) => d.category)).size,
      },
      readiness,
      reminders: reminders.slice(0, 3),
      recentDocuments: documents.slice(0, 6).map((doc) => ({
        ...doc,
        categoryLabel: categoryLabel(doc.category),
      })),
      // The alert banner the owner sees when a trustee has started the protocol.
      openAccessRequests: openRequests.map((row) => ({
        id: row.id,
        memberName: row.member_name,
        unlockAt: row.unlock_at,
        initiatedAt: row.initiated_at,
      })),
    });
  });

  router.get('/reminders', (req, res) => {
    const documents = vault.list(req.user.id, { limit: 200 });
    const result = computeReminders({ documents, states: reminderStates(db, req.user.id) });
    res.json(result);
  });

  router.put('/reminders/:key', validateBody(reminderStateSchema), (req, res) => {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO reminder_states (id, user_id, reminder_key, state, snoozed_until, updated_at)
       VALUES (@id, @userId, @key, @state, @snoozedUntil, @now)
       ON CONFLICT (user_id, reminder_key) DO UPDATE SET
         state = excluded.state, snoozed_until = excluded.snoozed_until, updated_at = excluded.updated_at`,
    ).run({
      id: newId(),
      userId: req.user.id,
      key: req.params.key.slice(0, 120),
      state: req.body.state,
      snoozedUntil: req.body.snoozedUntil ?? null,
      now,
    });

    const documents = vault.list(req.user.id, { limit: 200 });
    res.json(computeReminders({ documents, states: reminderStates(db, req.user.id) }));
  });

  router.get('/timeline', (req, res) => {
    const documents = vault.list(req.user.id, { limit: 200 });
    res.json(computeTimeline(documents));
  });

  router.get('/readiness', (req, res) => {
    const documents = vault.list(req.user.id, { limit: 200 });
    const members = access.listMembers(req.user.id);
    const enabled = JSON.parse(
      db.prepare('SELECT categories_json AS c FROM users WHERE id = ?').get(req.user.id).c || '[]',
    );
    res.json(computeReadiness({ documents, members, enabledCategories: enabled }));
  });

  /** The other side of sharing: vaults and documents other people opened to me. */
  router.get('/shared-with-me', (req, res) => {
    const memberships = access.membershipsFor(req.user.id);

    const documents = memberships.flatMap((membership) => {
      const shared = db
        .prepare(
          `SELECT d.*, s.can_download
             FROM document_shares s JOIN documents d ON d.id = s.document_id
            WHERE s.member_id = ? AND s.revoked_at IS NULL
              AND (s.expires_at IS NULL OR s.expires_at > ?)`,
        )
        .all(membership.id, new Date().toISOString());

      const byCategory = db
        .prepare(
          `SELECT d.*, g.can_download
             FROM category_grants g JOIN documents d
               ON d.category = g.category AND d.user_id = g.user_id
            WHERE g.member_id = ?`,
        )
        .all(membership.id);

      const seen = new Set();
      return [...shared, ...byCategory]
        .filter((row) => (seen.has(row.id) ? false : seen.add(row.id)))
        .map((row) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          categoryLabel: categoryLabel(row.category),
          subject: row.subject,
          expiresOn: row.expires_on,
          canDownload: Boolean(row.can_download),
          ownerName: membership.ownerName ?? null,
          ownerId: row.user_id,
        }));
    });

    const pendingInvites = db
      .prepare(
        `SELECT m.id, m.name, m.relationship, m.is_trustee, m.invited_at, u.name AS owner_name
           FROM members m JOIN users u ON u.id = m.user_id
          WHERE m.linked_user_id = ? AND m.status = 'pending'`,
      )
      .all(req.user.id)
      .map((row) => ({
        memberId: row.id,
        ownerName: row.owner_name,
        isTrustee: Boolean(row.is_trustee),
        relationship: row.relationship,
        invitedAt: row.invited_at,
      }));

    res.json({ memberships, documents, pendingInvites });
  });

  return router;
}

function reminderStates(db, userId) {
  return db
    .prepare('SELECT reminder_key, state, snoozed_until FROM reminder_states WHERE user_id = ?')
    .all(userId)
    .map((row) => ({ reminderKey: row.reminder_key, state: row.state, snoozedUntil: row.snoozed_until }));
}
