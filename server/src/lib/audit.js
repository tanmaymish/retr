import { newId } from './crypto.js';

const MAX_META_BYTES = 4000;

/**
 * Appends to the activity log the owner reads on the Activity screen. This is
 * the same log the app relies on for security review, so it is written for
 * every action that changes state or touches a document — including actions
 * taken by trustees and family members, labelled with who did them.
 *
 * Audit writes never throw into the request path: losing the response is worse
 * than losing one log line, so a failure is logged and swallowed.
 */
export function recordAudit(
  ctx,
  { userId = null, actorLabel = null, event, category = 'security', outcome = 'success', summary, req, meta },
) {
  try {
    let metaJson = null;
    if (meta !== undefined) {
      metaJson = JSON.stringify(meta);
      if (metaJson.length > MAX_META_BYTES) metaJson = JSON.stringify({ truncated: true });
    }
    ctx.db
      .prepare(
        `INSERT INTO audit_log
           (id, user_id, actor_label, event, category, outcome, summary, ip, user_agent, meta_json, created_at)
         VALUES
           (@id, @userId, @actorLabel, @event, @category, @outcome, @summary, @ip, @userAgent, @metaJson, @createdAt)`,
      )
      .run({
        id: newId(),
        userId,
        actorLabel,
        event,
        category,
        outcome,
        summary: summary ?? event,
        ip: req?.clientIp ?? null,
        userAgent: (req?.get?.('user-agent') ?? '').slice(0, 300) || null,
        metaJson,
        createdAt: new Date().toISOString(),
      });
  } catch (err) {
    ctx.logger.error('audit_write_failed', { event, error: err.message });
  }
}

/** Turns a raw user-agent into the short label the activity screen shows. */
export function describeDevice(userAgent) {
  if (!userAgent) return 'Unknown device';
  const ua = String(userAgent);
  const browser = /Firefox\//.test(ua)
    ? 'Firefox'
    : /Edg\//.test(ua)
      ? 'Edge'
      : /Chrome\//.test(ua)
        ? 'Chrome'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Browser';
  const platform = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Macintosh|Mac OS X/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : /Linux/.test(ua)
            ? 'Linux'
            : 'Unknown OS';
  return `${browser} on ${platform}`;
}
