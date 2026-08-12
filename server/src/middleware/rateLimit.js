import { tooManyRequests } from '../lib/errors.js';

/**
 * Fixed-window counters held in process memory. Adequate for a single-node
 * deployment, which is what this app ships as; a multi-node deployment would
 * point the same interface at Redis.
 */
export function createRateLimiter(config) {
  const buckets = new Map();

  // Bounded sweep so an attacker rotating source IPs cannot grow the map
  // without limit.
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  timer.unref?.();

  function hit(key, max, windowMs) {
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    return {
      allowed: bucket.count <= max,
      remaining: Math.max(0, max - bucket.count),
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  /**
   * @param {object} options
   * @param {string} options.name        bucket namespace
   * @param {number} options.max         requests permitted per window
   * @param {(req) => string} [options.keyOn]  extra key material (e.g. the submitted email)
   */
  function limit({ name, max, windowMs = config.rateLimit.windowMs, keyOn }) {
    return function rateLimitMiddleware(req, res, next) {
      if (!config.rateLimit.enabled) return next();

      const extra = keyOn ? keyOn(req) : '';
      const result = hit(`${name}:${req.clientIp ?? 'unknown'}:${extra}`, max, windowMs);

      res.setHeader('X-RateLimit-Limit', String(max));
      res.setHeader('X-RateLimit-Remaining', String(result.remaining));

      if (!result.allowed) {
        res.setHeader('Retry-After', String(result.retryAfterSeconds));
        return next(
          tooManyRequests('Too many requests. Wait a moment and try again.', result.retryAfterSeconds),
        );
      }
      return next();
    };
  }

  return { limit, reset: () => buckets.clear(), stop: () => clearInterval(timer) };
}
