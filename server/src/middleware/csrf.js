import { forbidden } from '../lib/errors.js';
import { hmac, safeEqual } from '../lib/crypto.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Double-submit CSRF protection, bound to the session.
 *
 * The CSRF token is issued alongside the session in a readable cookie; the
 * client echoes it in the X-CSRF-Token header. Because the server stores only
 * an HMAC of the token in the session row, a token minted for another session
 * (or forged offline) does not validate. SameSite cookies are the first line
 * of defence; this is the second, for browsers and flows where SameSite alone
 * is not enough.
 */
export function csrfProtection(ctx) {
  return function csrfMiddleware(req, _res, next) {
    if (SAFE_METHODS.has(req.method)) return next();
    // Unauthenticated state-changing routes (login, register) are protected by
    // SameSite plus origin checking below — there is no session to bind to yet.
    if (!req.session) return next(originCheck(ctx, req));

    const header = req.get('x-csrf-token');
    if (!header) return next(forbidden('Missing CSRF token.'));

    const expected = req.session.csrf_hash;
    if (!safeEqual(hmac(ctx.config.sessionSecret, header), expected)) {
      return next(forbidden('Invalid CSRF token.'));
    }
    return next(originCheck(ctx, req));
  };
}

/**
 * Rejects cross-origin writes outright. Origin is sent by every browser on
 * state-changing requests; a request that carries one from an unexpected
 * origin is never legitimate here.
 */
function originCheck(ctx, req) {
  const origin = req.get('origin');
  if (!origin) return undefined; // non-browser client (curl, tests, mobile)

  const allowed = new Set(ctx.config.corsOrigins);
  const host = req.get('host');
  if (host) {
    allowed.add(`https://${host}`);
    if (!ctx.config.isProduction) allowed.add(`http://${host}`);
  }

  if (!allowed.has(origin)) return forbidden('Cross-origin request rejected.');
  return undefined;
}
