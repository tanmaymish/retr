import { useState } from 'react';
import { Badge, Button, Card, EmptyState, Icon, Select, Spinner, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { formatDateTime, relativeTime } from '../lib/format';
import { HOUSEHOLDS, INTERESTS, TIMEFRAMES } from '../site/LeadForm';

const STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
];

/**
 * The admin inbox. Guarded server-side by role, not by hiding the nav item —
 * a member who types the URL still gets a 403 from the API.
 */
export default function Leads() {
  const [filter, setFilter] = useState('');
  const { data, loading, error, reload } = useApi(`/leads${filter ? `?status=${filter}` : ''}`);
  const toast = useToast();

  if (loading) return <Spinner label="Loading enquiries" />;
  if (error) {
    return (
      <EmptyState icon={error.status === 403 ? 'lock' : 'cloud_off'} title="Not available">
        {error.message}
      </EmptyState>
    );
  }

  const leads = data.leads ?? [];
  const counts = data.counts ?? {};

  async function update(lead, patch) {
    try {
      await api.patch(`/leads/${lead.id}`, patch);
      toast.success('Enquiry updated.');
      reload();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="stack stack-md enter">
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 32 }}>Enquiries</h1>
        <p className="muted small">
          Everyone who has asked to talk to us. Working the inbox is recorded in your activity log.
        </p>
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        <Chip active={!filter} label={`All ${leads.length ? '' : ''}`} onClick={() => setFilter('')} />
        {STATUSES.map((status) => (
          <Chip
            key={status.value}
            active={filter === status.value}
            label={`${status.label} ${counts[status.value] ?? 0}`}
            onClick={() => setFilter(status.value)}
          />
        ))}
      </div>

      {leads.length === 0 ? (
        <Card flat>
          <EmptyState icon="inbox" title="No enquiries yet">
            When someone completes the contact form or the preparedness check, they appear here.
          </EmptyState>
        </Card>
      ) : (
        <div className="stack stack-sm">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Where the enquiry came from, so the inbox reads at a glance. */
const SOURCE = {
  contact: { icon: 'mail', background: 'var(--surface-container)', label: 'Contact form' },
  preparedness_check: { icon: 'fact_check', background: 'var(--primary-fixed)', label: 'Preparedness check' },
  call_request: { icon: 'call', background: 'var(--gold-surface)', label: 'Asked for a call' },
};

function LeadCard({ lead, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? '');

  return (
    <Card className="stack stack-sm">
      <div className="row-between wrap" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 'var(--radius-md)',
              background: SOURCE[lead.source]?.background ?? 'var(--surface-container)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
              flex: 'none',
            }}
          >
            <Icon name={SOURCE[lead.source]?.icon ?? 'mail'} size={20} />
          </span>
          <div className="stack" style={{ gap: 3 }}>
            <strong>{lead.name}</strong>
            <span className="tiny muted">
              {lead.email}
              {lead.phone ? ` · ${lead.phone}` : ''}
            </span>
            <span className="tiny muted">
              {SOURCE[lead.source]?.label ?? lead.source} · {relativeTime(lead.createdAt)}
            </span>
          </div>
        </div>

        <div className="row wrap" style={{ gap: 8 }}>
          {lead.checkScore !== null && lead.checkScore !== undefined && (
            <Badge tone={lead.checkScore < 40 ? 'danger' : lead.checkScore < 65 ? 'pending' : 'verified'}>
              Check score {lead.checkScore}
            </Badge>
          )}
          <Select
            value={lead.status}
            onChange={(event) => onUpdate(lead, { status: event.target.value })}
            aria-label={`Status for ${lead.name}`}
            style={{ width: 150 }}
          >
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? 'Less' : 'Details'}
          </Button>
        </div>
      </div>

      {open && (
        <div className="stack stack-sm" style={{ paddingTop: 12, borderTop: '1px solid var(--outline-variant)' }}>
          <Detail label="Received" value={formatDateTime(lead.createdAt)} />
          <Detail label="Planning for" value={labelOf(HOUSEHOLDS, lead.household)} />
          <Detail label="Interested in" value={Array.isArray(lead.interests) ? lead.interests.map((v) => labelOf(INTERESTS, v)).filter(Boolean).join(', ') : ''} />
          <Detail label="Timing" value={labelOf(TIMEFRAMES, lead.timeframe)} />
          {lead.message && (
            <div className="stack" style={{ gap: 4 }}>
              <span className="tiny caps muted">Their message</span>
              <p className="small" style={{ lineHeight: 1.7 }}>{lead.message}</p>
            </div>
          )}
          <div className="stack" style={{ gap: 6 }}>
            <span className="tiny caps muted">Your notes</span>
            <textarea
              className="input"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What was discussed, what happens next."
            />
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <Button size="sm" variant="secondary" onClick={() => onUpdate(lead, { notes })}>
                Save notes
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="row-between">
      <span className="tiny muted">{label}</span>
      <span className="small" style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function Chip({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius-full)',
        border: `1px solid ${active ? 'var(--primary)' : 'var(--outline-variant)'}`,
        background: active ? 'var(--primary)' : 'var(--surface-lowest)',
        color: active ? 'var(--on-primary)' : 'var(--on-surface-variant)',
        fontSize: 14,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? '';
}
