import { forbidden, notFound } from '../lib/errors.js';
import { hmac, newId, randomToken } from '../lib/crypto.js';
import { safeParse } from './vault.js';

/**
 * Who may see what.
 *
 * Access to a document is never inferred from the requester's role alone. It
 * is resolved here, for every read, from three explicit sources:
 *
 *   1. ownership;
 *   2. a share the owner granted — either on that document or on its whole
 *      category — to a member linked to the requester's account;
 *   3. a completed emergency-access request held by a trustee, limited to the
 *      categories that trustee was designated for.
 *
 * Anything else is a denial. Revocation is immediate because nothing is cached.
 */
export function createAccessService(ctx) {
  const { db, config } = ctx;

  /** Members of other people's vaults that this user has accepted. */
  function membershipsFor(userId) {
    return db
      .prepare(
        `SELECT m.*, u.name AS owner_name, u.email AS owner_email
           FROM members m
           JOIN users u ON u.id = m.user_id
          WHERE m.linked_user_id = ? AND m.status = 'active'`,
      )
      .all(userId)
      // The owner's name is what the "shared with me" screen labels each vault
      // with, so it is carried through rather than dropped by mapMember.
      .map((row) => ({ ...mapMember(row), ownerName: row.owner_name, ownerEmail: row.owner_email }));
  }

  function memberFor({ ownerId, viewerId }) {
    const row = db
      .prepare(
        `SELECT * FROM members
          WHERE user_id = ? AND linked_user_id = ? AND status = 'active'`,
      )
      .get(ownerId, viewerId);
    return row ? mapMember(row) : null;
  }

  /**
   * @returns {{allowed: boolean, canDownload: boolean, via: string, reason?: string}}
   */
  function permissionForDocument({ document, viewerId, asOf = new Date() }) {
    if (!document) return { allowed: false, canDownload: false, via: 'none', reason: 'not_found' };
    if (document.ownerId === viewerId) return { allowed: true, canDownload: true, via: 'owner' };

    const member = memberFor({ ownerId: document.ownerId, viewerId });
    if (!member) return { allowed: false, canDownload: false, via: 'none', reason: 'not_a_member' };

    const share = db
      .prepare(
        `SELECT * FROM document_shares
          WHERE document_id = ? AND member_id = ? AND revoked_at IS NULL`,
      )
      .get(document.id, member.id);
    if (share && !isExpired(share.expires_at, asOf)) {
      return { allowed: true, canDownload: Boolean(share.can_download), via: 'document_share' };
    }

    const grant = db
      .prepare('SELECT * FROM category_grants WHERE member_id = ? AND category = ?')
      .get(member.id, document.category);
    if (grant) {
      return { allowed: true, canDownload: Boolean(grant.can_download), via: 'category_grant' };
    }

    if (member.isTrustee) {
      const granted = activeGrantedRequest({ ownerId: document.ownerId, memberId: member.id, asOf });
      if (granted && member.trusteeCategories.includes(document.category)) {
        return { allowed: true, canDownload: true, via: 'emergency_access' };
      }
      if (granted) {
        return {
          allowed: false,
          canDownload: false,
          via: 'emergency_access',
          reason: 'category_not_designated',
        };
      }
    }

    return { allowed: false, canDownload: false, via: 'none', reason: 'not_shared' };
  }

  /** The emergency request a trustee currently holds, if it has matured. */
  function activeGrantedRequest({ ownerId, memberId, asOf = new Date() }) {
    const row = db
      .prepare(
        `SELECT * FROM access_requests
          WHERE user_id = ? AND member_id = ? AND status IN ('waiting', 'granted')
          ORDER BY initiated_at DESC LIMIT 1`,
      )
      .get(ownerId, memberId);
    if (!row) return null;

    const matured = maturedRequest(row, asOf);
    if (matured.status !== 'granted') return null;
    if (matured.access_expires_at && new Date(matured.access_expires_at) <= asOf) return null;
    return matured;
  }

  /**
   * A waiting request that has passed its unlock time is granted the moment
   * anyone looks at it. The transition is written to the database so it is
   * recorded once and read consistently — the app never depends on a timer
   * having fired to be correct.
   */
  function maturedRequest(row, asOf = new Date()) {
    if (row.status !== 'waiting') return row;
    if (new Date(row.unlock_at) > asOf) return row;

    // Emergency access opens a 30-day window, not an indefinite one.
    const accessExpiresAt = new Date(asOf.getTime() + 30 * 86_400_000).toISOString();
    db.prepare(
      `UPDATE access_requests
          SET status = 'granted', resolved_at = @now, resolved_by = 'protocol', access_expires_at = @expires
        WHERE id = @id AND status = 'waiting'`,
    ).run({ id: row.id, now: asOf.toISOString(), expires: accessExpiresAt });

    return { ...row, status: 'granted', resolved_at: asOf.toISOString(), resolved_by: 'protocol', access_expires_at: accessExpiresAt };
  }

  /** Refreshes every stale request for a user, so reads are always current. */
  function settleRequests(userId, asOf = new Date()) {
    const rows = db
      .prepare("SELECT * FROM access_requests WHERE user_id = ? AND status = 'waiting'")
      .all(userId);
    return rows.map((row) => maturedRequest(row, asOf));
  }

  function requireDocumentAccess({ document, viewerId, download = false }) {
    const permission = permissionForDocument({ document, viewerId });
    if (!permission.allowed) {
      // A document the viewer cannot see is reported as missing rather than
      // forbidden, so the API does not confirm that an id exists.
      throw permission.reason === 'category_not_designated'
        ? forbidden('That category is not part of your trustee designation.')
        : notFound('Document not found.');
    }
    if (download && !permission.canDownload) {
      throw forbidden('You can view this document but not download a copy.');
    }
    return permission;
  }

  /** Mints an invitation token. Only its HMAC is stored. */
  function issueInviteToken(memberId, { days = 30 } = {}) {
    const token = randomToken(32);
    db.prepare('UPDATE members SET invite_token_hash = ?, invite_expires_at = ? WHERE id = ?').run(
      hmac(config.sessionSecret, token),
      new Date(Date.now() + days * 86_400_000).toISOString(),
      memberId,
    );
    return token;
  }

  function findByInviteToken(token, asOf = new Date()) {
    if (!token) return null;
    const row = db
      .prepare(
        `SELECT m.*, u.name AS owner_name, u.email AS owner_email
           FROM members m JOIN users u ON u.id = m.user_id
          WHERE m.invite_token_hash = ?`,
      )
      .get(hmac(config.sessionSecret, token));
    if (!row) return null;
    if (row.status === 'revoked') return null;
    if (row.invite_expires_at && new Date(row.invite_expires_at) <= asOf) return null;
    return { ...mapMember(row), ownerName: row.owner_name, ownerEmail: row.owner_email };
  }

  function listMembers(userId) {
    return db
      .prepare('SELECT * FROM members WHERE user_id = ? ORDER BY is_trustee DESC, created_at')
      .all(userId)
      .map(mapMember);
  }

  function getMember(userId, memberId) {
    const row = db.prepare('SELECT * FROM members WHERE id = ? AND user_id = ?').get(memberId, userId);
    return row ? mapMember(row) : null;
  }

  function grantsForMember(memberId) {
    return db.prepare('SELECT * FROM category_grants WHERE member_id = ?').all(memberId);
  }

  function newMemberId() {
    return newId();
  }

  return {
    membershipsFor,
    memberFor,
    permissionForDocument,
    requireDocumentAccess,
    activeGrantedRequest,
    maturedRequest,
    settleRequests,
    issueInviteToken,
    findByInviteToken,
    listMembers,
    getMember,
    grantsForMember,
    newMemberId,
  };
}

const isExpired = (value, asOf) => Boolean(value) && new Date(value) <= asOf;

export function mapMember(row) {
  return {
    id: row.id,
    ownerId: row.user_id,
    name: row.name,
    email: row.email,
    relationship: row.relationship,
    isTrustee: Boolean(row.is_trustee),
    status: row.status,
    trusteeCategories: safeParse(row.trustee_categories_json, []),
    invitedAt: row.invited_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
    lastActiveAt: row.last_active_at,
    linkedUserId: row.linked_user_id,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
