import { newId } from '../lib/crypto.js';

/**
 * The notification protocol.
 *
 * No email or SMS transport is configured in this deployment, so every
 * notification is *recorded* rather than sent, and the app says so wherever it
 * shows one. That is a deliberate choice: an emergency-access protocol that
 * claims to have notified someone when it has not is worse than one that is
 * honest about the channel being unconfigured. Wiring a real transport means
 * implementing `deliver` — nothing else changes.
 */
export function createNotificationService(ctx) {
  const { db } = ctx;

  function record({ userId, requestId = null, channel, subject, body }) {
    const row = {
      id: newId(),
      user_id: userId,
      request_id: requestId,
      channel,
      subject,
      body,
      delivery: 'recorded',
      created_at: new Date().toISOString(),
    };
    db.prepare(
      `INSERT INTO notifications (id, user_id, request_id, channel, subject, body, delivery, created_at)
       VALUES (@id, @user_id, @request_id, @channel, @subject, @body, @delivery, @created_at)`,
    ).run(row);
    return row;
  }

  /** Fans one message out across every channel the protocol promises. */
  function broadcast({ userId, requestId, subject, body, channels = ['email', 'sms', 'push', 'in_app'] }) {
    return channels.map((channel) => record({ userId, requestId, channel, subject, body }));
  }

  function listForUser(userId, { limit = 50, unreadOnly = false } = {}) {
    return db
      .prepare(
        `SELECT * FROM notifications
          WHERE user_id = @userId ${unreadOnly ? 'AND read_at IS NULL' : ''}
          ORDER BY created_at DESC
          LIMIT @limit`,
      )
      .all({ userId, limit });
  }

  function markRead(userId, id) {
    return db
      .prepare('UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ? AND read_at IS NULL')
      .run(new Date().toISOString(), id, userId).changes;
  }

  function markAllRead(userId) {
    return db
      .prepare('UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL')
      .run(new Date().toISOString(), userId).changes;
  }

  function countForRequest(requestId) {
    return db
      .prepare('SELECT COUNT(*) AS count FROM notifications WHERE request_id = ?')
      .get(requestId).count;
  }

  return { record, broadcast, listForUser, markRead, markAllRead, countForRequest };
}
