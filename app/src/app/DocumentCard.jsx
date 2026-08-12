import { Link } from 'react-router-dom';
import { Badge, Card, Icon } from '../components/ui';
import { categoryIcon } from '../lib/categories';
import { formatDate } from '../lib/format';

const SOURCE = {
  source_verified: { tone: 'verified', icon: 'verified', label: 'Source verified' },
  auto_extracted: { tone: 'ai', icon: 'auto_awesome', label: 'Auto extracted' },
  user_uploaded: { tone: 'neutral', icon: 'person', label: 'You added this' },
};

/** The card used everywhere a document is listed. */
export function DocumentCard({ document, to }) {
  const source = SOURCE[document.source] ?? SOURCE.user_uploaded;
  const dateLabel = document.expiresOn ? 'Expiry' : document.renewalOn ? 'Renewal' : 'Added';
  const dateValue = document.expiresOn ?? document.renewalOn ?? document.createdAt;
  const expired = document.expiresOn && new Date(document.expiresOn) < new Date();

  return (
    <Card as={Link} to={to ?? `/vault/documents/${document.id}`} className="card-link stack" style={{ gap: 14 }}>
      <div className="row-between" style={{ alignItems: 'flex-start' }}>
        <span
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'var(--surface-container)',
            color: 'var(--primary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name={categoryIcon(document.category)} size={20} />
        </span>
        <Badge tone={source.tone} icon={source.icon}>{source.label}</Badge>
      </div>

      <div className="stack" style={{ gap: 2 }}>
        <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16, lineHeight: 1.3 }}>
          {document.title}
        </strong>
        <span className="small muted">
          {document.categoryLabel ?? document.category}
          {document.subject ? ` · ${document.subject}` : ''}
        </span>
      </div>

      <hr className="divider" />

      <div className="row-between">
        <span className="small muted">{dateLabel}</span>
        <span className="small" style={{ fontWeight: 600, color: expired ? 'var(--error)' : undefined }}>
          {formatDate(dateValue)}
        </span>
      </div>

      {document.sharedWithCount > 0 && (
        <div className="row tiny muted" style={{ gap: 5 }}>
          <Icon name="folder_shared" size={14} />
          Shared with {document.sharedWithCount}
        </div>
      )}
    </Card>
  );
}
