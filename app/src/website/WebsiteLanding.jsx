import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Logo from '../components/Logo';
import { Compass, Bot, ShieldCheck, ArrowRight, Zap, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './WebsiteLanding.css';

function LiveMarketRibbon() {
  const [news, setNews] = useState([
    { id: 1, text: "RBI maintains repo rate at 6.5%, signals stable interest rates for upcoming quarter." },
    { id: 2, text: "NIFTY 50 surges past 24,000 mark on strong IT and Banking earnings." },
    { id: 3, text: "New Tax Regime adoption hits 65% among salaried professionals this financial year." },
    { id: 4, text: "Gold prices stabilize at ₹72,400 per 10g amid global geopolitical shifts." }
  ]);
  const [storyIndex, setStoryIndex] = useState(0);
  const [indices, setIndices] = useState([
    { name: "NIFTY 50", val: 24320.50, up: true },
    { name: "SENSEX", val: 78912.40, up: false }
  ]);

  useEffect(() => {
    const int = setInterval(() => {
      setIndices(prev => prev.map(i => ({
        ...i,
        val: i.val + (Math.random() * 10 - 5),
        up: Math.random() > 0.5
      })));
    }, 2500);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    const storyInt = setInterval(() => {
      setStoryIndex(prev => (prev + 1) % news.length);
    }, 4000); // 4 seconds per story
    return () => clearInterval(storyInt);
  }, [news.length]);

  return (
    <div className="live-market-ribbon">
      <div className="ribbon-left">
        <span className="live-node">LIVE</span>
        {indices.map((idx, i) => (
          <div key={i} className="live-index-node">
            <div style={{ fontSize: '10px', color: 'var(--color-text)', opacity: 0.5, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>{idx.name}</div>
            <div className={idx.up ? 'flash-green' : 'flash-red'} style={{ fontSize: '15px', fontFamily: 'monospace' }}>
              {idx.val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="ribbon-right">
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Alpha Broadcast</div>
        <div key={storyIndex} className="ribbon-news-item">
          {news[storyIndex].text}
        </div>
      </div>
    </div>
  );
}

function LandingMarquee() {
  const [ticks, setTicks] = useState([
    { symbol: 'NIFTY 50', val: 24320.50, diff: 45.20, up: true },
    { symbol: 'SENSEX', val: 78912.40, diff: -12.10, up: false },
    { symbol: 'RELIANCE', val: 2940.10, diff: 12.45, up: true },
    { symbol: 'HDFC BANK', val: 1640.20, diff: 5.10, up: true },
    { symbol: 'TCS', val: 3890.50, diff: -14.20, up: false },
    { symbol: 'GOLD 24K', val: 72400.00, diff: 120.00, up: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicks(prev => prev.map(t => {
        const change = (Math.random() * 10) - 5;
        return { ...t, val: t.val + change, diff: t.diff + change, up: change >= 0 };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const TickerTrack = () => (
    <>
      {ticks.map((t, i) => (
        <div key={i} className="landing-marquee-item">
          <span>{t.symbol}</span>
          <span style={{ color: t.up ? '#4caf50' : 'var(--color-accent)' }}>{t.val.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span style={{ color: t.up ? '#4caf50' : 'var(--color-accent)', display: 'flex', alignItems: 'center' }}>
            {t.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(t.diff).toFixed(2)}
          </span>
        </div>
      ))}
    </>
  );

  return (
    <div className="landing-marquee-container">
      <div className="landing-marquee-track">
        <TickerTrack />
        <TickerTrack />
        <TickerTrack />
        <TickerTrack />
      </div>
    </div>
  );
}

export default function WebsiteLanding() {
  useDocumentTitle('Akshay Vridhi | The Indian Financial OS');
  const navigate = useNavigate();

  return (
    <div className="landing-layout">
      {/* Dynamic Background */}
      <div className="financial-gradient-bg" />
      <LandingMarquee />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-logo">
           <Logo size={40} align="left" tagline={false} />
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/site/home')}>Access Dashboard <ArrowRight size={16} /></button>
      </nav>

      <main className="landing-main">
        {/* Center Hero Section */}
        <header className="landing-hero">
          <h1 className="landing-headline">
             The Trusted Financial Guide.<br/><span className="text-gradient">For Indian Households.</span>
          </h1>
          
          {/* Trust Action Ribbon */}
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
             <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
               <ShieldCheck size={16} color="#4caf50" /> STRICTLY IRDAI SOURCED
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
               <ShieldCheck size={16} color="#4caf50" /> SEBI LOGIC ALIGNED
             </span>
             <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
               <ShieldCheck size={16} color="#4caf50" /> 100% SECURE CALCULATION
             </span>
          </div>
          
          <LiveMarketRibbon />
        </header>

        {/* Actionable Funnel Grid (Bento Box Style) */}
        <section style={{ marginTop: '4vh' }}>
          <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '32px', color: 'color-mix(in srgb, var(--color-text) 60%, transparent)', fontWeight: 500 }}>
            What would you like to solve today?
          </h2>
          <div className="bento-grid">
            
            {/* Bento Featured: Huge 2x2 Span */}
            <div className="bento-card bento-featured" onClick={() => navigate('/site/ask')}>
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <div style={{ width: '48px', height: '48px', marginBottom: '16px', background: 'linear-gradient(135deg, color-mix(in srgb, #9c27b0 20%, transparent) 0%, transparent 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, #9c27b0 20%, transparent)' }}>
                   <Bot size={28} color="#9c27b0" />
                 </div>
                 <h3 style={{ fontSize: '28px', margin: 0, fontFamily: 'var(--font-heading)' }}>AI Financial Advisor</h3>
                 <p className="text-muted" style={{ margin: 0, fontSize: '16px', maxWidth: '80%' }}>Get instant, personalized answers to all your tax and investment queries entirely securely.</p>
               </div>
               <div style={{ alignSelf: 'flex-end', padding: '8px 16px', background: 'var(--color-bg)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600 }}>Try Nemotron Copilot &rarr;</div>
            </div>

            {/* Bento Standard: 1x1 Squares */}
            <div className="bento-card bento-standard" onClick={() => navigate('/site/protect')}>
               <div style={{ width: '40px', height: '40px', marginBottom: '16px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 20%, transparent) 0%, transparent 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, var(--color-accent) 20%, transparent)' }}>
                 <ShieldCheck size={24} color="var(--color-accent)" />
               </div>
               <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Term Insurance</h3>
               <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>Secure your family's future with expertly curated high-cover term plans.</p>
            </div>

            <div className="bento-card bento-standard" onClick={() => navigate('/site/grow')}>
               <div style={{ width: '40px', height: '40px', marginBottom: '16px', background: 'linear-gradient(135deg, color-mix(in srgb, #4caf50 20%, transparent) 0%, transparent 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, #4caf50 20%, transparent)' }}>
                 <Compass size={24} color="#4caf50" />
               </div>
               <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Tax Planning</h3>
               <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>Compare Old vs New Regimes and maximize your deductions effortlessly.</p>
            </div>

            {/* Span entire bottom row below featured if we want, or just another 1x1 next to it */}
            <div className="bento-card bento-standard" onClick={() => navigate('/site/calculators')}>
               <div style={{ width: '40px', height: '40px', marginBottom: '16px', background: 'linear-gradient(135deg, color-mix(in srgb, #ff9800 20%, transparent) 0%, transparent 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid color-mix(in srgb, #ff9800 20%, transparent)' }}>
                 <Calculator size={24} color="#ff9800" />
               </div>
               <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Investment Tools</h3>
               <p className="text-muted" style={{ margin: 0, fontSize: '13px' }}>Easily calculate SIP compounding, Home Loan EMIs, and EPF returns.</p>
            </div>

          </div>
        </section>


      </main>
      
      <footer className="landing-footer">
         Powered by React 19 • Vite • FreeLLMAPI • Akshay Vridhi Architecture
      </footer>
    </div>
  );
}
