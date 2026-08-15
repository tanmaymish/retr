import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, EmptyState, Icon, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { Columns } from '../site/Chart';

/**
 * The one screen to open in the morning.
 *
 * Four numbers, the shape of the last month, and the two things that might
 * need doing today — enquiries nobody has replied to, and copy edited but not
 * published. Everything deeper has its own page.
 */

const RANGES = [
  { days: 7, label: '7 days' },
  { days: 30, label: '30 days' },
  { days: 90, label: '90 days' },
];

export default function AdminOverview() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi(`/admin/overview?days=${days}`);

  if (loading) return <Spinner label="Reading the numbers" />;
  if (error) {
    return (
      <EmptyState icon="cloud_off" title="The dashboard could not load">
        {error.message}
      </EmptyState>
    );
  }

  const { traffic, leads, content } = data;
  const newLeads = leads.byStatus.find((s) => s.status === 'new')?.count ?? 0;

  return (
    <div className="stack stack-lg enter">
      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ fontSize: 30 }}>Overview</h1>
          <p className="small muted">The last {days} days.</p>
        </div>
        <Ranges value={days} onChange={setDays} />
      </div>

      <div className="grid grid-4">
        <Stat label="Visitors" value={traffic.totals.visitors} icon="group" />
        <Stat label="Page views" value={traffic.totals.views} icon="visibility" />
        <Stat label="Enquiries" value={leads.recent} icon="inbox" sub={`${leads.total} all time`} />
        <Stat
          label="Waiting for a reply"
          value={newLeads}
          icon="mark_email_unread"
          tone={newLeads > 0 ? 'attention' : undefined}
        />
      </div>

      {content.unpublished > 0 && (
        <Card className="row-between wrap card-gold" style={{ gap: 14 }}>
          <span className="row" style={{ gap: 12 }}>
            <Icon name="edit_note" size={22} style={{ color: 'var(--gold-ink)' }} />
            <span className="stack" style={{ gap: 2 }}>
              <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                {content.unpublished} {content.unpublished === 1 ? 'block has' : 'blocks have'} unpublished edits
              </strong>
              <span className="small muted">Saved as drafts. The live site still shows the old copy.</span>
            </span>
          </span>
          <Link to="/admin/content" className="btn btn-sm">Review and publish</Link>
        </Card>
      )}

      <Card className="stack stack-md">
        <div className="row-between">
          <h3>Visitors a day</h3>
          <span className="tiny muted">From the daily rollup — kept for ever</span>
        </div>
        <Series series={traffic.series} days={days} />
      </Card>

      <div className="grid grid-2">
        <Card className="stack stack-sm">
          <h3>Most read</h3>
          <Table
            rows={traffic.pages.slice(0, 8).map((p) => ({ label: p.path, value: p.views }))}
            empty="No page views recorded yet."
          />
        </Card>
        <Card className="stack stack-sm">
          <h3>Where they came from</h3>
          <Table
            rows={traffic.referrers.slice(0, 8).map((r) => ({ label: r.source, value: r.views }))}
            empty="No referrers recorded yet."
          />
        </Card>
      </div>
    </div>
  );
}

export function Ranges({ value, onChange }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {RANGES.map((range) => (
        <button
          key={range.days}
          type="button"
          className={`btn btn-sm ${value === range.days ? '' : 'btn-secondary'}`}
          onClick={() => onChange(range.days)}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ label, value, icon, sub, tone }) {
  return (
    <Card className="stack" style={{ gap: 6 }}>
      <span className="row-between">
        <span className="tiny caps muted">{label}</span>
        <Icon name={icon} size={18} style={{ color: tone === 'attention' ? '#a02a42' : 'var(--gold)' }} />
      </span>
      <strong
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 40,
          lineHeight: 1,
          color: tone === 'attention' ? '#a02a42' : 'var(--primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value.toLocaleString('en-IN')}
      </strong>
      {sub && <span className="tiny muted">{sub}</span>}
    </Card>
  );
}

/**
 * The daily series as columns.
 *
 * Days with no traffic are filled in as zero rather than skipped: a chart that
 * silently omits the quiet days makes a bad week look like a busy one.
 */
export function Series({ series, days }) {
  const byDay = new Map(series.map((row) => [row.day, row]));
  const points = [];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
    const row = byDay.get(day);
    points.push({
      x: day,
      y: row?.visitors ?? 0,
      label: `${day}: ${row?.visitors ?? 0} visitors, ${row?.views ?? 0} views`,
    });
  }

  if (points.every((p) => p.y === 0)) {
    return <p className="small muted">Nothing recorded yet. Numbers appear as people visit.</p>;
  }

  return (
    <Columns
      points={points}
      height={170}
      aria={`Visitors a day over the last ${days} days.`}
      foot={[points[0].x, points.at(-1).x]}
    />
  );
}

export function Table({ rows, empty }) {
  if (rows.length === 0) return <p className="small muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="stack" style={{ gap: 0 }}>
      {rows.map((row) => (
        <div key={row.label} className="admin-bar-row">
          <span className="small" style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {row.label}
          </span>
          <span className="admin-bar" aria-hidden="true">
            <span style={{ width: `${(row.value / max) * 100}%` }} />
          </span>
          <span className="small" style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
            {row.value.toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  );
}
