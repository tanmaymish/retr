import { unauthorized } from '../lib/errors.js';

/**
 * Attaches req.session / req.user when a valid session cookie is present.
 * Never rejects — routes decide whether authentication is required, so public
 * endpoints can still personalise for a signed-in visitor.
 */
export function loadSession(ctx) {
  return function loadSessionMiddleware(req, _res, next) {
    const token = req.cookies?.[ctx.config.cookie.name];
    if (!token) return next();

    const session = ctx.sessions.resolve(token);
    if (!session) return next();

    const user = ctx.db
      .prepare(
        `SELECT id, email, name, vault_profile, onboarding_step, waiting_period_days,
                mfa_enabled, created_at, password_changed_at
           FROM users WHERE id = ?`,
      )
      .get(session.user_id);
    if (!user) return next();

    req.session = session;
    req.user = user;
    next();
  };
}

/** Guards every route that touches vault data. */
export function requireAuth(req, _res, next) {
  if (!req.user) return next(unauthorized());
  next();
}
