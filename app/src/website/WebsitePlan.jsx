import { useState, useMemo } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export default function WebsitePlan() {
  useDocumentTitle('Financial Plan');

  const [retireAge, setRetireAge] = useState(60);
  const [monthlySip, setMonthlySip] = useState(20000);
  const [returnRate, setReturnRate] = useState(10);
  
  const currentAge = 27;
  const currentCorpus = 1450000;
  const currentCostOfLiving = 80000;
  const inflation = 6;
  const lifeExpectancy = 85;

  const metrics = useMemo(() => {
    const yearsToRetire = retireAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retireAge;
    const futureMonthlyCost = currentCostOfLiving * Math.pow(1 + inflation / 100, yearsToRetire);
    const requiredCorpus = futureMonthlyCost * 12 * yearsInRetirement;

    const rMonthly = returnRate / 100 / 12;
    const months = yearsToRetire * 12;
    const fvCurrent = currentCorpus * Math.pow(1 + rMonthly, months);
    const fvSip = monthlySip * ((Math.pow(1 + rMonthly, months) - 1) / rMonthly);
    const projectedCorpus = fvCurrent + fvSip;
    const shortfall = Math.max(0, requiredCorpus - projectedCorpus);

    return { requiredCorpus, projectedCorpus, shortfall };
  }, [retireAge, monthlySip, returnRate]);

  const formatCr = (num) => `₹${(num / 10000000).toFixed(2)} Cr`;
  const formatK = (num) => `₹${(num / 1000).toFixed(0)}K`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* Hero number */}
      <div>
        <p className="text-muted" style={{ fontSize: '14px', marginBottom: '8px' }}>Retirement Corpus Required</p>
        <h1 style={{ fontSize: '48px', fontFamily: 'var(--font-heading)', lineHeight: 1, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          {formatCr(metrics.requiredCorpus)}
        </h1>
        {metrics.shortfall > 0 ? (
          <span style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} /> Shortfall of {formatCr(metrics.shortfall)}
          </span>
        ) : (
          <span style={{ color: '#4caf50', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} /> Fully funded — you're on track
          </span>
        )}
      </div>

      {/* Snapshot row */}
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Projected Corpus</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)', color: metrics.shortfall > 0 ? 'var(--color-text)' : '#4caf50' }}>{formatCr(metrics.projectedCorpus)}</span>
          </div>
          <div className="hr" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Years to Retire</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{retireAge - currentAge} yrs</span>
          </div>
          <div className="hr" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Monthly Expenses at Retirement</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{formatK(currentCostOfLiving * Math.pow(1 + inflation / 100, retireAge - currentAge))}</span>
          </div>
          <div className="hr" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px' }}>Assumed Inflation</span>
            <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{inflation}%</span>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="card" style={{ padding: '32px' }}>
        <p className="text-muted" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '32px' }}>Adjust Assumptions</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Retirement Age</span>
              <span style={{ fontWeight: 600 }}>{retireAge} yr</span>
            </div>
            <input type="range" className="range-slider" min="45" max="75" step="1" value={retireAge} onChange={(e) => setRetireAge(Number(e.target.value))} />
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Monthly SIP</span>
              <span style={{ fontWeight: 600 }}>{formatK(monthlySip)}</span>
            </div>
            <input type="range" className="range-slider" min="5000" max="150000" step="1000" value={monthlySip} onChange={(e) => setMonthlySip(Number(e.target.value))} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '12px' }}>
              <span>Expected Return</span>
              <span style={{ fontWeight: 600 }}>{returnRate}%</span>
            </div>
            <input type="range" className="range-slider" min="5" max="15" step="0.5" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} />
          </div>
        </div>
      </div>

    </div>
  );
}
