import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Icon, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { categoryIcon } from '../lib/categories';
import { relationshipLabel, relativeTime } from '../lib/format';

/** The other side of sharing: what other people have opened to this user. */
export default function Shared() {
  const { data, loading, error } = useApi('/shared-with-me');
  const navigate = useNavigate();

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="cloud_off" title="Could not load what is shared with you">{error.message}</EmptyState>;

  const { documents, memberships, pendingInvites } = data;

  return (
    <div className="stack stack-lg enter">
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 32 }}>Shared with me</h1>
        <p className="muted small">
          Vaults other people have opened to you. What you can see here is entirely their choice, and
          they can revoke it at any time.
        </p>
      </div>

      {pendingInvites.length > 0 && (
        <section className="stack stack-sm">
          <h3>Invitations waiting for you</h3>
          {pendingInvites.map((invite) => (
            <Card key={invite.memberId} className="row-between wrap" style={{ gap: 12, background: 'var(--primary-fixed)' }}>
              <div className="row" style={{ gap: 12 }}>
                <Icon name={invite.isTrustee ? 'gavel' : 'family_restroom'} size={24} style={{ color: 'var(--primary)' }} />
                <div className="stack" style={{ gap: 2 }}>
                  <strong className="small">
                    {invite.ownerName} invited you{invite.isTrustee ? ' to be a trustee' : ' to their family vault'}
                  </strong>
                  <span className="tiny muted">
                    As {relationshipLabel(invite.relationship)} · {relativeTime(invite.invitedAt)}
                  </span>
                </div>
              </div>
              <span className="tiny muted">Open the invitation link they sent you to accept.</span>
            </Card>
          ))}
        </section>
      )}

      {memberships.length > 0 && (
        <section className="stack stack-sm">
          <h3>Vaults you have access to</h3>
          <div className="grid grid-3">
            {memberships.map((membership) => (
              <Card key={membership.id} className="stack stack-sm">
                <div className="row-between">
                  <strong className="small">{membership.ownerName}</strong>
                  {membership.isTrustee && <Badge tone="primary" icon="gavel">Trustee</Badge>}
                </div>
                <span className="tiny muted">You are recorded as {relationshipLabel(membership.relationship)}.</span>
                {membership.isTrustee && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/vault/trustees')}>
                    Trustee options
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="stack stack-sm">
        <h3>Documents</h3>
        {documents.length === 0 ? (
          <Card flat>
            <EmptyState icon="folder_shared" title="Nothing shared with you yet">
              When someone shares a document or a whole category, it appears here.
            </EmptyState>
          </Card>
        ) : (
          <div className="grid grid-3">
            {documents.map((document) => (
              <Card
                as={Link}
                to={`/vault/documents/${document.id}`}
                key={document.id}
                className="card-link stack"
                style={{ gap: 10 }}
              >
                <div className="row-between">
                  <Icon name={categoryIcon(document.category)} size={22} style={{ color: 'var(--primary)' }} />
                  <Badge icon={document.canDownload ? 'download' : 'visibility'}>
                    {document.canDownload ? 'View + download' : 'View only'}
                  </Badge>
                </div>
                <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{document.title}</strong>
                <span className="tiny muted">
                  {document.categoryLabel}
                  {document.ownerName ? ` · from ${document.ownerName}` : ''}
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
