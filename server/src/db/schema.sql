-- Heritage Ledger schema.
--
-- One vault per user. Everything a user owns carries user_id with ON DELETE
-- CASCADE, so closing an account removes the vault with it in one transaction.
-- Dates are ISO-8601 strings so they sort lexicographically in SQLite.

CREATE TABLE IF NOT EXISTS users (
  id                     TEXT PRIMARY KEY,
  email                  TEXT NOT NULL,
  email_normalized       TEXT NOT NULL UNIQUE,
  password_hash          TEXT NOT NULL,
  name                   TEXT NOT NULL,
  -- Which vault shape the owner chose during onboarding.
  vault_profile          TEXT CHECK (vault_profile IN ('me', 'me_partner', 'family', 'parents')),
  categories_json        TEXT NOT NULL DEFAULT '[]',
  onboarding_step        TEXT NOT NULL DEFAULT 'personalization'
                           CHECK (onboarding_step IN ('personalization', 'categories', 'done')),
  -- Days a trustee's emergency request must wait before access opens.
  waiting_period_days    INTEGER NOT NULL DEFAULT 14 CHECK (waiting_period_days BETWEEN 1 AND 90),
  mfa_secret             TEXT,
  mfa_enabled            INTEGER NOT NULL DEFAULT 0 CHECK (mfa_enabled IN (0, 1)),
  mfa_enrolled_at        TEXT,
  failed_login_count     INTEGER NOT NULL DEFAULT 0,
  locked_until           TEXT,
  password_changed_at    TEXT NOT NULL,
  created_at             TEXT NOT NULL,
  updated_at             TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recovery_codes (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,
  used_at    TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recovery_user ON recovery_codes(user_id);

CREATE TABLE IF NOT EXISTS sessions (
  id                     TEXT PRIMARY KEY,
  user_id                TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash             TEXT NOT NULL UNIQUE,
  csrf_hash              TEXT NOT NULL,
  ip                     TEXT,
  user_agent             TEXT,
  -- A session that has passed the password step but not yet the MFA step can
  -- do exactly one thing: complete MFA.
  mfa_pending            INTEGER NOT NULL DEFAULT 0 CHECK (mfa_pending IN (0, 1)),
  created_at             TEXT NOT NULL,
  last_seen_at           TEXT NOT NULL,
  idle_expires_at        TEXT NOT NULL,
  absolute_expires_at    TEXT NOT NULL,
  revoked_at             TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- The documents themselves. Ciphertext lives on disk; this row holds only
-- metadata and the parameters needed to decrypt it.
CREATE TABLE IF NOT EXISTS documents (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN
                    ('identity', 'insurance', 'property', 'financial', 'medical',
                     'education', 'vehicle', 'legal', 'memories')),
  -- Who or what the document is about: "Saanvi", "Family Home".
  subject         TEXT,
  -- How the details were established, shown as the badge on every card.
  source          TEXT NOT NULL DEFAULT 'user_uploaded'
                    CHECK (source IN ('user_uploaded', 'auto_extracted', 'source_verified')),
  issued_on       TEXT,
  expires_on      TEXT,
  renewal_on      TEXT,
  -- Extracted or user-entered fields, each with its own confidence and
  -- whether a human confirmed it.
  fields_json     TEXT NOT NULL DEFAULT '[]',
  notes           TEXT,
  original_name   TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  size_bytes      INTEGER NOT NULL,
  sha256          TEXT NOT NULL,
  storage_name    TEXT NOT NULL,
  enc_salt        TEXT NOT NULL,
  enc_iv          TEXT NOT NULL,
  enc_tag         TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id, category);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(user_id, expires_on);

-- Family members and trustees are the same kind of thing — a person the owner
-- has named — separated by is_trustee and by what they are granted.
CREATE TABLE IF NOT EXISTS members (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  email              TEXT NOT NULL,
  email_normalized   TEXT NOT NULL,
  relationship       TEXT NOT NULL CHECK (relationship IN
                       ('mother', 'father', 'partner', 'child', 'sibling',
                        'family_member', 'legal_counsel', 'trusted_friend', 'other')),
  is_trustee         INTEGER NOT NULL DEFAULT 0 CHECK (is_trustee IN (0, 1)),
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'active', 'declined', 'revoked')),
  -- Categories a trustee may open once an emergency request completes.
  trustee_categories_json TEXT NOT NULL DEFAULT '[]',
  invite_token_hash  TEXT,
  invite_expires_at  TEXT,
  invited_at         TEXT NOT NULL,
  accepted_at        TEXT,
  revoked_at         TEXT,
  last_active_at     TEXT,
  -- Set once the invitee has an account of their own.
  linked_user_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  message            TEXT,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL,
  UNIQUE (user_id, email_normalized)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_linked ON members(linked_user_id);

-- Standing access to a whole category, shown on the family overview.
CREATE TABLE IF NOT EXISTS category_grants (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category      TEXT NOT NULL,
  can_download  INTEGER NOT NULL DEFAULT 0 CHECK (can_download IN (0, 1)),
  granted_at    TEXT NOT NULL,
  UNIQUE (member_id, category)
);
CREATE INDEX IF NOT EXISTS idx_category_grants_user ON category_grants(user_id);

-- Access to one specific document.
CREATE TABLE IF NOT EXISTS document_shares (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id   TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  member_id     TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  can_download  INTEGER NOT NULL DEFAULT 0 CHECK (can_download IN (0, 1)),
  expires_at    TEXT,
  granted_at    TEXT NOT NULL,
  revoked_at    TEXT,
  UNIQUE (document_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_shares_member ON document_shares(member_id);
CREATE INDEX IF NOT EXISTS idx_shares_user ON document_shares(user_id);

-- The emergency access protocol. One row per request; the waiting period is
-- copied onto the row at initiation so changing the setting later cannot
-- shorten a request already in flight.
CREATE TABLE IF NOT EXISTS access_requests (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id           TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'waiting'
                        CHECK (status IN ('waiting', 'granted', 'denied', 'cancelled', 'expired')),
  reason              TEXT,
  confirmations_json  TEXT NOT NULL DEFAULT '[]',
  waiting_period_days INTEGER NOT NULL,
  initiated_at        TEXT NOT NULL,
  unlock_at           TEXT NOT NULL,
  resolved_at         TEXT,
  resolved_by         TEXT,
  access_expires_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_access_requests_user ON access_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_access_requests_member ON access_requests(member_id);

-- Every notification the protocol says it sends. Recorded whether or not a
-- transport is configured, so the owner can see exactly what was attempted.
CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id   TEXT REFERENCES access_requests(id) ON DELETE CASCADE,
  channel      TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app')),
  subject      TEXT NOT NULL,
  body         TEXT NOT NULL,
  delivery     TEXT NOT NULL DEFAULT 'recorded' CHECK (delivery IN ('recorded', 'sent', 'failed')),
  read_at      TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at);

-- Reminders are derived from document dates on every read. This table only
-- records what the owner has dismissed or snoozed, so a dismissed reminder
-- stays dismissed without freezing a stale copy of the reminder itself.
CREATE TABLE IF NOT EXISTS reminder_states (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_key  TEXT NOT NULL,
  state         TEXT NOT NULL CHECK (state IN ('dismissed', 'snoozed', 'done')),
  snoozed_until TEXT,
  updated_at    TEXT NOT NULL,
  UNIQUE (user_id, reminder_key)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          TEXT PRIMARY KEY,
  user_id     TEXT REFERENCES users(id) ON DELETE CASCADE,
  -- Who performed it, when that is not the vault owner (a trustee, say).
  actor_label TEXT,
  event       TEXT NOT NULL,
  -- Drives the filter tabs on the activity screen.
  category    TEXT NOT NULL DEFAULT 'security'
                CHECK (category IN ('security', 'documents', 'sharing', 'trustees', 'account')),
  outcome     TEXT NOT NULL DEFAULT 'success' CHECK (outcome IN ('success', 'failure')),
  summary     TEXT NOT NULL,
  ip          TEXT,
  user_agent  TEXT,
  meta_json   TEXT,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at);
