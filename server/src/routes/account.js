import { Router } from 'express';
import { recordAudit, describeDevice } from '../lib/audit.js';
import { notFound } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { activityQuerySchema, onboardingSchema, securitySettingsSchema } from '../schemas.js';
import { publicUser } from './auth.js';

export function accountRoutes(ctx) {
  const { db, sessions, notifications } = ctx;
  const router = Router();

  router.use(requireAuth);

  /** Onboarding is a resumable patch, not a wizard the server has to remember. */
  router.patch('/onboarding', validateBody(onboardingSchema), (req, res) => {
    const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const next = {
      id: req.user.id,
      vaultProfile: req.body.vaultProfile ?? current.vault_profile,
      categories: JSON.stringify(req.body.categories ?? JSON.parse(current.categories_json || '[]')),
      step: req.body.step ?? current.onboarding_step,
      now: new Date().toISOString(),
    };

    db.prepare(
      `UPDATE users
          SET vault_profile = @vaultProfile, categories_json = @categories,
              onboarding_step = @step, updated_at = @now
        WHERE id = @id`,
    ).run(next);

    if (next.step === 'done' && current.onboarding_step !== 'done') {
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'account.onboarded',
        category: 'account',
        summary: 'Vault set up and ready',
        req,
      });
    }

    res.json({ user: publicUser(db, req.user.id) });
  });

  router.patch('/security', validateBody(securitySettingsSchema), (req, res) => {
    db.prepare('UPDATE users SET waiting_period_days = ?, updated_at = ? WHERE id = ?').run(
      req.body.waitingPeriodDays,
      new Date().toISOString(),
      req.user.id,
    );
    recordAudit(ctx, {
      userId: req.user.id,
      event: 'account.protocol_updated',
      category: 'security',
      summary: `Emergency waiting period set to ${req.body.waitingPeriodDays} days — requests already running keep their original period`,
      req,
    });
    res.json({ user: publicUser(db, req.user.id) });
  });

  /** The security panel beside the activity log. */
  router.get('/security-health', (req, res) => {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const active = sessions.listForUser(req.user.id);
    const lastLogin = db
      .prepare(
        `SELECT created_at, user_agent FROM audit_log
          WHERE user_id = ? AND event = 'auth.login' ORDER BY created_at DESC LIMIT 1 OFFSET 1`,
      )
      .get(req.user.id);
    const trustees = db
      .prepare("SELECT COUNT(*) AS count FROM members WHERE user_id = ? AND is_trustee = 1 AND status = 'active'")
      .get(req.user.id).count;
    const unusedRecoveryCodes = db
      .prepare('SELECT COUNT(*) AS count FROM recovery_codes WHERE user_id = ? AND used_at IS NULL')
      .get(req.user.id).count;

    res.json({
      health: {
        mfaEnabled: Boolean(user.mfa_enabled),
        mfaEnrolledAt: user.mfa_enrolled_at,
        unusedRecoveryCodes,
        activeSessions: active.length,
        activeTrustees: trustees,
        waitingPeriodDays: user.waiting_period_days,
        passwordChangedAt: user.password_changed_at,
        lastLogin: lastLogin
          ? { at: lastLogin.created_at, device: describeDevice(lastLogin.user_agent) }
          : null,
        encryption: {
          algorithm: 'AES-256-GCM',
          scope: 'Every document is encrypted with its own key before it touches disk.',
        },
      },
    });
  });

  router.get('/activity', validateQuery(activityQuerySchema), (req, res) => {
    const { category, limit, before } = req.validatedQuery;
    const rows = db
      .prepare(
        `SELECT * FROM audit_log
          WHERE user_id = @userId
            AND (@category IS NULL OR category = @category)
            AND (@before IS NULL OR created_at < @before)
          ORDER BY created_at DESC
          LIMIT @limit`,
      )
      .all({ userId: req.user.id, category: category ?? null, before: before ?? null, limit });

    res.json({
      entries: rows.map((row) => ({
        id: row.id,
        event: row.event,
        category: row.category,
        outcome: row.outcome,
        summary: row.summary,
        actor: row.actor_label ?? 'You',
        actorIsOwner: !row.actor_label,
        device: describeDevice(row.user_agent),
        ip: row.ip,
        at: row.created_at,
      })),
      nextCursor: rows.length === limit ? rows[rows.length - 1].created_at : null,
    });
  });

  router.get('/notifications', (req, res) => {
    res.json({
      notifications: notifications.listForUser(req.user.id).map((row) => ({
        id: row.id,
        channel: row.channel,
        subject: row.subject,
        body: row.body,
        delivery: row.delivery,
        requestId: row.request_id,
        readAt: row.read_at,
        at: row.created_at,
      })),
      // Said plainly rather than implied: nothing leaves this server.
      deliveryNotice:
        'No email or SMS transport is configured on this deployment, so notifications are recorded here rather than sent.',
    });
  });

  router.post('/notifications/:id/read', (req, res, next) => {
    try {
      const changed = notifications.markRead(req.user.id, req.params.id);
      if (!changed) throw notFound('No such notification.');
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/notifications/read-all', (req, res) => {
    res.json({ ok: true, read: notifications.markAllRead(req.user.id) });
  });

  return router;
}
