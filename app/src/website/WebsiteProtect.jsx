import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { ArrowRight } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';

export default function WebsiteProtect() {
  useDocumentTitle('Protection');
  const { setGlobalProtectionGap } = useSiteContext();

  const [annualIncome, setAnnualIncome] = useState(1500000);
  const [existingCover, setExistingCover] = useState(5000000);
  const [outstandingLoans, setOutstandingLoans] = useState(2500000);

  const hlvOutput = useMemo(() => {
     const rawHlv = annualIncome * 15;
     const requiredCover = rawHlv + outstandingLoans;
     const nakedRiskGap = Math.max(0, requiredCover - existingCover);
     const protectionScore = Math.min(100, Math.round((existingCover / requiredCover) * 100)) || 0;
     return { requiredCover, nakedRiskGap, protectionScore };
  }, [annualIncome, existingCover, outstandingLoans]);

  useEffect(() => {
     setGlobalProtectionGap(hlvOutput.nakedRiskGap);
  }, [hlvOutput.nakedRiskGap, setGlobalProtectionGap]);

  const formatCr = (num) => `₹${(num / 10000000).toFixed(2)} Cr`;
  const formatL = (num) => `₹${(num / 100000).toFixed(1)}L`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* Hero number */}
      <div>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Your Protection Gap</p>
        <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: '12px', letterSpacing: '-0.02em', color: hlvOutput.nakedRiskGap > 0 ? 'var(--color-accent)' : '#4caf50' }}>
          {formatCr(hlvOutput.nakedRiskGap)}
        </h1>
        <span className="text-muted" style={{ fontSize: '14px' }}>
          Protection Score: <strong style={{ color: hlvOutput.protectionScore < 50 ? 'var(--color-accent)' : hlvOutput.protectionScore < 80 ? '#f59e0b' : '#4caf50' }}>{hlvOutput.protectionScore}/100</strong>
        </span>
      </div>

      {/* Snapshot */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Total Cover Required (15x Income + Loans)</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{formatCr(hlvOutput.requiredCover)}</span>
          </div>
          <div className="hr" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Existing Life Cover</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{formatL(existingCover)}</span>
          </div>
          <div className="hr" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Outstanding Loans</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{formatL(outstandingLoans)}</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="card" style={{ padding: '32px' }}>
        <p className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>Adjust Your Numbers</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Annual Income</span>
              <span style={{ fontWeight: 600 }}>{formatL(annualIncome)}</span>
            </div>
            <input type="range" className="range-slider" min="500000" max="6000000" step="100000" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Outstanding Loans</span>
              <span style={{ fontWeight: 600 }}>{formatL(outstandingLoans)}</span>
            </div>
            <input type="range" className="range-slider" min="0" max="20000000" step="500000" value={outstandingLoans} onChange={e => setOutstandingLoans(Number(e.target.value))} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Existing Life Cover</span>
              <span style={{ fontWeight: 600 }}>{formatL(existingCover)}</span>
            </div>
            <input type="range" className="range-slider" min="0" max="30000000" step="500000" value={existingCover} onChange={e => setExistingCover(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* CTA */}
      {hlvOutput.nakedRiskGap > 0 && (
        <Link to="/site/explore" className="btn btn-primary" style={{ alignSelf: 'flex-start', fontSize: '15px', padding: '16px 32px' }}>
          Find cover for {formatCr(hlvOutput.nakedRiskGap)} <ArrowRight size={16} style={{ marginLeft: '8px' }} />
        </Link>
      )}

    </div>
  );
}
