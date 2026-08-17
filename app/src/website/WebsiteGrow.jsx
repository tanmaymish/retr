import useDocumentTitle from '../hooks/useDocumentTitle';
import { ArrowRight } from 'lucide-react';

export default function WebsiteGrow() {
  useDocumentTitle('Wealth & Growth');

  const invested = 1840000;
  const currentValue = 2350000;
  const xirr = 18.2;
  const absoluteReturn = currentValue - invested;

  const allocation = [
    { label: 'Equity (MFs & Stocks)', value: 65, color: '#4caf50' },
    { label: 'Debt (PF & Bonds)', value: 25, color: 'var(--color-accent)' },
    { label: 'Gold', value: 5, color: '#f59e0b' },
    { label: 'Cash', value: 5, color: 'color-mix(in srgb, var(--color-text) 30%, transparent)' }
  ];

  const formatL = (num) => `₹${(num / 100000).toFixed(2)}L`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* Hero number */}
      <div>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Portfolio Value</p>
        <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          {formatL(currentValue)}
        </h1>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
          <span style={{ color: '#4caf50', fontWeight: 600 }}>+{formatL(absoluteReturn)}</span>
          <span className="text-muted">XIRR {xirr}%</span>
        </div>
      </div>

      {/* Allocation */}
      <div className="card" style={{ padding: '32px' }}>
        <p className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Asset Allocation</p>

        {/* Bar */}
        <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '6px', overflow: 'hidden', marginBottom: '32px' }}>
          {allocation.map(a => (
            <div key={a.label} style={{ width: `${a.value}%`, background: a.color, height: '100%' }} />
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {allocation.map(a => (
            <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: a.color }} />
                <span style={{ fontSize: '15px' }}>{a.label}</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{a.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="card" style={{ padding: '32px' }}>
        <p className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px' }}>Insights</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px' }}>Tax Harvesting Opportunity</span>
              <span style={{ fontSize: '15px', color: '#4caf50', fontWeight: 600 }}>₹12,050 savings</span>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>₹96,400 unrealized LTCG can be booked under the ₹1.25L threshold.</p>
          </div>

          <div className="hr" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px' }}>Top Fund: Quant Small Cap</span>
              <span style={{ fontSize: '15px', color: '#4caf50', fontWeight: 600 }}>38.4% CAGR</span>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Equity · High Risk · 3 Year trailing return.</p>
          </div>

          <div className="hr" />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '15px' }}>Parag Parikh Flexi Cap</span>
              <span style={{ fontSize: '15px', color: '#4caf50', fontWeight: 600 }}>22.1% CAGR</span>
            </div>
            <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>Equity · Medium Risk · 3 Year trailing return.</p>
          </div>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: '24px', paddingLeft: 0 }}>Explore more funds <ArrowRight size={14} style={{ marginLeft: '4px' }} /></button>
      </div>

    </div>
  );
}
