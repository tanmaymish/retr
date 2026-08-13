import { Link, useNavigate } from 'react-router-dom';
import { Badge, Card, EmptyState, Icon, Meter, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { categoryIcon } from '../lib/categories';
import { formatDate, greeting, relativeTime } from '../lib/format';
import { DocumentCard } from './DocumentCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi('/dashboard');

  if (loading) return <Spinner label="Opening your vault" />;
  if (error) {
    return (
      <EmptyState icon="cloud_off" title="We could not load your vault">
        {error.message}
      </EmptyState>
    );
  }

  const { greeting: hello, stats, readiness, reminders, recentDocuments, openAccessRequests } = data;

  return (
    <div className="stack stack-lg enter">
      {openAccessRequests.map((request) => (
        <AccessAlert key={request.id} request={request} />
      ))}

      <header className="row-between wrap" style={{ gap: 20 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', color: 'var(--primary)' }}>
            {greeting()}, {hello.name}.
          </h1>
          <p className="muted" style={{ fontSize: 17 }}>{hello.headline}</p>
        </div>
        <Card flat className="row" style={{ gap: 10, padding: '14px 18px' }}>
          <Icon name="verified_user" size={20} style={{ color: 'var(--sage)' }} />
          <span className="small">
            <strong>{stats.addedThisWeek} added</strong> this week
            {' · '}
            <span style={{ color: stats.remindersPending ? 'var(--error)' : 'var(--sage)' }}>
              {stats.remindersPending} reminder{stats.remindersPending === 1 ? '' : 's'} pending
            </span>
          </span>
        </Card>
      </header>

      <div className="grid grid-4">
        <Stat label="Documents" value={stats.documents} icon="folder" to="/vault/documents" />
        <Stat label="Categories used" value={`${stats.categoriesUsed} of 9`} icon="category" to="/vault/documents" />
        <Stat label="Family with access" value={stats.activeMembers} icon="family_restroom" to="/vault/family" />
        <Stat label="Trustees" value={stats.activeTrustees} icon="gavel" to="/vault/trustees" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)' }}>
        <div className="stack stack-md">
          <DropZone onClick={() => navigate('/vault/add')} />

          <div className="row-between">
            <h3>Recent documents</h3>
            <Link to="/vault/documents" className="row small" style={{ gap: 4 }}>
              View all <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <Card flat>
              <EmptyState icon="folder_open" title="Nothing in the vault yet">
                Add the first document and the vault starts working — reminders, readiness, and a
                place your family can actually look.
              </EmptyState>
            </Card>
          ) : (
            <div className="grid grid-3">
              {recentDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          )}
        </div>

        <div className="stack stack-md">
          <ReadinessCard readiness={readiness} />
          <RemindersCard reminders={reminders} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon, to }) {
  return (
    <Card as={Link} to={to} className="card-link stack" style={{ gap: 8 }}>
      <div className="row-between">
        <span className="tiny muted caps">{label}</span>
        <Icon name={icon} size={18} style={{ color: 'var(--outline)' }} />
      </div>
      <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 28 }}>{value}</strong>
    </Card>
  );
}

function DropZone({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '2px dashed var(--outline-variant)',
        background: 'transparent',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 24px',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        gap: 12,
        textAlign: 'center',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--surface-low)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--outline-variant)'; e.currentTarget.style.background = 'transparent'; }}
    >
      <span
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-fixed)',
          color: 'var(--primary)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon name="upload_file" size={28} />
      </span>
      <h3>Drop a document to secure it</h3>
      <p className="small muted" style={{ maxWidth: 420 }}>
        We read the details out of it, organise it, and set the reminders it needs — before anything
        is saved.
      </p>
      <span className="btn btn-secondary btn-sm">Browse files</span>
    </button>
  );
}

function ReadinessCard({ readiness }) {
  const tone = readiness.score >= 85 ? 'sage' : readiness.score >= 60 ? 'primary' : readiness.score >= 35 ? 'amber' : 'error';
  return (
    <Card className="stack stack-sm">
      <div className="row-between">
        <h4>Legacy readiness</h4>
        <Badge tone={tone === 'sage' ? 'verified' : tone === 'error' ? 'danger' : 'primary'}>
          {readiness.band}
        </Badge>
      </div>
      <div className="row" style={{ gap: 12, alignItems: 'baseline' }}>
        <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 40 }}>{readiness.score}</strong>
        <span className="muted small">out of 100</span>
      </div>
      <Meter value={readiness.score} tone={tone} label="Legacy readiness" />

      {readiness.note ? (
        <p className="small muted" style={{ marginTop: 6 }}>{readiness.note}</p>
      ) : (
        <div className="stack stack-sm" style={{ marginTop: 8 }}>
          <span className="tiny caps muted">What moves it most</span>
          {readiness.nextSteps.map((step) => (
            <div key={step.key} className="stack" style={{ gap: 2 }}>
              <div className="row-between">
                <strong className="small">{step.label}</strong>
                <span className="tiny muted">+{step.points}</span>
              </div>
              <p className="tiny muted">{step.note}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function RemindersCard({ reminders }) {
  return (
    <Card className="stack stack-sm">
      <div className="row-between">
        <h4>Coming up</h4>
        <Link to="/vault/reminders" className="tiny">All reminders</Link>
      </div>
      {reminders.length === 0 ? (
        <p className="small muted">Nothing needs your attention. Enjoy the peace of mind.</p>
      ) : (
        reminders.map((reminder) => (
          <Link
            key={reminder.key}
            to="/vault/reminders"
            className="stack"
            style={{ gap: 2, padding: '10px 0', borderTop: '1px solid var(--outline-variant)', color: 'inherit' }}
          >
            <div className="row" style={{ gap: 8 }}>
              <Icon name={categoryIcon(reminder.category)} size={16} style={{ color: 'var(--primary)' }} />
              <strong className="small">{reminder.title}</strong>
            </div>
            <span className={`tiny ${reminder.overdue ? '' : 'muted'}`} style={{ color: reminder.overdue ? 'var(--error)' : undefined }}>
              {reminder.overdue
                ? `Overdue by ${Math.abs(reminder.daysUntil)} days`
                : `Due in ${reminder.daysUntil} days · ${formatDate(reminder.dueOn)}`}
            </span>
          </Link>
        ))
      )}
    </Card>
  );
}

/** The banner an owner sees the moment a trustee starts the protocol. */
function AccessAlert({ request }) {
  return (
    <Card
      className="row-between wrap"
      style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', gap: 16 }}
    >
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <Icon name="gavel" size={26} />
        <div className="stack" style={{ gap: 4 }}>
          <strong>Emergency access requested</strong>
          <p className="small">
            {request.memberName} started the emergency access protocol {relativeTime(request.initiatedAt)}.
            If you are safe, deny it. Access opens on {formatDate(request.unlockAt)} otherwise.
          </p>
        </div>
      </div>
      <Link to="/vault/trustees" className="btn btn-danger btn-sm">Review request</Link>
    </Card>
  );
}
