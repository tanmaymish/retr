import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, Icon, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { dayLabel, formatDate, relativeTime } from '../lib/format';

const TABS = [
  { key: '', label: 'All activity' },
  { key: 'security', label: 'Security' },
  { key: 'documents', label: 'Documents' },
  { key: 'sharing', label: 'Sharing' },
  { key: 'trustees', label: 'Trustees' },
];

const EVENT_ICON = {
  'document.uploaded': 'description',
  'document.updated': 'edit_document',
  'document.deleted': 'delete',
  'document.viewed': 'visibility',
  'document.downloaded': 'download',
  'share.granted': 'share',
  'share.revoked': 'link_off',
  'share.categories_updated': 'folder_shared',
  'auth.login': 'login',
  'auth.logout': 'logout',
  'auth.mfa': 'password',
  'auth.password_ok': 'password',
  'account.created': 'celebration',
  'account.password_changed': 'key',
  'account.mfa_enabled': 'verified_user',
  'account.mfa_disabled': 'gpp_maybe',
  'account.session_revoked': 'devices',
  'account.sessions_revoked': 'devices',
  'account.protocol_updated': 'hourglass_empty',
  'member.invited': 'person_add',
  'member.accepted': 'how_to_reg',
  'member.revoked': 'person_remove',
  'trustee.invited': 'gavel',
  'trustee.accepted': 'gavel',
  'emergency.initiated': 'warning',
  'emergency.denied': 'verified_user',
  'emergency.cancelled': 'cancel',
  'emergency.vault_listed': 'lock_open',
};

export default function Activity() {
  const [tab, setTab] = useState('');
  const { data, loading, error } = useApi(`/account/activity${tab ? `?category=${tab}` : ''}`);
  const health = useApi('/account/security-health');

  const groups = groupByDay(data?.entries ?? []);

  return (
    <div className="stack stack-md enter">
      <div className="stack" style={{ gap: 6 }}>
        <div className="row" style={{ gap: 10 }}>
          <Icon name="verified_user" size={22} style={{ color: 'var(--sage)' }} />
          <h1 style={{ fontSize: 32 }}>Your vault is secure.</h1>
        </div>
        <p className="muted small">
          A transparent history of every action taken to protect your family’s legacy — including
          actions taken by anyone you gave access to.
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)' }}>
        <div className="stack stack-md">
          <div className="row wrap" style={{ gap: 8 }}>
            {TABS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                onClick={() => setTab(entry.key)}
                aria-pressed={tab === entry.key}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${tab === entry.key ? 'var(--primary)' : 'var(--outline-variant)'}`,
                  background: tab === entry.key ? 'var(--primary)' : 'var(--surface-lowest)',
                  color: tab === entry.key ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Spinner />
          ) : error ? (
            <EmptyState icon="cloud_off" title="Could not load the activity log">{error.message}</EmptyState>
          ) : groups.length === 0 ? (
            <Card flat>
              <EmptyState icon="history" title="Nothing recorded here yet" />
            </Card>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="stack stack-sm">
                <span className="tiny caps muted">{group.label}</span>
                <Card className="stack" style={{ gap: 0, padding: 0 }}>
                  {group.entries.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="row"
                      style={{
                        gap: 14,
                        padding: '16px 20px',
                        borderTop: index ? '1px solid var(--outline-variant)' : 'none',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-md)',
                          background: entry.outcome === 'failure' ? 'var(--error-container)' : 'var(--surface-container)',
                          color: entry.outcome === 'failure' ? 'var(--on-error-container)' : 'var(--primary)',
                          display: 'grid',
                          placeItems: 'center',
                          flex: 'none',
                        }}
                      >
                        <Icon name={EVENT_ICON[entry.event] ?? 'bolt'} size={18} />
                      </span>
                      <div className="stack grow" style={{ gap: 3 }}>
                        <strong className="small">{entry.summary}</strong>
                        <div className="row wrap tiny muted" style={{ gap: 10 }}>
                          <span className="row" style={{ gap: 4 }}>
                            <Icon name="person" size={13} />
                            {entry.actor}
                          </span>
                          <span className="row" style={{ gap: 4 }}>
                            <Icon name="devices" size={13} />
                            {entry.device}
                          </span>
                          <span>{relativeTime(entry.at)}</span>
                        </div>
                      </div>
                      {entry.outcome === 'failure' ? (
                        <Badge tone="danger">Failed</Badge>
                      ) : (
                        <Badge tone="verified" icon="check_circle">Recorded</Badge>
                      )}
                    </div>
                  ))}
                </Card>
              </div>
            ))
          )}
        </div>

        <Card className="stack stack-sm" style={{ alignSelf: 'start' }}>
          <div className="row" style={{ gap: 8 }}>
            <Icon name="health_and_safety" size={20} style={{ color: 'var(--sage)' }} />
            <h4>Security health</h4>
          </div>
          {health.loading ? (
            <Spinner label="Checking" />
          ) : health.data ? (
            <>
              <HealthRow
                icon="schedule"
                label="Last sign-in"
                value={
                  health.data.health.lastLogin
                    ? `${relativeTime(health.data.health.lastLogin.at)} · ${health.data.health.lastLogin.device}`
                    : 'This is your first session'
                }
              />
              <HealthRow
                icon="lock_clock"
                label="Two-factor"
                value={health.data.health.mfaEnabled ? 'Active via authenticator' : 'Not switched on'}
                tone={health.data.health.mfaEnabled ? 'verified' : 'pending'}
              />
              <HealthRow
                icon="enhanced_encryption"
                label="Encryption"
                value={health.data.health.encryption.algorithm}
                tone="verified"
              />
              <HealthRow icon="devices" label="Active sessions" value={`${health.data.health.activeSessions} device${health.data.health.activeSessions === 1 ? '' : 's'}`} />
              <HealthRow icon="gavel" label="Trustees" value={`${health.data.health.activeTrustees} active`} tone={health.data.health.activeTrustees ? 'verified' : 'pending'} />
              <HealthRow icon="hourglass_empty" label="Waiting period" value={`${health.data.health.waitingPeriodDays} days`} />
              <HealthRow icon="key" label="Password changed" value={formatDate(health.data.health.passwordChangedAt)} />
              <Link to="/vault/security" className="btn btn-secondary btn-sm" style={{ marginTop: 8 }}>
                <Icon name="manage_accounts" size={16} /> Security settings
              </Link>
            </>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

function HealthRow({ icon, label, value, tone }) {
  return (
    <div className="row-between" style={{ padding: '10px 0', borderTop: '1px solid var(--outline-variant)' }}>
      <div className="row" style={{ gap: 8 }}>
        <Icon name={icon} size={16} style={{ color: 'var(--on-surface-variant)' }} />
        <span className="small muted">{label}</span>
      </div>
      <span className="small" style={{ fontWeight: 600, color: tone === 'pending' ? 'var(--amber)' : tone === 'verified' ? 'var(--sage)' : undefined, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function groupByDay(entries) {
  const groups = [];
  for (const entry of entries) {
    const label = dayLabel(entry.at);
    const last = groups[groups.length - 1];
    if (last?.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}
