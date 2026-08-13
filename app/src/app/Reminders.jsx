import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Icon, Spinner, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { categoryIcon } from '../lib/categories';
import { formatDate } from '../lib/format';

export default function Reminders() {
  const { data, loading, error, setData } = useApi('/reminders');
  const toast = useToast();

  async function update(key, state, snoozedUntil = null) {
    try {
      const next = await api.put(`/reminders/${encodeURIComponent(key)}`, { state, snoozedUntil });
      setData(next);
      toast.success(state === 'snoozed' ? 'Snoozed for a month.' : 'Cleared.');
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="cloud_off" title="Could not load reminders">{error.message}</EmptyState>;

  const { reminders, counts, emptyMessage } = data;

  return (
    <div className="stack stack-md enter" style={{ maxWidth: 860 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 32 }}>
          {counts.total === 0 ? 'Everything’s taken care of.' : 'A few things need you soon.'}
        </h1>
        <p className="muted">
          {counts.total === 0
            ? emptyMessage
            : 'Gathered from the dates on your own documents — nothing here was invented.'}
        </p>
      </div>

      {counts.total > 0 && (
        <div className="row wrap" style={{ gap: 10 }}>
          {counts.overdue > 0 && <Badge tone="danger" icon="error">{counts.overdue} overdue</Badge>}
          {counts.soon > 0 && <Badge tone="pending" icon="schedule">{counts.soon} within a month</Badge>}
        </div>
      )}

      {reminders.length === 0 ? (
        <Card flat>
          <EmptyState icon="task_alt" title="Nothing needs your attention">
            {emptyMessage}
          </EmptyState>
        </Card>
      ) : (
        <div className="stack stack-md">
          {reminders.map((reminder) => (
            <Card key={reminder.key} className="stack stack-sm">
              <div className="row-between wrap" style={{ gap: 12 }}>
                <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: reminder.overdue ? 'var(--error-container)' : 'var(--primary-fixed)',
                      color: reminder.overdue ? 'var(--on-error-container)' : 'var(--primary)',
                      display: 'grid',
                      placeItems: 'center',
                      flex: 'none',
                    }}
                  >
                    <Icon name={categoryIcon(reminder.category)} size={22} />
                  </span>
                  <div className="stack" style={{ gap: 4 }}>
                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 17 }}>{reminder.title}</strong>
                    <span
                      className="small"
                      style={{ color: reminder.overdue ? 'var(--error)' : 'var(--on-surface-variant)' }}
                    >
                      {reminder.overdue
                        ? `Overdue by ${Math.abs(reminder.daysUntil)} days · was due ${formatDate(reminder.dueOn)}`
                        : `Due in ${reminder.daysUntil} days · ${formatDate(reminder.dueOn)}`}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-ghost"
                  aria-label="Dismiss reminder"
                  onClick={() => update(reminder.key, 'dismissed')}
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <p className="small muted">{reminder.body}</p>

              <div className="row-between wrap" style={{ gap: 10 }}>
                <Link to={`/vault/documents/${reminder.documentId}`} className="btn btn-secondary btn-sm">
                  {reminder.cta} <Icon name="arrow_forward" size={16} />
                </Link>
                <div className="row" style={{ gap: 6 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      update(reminder.key, 'snoozed', new Date(Date.now() + 30 * 86_400_000).toISOString())
                    }
                  >
                    Snooze a month
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => update(reminder.key, 'done')}>
                    Mark handled
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
