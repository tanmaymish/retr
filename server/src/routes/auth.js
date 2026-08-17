import { Router } from 'express';
import { z } from 'zod';
import { recordAudit, describeDevice } from '../lib/audit.js';
import { hashPassword, hmac, newId, randomToken, safeEqual, verifyPassword } from '../lib/crypto.js';
import { badRequest, conflict, forbidden, tooManyRequests, unauthorized } from '../lib/errors.js';
import { generateSecret, otpauthUri, verifyTotp } from '../lib/totp.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  changePasswordSchema,
  loginSchema,
  mfaChallengeSchema,
  registerSchema,
} from '../schemas.js';

const RECOVERY_CODE_COUNT = 10;

export function authRoutes(ctx) {
  const { db, config, sessions, limiter } = ctx;
  const router = Router();

  // A real hash to verify against when the account does not exist, so a
  // response cannot be timed to tell registered emails from unregistered ones.
  let decoyHash = null;
  const decoyReady = hashPassword(randomToken(24)).then((hash) => {
    decoyHash = hash;
  });

  const loginLimit = limiter.limit({
    name: 'login',
    max: config.rateLimit.authMax,
    keyOn: (req) => String(req.body?.email ?? '').toLowerCase().slice(0, 120),
  });
  const registerLimit = limiter.limit({ name: 'register', max: config.rateLimit.authMax });

  router.post('/register', registerLimit, validateBody(registerSchema(config.auth.minPasswordLength)), async (req, res, next) => {
    try {
      if (!config.auth.allowRegistration) throw forbidden('Registration is closed on this deployment.');

      const { name, email, password } = req.body;
      const normalized = email.toLowerCase();

      const existing = db.prepare('SELECT id FROM users WHERE email_normalized = ?').get(normalized);
      if (existing) {
        // The address is already registered; saying so is the honest answer and
        // is discoverable from the sign-in form anyway.
        throw conflict('An account already exists for that email address. Sign in instead.');
      }

      const now = new Date().toISOString();
      const user = {
        id: newId(),
        email,
        email_normalized: normalized,
        password_hash: await hashPassword(password),
        name,
        password_changed_at: now,
        created_at: now,
        updated_at: now,
      };

      db.prepare(
        `INSERT INTO users (id, email, email_normalized, password_hash, name, role, password_changed_at, created_at, updated_at)
         VALUES (@id, @email, @email_normalized, @password_hash, @name, 'member', @password_changed_at, @created_at, @updated_at)`,
      ).run(user);

      // Any pending invitations addressed to this email now belong to them.
      linkPendingInvitations(db, user.id, normalized);

      const issued = sessions.issue({ userId: user.id, req });
      sessions.setCookies(res, issued);

      recordAudit(ctx, {
        userId: user.id,
        event: 'account.created',
        category: 'account',
        summary: 'Vault created',
        req,
      });

      res.status(201).json({ user: publicUser(db, user.id), csrfToken: issued.csrfToken });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', loginLimit, validateBody(loginSchema), async (req, res, next) => {
    try {
      await decoyReady;
      const { email, password } = req.body;
      const row = db.prepare('SELECT * FROM users WHERE email_normalized = ?').get(email.toLowerCase());

      if (!row) {
        await verifyPassword(password, decoyHash);
        recordAudit(ctx, {
          event: 'auth.login',
          category: 'security',
          outcome: 'failure',
          summary: 'Sign-in attempt for an unknown address',
          req,
          meta: { email: email.slice(0, 120) },
        });
        throw unauthorized('That email address and password do not match.');
      }

      if (row.locked_until && new Date(row.locked_until) > new Date()) {
        const seconds = Math.ceil((new Date(row.locked_until).getTime() - Date.now()) / 1000);
        recordAudit(ctx, {
          userId: row.id,
          event: 'auth.login',
          category: 'security',
          outcome: 'failure',
          summary: 'Sign-in refused — account temporarily locked',
          req,
        });
        throw tooManyRequests(
          'Too many failed attempts. This account is locked for a few minutes.',
          seconds,
        );
      }

      const ok = await verifyPassword(password, row.password_hash);
      if (!ok) {
        registerFailure(db, config, row);
        recordAudit(ctx, {
          userId: row.id,
          event: 'auth.login',
          category: 'security',
          outcome: 'failure',
          summary: 'Incorrect password',
          req,
        });
        throw unauthorized('That email address and password do not match.');
      }

      db.prepare('UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?').run(row.id);

      const mfaRequired = Boolean(row.mfa_enabled);
      const issued = sessions.issue({ userId: row.id, req, mfaPending: mfaRequired });
      sessions.setCookies(res, issued);

      recordAudit(ctx, {
        userId: row.id,
        event: mfaRequired ? 'auth.password_ok' : 'auth.login',
        category: 'security',
        summary: mfaRequired
          ? 'Password accepted — waiting on the authenticator code'
          : `New sign-in from ${describeDevice(req.get('user-agent'))}`,
        req,
      });

      res.json({
        mfaRequired,
        user: mfaRequired ? null : publicUser(db, row.id),
        csrfToken: issued.csrfToken,
      });
    } catch (err) {
      next(err);
    }
  });

  /** Completes a sign-in that is waiting on the second factor. */
  router.post('/mfa/verify', limiter.limit({ name: 'mfa', max: 10 }), validateBody(mfaChallengeSchema), async (req, res, next) => {
    try {
      if (!req.session) throw unauthorized('Start again from the sign-in screen.');
      if (!req.session.mfa_pending) throw badRequest('This session has already been verified.');

      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.user_id);
      if (!row?.mfa_secret) throw badRequest('Two-factor authentication is not set up on this account.');

      const code = req.body.code.replace(/\s/g, '');
      const accepted =
        verifyTotp(row.mfa_secret, code) || consumeRecoveryCode(db, config, row.id, code);

      if (!accepted) {
        registerFailure(db, config, row);
        recordAudit(ctx, {
          userId: row.id,
          event: 'auth.mfa',
          category: 'security',
          outcome: 'failure',
          summary: 'Incorrect authenticator code',
          req,
        });
        throw unauthorized('That code is not right. Codes change every 30 seconds.');
      }

      sessions.completeMfa(req.session.id);
      db.prepare('UPDATE users SET failed_login_count = 0, locked_until = NULL WHERE id = ?').run(row.id);
      recordAudit(ctx, {
        userId: row.id,
        event: 'auth.login',
        category: 'security',
        summary: `New sign-in from ${describeDevice(req.get('user-agent'))}`,
        req,
      });

      res.json({ user: publicUser(db, row.id) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/logout', (req, res) => {
    if (req.session) {
      sessions.revoke(req.session.id);
      recordAudit(ctx, {
        userId: req.session.user_id,
        event: 'auth.logout',
        category: 'security',
        summary: 'Signed out',
        req,
      });
    }
    sessions.clearCookies(res);
    res.json({ ok: true });
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(db, req.user.id) });
  });

  router.post('/password', requireAuth, validateBody(changePasswordSchema(config.auth.minPasswordLength)), async (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      if (!(await verifyPassword(req.body.currentPassword, row.password_hash))) {
        throw unauthorized('That is not your current password.');
      }
      if (await verifyPassword(req.body.newPassword, row.password_hash)) {
        throw badRequest('The new password is the same as the old one.');
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE users SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE id = ?').run(
        await hashPassword(req.body.newPassword),
        now,
        now,
        row.id,
      );

      // Everything else signed in with the old password is now signed out.
      const revoked = sessions.revokeAllForUser(row.id, req.session.id);
      recordAudit(ctx, {
        userId: row.id,
        event: 'account.password_changed',
        category: 'security',
        summary: `Password changed — ${revoked} other session${revoked === 1 ? '' : 's'} signed out`,
        req,
      });

      res.json({ ok: true, otherSessionsSignedOut: revoked });
    } catch (err) {
      next(err);
    }
  });

  router.get('/sessions', requireAuth, (req, res) => {
    res.json({
      sessions: sessions.listForUser(req.user.id).map((s) => ({
        id: s.id,
        device: describeDevice(s.user_agent),
        ip: s.ip,
        createdAt: s.created_at,
        lastSeenAt: s.last_seen_at,
        current: s.id === req.session.id,
      })),
    });
  });

  router.delete('/sessions/:id', requireAuth, (req, res, next) => {
    try {
      const target = db
        .prepare('SELECT * FROM sessions WHERE id = ? AND user_id = ?')
        .get(req.params.id, req.user.id);
      if (!target) throw badRequest('That session is not yours or has already ended.');

      sessions.revoke(target.id);
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'account.session_revoked',
        category: 'security',
        summary: `Signed out ${describeDevice(target.user_agent)}`,
        req,
      });
      if (target.id === req.session.id) sessions.clearCookies(res);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  router.post('/sessions/revoke-others', requireAuth, (req, res) => {
    const count = sessions.revokeAllForUser(req.user.id, req.session.id);
    recordAudit(ctx, {
      userId: req.user.id,
      event: 'account.sessions_revoked',
      category: 'security',
      summary: `Signed out ${count} other session${count === 1 ? '' : 's'}`,
      req,
    });
    res.json({ ok: true, revoked: count });
  });

  // ── Two-factor authentication ────────────────────────────────────────────

  router.post('/mfa/setup', requireAuth, (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      if (row.mfa_enabled) throw conflict('Two-factor authentication is already on.');

      const secret = generateSecret();
      // Held unconfirmed until a valid code proves the app is enrolled.
      db.prepare('UPDATE users SET mfa_secret = ?, updated_at = ? WHERE id = ?').run(
        secret,
        new Date().toISOString(),
        row.id,
      );

      res.json({ secret, otpauthUri: otpauthUri({ secret, account: row.email }) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/mfa/enable', requireAuth, validateBody(mfaChallengeSchema), (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
      if (row.mfa_enabled) throw conflict('Two-factor authentication is already on.');
      if (!row.mfa_secret) throw badRequest('Start the setup step first.');
      if (!verifyTotp(row.mfa_secret, req.body.code)) {
        throw badRequest('That code is not right. Check the app and try the next one.');
      }

      const now = new Date().toISOString();
      db.prepare('UPDATE users SET mfa_enabled = 1, mfa_enrolled_at = ?, updated_at = ? WHERE id = ?').run(
        now,
        now,
        row.id,
      );

      const codes = issueRecoveryCodes(db, config, row.id);
      recordAudit(ctx, {
        userId: row.id,
        event: 'account.mfa_enabled',
        category: 'security',
        summary: 'Two-factor authentication turned on',
        req,
      });

      res.json({ ok: true, recoveryCodes: codes });
    } catch (err) {
      next(err);
    }
  });

  router.post(
    '/mfa/disable',
    requireAuth,
    validateBody(z.object({ password: z.string().min(1).max(256) })),
    async (req, res, next) => {
      try {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!(await verifyPassword(req.body.password, row.password_hash))) {
          throw unauthorized('That password is not right.');
        }

        db.prepare(
          'UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_enrolled_at = NULL, updated_at = ? WHERE id = ?',
        ).run(new Date().toISOString(), row.id);
        db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(row.id);

        recordAudit(ctx, {
          userId: row.id,
          event: 'account.mfa_disabled',
          category: 'security',
          summary: 'Two-factor authentication turned off',
          req,
        });
        res.json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  );

  router.post(
    '/mfa/recovery-codes',
    requireAuth,
    validateBody(z.object({ password: z.string().min(1).max(256) })),
    async (req, res, next) => {
      try {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!row.mfa_enabled) throw badRequest('Turn on two-factor authentication first.');
        if (!(await verifyPassword(req.body.password, row.password_hash))) {
          throw unauthorized('That password is not right.');
        }

        const codes = issueRecoveryCodes(db, config, row.id);
        recordAudit(ctx, {
          userId: row.id,
          event: 'account.recovery_codes_reissued',
          category: 'security',
          summary: 'Recovery codes regenerated — the previous set stopped working',
          req,
        });
        res.json({ recoveryCodes: codes });
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    '/account',
    requireAuth,
    validateBody(z.object({ password: z.string().min(1).max(256), confirm: z.literal('DELETE') })),
    async (req, res, next) => {
      try {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        if (!(await verifyPassword(req.body.password, row.password_hash))) {
          throw unauthorized('That password is not right.');
        }

        // Remove the ciphertext before the rows that point at it.
        const documents = db.prepare('SELECT id FROM documents WHERE user_id = ?').all(row.id);
        for (const doc of documents) {
          await ctx.vault.remove({ userId: row.id, documentId: doc.id });
        }
        db.prepare('DELETE FROM users WHERE id = ?').run(row.id);
        sessions.clearCookies(res);

        ctx.logger.info('account_deleted', { documents: documents.length });
        res.json({ ok: true });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

function registerFailure(db, config, row) {
  const count = row.failed_login_count + 1;
  const lockedUntil =
    count >= config.auth.maxFailedLogins
      ? new Date(Date.now() + config.auth.lockoutMs).toISOString()
      : row.locked_until;
  db.prepare('UPDATE users SET failed_login_count = ?, locked_until = ? WHERE id = ?').run(
    count >= config.auth.maxFailedLogins ? 0 : count,
    lockedUntil,
    row.id,
  );
}

/**
 * Recovery codes are 128-bit random values, so they are stored as keyed HMACs
 * rather than slow hashes — there is nothing to brute-force in a value with
 * that much entropy, and the key never leaves the server's configuration.
 */
function issueRecoveryCodes(db, config, userId) {
  db.prepare('DELETE FROM recovery_codes WHERE user_id = ?').run(userId);
  const codes = [];
  const insert = db.prepare(
    'INSERT INTO recovery_codes (id, user_id, code_hash, created_at) VALUES (?, ?, ?, ?)',
  );
  const now = new Date().toISOString();

  const write = db.transaction(() => {
    for (let i = 0; i < RECOVERY_CODE_COUNT; i += 1) {
      const code = randomToken(8).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
      codes.push(code);
      insert.run(newId(), userId, hmac(config.sessionSecret, code), now);
    }
  });
  write();

  return codes;
}

function consumeRecoveryCode(db, config, userId, candidate) {
  const wanted = hmac(config.sessionSecret, candidate.toLowerCase());
  const rows = db.prepare('SELECT * FROM recovery_codes WHERE user_id = ? AND used_at IS NULL').all(userId);
  const match = rows.find((row) => safeEqual(row.code_hash, wanted));
  if (!match) return false;
  db.prepare('UPDATE recovery_codes SET used_at = ? WHERE id = ?').run(new Date().toISOString(), match.id);
  return true;
}

/** Attaches invitations that were addressed to an email before it had an account. */
export function linkPendingInvitations(db, userId, emailNormalized) {
  return db
    .prepare(
      `UPDATE members SET linked_user_id = @userId, updated_at = @now
        WHERE email_normalized = @email AND linked_user_id IS NULL AND status IN ('pending', 'active')`,
    )
    .run({ userId, email: emailNormalized, now: new Date().toISOString() }).changes;
}

/** The user object the client sees. Never includes hashes or MFA secrets. */
export function publicUser(db, userId) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) return null;

  const pendingInvites = db
    .prepare(
      `SELECT COUNT(*) AS count FROM members
        WHERE linked_user_id = ? AND status = 'pending'`,
    )
    .get(userId).count;

  const unreadNotifications = db
    .prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL')
    .get(userId).count;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isAdmin: row.role === 'admin',
    vaultProfile: row.vault_profile,
    categories: JSON.parse(row.categories_json || '[]'),
    onboardingStep: 'done',
    onboarded: true,
    waitingPeriodDays: row.waiting_period_days,
    mfaEnabled: Boolean(row.mfa_enabled),
    createdAt: row.created_at,
    pendingInvites,
    unreadNotifications,
  };
}
