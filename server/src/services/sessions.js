import { hmac, newId, randomToken } from '../lib/crypto.js';

/**
 * Session lifecycle. Sessions are opaque random tokens stored as HMACs, which
 * makes them revocable server-side — the property JWTs give up. Every login
 * mints a fresh session (no fixation), and a session carries both an idle and
 * an absolute expiry.
 */
export function createSessionService(ctx) {
  const { db, config } = ctx;

  /**
   * @param {object} options
   * @param {boolean} [options.mfaPending] session may only complete the MFA
   *   challenge until this clears — it carries no other authority.
   */
  function issue({ userId, req, mfaPending = false }) {
    const token = randomToken(32);
    const csrfToken = randomToken(32);
    const now = new Date();
    // An unfinished MFA challenge is short-lived on purpose.
    const idleTtl = mfaPending ? 10 * 60_000 : config.session.idleTtlMs;
    const absoluteTtl = mfaPending ? 10 * 60_000 : config.session.absoluteTtlMs;
    const session = {
      id: newId(),
      user_id: userId,
      token_hash: hmac(config.sessionSecret, token),
      csrf_hash: hmac(config.sessionSecret, csrfToken),
      ip: req?.clientIp ?? null,
      user_agent: (req?.get?.('user-agent') ?? '').slice(0, 300) || null,
      mfa_pending: mfaPending ? 1 : 0,
      created_at: now.toISOString(),
      last_seen_at: now.toISOString(),
      idle_expires_at: new Date(now.getTime() + idleTtl).toISOString(),
      absolute_expires_at: new Date(now.getTime() + absoluteTtl).toISOString(),
    };

    db.prepare(
      `INSERT INTO sessions
         (id, user_id, token_hash, csrf_hash, ip, user_agent, mfa_pending, created_at, last_seen_at, idle_expires_at, absolute_expires_at)
       VALUES
         (@id, @user_id, @token_hash, @csrf_hash, @ip, @user_agent, @mfa_pending, @created_at, @last_seen_at, @idle_expires_at, @absolute_expires_at)`,
    ).run(session);

    return { session, token, csrfToken };
  }

  /**
   * Promotes a session that has just passed its MFA challenge, and extends it
   * to a full-length session.
   */
  function completeMfa(sessionId) {
    const now = new Date();
    db.prepare(
      `UPDATE sessions
          SET mfa_pending = 0, idle_expires_at = @idle, absolute_expires_at = @absolute
        WHERE id = @id`,
    ).run({
      id: sessionId,
      idle: new Date(now.getTime() + config.session.idleTtlMs).toISOString(),
      absolute: new Date(now.getTime() + config.session.absoluteTtlMs).toISOString(),
    });
  }

  /** Resolves a raw cookie token to a live session, sliding its idle window. */
  function resolve(token) {
    if (!token || typeof token !== 'string') return null;
    const row = db
      .prepare('SELECT * FROM sessions WHERE token_hash = ?')
      .get(hmac(config.sessionSecret, token));
    if (!row || row.revoked_at) return null;

    const now = new Date();
    if (new Date(row.idle_expires_at) <= now || new Date(row.absolute_expires_at) <= now) {
      revoke(row.id);
      return null;
    }

    // Slide the idle window, but never past the absolute expiry.
    const nextIdle = new Date(
      Math.min(now.getTime() + config.session.idleTtlMs, new Date(row.absolute_expires_at).getTime()),
    ).toISOString();
    db.prepare('UPDATE sessions SET last_seen_at = ?, idle_expires_at = ? WHERE id = ?').run(
      now.toISOString(),
      nextIdle,
      row.id,
    );

    return { ...row, last_seen_at: now.toISOString(), idle_expires_at: nextIdle };
  }

  function revoke(sessionId) {
    db.prepare('UPDATE sessions SET revoked_at = ? WHERE id = ? AND revoked_at IS NULL').run(
      new Date().toISOString(),
      sessionId,
    );
  }

  function revokeAllForUser(userId, exceptSessionId = null) {
    return db
      .prepare(
        `UPDATE sessions SET revoked_at = @now
          WHERE user_id = @userId AND revoked_at IS NULL AND id IS NOT @except`,
      )
      .run({ now: new Date().toISOString(), userId, except: exceptSessionId }).changes;
  }

  function listForUser(userId) {
    return db
      .prepare(
        `SELECT id, ip, user_agent, created_at, last_seen_at, idle_expires_at
           FROM sessions
          WHERE user_id = ? AND revoked_at IS NULL AND mfa_pending = 0 AND idle_expires_at > ?
          ORDER BY last_seen_at DESC`,
      )
      .all(userId, new Date().toISOString());
  }

  function setCookies(res, { token, csrfToken, session }) {
    const maxAge = new Date(session.absolute_expires_at).getTime() - Date.now();
    res.cookie(config.cookie.name, token, {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      domain: config.cookie.domain,
      path: '/',
      maxAge,
    });
    // Readable by the client on purpose: it must echo the value in a header.
    // Knowing it is useless without the httpOnly session cookie.
    res.cookie(config.cookie.csrfName, csrfToken, {
      httpOnly: false,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      domain: config.cookie.domain,
      path: '/',
      maxAge,
    });
  }

  function clearCookies(res) {
    const options = {
      httpOnly: true,
      secure: config.cookie.secure,
      sameSite: config.cookie.sameSite,
      domain: config.cookie.domain,
      path: '/',
    };
    res.clearCookie(config.cookie.name, options);
    res.clearCookie(config.cookie.csrfName, { ...options, httpOnly: false });
  }

  return {
    issue,
    completeMfa,
    resolve,
    revoke,
    revokeAllForUser,
    listForUser,
    setCookies,
    clearCookies,
  };
}
