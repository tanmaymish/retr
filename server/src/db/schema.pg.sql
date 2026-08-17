-- Heritage Ledger PostgreSQL Schema for Neon
-- Auto-created for high-performance serverless PostgreSQL hosting

CREATE TABLE IF NOT EXISTS users (
  id                     TEXT PRIMARY KEY,
  email                  TEXT NOT NULL,
  email_normalized       TEXT NOT NULL UNIQUE,
  password_hash          TEXT NOT NULL,
  name                   TEXT NOT NULL,
  vault_profile          TEXT CHECK (vault_profile IN ('me', 'me_partner', 'family', 'parents')),
  categories_json        TEXT NOT NULL DEFAULT '[]',
  onboarding_step        TEXT NOT NULL DEFAULT 'personalization'
                           CHECK (onboarding_step IN ('personalization', 'categories', 'done')),
  waiting_period_days    INTEGER NOT NULL DEFAULT 14 CHECK (waiting_period_days BETWEEN 1 AND 90),
  role                   TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
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
  mfa_pending            INTEGER NOT NULL DEFAULT 0 CHECK (mfa_pending IN (0, 1)),
  created_at             TEXT NOT NULL,
  last_seen_at           TEXT NOT NULL,
  idle_expires_at        TEXT NOT NULL,
  absolute_expires_at    TEXT NOT NULL,
  revoked_at             TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS documents (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN
                    ('identity', 'insurance', 'property', 'financial', 'medical',
                     'education', 'vehicle', 'legal', 'memories')),
  subject         TEXT,
  source          TEXT NOT NULL DEFAULT 'user_uploaded'
                    CHECK (source IN ('user_uploaded', 'auto_extracted', 'source_verified')),
  issued_on       TEXT,
  expires_on      TEXT,
  renewal_on      TEXT,
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

CREATE TABLE IF NOT EXISTS members (
  id                      TEXT PRIMARY KEY,
  user_id                 TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name                    TEXT NOT NULL,
  email                   TEXT NOT NULL,
  email_normalized        TEXT NOT NULL,
  relationship            TEXT NOT NULL CHECK (relationship IN
                            ('mother', 'father', 'partner', 'child', 'sibling',
                             'family_member', 'legal_counsel', 'trusted_friend', 'other')),
  is_trustee              INTEGER NOT NULL DEFAULT 0 CHECK (is_trustee IN (0, 1)),
  status                  TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'active', 'declined', 'revoked')),
  trustee_categories_json TEXT NOT NULL DEFAULT '[]',
  invite_token_hash       TEXT,
  invite_expires_at       TEXT,
  invited_at              TEXT NOT NULL,
  accepted_at             TEXT,
  revoked_at              TEXT,
  last_active_at          TEXT,
  linked_user_id          TEXT REFERENCES users(id) ON DELETE SET NULL,
  message                 TEXT,
  created_at              TEXT NOT NULL,
  updated_at              TEXT NOT NULL,
  UNIQUE (user_id, email_normalized)
);
CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_linked ON members(linked_user_id);

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
  actor_label TEXT,
  event       TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  household       TEXT,
  interests_json  TEXT NOT NULL DEFAULT '[]',
  timeframe       TEXT,
  message         TEXT,
  source          TEXT NOT NULL DEFAULT 'contact'
                    CHECK (source IN ('contact', 'preparedness_check', 'call_request')),
  check_score     INTEGER,
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'archived')),
  notes           TEXT,
  ip              TEXT,
  user_agent      TEXT,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status, created_at);

CREATE TABLE IF NOT EXISTS content_blocks (
  key              TEXT PRIMARY KEY,
  kind             TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'json')),
  label            TEXT NOT NULL,
  draft_value      TEXT,
  published_value  TEXT,
  published_at     TEXT,
  updated_at       TEXT NOT NULL,
  updated_by       TEXT REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS content_revisions (
  id          TEXT PRIMARY KEY,
  key         TEXT NOT NULL,
  action      TEXT NOT NULL CHECK (action IN ('save', 'publish', 'revert')),
  value       TEXT,
  note        TEXT,
  created_by  TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_revisions_key ON content_revisions(key, created_at DESC);

CREATE TABLE IF NOT EXISTS page_views (
  id            TEXT PRIMARY KEY,
  path          TEXT NOT NULL,
  referrer_host TEXT,
  device        TEXT CHECK (device IN ('mobile', 'tablet', 'desktop')),
  country       TEXT,
  visitor_hash  TEXT NOT NULL,
  dwell_ms      INTEGER,
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_views_path ON page_views(path, created_at);

CREATE TABLE IF NOT EXISTS site_events (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  path         TEXT,
  props_json   TEXT,
  visitor_hash TEXT NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_created ON site_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_name ON site_events(name, created_at);

CREATE TABLE IF NOT EXISTS daily_stats (
  day        TEXT NOT NULL,
  path       TEXT NOT NULL,
  views      INTEGER NOT NULL DEFAULT 0,
  visitors   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);

CREATE TABLE IF NOT EXISTS daily_visitors (
  day          TEXT NOT NULL,
  path         TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  PRIMARY KEY (day, path, visitor_hash)
);
