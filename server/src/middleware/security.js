import { randomBytes } from 'node:crypto';
import { forbidden } from '../lib/errors.js';

/**
 * Security headers, applied to every response including errors and static
 * assets. The CSP is strict by default: no inline script, no eval, no remote
 * script or frame, and nothing may embed the app in a frame.
 */
export function securityHeaders(config) {
  const connectSrc = ["'self'", ...config.corsOrigins];

  return function securityHeadersMiddleware(req, res, next) {
    // A per-response nonce lets index.html carry a bootstrap script if it ever
    // needs one, without opening 'unsafe-inline' for everything.
    res.locals.cspNonce = randomBytes(16).toString('base64');

    // Vite's dev client needs a websocket for HMR, and upgrade-insecure-requests
    // would break plain-http localhost — both are production-only concerns.
    const connect = config.isProduction ? connectSrc : [...connectSrc, 'ws:', 'wss:'];

    const directives = [
      "default-src 'self'",
      `script-src 'self' 'nonce-${res.locals.cspNonce}'`,
      // Vite emits a <style> tag per component in dev and inline critical CSS
      // in prod; Google Fonts is the only remote origin the design system uses.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      `connect-src ${connect.join(' ')}`,
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(config.isProduction ? ['upgrade-insecure-requests'] : []),
    ];

    res.setHeader('Content-Security-Policy', directives.join('; '));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    res.removeHeader('X-Powered-By');

    if (config.isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  };
}

/**
 * CORS. Off entirely when no origins are configured (the production default —
 * the API serves the SPA from the same origin). When on, it is an allow-list;
 * credentials are only ever granted to an exact configured origin, never to a
 * reflected wildcard.
 */
export function cors(config) {
  const allowed = new Set(config.corsOrigins);

  return function corsMiddleware(req, res, next) {
    const origin = req.headers.origin;
    if (!origin) return next();

    if (allowed.has(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Max-Age', '600');
      res.setHeader('Vary', 'Origin');
    } else if (req.method === 'OPTIONS') {
      return next(forbidden('Origin not allowed.'));
    }

    if (req.method === 'OPTIONS') return res.status(204).end();
    return next();
  };
}

/**
 * Resolves the client IP once per request. Proxy headers are only trusted when
 * TRUST_PROXY is on, so a client cannot spoof its way past rate limits by
 * sending its own X-Forwarded-For.
 */
export function clientIp(config) {
  return function clientIpMiddleware(req, _res, next) {
    if (config.trustProxy) {
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string' && forwarded.length) {
        req.clientIp = forwarded.split(',')[0].trim();
        return next();
      }
    }
    req.clientIp = req.socket?.remoteAddress ?? null;
    next();
  };
}
