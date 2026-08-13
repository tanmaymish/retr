import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, Icon, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { categoryIcon } from '../lib/categories';
import { formatDate } from '../lib/format';

export default function Timeline() {
  const { data, loading, error } = useApi('/timeline');

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="cloud_off" title="Could not load your timeline">{error.message}</EmptyState>;

  return (
    <div className="stack stack-lg enter" style={{ maxWidth: 860 }}>
      <div className="stack" style={{ gap: 8 }}>
        <h1 style={{ fontSize: 34 }}>Life journey</h1>
        <p className="muted">
          Life changes. Your important records stay with you. A chronological ledger of your family’s
          enduring legacy, arranged by chapter rather than by folder.
        </p>
      </div>

      {data.chapters.length === 0 ? (
        <Card flat>
          <EmptyState
            icon="history_edu"
            title="The journey starts with one document"
            action={<Link to="/vault/add" className="btn">Add a document</Link>}
          >
            {data.emptyMessage}
          </EmptyState>
        </Card>
      ) : (
        <div className="stack stack-lg">
          {data.chapters.map((chapter) => (
            <section key={chapter.key} className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
              <div className="stack" style={{ alignItems: 'center', gap: 0, flex: 'none' }}>
                <span
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: 'var(--on-primary)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={chapter.icon} size={22} />
                </span>
                <span style={{ width: 2, flex: 1, minHeight: 40, background: 'var(--outline-variant)' }} />
              </div>

              <div className="stack stack-sm grow" style={{ paddingBottom: 24 }}>
                <div className="stack" style={{ gap: 2 }}>
                  <h3>{chapter.label}</h3>
                  <p className="small muted">{chapter.blurb}</p>
                </div>

                <div className="grid grid-2">
                  {chapter.entries.map((entry) => (
                    <Card
                      as={Link}
                      to={`/vault/documents/${entry.id}`}
                      key={entry.id}
                      className="card-link row-between"
                      style={{ gap: 12 }}
                    >
                      <div className="row" style={{ gap: 12 }}>
                        <Icon name={categoryIcon(entry.category)} size={22} style={{ color: 'var(--primary)' }} />
                        <div className="stack" style={{ gap: 2 }}>
                          <strong className="small">{entry.title}</strong>
                          <span className="tiny muted">
                            {entry.dateIsIssued ? 'Dated' : 'Added'} {formatDate(entry.date)}
                            {entry.subject ? ` · ${entry.subject}` : ''}
                          </span>
                        </div>
                      </div>
                      {entry.source === 'source_verified' && <Badge tone="verified" icon="verified">Verified</Badge>}
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
