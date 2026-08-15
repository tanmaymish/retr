import { useState } from 'react';
import { Card, EmptyState, Spinner } from '../components/ui';
import { useApi } from '../lib/useApi';
import { Ranges, Series, Table } from './AdminOverview';

/**
 * Traffic in detail.
 *
 * One thing this page is careful to say out loud: the totals and the daily
 * series come from a rollup that is kept for ever, while sources, devices and
 * events come from raw rows that are deleted after ninety days. Presenting the
 * two side by side without saying so would invite someone to read a
 * ninety-one-day-old zero as a real one.
 */
export default function AdminTraffic() {
  const [days, setDays] = useState(30);
  const { data, loading, error } = useApi(`/admin/traffic?days=${days}`);

  if (loading) return <Spinner label="Reading the numbers" />;
  if (error) {
    return (
      <EmptyState icon="cloud_off" title="Traffic could not load">
        {error.message}
      </EmptyState>
    );
  }

  return (
    <div className="stack stack-lg enter">
      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 4 }}>
          <h1 style={{ fontSize: 30 }}>Traffic</h1>
          <p className="small muted">
            {data.totals.visitors.toLocaleString('en-IN')} visitors and{' '}
            {data.totals.views.toLocaleString('en-IN')} views since {data.from}.
          </p>
        </div>
        <Ranges value={days} onChange={setDays} />
      </div>

      <Card className="stack stack-md">
        <h3>Visitors a day</h3>
        <Series series={data.series} days={days} />
      </Card>

      <div className="grid grid-2">
        <Card className="stack stack-sm">
          <h3>Pages</h3>
          <Table
            rows={data.pages.map((p) => ({ label: p.path, value: p.views }))}
            empty="No page views recorded yet."
          />
        </Card>
        <Card className="stack stack-sm">
          <h3>Sources</h3>
          <Table
            rows={data.referrers.map((r) => ({ label: r.source, value: r.views }))}
            empty="No referrers recorded yet."
          />
          <p className="tiny muted" style={{ lineHeight: 1.6 }}>
            Direct means no referring site — typed in, bookmarked, or from an app that strips it.
          </p>
        </Card>
      </div>

      <div className="grid grid-2">
        <Card className="stack stack-sm">
          <h3>Devices</h3>
          <Table
            rows={data.devices.map((d) => ({ label: d.device, value: d.views }))}
            empty="No devices recorded yet."
          />
        </Card>
        <Card className="stack stack-sm">
          <h3>What people did</h3>
          <Table
            rows={data.events.map((e) => ({ label: e.name, value: e.count }))}
            empty="No events recorded yet."
          />
        </Card>
      </div>

      <Card flat className="stack stack-sm">
        <h4>How this is counted</h4>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          First-party and cookieless. Nothing is sent to any third party, and no identifier is stored
          — a visitor is a hash of coarse request details and a secret that changes daily, so the
          same person can be counted once today and is unrecognisable tomorrow.
        </p>
        <p className="small muted" style={{ lineHeight: 1.75 }}>
          Visitors, views and the daily chart come from a rollup that is kept permanently. Sources,
          devices and events are read from raw rows, which are deleted after ninety days — so those
          four panels only ever describe the last ninety days, whatever range is selected above.
        </p>
      </Card>
    </div>
  );
}
