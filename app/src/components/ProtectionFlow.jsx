import { useState } from 'react';

// The action → why → options → decided state machine (originally screen 4a).
// Framing-agnostic: no device chrome of its own, so it can be shown inside a
// standalone IOSDevice (the design gallery) or embedded in the app shell's
// own persistent frame (the real app).
const STEP_LABELS = {
  home: "STEP 1 OF 4 · WHAT'S HAPPENING",
  gap: 'STEP 2 OF 4 · WHY',
  opts: 'STEP 3 OF 4 · OPTIONS',
  done: 'STEP 4 OF 4 · DECIDED',
};

export default function ProtectionFlow() {
  const [step, setStep] = useState('home');

  return (
    <div style={{ background: '#fff', fontFamily: 'Archivo, sans-serif', color: '#201e1d' }}>
      {step !== 'home' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '9px 20px',
            background: '#f3f2f2',
            borderBottom: '1px solid #ddd9d7',
          }}
        >
          <span style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
            {STEP_LABELS[step]}
          </span>
          <span
            onClick={() => setStep('home')}
            style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#b7290f', cursor: 'pointer' }}
          >
            RESTART
          </span>
        </div>
      )}

      {step === 'home' && <HomeStep onGap={() => setStep('gap')} />}
      {step === 'gap' && <GapStep onOpts={() => setStep('opts')} onBack={() => setStep('home')} />}
      {step === 'opts' && <OptsStep onDone={() => setStep('done')} onBack={() => setStep('gap')} />}
      {step === 'done' && <DoneStep onHome={() => setStep('home')} />}
    </div>
  );
}

function HomeStep({ onGap }) {
  return (
    <div>
      <div style={{ padding: '18px 20px', borderBottom: '2px solid #201e1d' }}>
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
          WHAT'S HAPPENING
        </div>
        <div style={{ font: '700 23px/1.25 Archivo, sans-serif', letterSpacing: '-.02em', margin: '10px 0' }}>
          If your income stopped today, your family has 4.2 months of cover.
        </div>
        <div style={{ display: 'flex', gap: 22 }}>
          <div>
            <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>RESILIENCE</div>
            <div style={{ font: '700 22px Archivo, sans-serif', marginTop: 5 }}>
              61<span style={{ font: '500 12px Archivo, sans-serif', color: '#8a8785' }}>/100</span>
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #ddd9d7', paddingLeft: 22 }}>
            <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>LAST MONTH</div>
            <div style={{ font: '700 22px Archivo, sans-serif', marginTop: 5, color: '#8a8785' }}>57</div>
          </div>
        </div>
      </div>
      <div
        onClick={onGap}
        style={{ padding: '16px 20px', background: '#201e1d', color: '#fff', borderBottom: '2px solid #201e1d', cursor: 'pointer' }}
      >
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#ff8a72' }}>
          YOUR NEXT BEST ACTION
        </div>
        <div style={{ font: '700 19px/1.3 Archivo, sans-serif', margin: '9px 0 8px' }}>
          Close a ₹1.2 Cr life protection gap
        </div>
        <div style={{ font: '400 12px/1.5 Archivo, sans-serif', color: '#c9c6c4' }}>
          Two dependent children and 19 years of home loan sit behind one income.
        </div>
        <div style={{ marginTop: 14, padding: '11px 14px', background: '#ec3013', display: 'inline-block', font: '600 11px Archivo, sans-serif' }}>
          SHOW ME WHY →
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid #eceaea' }}>
        <span className="tag tag-accent" style={{ height: 'fit-content' }}>HIGH</span>
        <div>
          <div style={{ font: '600 13px Archivo, sans-serif' }}>Health cover is ₹5L for four people</div>
          <div style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785', marginTop: 3 }}>One hospitalisation would exhaust it</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid #eceaea' }}>
        <span className="tag tag-neutral" style={{ height: 'fit-content' }}>MEDIUM</span>
        <div>
          <div style={{ font: '600 13px Archivo, sans-serif' }}>Retirement tracking to ₹3.1 Cr of ₹6 Cr</div>
          <div style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785', marginTop: 3 }}>At 7% real growth, retiring at 58</div>
        </div>
      </div>
      <div style={{ padding: '14px 20px', background: '#f3f2f2', font: '400 11px/1.5 Archivo, sans-serif', color: '#5f5c5a' }}>
        Two of these three are fixed by changing what you already own.
      </div>
    </div>
  );
}

function GapStep({ onOpts, onBack }) {
  const row = (label, sub, value, subColor, valueColor, last) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 20px',
        borderBottom: last ? '2px solid #201e1d' : '1px solid #eceaea',
      }}
    >
      <div>
        <div style={{ font: '600 13px Archivo, sans-serif' }}>{label}</div>
        <div style={{ font: '400 11px Archivo, sans-serif', color: subColor || '#8a8785', marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ font: '600 13px Archivo, sans-serif', color: valueColor }}>{value}</div>
    </div>
  );
  return (
    <div>
      <div style={{ padding: '18px 20px', borderBottom: '2px solid #201e1d' }}>
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#b7290f' }}>
          CRITICAL · LIFE PROTECTION
        </div>
        <div style={{ font: '700 34px/1 Archivo, sans-serif', letterSpacing: '-.03em', margin: '12px 0 8px' }}>₹1.2 Cr</div>
        <div style={{ font: '400 12px/1.5 Archivo, sans-serif', color: '#5f5c5a' }}>
          Required ₹2.7 Cr — existing ₹1.5 Cr. Estimated from what you have told us.
        </div>
      </div>
      <div style={{ padding: '11px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
        HOW WE GOT THERE
      </div>
      {row('Income to replace', '₹25L × 12 years', '₹3.00 Cr')}
      {row('Home loan outstanding', '19 years remaining', '₹62,00,000')}
      {row('Less: liquid assets', 'Excludes property and EPF', '−₹1.03 Cr', null, '#8a8785')}
      {row('Less: existing cover', 'LIC ₹50L + employer ₹1 Cr', '−₹1.50 Cr', null, '#8a8785', true)}
      <div style={{ display: 'flex', gap: 12, padding: '14px 20px', background: '#fbe3de', borderBottom: '2px solid #201e1d' }}>
        <span style={{ width: 12, height: 12, background: '#ec3013', marginTop: 3, flex: 'none' }} />
        <div style={{ font: '400 12px/1.5 Archivo, sans-serif', color: '#7d1c0a' }}>
          ₹1 Cr of your cover is your employer's. It ends the day the job does.
        </div>
      </div>
      <div style={{ padding: '11px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
        THREE WAYS TO CLOSE IT
      </div>
      {[
        ['A', '#ec3013', 'Buy ₹1.2 Cr more term cover', '≈ ₹1,850/month · 22 years'],
        ['B', '#8a8785', 'Prepay the home loan instead', 'Cuts the required cover by ₹62L'],
        ['C', '#8a8785', 'Restate your assumptions', 'If Meera returns to work, the gap falls to ₹40L'],
      ].map(([letter, color, title, sub], i, arr) => (
        <div
          key={letter}
          style={{
            display: 'flex',
            gap: 12,
            padding: '13px 20px',
            borderBottom: i === arr.length - 1 ? '2px solid #201e1d' : '1px solid #eceaea',
          }}
        >
          <span style={{ font: '600 12px ui-monospace, monospace', color }}>{letter}</span>
          <div>
            <div style={{ font: '600 13px Archivo, sans-serif' }}>{title}</div>
            <div style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785', marginTop: 2 }}>{sub}</div>
          </div>
        </div>
      ))}
      <div style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
        <div onClick={onOpts} style={{ flex: 1, padding: 14, background: '#ec3013', color: '#fff', font: '600 11px Archivo, sans-serif', cursor: 'pointer' }}>
          COMPARE THE THREE
        </div>
        <div onClick={onBack} style={{ padding: 14, border: '2px solid #201e1d', font: '600 11px Archivo, sans-serif', cursor: 'pointer' }}>
          BACK
        </div>
      </div>
    </div>
  );
}

function OptsStep({ onDone, onBack }) {
  return (
    <div>
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
      <div style={{ padding: '11px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
        WHY THIS MATCHED YOU
      </div>
      <div style={{ padding: '0 20px 10px', borderBottom: '1px solid #ddd9d7' }}>
        {[
          'Covers the ₹1.2 Cr gap with 4% headroom',
          'Term ends at 60 — the year your loan does',
          'Premium is 0.9% of income, inside your budget',
        ].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
            <span style={{ width: 10, height: 10, background: '#201e1d', marginTop: 4, flex: 'none' }} />
            <span style={{ font: '400 12px/1.4 Archivo, sans-serif' }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '11px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#b7290f' }}>
        THINGS TO CONSIDER
      </div>
      <div style={{ padding: '0 20px 10px', borderBottom: '2px solid #201e1d' }}>
        {['Suicide exclusion in the first 12 months', 'Medical test required — the quote can change'].map((t) => (
          <div key={t} style={{ display: 'flex', gap: 10, padding: '8px 0' }}>
            <span style={{ width: 10, height: 10, border: '2px solid #ec3013', marginTop: 4, flex: 'none' }} />
            <span style={{ font: '400 12px/1.4 Archivo, sans-serif' }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ padding: '13px 20px', background: '#f3f2f2', borderBottom: '2px solid #201e1d', font: '500 10px/1.6 ui-monospace, monospace', color: '#5f5c5a' }}>
        PREMIUM VERIFIED 2 DAYS AGO · SCORING MODEL v4.2
        <br />
        WE EARN A COMMISSION ON THIS PRODUCT. IT DOES NOT AFFECT THE SCORE.
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', gap: 10 }}>
        <div onClick={onDone} style={{ flex: 1, padding: 14, background: '#ec3013', color: '#fff', font: '600 11px Archivo, sans-serif', cursor: 'pointer' }}>
          CONTINUE WITH THIS
        </div>
        <div onClick={onBack} style={{ padding: 14, border: '2px solid #201e1d', font: '600 11px Archivo, sans-serif', cursor: 'pointer' }}>
          BACK
        </div>
      </div>
    </div>
  );
}

function DoneStep({ onHome }) {
  return (
    <div>
      <div style={{ padding: 20, borderBottom: '2px solid #201e1d' }}>
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#b7290f' }}>DECISION RECORDED</div>
        <div style={{ font: '700 24px/1.25 Archivo, sans-serif', letterSpacing: '-.02em', margin: '12px 0 8px' }}>
          Resilience 61 → 78 once this is in force.
        </div>
        <div style={{ font: '400 12px/1.5 Archivo, sans-serif', color: '#5f5c5a' }}>
          Nothing is bought yet. We have written down what you chose and why, and you can undo it at any point.
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #201e1d' }}>
        <div style={{ padding: '14px 16px', borderRight: '1px solid #ddd9d7' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>PROTECTION GAP</div>
          <div style={{ font: '700 18px Archivo, sans-serif', marginTop: 6 }}>₹1.2 Cr → ₹0</div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.1em', color: '#8a8785' }}>MONTHLY COST</div>
          <div style={{ font: '700 18px Archivo, sans-serif', marginTop: 6 }}>₹1,842</div>
        </div>
      </div>
      <div style={{ padding: '11px 20px', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
        WHAT HAPPENS NEXT
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '13px 20px', borderBottom: '1px solid #eceaea' }}>
        <span style={{ font: '600 12px ui-monospace, monospace', color: '#ec3013' }}>01</span>
        <div style={{ font: '600 13px Archivo, sans-serif' }}>Medical test booked at your address</div>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '13px 20px', borderBottom: '1px solid #eceaea' }}>
        <span style={{ font: '600 12px ui-monospace, monospace', color: '#8a8785' }}>02</span>
        <div style={{ font: '600 13px Archivo, sans-serif' }}>Final premium confirmed before any payment</div>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '13px 20px', borderBottom: '2px solid #201e1d' }}>
        <span style={{ font: '600 12px ui-monospace, monospace', color: '#8a8785' }}>03</span>
        <div>
          <div style={{ font: '600 13px Archivo, sans-serif' }}>Policy lands in your vault</div>
          <div style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785', marginTop: 2 }}>Meera is told it exists — not what it pays</div>
        </div>
      </div>
      <div style={{ padding: '13px 20px', background: '#f3f2f2', borderBottom: '2px solid #201e1d', font: '500 10px/1.6 ui-monospace, monospace', color: '#5f5c5a' }}>
        RECOMMENDATION SAVED · PROFILE v18 · RULES v4.2 · 09 AUG 2026
        <br />
        REPRODUCIBLE ON REQUEST.
      </div>
      <div style={{ padding: '16px 20px' }}>
        <div onClick={onHome} style={{ padding: 14, border: '2px solid #201e1d', font: '600 11px Archivo, sans-serif', cursor: 'pointer' }}>
          BACK TO MY MONEY
        </div>
      </div>
    </div>
  );
}
