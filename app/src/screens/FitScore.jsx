import { IOSDevice } from '../components/frames/IOSFrame';
import { fitExplanationsContent } from '../data/aiContent';

const FALLBACK = {
  why_matched: [
    'Covers the ₹1.2 Cr gap with 4% headroom',
    'Term ends at 60 — the year your loan does',
    'Premium is 0.9% of income, inside your stated budget',
  ],
  considerations: [
    'Suicide exclusion in the first 12 months',
    'Medical test required — the quote can change',
  ],
};

export default function FitScore() {
  const ai = fitExplanationsContent?.products?.A;
  const whyMatched = ai?.why_matched?.length ? ai.why_matched : FALLBACK.why_matched;
  const considerations = ai?.considerations?.length ? ai.considerations : FALLBACK.considerations;
  const isAI = Boolean(ai?.why_matched?.length);

  return (
    <IOSDevice title="Term cover options">
      <div style={{ background: '#fff', fontFamily: 'Archivo, sans-serif', color: '#201e1d' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '2px solid #201e1d' }}>
          {[
            ['BEST MATCH', 94, true],
            ['CHEAPER', 88, false],
            ['MORE COVER', 87, false],
            ['FEATURES', 85, false],
          ].map(([label, score, best]) => (
            <div
              key={label}
              style={{
                padding: '12px 10px',
                background: best ? '#201e1d' : undefined,
                color: best ? '#fff' : undefined,
                borderRight: best ? undefined : '1px solid #ddd9d7',
              }}
            >
              <div style={{ font: '600 8px Archivo, sans-serif', letterSpacing: '.08em', color: best ? undefined : '#8a8785' }}>{label}</div>
              <div style={{ font: '700 18px Archivo, sans-serif', marginTop: 5, color: best ? undefined : '#8a8785' }}>{score}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid #ddd9d7' }}>
          <div style={{ font: '600 15px Archivo, sans-serif' }}>Provider A — Term Shield</div>
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
            {[['COVER', '₹1.25 Cr'], ['MONTHLY', '₹1,842'], ['TERM', '22 yrs']].map(([label, val]) => (
              <div key={label}>
                <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>{label}</div>
                <div style={{ font: '600 15px Archivo, sans-serif', marginTop: 4 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
          WHY THIS MATCHED YOU
        </div>
        <div style={{ padding: '0 20px 12px', borderBottom: '1px solid #ddd9d7' }}>
          {whyMatched.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0' }}>
              <span style={{ width: 10, height: 10, background: '#201e1d', marginTop: 4, flex: 'none' }} />
              <span style={{ font: '400 12px/1.4 Archivo, sans-serif' }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#b7290f' }}>
          THINGS TO CONSIDER
        </div>
        <div style={{ padding: '0 20px 12px', borderBottom: '2px solid #201e1d' }}>
          {considerations.map((line, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0' }}>
              <span style={{ width: 10, height: 10, border: '2px solid #ec3013', marginTop: 4, flex: 'none' }} />
              <span style={{ font: '400 12px/1.4 Archivo, sans-serif' }}>{line}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 20px', background: '#f3f2f2', borderBottom: '2px solid #201e1d', font: '500 10px/1.6 ui-monospace, monospace', color: '#5f5c5a' }}>
          {isAI ? 'AI-GENERATED EXPLANATION' : 'DESIGN SAMPLE COPY'} · SCORING MODEL v4.2 · PREMIUM VERIFIED 2 DAYS AGO
          <br />
          WE EARN A DISTRIBUTION COMMISSION ON THIS PRODUCT. IT DOES NOT AFFECT THE SCORE.
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button className="btn btn-primary btn-block" style={{ justifyContent: 'flex-start' }}>CONTINUE WITH THIS</button>
          <button className="btn btn-ghost btn-block" style={{ justifyContent: 'flex-start' }}>SHOW THE SCORE BREAKDOWN</button>
        </div>
      </div>
    </IOSDevice>
  );
}
