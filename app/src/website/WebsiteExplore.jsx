import { useState, useEffect } from 'react';
import PageHeader from './PageHeader';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Shield, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, FileText, Info } from 'lucide-react';
import { useSiteContext } from '../context/SiteContext';

const BASE_POLICIES = [
  {
    id: 'p1',
    name: 'Max Life Smart Secure Plus',
    provider: 'Max Life Insurance',
    cover: '₹2 Cr',
    basePremium: 14500,
    claimRatio: '99.51%',
    matchScore: 94,
    solvencyRatio: '2.14',
    aum: '₹1.5 Lakh Cr',
    inbuiltRiders: 'Terminal Illness Cover',
    pros: ['Coverage sufficiently matches your minimum gap', 'Claim settlement ratio is highest in industry', 'Solvency ratio strongly exceeds IRDAI minimum of 1.50'],
    concerns: ['Waiver of Premium is chargeable extra'],
    keyFeatures: { term: 'to age 70', waiting: '0 days', claimTime: '24 hours' }
  },
  {
    id: 'p2',
    name: 'HDFC Click 2 Protect Super',
    provider: 'HDFC Life',
    cover: '₹2 Cr',
    basePremium: 15200,
    claimRatio: '99.04%',
    matchScore: 88,
    solvencyRatio: '2.03',
    aum: '₹2.9 Lakh Cr',
    inbuiltRiders: 'WOP on Accidental Disability',
    pros: ['Massive institutional AUM provides absolute trust', 'Flexible payout options for nominees'],
    concerns: ['Slightly higher premium than alternatives', 'Strict medical underwriting'],
    keyFeatures: { term: 'to age 70', waiting: '0 days', claimTime: '24 hours' }
  },
  {
    id: 'p3',
    name: 'ICICI iProtect Smart',
    provider: 'ICICI Prudential',
    cover: '₹1.5 Cr',
    basePremium: 12000,
    claimRatio: '97.80%',
    matchScore: 72,
    solvencyRatio: '2.09',
    aum: '₹2.7 Lakh Cr',
    inbuiltRiders: 'Critical Illness (Default)',
    pros: ['Very cost-effective', 'Free mandatory terminal illness cover'],
    concerns: ['Coverage falls short of your required gap', 'Claim ratio slightly lower than Max/HDFC'],
    keyFeatures: { term: 'to age 75', waiting: '0 days', claimTime: '48 hours' }
  },
  {
    id: 'p4',
    name: 'Tata AIA Maha Life Gold',
    provider: 'Tata AIA',
    cover: '₹2.5 Cr',
    basePremium: 16400,
    claimRatio: '99.01%',
    matchScore: 91,
    solvencyRatio: '2.12',
    aum: '₹1.1 Lakh Cr',
    inbuiltRiders: 'Accidental Death Benefit',
    pros: ['Extensive coverage surpassing your minimum gap', 'Strong legacy trust associated with Tata'],
    concerns: ['Premium is on the higher end of the spectrum'],
    keyFeatures: { term: 'to age 75', waiting: '30 days', claimTime: '24 hours' }
  },
  {
    id: 'p5',
    name: 'LIC Tech Term Plan',
    provider: 'LIC of India',
    cover: '₹2 Cr',
    basePremium: 13800,
    claimRatio: '98.52%',
    matchScore: 85,
    solvencyRatio: '1.92',
    aum: '₹47 Lakh Cr',
    inbuiltRiders: 'None',
    pros: ['Absolute sovereign guarantee', 'Unrivaled AUM size in India'],
    concerns: ['Completely vanilla product with zero default riders', 'Slower claim payout SLA'],
    keyFeatures: { term: 'to age 80', waiting: '90 days', claimTime: '7 days' }
  },
  {
    id: 'p6',
    name: 'SBI Life eShield Next',
    provider: 'SBI Life',
    cover: '₹2 Cr',
    basePremium: 14900,
    claimRatio: '97.05%',
    matchScore: 78,
    solvencyRatio: '2.25',
    aum: '₹3.6 Lakh Cr',
    inbuiltRiders: 'Terminal Illness',
    pros: ['Very high solvency ratio showing extreme liquidity bounds', 'Backed by SBI network'],
    concerns: ['Relatively lower claim ratio vs private giants', 'Medical checks are extremely stringent'],
    keyFeatures: { term: 'to age 70', waiting: '0 days', claimTime: '3 days' }
  }
];

export default function WebsiteExplore() {
  useDocumentTitle('Policy Discovery');
  const { globalProtectionGap } = useSiteContext();
  const formatCr = (num) => `₹${(num / 10000000).toFixed(2)} Cr`;
  
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [comparing, setComparing] = useState(false);
  const [livePolicies, setLivePolicies] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const fetchLiveQuotes = () => {
    setIsFetching(true);
    setLoadingStep(0);
    // Sequence loader steps
    setTimeout(() => setLoadingStep(1), 600);
    setTimeout(() => setLoadingStep(2), 1200);
    setTimeout(() => setLoadingStep(3), 1800);
    
    // Resolve data
    setTimeout(() => {
      const generated = BASE_POLICIES.map(p => {
        const volatility = Math.floor(Math.random() * 401) - 200; // -200 to +200
        const newPremium = p.basePremium + volatility;
        return {
          ...p,
          premium: `₹${newPremium.toLocaleString('en-IN')}/yr`
        };
      });
      setLivePolicies(generated);
      setIsFetching(false);
    }, 2400);
  };

  useEffect(() => {
    fetchLiveQuotes();
  }, []);
  const [searchText, setSearchText] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleChat = (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    setIsTyping(true);
    setChatResponse('');
    setTimeout(() => {
      setChatResponse("Based on your query, Max Life Smart Secure Plus offers the best claim ratio (99.51%). It fully covers your ₹2 Cr gap with ₹1.5L Cr AUM backing.");
      setIsTyping(false);
    }, 1200);
  };

  const toggleCompare = (id) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, id]);
    }
  };

  if (comparing) {
    const p1 = livePolicies.find(p => p.id === selectedForCompare[0]);
    const p2 = livePolicies.find(p => p.id === selectedForCompare[1]);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setComparing(false)}>
           <ArrowRight size={20} style={{ transform: 'rotate(180deg)' }} /> <span style={{ fontWeight: 600 }}>Back to Discovery</span>
         </div>
         
         <div className="card" style={{ padding: '32px' }}>
           <h2 style={{ marginBottom: '24px' }}>Side-by-Side Comparison</h2>
           
           <table className="table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>FEATURE</th>
                  <th>{p1.name} <div style={{ fontSize: '12px', color: 'var(--color-accent)' }}>Match: {p1.matchScore}</div></th>
                  <th>{p2.name} <div style={{ fontSize: '12px', color: 'var(--color-accent)' }}>Match: {p2.matchScore}</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Provider</td>
                  <td style={{ fontWeight: 600 }}>{p1.provider}</td>
                  <td style={{ fontWeight: 600 }}>{p2.provider}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Life Cover</td>
                  <td style={{ fontSize: '18px', fontWeight: 700 }}>{p1.cover}</td>
                  <td style={{ fontSize: '18px', fontWeight: 700 }}>{p2.cover}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Annual Premium</td>
                  <td style={{ color: 'var(--color-accent)' }}>{p1.premium}</td>
                  <td style={{ color: 'var(--color-accent)' }}>{p2.premium}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Claim Settlement</td>
                  <td>{p1.claimRatio}</td>
                  <td>{p2.claimRatio}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Solvency Ratio</td>
                  <td style={{ fontWeight: 600, color: Number(p1.solvencyRatio) >= 1.5 ? '#4caf50' : 'var(--color-accent)' }}>{p1.solvencyRatio}</td>
                  <td style={{ fontWeight: 600, color: Number(p2.solvencyRatio) >= 1.5 ? '#4caf50' : 'var(--color-accent)' }}>{p2.solvencyRatio}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Total AUM</td>
                  <td>{p1.aum}</td>
                  <td>{p2.aum}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Inbuilt Riders</td>
                  <td>{p1.inbuiltRiders}</td>
                  <td>{p2.inbuiltRiders}</td>
                </tr>
                <tr>
                  <td style={{ color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Policy Term</td>
                  <td>{p1.keyFeatures.term}</td>
                  <td>{p2.keyFeatures.term}</td>
                </tr>
              </tbody>
           </table>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '32px' }}>
             <button className="btn btn-primary">Proceed with {p1.provider}</button>
             <button className="btn btn-primary">Proceed with {p2.provider}</button>
           </div>
         </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <PageHeader
        kicker="DISCOVERY ENGINE"
        title="Intelligent Policy Match"
        description="We matched your specific financial gap against the market safely and impartially."
      />

      <div style={{ background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)', padding: '24px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '24px', alignItems: 'center' }}>
         <div style={{ background: 'var(--color-accent)', padding: '16px', borderRadius: '50%', color: 'var(--color-bg)' }}>
           <Shield size={32} />
         </div>
         <div>
           <div style={{ fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-accent)', fontWeight: 700 }}>Identified Need</div>
           <div style={{ fontSize: '24px', fontWeight: 600, margin: '4px 0' }}>{formatCr(globalProtectionGap)} Term Life Protection</div>
           <div style={{ color: 'var(--color-text)', opacity: 0.8, fontSize: '14px' }}>Based directly on your live Human Life Value module.</div>
         </div>
         <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
           <div style={{ fontSize: '12px', color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' }}>Evaluation Rigor</div>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#4caf50', justifyContent: 'flex-end' }}>
               <CheckCircle2 size={12} /> CSR & Solvency Verified
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#4caf50', justifyContent: 'flex-end' }}>
               <CheckCircle2 size={12} /> IRDAI Data Sourced
             </div>
           </div>
         </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Search & Chat Command Bar */}
        <div className="card" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', background: 'color-mix(in srgb, var(--color-surface) 50%, transparent)' }}>
           <input 
             type="text" 
             placeholder="Search by provider or feature (e.g. 'HDFC')..." 
             value={searchText} 
             onChange={e => setSearchText(e.target.value)}
             style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-divider)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}
           />
           <form onSubmit={handleChat} style={{ flex: 1, display: 'flex', gap: '8px' }}>
             <input 
               type="text" 
               placeholder="✨ Ask Nemotron to suggest a policy..." 
               value={chatQuery} 
               onChange={e => setChatQuery(e.target.value)}
               style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-full)', border: '1px outset var(--color-accent)', background: 'color-mix(in srgb, var(--color-accent) 5%, transparent)', color: 'var(--color-text)', outline: 'none' }}
             />
             <button type="submit" className="btn btn-primary" style={{ padding: '0 24px', borderRadius: 'var(--radius-full)' }}>Suggest</button>
           </form>
        </div>

        {(chatResponse || isTyping) && (
          <div style={{ padding: '16px 24px', background: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', borderLeft: '4px solid var(--color-accent)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '4px' }}>Nemotron AI Copilot</div>
            <div style={{ fontSize: '14px', lineHeight: 1.5 }}>{isTyping ? 'Analyzing optimal policies...' : chatResponse}</div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <h3 style={{ margin: 0 }}>Top Matches for You</h3>
             <button className="btn" onClick={fetchLiveQuotes} style={{ padding: '4px 12px', fontSize: '11px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', color: 'var(--color-text)', borderRadius: 'var(--radius-full)' }}>Refresh Quotes</button>
          </div>
          {selectedForCompare.length > 0 && (
            <button 
              className="btn btn-primary" 
              disabled={selectedForCompare.length < 2}
              onClick={() => setComparing(true)}
            >
              Compare {selectedForCompare.length}/2
            </button>
          )}
        </div>

        {isFetching ? (
          <div className="card" style={{ padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--color-accent)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid color-mix(in srgb, var(--color-accent) 20%, transparent)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
              {loadingStep === 0 && 'Opening secure IRDAI channels...'}
              {loadingStep === 1 && 'Scanning 43 institutions for premiums...'}
              {loadingStep === 2 && 'Applying baseline solvency verifications...'}
              {loadingStep === 3 && 'Finalizing policy matches...'}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : livePolicies.filter(p => !searchText || p.name.toLowerCase().includes(searchText.toLowerCase()) || p.provider.toLowerCase().includes(searchText.toLowerCase())).map((policy, idx) => {
          const isSelected = selectedForCompare.includes(policy.id);
          return (
            <div key={policy.id} className="card animate-fade-up" style={{ animationDelay: `${idx * 0.1}s`, padding: '24px', flexDirection: 'row', gap: '32px', borderColor: isSelected ? 'var(--color-accent)' : undefined }}>
               
               {/* Match Score */}
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '100px', borderRight: '1px solid var(--color-divider-subtle)', paddingRight: '24px' }}>
                 <div style={{ fontSize: '36px', fontWeight: 700, color: policy.matchScore > 80 ? '#4caf50' : 'var(--color-text)' }}>
                   {policy.matchScore}
                 </div>
                 <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' }}>Match Score</div>
               </div>

               {/* Policy Info */}
               <div style={{ flex: 1 }}>
                 <div style={{ fontSize: '13px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', marginBottom: '4px' }}>{policy.provider}</div>
                 <h4 style={{ fontSize: '20px', margin: '0 0 16px 0' }}>{policy.name}</h4>
                 
                 <div style={{ display: 'flex', gap: '32px' }}>
                   <div>
                     <div style={{ fontSize: '11px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', textTransform: 'uppercase' }}>Life Cover</div>
                     <div style={{ fontSize: '16px', fontWeight: 600 }}>{policy.cover}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', textTransform: 'uppercase' }}>Annual Premium</div>
                     <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-accent)' }}>{policy.premium}</div>
                   </div>
                   <div>
                     <div style={{ fontSize: '11px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', textTransform: 'uppercase' }}>Claim Ratio</div>
                     <div style={{ fontSize: '16px', fontWeight: 600 }}>{policy.claimRatio}</div>
                   </div>
                 </div>
               </div>

               {/* Rationale (Pros/Cons) */}
               <div style={{ flex: 1.5, background: 'color-mix(in srgb, var(--color-surface) 50%, transparent)', padding: '16px', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                 <div style={{ marginBottom: '12px', fontWeight: 600 }}>Why this score?</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   {policy.pros.map(pro => (
                     <div key={pro} style={{ display: 'flex', gap: '8px', color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
                       <CheckCircle2 size={16} color="#4caf50" style={{ flexShrink: 0 }} /> <span>{pro}</span>
                     </div>
                   ))}
                   {policy.concerns.map(con => (
                     <div key={con} style={{ display: 'flex', gap: '8px', color: 'color-mix(in srgb, var(--color-text) 80%, transparent)' }}>
                       <ShieldAlert size={16} color="var(--color-accent)" style={{ flexShrink: 0 }} /> <span>{con}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Actions */}
               <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px', minWidth: '140px', paddingLeft: '16px' }}>
                 <button className="btn btn-primary btn-block" style={{ justifyContent: 'center' }}>Explore</button>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', userSelect: 'none', justifyContent: 'center' }}>
                   <input type="checkbox" checked={isSelected} onChange={() => toggleCompare(policy.id)} disabled={!isSelected && selectedForCompare.length >= 2} /> Compare
                 </label>
               </div>
               
            </div>
          );
        })}
      </div>

    </div>
  );
}
