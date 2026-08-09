import DvCard from '../components/DvCard';
import ProtectionFlow from '../components/ProtectionFlow';
import PageHeader from './PageHeader';
import useDocumentTitle from '../hooks/useDocumentTitle';

const STATS = [
  { label: 'NET WORTH', value: '₹4.83 Cr' },
  { label: 'RESILIENCE', value: '61/100' },
  { label: 'PROTECTION GAP', value: '₹1.2 Cr' },
  { label: 'RETIREMENT', value: '₹3.1 of ₹6 Cr' },
];

export default function WebsiteHome() {
  useDocumentTitle('Home');
  return (
    <div>
      <PageHeader
        kicker="OVERVIEW"
        title="What's happening"
        description="One next action, not fifty products. Tap into it below to see the maths, the options and what deciding actually records."
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          border: '2px solid #201e1d',
          marginBottom: 28,
        }}
      >
        {STATS.map((s, i) => (
          <div key={s.label} style={{ padding: '14px 18px', borderRight: i < STATS.length - 1 ? '1px solid #ddd9d7' : undefined }}>
            <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>{s.label}</div>
            <div style={{ font: '700 18px Archivo, sans-serif', marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <DvCard width={460}>
        <ProtectionFlow />
      </DvCard>
    </div>
  );
}
