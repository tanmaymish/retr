import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, Icon, Spinner } from '../components/ui';
import { Wordmark } from '../site/SiteChrome';
import { brand } from '../site/content';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';
import { relationshipLabel } from '../lib/format';

/**
 * The invitation a family member or trustee opens. The token is the only
 * secret, so the preview is public — but accepting requires being signed in,
 * which binds the invitation to a real account rather than to whoever has the
 * link.
 */
export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = useApi(`/invites/${token}`);
  const [busy, setBusy] = useState(null);
  const [failure, setFailure] = useState(null);

  if (loading) return <Spinner label="Checking the invitation" />;

  if (error) {
    return (
      <Shell>
        <Card className="stack stack-md center" style={{ alignItems: 'center' }}>
          <Icon name="link_off" size={40} style={{ color: 'var(--outline)' }} />
          <h2>This invitation is no longer valid</h2>
          <p className="muted small">{error.message}</p>
          <Link to="/" className="btn btn-secondary">Back to Akshayvriddhi</Link>
        </Card>
      </Shell>
    );
  }

  const invite = data.invite;
  const signInHref = `/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`;
  const signUpHref = `/create-vault?email=${encodeURIComponent(invite.email)}&next=${encodeURIComponent(`/invite/${token}`)}`;

  async function respond(action) {
    setBusy(action);
    setFailure(null);
    try {
      await api.post(`/invites/${action}`, { token });
      navigate(action === 'accept' ? '/vault/shared' : '/', { replace: true });
    } catch (err) {
      setFailure(err);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell>
      <Card className="stack stack-md">
        <div className="stack" style={{ gap: 8 }}>
          <Badge tone="primary" icon={invite.isTrustee ? 'gavel' : 'family_restroom'}>
            {invite.isTrustee ? 'Trustee designation' : 'Family invitation'}
          </Badge>
          <h1 style={{ fontSize: 30 }}>
            {invite.isTrustee
              ? 'You have been invited to serve as a Trustee.'
              : `${invite.ownerName} invited you to their family vault.`}
          </h1>
          <p className="muted">
            {invite.isTrustee
              ? 'A trustee is a trusted individual nominated to help recover access to a family’s vault in times of need.'
              : 'You will be able to see exactly what they choose to share with you, and nothing else.'}
          </p>
        </div>

        <div className="row-between" style={{ padding: 16, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
          <div className="stack" style={{ gap: 2 }}>
            <span className="tiny caps muted">Invited by</span>
            <strong>{invite.ownerName}</strong>
            <span className="tiny muted">You are recorded as {relationshipLabel(invite.relationship)}.</span>
          </div>
          <Badge tone="verified" icon="check_circle">Verified</Badge>
        </div>

        {invite.message && (
          <p className="small" style={{ fontStyle: 'italic', paddingLeft: 14, borderLeft: '3px solid var(--primary-fixed)' }}>
            “{invite.message}”
          </p>
        )}

        {invite.isTrustee && (
          <div className="stack stack-sm">
            <span className="tiny caps muted">What this means for you</span>
            <Duty
              icon="lock"
              title="Secure access management"
              body={`You will not have access to ${invite.ownerName}’s files today. You are a keyholder for emergency recovery only.`}
            />
            <Duty
              icon="timer"
              title={`The ${invite.waitingPeriodDays}-day rule`}
              body={`If you request access, a ${invite.waitingPeriodDays}-day waiting period begins, and ${invite.ownerName} can cancel it at any point in that window.`}
            />
            <Duty
              icon="health_and_safety"
              title="Emergency execution"
              body={
                invite.trusteeCategories.length
                  ? `In a verified emergency where ${invite.ownerName} cannot respond, you would be granted access to: ${invite.trusteeCategories.map((c) => c.label).join(', ')}.`
                  : `No categories have been designated yet, so a completed request would open nothing.`
              }
            />
          </div>
        )}

        {failure && <p className="field-error">{failure.message}</p>}

        {user ? (
          <div className="row wrap" style={{ gap: 10, justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              icon="close"
              loading={busy === 'decline'}
              onClick={() => respond('decline')}
            >
              Decline
            </Button>
            <Button icon="verified_user" loading={busy === 'accept'} onClick={() => respond('accept')}>
              {invite.isTrustee ? 'Accept role' : 'Accept invitation'}
            </Button>
          </div>
        ) : (
          <div className="stack stack-sm">
            <p className="small muted">
              Sign in as <strong>{invite.email}</strong> to respond. An invitation is always tied to
              an account, never to whoever holds the link.
            </p>
            <div className="row wrap" style={{ gap: 10 }}>
              <Link to={signUpHref} className="btn">Create an account</Link>
              <Link to={signInHref} className="btn btn-secondary">I already have one</Link>
            </div>
          </div>
        )}

        <p className="tiny muted">
          By accepting you agree to act in the interest of the vault’s beneficiaries. Every action you
          take inside the vault is logged and visible to its owner.
        </p>
      </Card>
    </Shell>
  );
}

function Duty({ icon, title, body }) {
  return (
    <div className="row" style={{ gap: 12, alignItems: 'flex-start', padding: 14, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
      <Icon name={icon} size={20} style={{ color: 'var(--primary)', marginTop: 2 }} />
      <div className="stack" style={{ gap: 2 }}>
        <strong className="small">{title}</strong>
        <span className="tiny muted">{body}</span>
      </div>
    </div>
  );
}

function Shell({ children }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--surface)' }}>
      <div className="container" style={{ display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
        <div style={{ width: 'min(620px, 100%)' }} className="stack stack-md enter">
          <Link to="/" className="row" style={{ justifyContent: 'center', color: 'var(--on-surface)' }}>
            <Wordmark subtitle={brand.tagline} />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
