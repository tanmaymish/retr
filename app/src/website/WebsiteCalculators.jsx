import { useState } from 'react';
import PageHeader from './PageHeader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Calculator, LineChart, Banknote, Landmark, Percent, Receipt, PieChart, ShieldHalf } from 'lucide-react';
import { Link } from 'react-router-dom';

const CALC_CATEGORIES = [
  {
    title: 'Wealth & Investments',
    items: [
      { id: 'sip', name: 'SIP Calculator', desc: 'Project long-term mutual fund returns.', icon: <LineChart size={20} /> },
      { id: 'stepup', name: 'Step-up SIP', desc: 'Factor in yearly contribution increases.', icon: <TrendingUpIcon /> },
      { id: 'lumpsum', name: 'Lumpsum Return', desc: 'One-time investment future value.', icon: <Banknote size={20} /> },
    ]
  },
  {
    title: 'Loans & Liability',
    items: [
      { id: 'emi', name: 'Home Loan EMI', desc: 'Amortization schedule and interest cost.', icon: <Landmark size={20} /> },
      { id: 'prepay', name: 'EMI Prepayment', desc: 'See how extra payments reduce tenure.', icon: <Percent size={20} /> },
    ]
  },
  {
    title: 'Tax & Retirement',
    items: [
      { id: 'tax', name: 'Income Tax (Old vs New)', desc: 'Compare regimes for maximum savings.', icon: <Receipt size={20} /> },
      { id: 'nps', name: 'NPS Calculator', desc: 'Pension projection and corpus building.', icon: <PieChart size={20} /> },
      { id: 'hlv', name: 'Human Life Value', desc: 'Calculate your true insurance gap.', icon: <ShieldHalf size={20} />, link: '/site/protect' },
    ]
  },
  {
    title: 'Provident & Govt Schemes',
    items: [
      { id: 'epf', name: 'EPF Projection', desc: 'Estimate your Employee Provident Fund maturity.', icon: <Banknote size={20} /> },
      { id: 'ssy', name: 'Sukanya Samriddhi', desc: 'SSY compounding calculator for your daughter.', icon: <TrendingUpIcon /> },
      { id: 'ppf', name: 'PPF Calculator', desc: 'Public Provident Fund tax-free accumulation.', icon: <PieChart size={20} /> }
    ]
  }
];

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
  );
}

export default function WebsiteCalculators() {
  useDocumentTitle('Calculators');
  
  const [expandedSip, setExpandedSip] = useState(false);
  const [sipAmount, setSipAmount] = useState(15000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(25);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateSip = () => {
    const P = sipAmount;
    const i = (sipReturn / 100) / 12;
    const n = sipYears * 12;
    return P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  };

  const [expandedTax, setExpandedTax] = useState(false);
  const [salary, setSalary] = useState(1200000);
  const [deductions80C, setDeductions80C] = useState(150000);
  const [isComputingTax, setIsComputingTax] = useState(false);

  const calculateTax = () => {
    let oldTaxable = Math.max(0, salary - 50000 - deductions80C);
    let oldTax = 0;
    if (oldTaxable > 1000000) { oldTax += (oldTaxable - 1000000) * 0.3; oldTaxable = 1000000; }
    if (oldTaxable > 500000) { oldTax += (oldTaxable - 500000) * 0.2; oldTaxable = 500000; }
    if (oldTaxable > 250000) { oldTax += (oldTaxable - 250000) * 0.05; }
    if (Math.max(0, salary - 50000 - deductions80C) <= 500000) { oldTax = 0; }
    oldTax *= 1.04;

    let newTaxable = Math.max(0, salary - 75000);
    let newTax = 0;
    if (newTaxable > 1500000) { newTax += (newTaxable - 1500000) * 0.3; newTaxable = 1500000; }
    if (newTaxable > 1200000) { newTax += (newTaxable - 1200000) * 0.2; newTaxable = 1200000; }
    if (newTaxable > 1000000) { newTax += (newTaxable - 1000000) * 0.15; newTaxable = 1000000; }
    if (newTaxable > 700000) { newTax += (newTaxable - 700000) * 0.10; newTaxable = 700000; }
    if (newTaxable > 300000) { newTax += (newTaxable - 300000) * 0.05; }
    if (Math.max(0, salary - 75000) <= 700000) { newTax = 0; }
    newTax *= 1.04;

    return { old: oldTax, new: newTax };
  };

  const [expandedLump, setExpandedLump] = useState(false);
  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpReturn, setLumpReturn] = useState(12);
  const [lumpYears, setLumpYears] = useState(10);
  const calculateLump = () => lumpAmount * Math.pow(1 + (lumpReturn / 100), lumpYears);

  const [expandedEmi, setExpandedEmi] = useState(false);
  const [emiAmount, setEmiAmount] = useState(5000000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiYears, setEmiYears] = useState(20);
  const calculateEmi = () => {
    const P = emiAmount;
    const r = (emiRate / 100) / 12;
    const n = emiYears * 12;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const [expandedEpf, setExpandedEpf] = useState(false);
  const [epfBasic, setEpfBasic] = useState(50000);
  const [epfYears, setEpfYears] = useState(25);
  const calculateEpf = () => {
    const monthlyContribution = epfBasic * 0.1567;
    const i = (8.1 / 100) / 12;
    const n = epfYears * 12;
    return monthlyContribution * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        kicker="TOOLS"
        title="Calculators Hub"
        description="Quick math. Use these targeted micro-engines to answer specific financial questions."
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {CALC_CATEGORIES.map(category => (
          <div key={category.title}>
             <h3 style={{ fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)', marginBottom: '16px' }}>{category.title}</h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
               {category.items.map((calc, idx) => (
                 calc.link ? (
                    <Link key={calc.id} to={calc.link} className="card animate-fade-up" style={{ animationDelay: `${idx * 0.05}s`, padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', cursor: 'pointer', textDecoration: 'none', transition: 'border-color 0.2s', border: '1px solid var(--color-divider-subtle)' }}>
                      <div style={{ color: 'var(--color-accent)' }}>{calc.icon}</div>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--color-text)' }}>{calc.name}</h4>
                        <div style={{ fontSize: '13px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', lineHeight: 1.4 }}>{calc.desc}</div>
                      </div>
                    </Link>
                 ) : (
                    <div 
                      key={calc.id} 
                      className="card animate-fade-up" 
                      style={{ animationDelay: `${idx * 0.05}s`, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', cursor: ['sip','tax','lumpsum','emi','epf'].includes(calc.id) ? 'pointer' : 'not-allowed', transition: 'border-color 0.2s', opacity: ['sip','tax','lumpsum','emi','epf'].includes(calc.id) ? 1 : 0.4 }} 
                      onClick={() => { 
                        if (calc.id === 'sip') setExpandedSip(!expandedSip); 
                        if (calc.id === 'tax') setExpandedTax(!expandedTax);
                        if (calc.id === 'lumpsum') setExpandedLump(!expandedLump);
                        if (calc.id === 'emi') setExpandedEmi(!expandedEmi);
                        if (calc.id === 'epf') setExpandedEpf(!expandedEpf);
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--color-accent)' }}>{calc.icon}</div>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>{calc.name}</h4>
                          <div style={{ fontSize: '13px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', lineHeight: 1.4 }}>{calc.desc}</div>
                        </div>
                      </div>
                      
                      {/* Live SIP Engine block */}
                      {calc.id === 'sip' && expandedSip && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-divider)' }} onClick={e => e.stopPropagation()}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                             <label>Monthly SIP</label>
                             <span style={{ fontWeight: 600 }}>₹{sipAmount.toLocaleString('en-IN')}</span>
                           </div>
                           <input type="range" className="range-slider" min="1000" max="100000" step="1000" value={sipAmount} onChange={e => {setSipAmount(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Expected Return</label>
                             <span style={{ fontWeight: 600 }}>{sipReturn}% p.a.</span>
                           </div>
                           <input type="range" className="range-slider" min="5" max="25" step="1" value={sipReturn} onChange={e => {setSipReturn(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Time Period</label>
                             <span style={{ fontWeight: 600 }}>{sipYears} Years</span>
                           </div>
                           <input type="range" className="range-slider" min="1" max="40" step="1" value={sipYears} onChange={e => {setSipYears(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />

                           <div style={{ marginTop: '24px', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>{isCalculating ? 'Computing math...' : 'Estimated Corpus'}</div>
                              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                ₹{calculateSip().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </div>
                           </div>
                        </div>
                      )}

                      {/* Tax Engine block */}
                      {calc.id === 'tax' && expandedTax && (() => {
                        const tax = calculateTax();
                        const oldWins = tax.old < tax.new;
                        const savings = Math.abs(tax.new - tax.old);
                        
                        return (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-divider)' }} onClick={e => e.stopPropagation()}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                               <label>Gross Salary</label>
                               <span style={{ fontWeight: 600 }}>₹{salary.toLocaleString('en-IN')}</span>
                             </div>
                             <input type="range" className="range-slider" min="300000" max="5000000" step="100000" value={salary} onChange={e => {setSalary(Number(e.target.value)); setIsComputingTax(true); setTimeout(() => setIsComputingTax(false), 300);}} />
                             
                             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                               <label>80C + 80D Holdings</label>
                               <span style={{ fontWeight: 600 }}>₹{deductions80C.toLocaleString('en-IN')}</span>
                             </div>
                             <input type="range" className="range-slider" min="0" max="500000" step="10000" value={deductions80C} onChange={e => {setDeductions80C(Number(e.target.value)); setIsComputingTax(true); setTimeout(() => setIsComputingTax(false), 300);}} />

                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                                <div style={{ background: 'color-mix(in srgb, var(--color-surface) 50%, transparent)', border: `1px solid ${!oldWins ? 'var(--color-accent)' : 'var(--color-divider)'}`, padding: '16px', borderRadius: 'var(--radius-md)' }}>
                                   <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>New Regime (Budget '24)</div>
                                   <div style={{ fontSize: '20px', fontWeight: 700, color: !oldWins ? 'var(--color-accent)' : 'var(--color-text)', opacity: isComputingTax ? 0.5 : 1 }}>
                                     ₹{tax.new.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                   </div>
                                </div>
                                <div style={{ background: 'color-mix(in srgb, var(--color-surface) 50%, transparent)', border: `1px solid ${oldWins ? '#4caf50' : 'var(--color-divider)'}`, padding: '16px', borderRadius: 'var(--radius-md)' }}>
                                   <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Old Regime</div>
                                   <div style={{ fontSize: '20px', fontWeight: 700, color: oldWins ? '#4caf50' : 'var(--color-text)', opacity: isComputingTax ? 0.5 : 1 }}>
                                     ₹{tax.old.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                   </div>
                                </div>
                             </div>

                             <div style={{ marginTop: '16px', fontSize: '13px', textAlign: 'center', fontWeight: 600, color: oldWins ? '#4caf50' : 'var(--color-accent)' }}>
                                You save ₹{savings.toLocaleString('en-IN', { maximumFractionDigits: 0 })} using the {oldWins ? 'Old' : 'New'} Regime.
                             </div>
                          </div>
                        );
                      })()}

                      {/* Lumpsum Engine */}
                      {calc.id === 'lumpsum' && expandedLump && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-divider)' }} onClick={e => e.stopPropagation()}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                             <label>Total Investment</label>
                             <span style={{ fontWeight: 600 }}>₹{lumpAmount.toLocaleString('en-IN')}</span>
                           </div>
                           <input type="range" className="range-slider" min="10000" max="10000000" step="10000" value={lumpAmount} onChange={e => {setLumpAmount(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Expected Return</label>
                             <span style={{ fontWeight: 600 }}>{lumpReturn}% p.a.</span>
                           </div>
                           <input type="range" className="range-slider" min="5" max="25" step="1" value={lumpReturn} onChange={e => {setLumpReturn(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Time Period</label>
                             <span style={{ fontWeight: 600 }}>{lumpYears} Years</span>
                           </div>
                           <input type="range" className="range-slider" min="1" max="40" step="1" value={lumpYears} onChange={e => {setLumpYears(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />

                           <div style={{ marginTop: '24px', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>{isCalculating ? 'Computing math...' : 'Estimated Corpus'}</div>
                              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                ₹{calculateLump().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </div>
                           </div>
                        </div>
                      )}

                      {/* EMI Engine */}
                      {calc.id === 'emi' && expandedEmi && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-divider)' }} onClick={e => e.stopPropagation()}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                             <label>Loan Amount</label>
                             <span style={{ fontWeight: 600 }}>₹{emiAmount.toLocaleString('en-IN')}</span>
                           </div>
                           <input type="range" className="range-slider" min="500000" max="20000000" step="500000" value={emiAmount} onChange={e => {setEmiAmount(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Interest Rate</label>
                             <span style={{ fontWeight: 600 }}>{emiRate}% p.a.</span>
                           </div>
                           <input type="range" className="range-slider" min="5" max="15" step="0.1" value={emiRate} onChange={e => {setEmiRate(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Loan Tenure</label>
                             <span style={{ fontWeight: 600 }}>{emiYears} Years</span>
                           </div>
                           <input type="range" className="range-slider" min="1" max="30" step="1" value={emiYears} onChange={e => {setEmiYears(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />

                           <div style={{ marginTop: '24px', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>{isCalculating ? 'Computing math...' : 'Monthly EMI'}</div>
                              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                ₹{calculateEmi().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </div>
                           </div>
                        </div>
                      )}

                      {/* EPF Engine */}
                      {calc.id === 'epf' && expandedEpf && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-divider)' }} onClick={e => e.stopPropagation()}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                             <label>Basic Salary (Monthly)</label>
                             <span style={{ fontWeight: 600 }}>₹{epfBasic.toLocaleString('en-IN')}</span>
                           </div>
                           <input type="range" className="range-slider" min="10000" max="300000" step="5000" value={epfBasic} onChange={e => {setEpfBasic(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />
                           
                           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', marginTop: '16px' }}>
                             <label>Years to Retirement</label>
                             <span style={{ fontWeight: 600 }}>{epfYears} Years</span>
                           </div>
                           <input type="range" className="range-slider" min="1" max="40" step="1" value={epfYears} onChange={e => {setEpfYears(Number(e.target.value)); setIsCalculating(true); setTimeout(() => setIsCalculating(false), 300);}} />

                           <div style={{ marginTop: '24px', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                              <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>{isCalculating ? 'Computing math...' : 'Estimated EPF Corpus'}</div>
                              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-accent)', opacity: isCalculating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                ₹{calculateEpf().toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                 )
               ))}
             </div>
          </div>
        ))}
      </div>
    
    </div>
  );
}
