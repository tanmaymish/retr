import DvCard from '../components/DvCard';
import { advisorContent } from '../data/aiContent';

const FALLBACK = {
  discussion_points: [
    { title: 'Life protection after the third dependent', detail: 'Required cover moved from ₹2.7 Cr to ₹3.1 Cr. He has told the app he wants to keep premiums under ₹2,500 a month.' },
    { title: 'Child education — second goal added', detail: 'Two education goals and retirement now draw on ₹71,000 of surplus. He has not chosen an order yet.' },
    { title: 'Emergency fund is thin for five people', detail: '4.2 months at the old expense base; 3.1 at the new one.' },
  ],
  silence_note: 'Two of these three need no product. Say so first.',
  changed_since: [
    { field: 'Dependents', from: '2', to: '3' },
    { field: 'Monthly expenses', from: '₹1.4L', to: '₹1.7L' },
    { field: 'Term cover', from: '₹1.5 Cr', to: '₹2.25 Cr' },
    { field: 'Goals', from: '3', to: '4' },
  ],
};

export default function AdvisorCoPilot() {
  const ai = advisorContent;
  const points = ai?.discussion_points?.length ? ai.discussion_points : FALLBACK.discussion_points;
  const silenceNote = ai?.silence_note || FALLBACK.silence_note;
  const changed = ai?.changed_since?.length ? ai.changed_since : FALLBACK.changed_since;
  const isAI = Boolean(ai?.discussion_points?.length);

  return (
    <DvCard width={880}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '2px solid #201e1d',
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ width: 40, height: 40, background: '#201e1d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px Archivo, sans-serif' }}>
            RP
          </span>
          <div>
            <div style={{ font: '700 17px Archivo, sans-serif' }}>Rohan Prasad</div>
            <div style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785', marginTop: 2 }}>
              Client since 2023 · consent granted 11 Jul 2026 · meeting in 40 minutes
            </div>
          </div>
        </div>
        <span className="tag tag-outline">READ-ONLY · CLIENT OWNS THIS DATA</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: '2px solid #201e1d' }}>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #ddd9d7' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>FINANCIAL HEALTH</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ font: '700 26px Archivo, sans-serif' }}>72</span>
            <span style={{ font: '600 11px Archivo, sans-serif', color: '#b7290f' }}>from 61</span>
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #ddd9d7' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>PROTECTION GAP</div>
          <div style={{ font: '700 26px Archivo, sans-serif', marginTop: 8 }}>₹85L</div>
        </div>
        <div style={{ padding: '16px 20px', borderRight: '1px solid #ddd9d7' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>RETIREMENT GAP</div>
          <div style={{ font: '700 26px Archivo, sans-serif', marginTop: 8 }}>₹1.4 Cr</div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ font: '600 9px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>LIFE EVENT</div>
          <div style={{ font: '700 15px/1.3 Archivo, sans-serif', marginTop: 8 }}>
            New child
            <br />
            <span style={{ font: '400 11px Archivo, sans-serif', color: '#8a8785' }}>3 months ago</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
        <div style={{ borderRight: '2px solid #201e1d' }}>
          <div style={{ padding: '12px 24px', background: '#f3f2f2', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
            RECOMMENDED DISCUSSION · {isAI ? 'AI-GENERATED' : 'DESIGN SAMPLE'}
          </div>
          {points.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 16,
                padding: '16px 24px',
                borderBottom: i === points.length - 1 ? '2px solid #201e1d' : '1px solid #eceaea',
              }}
            >
              <span style={{ font: '600 13px ui-monospace, monospace', color: i === 0 ? '#ec3013' : '#8a8785' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <div style={{ font: '600 14px Archivo, sans-serif' }}>{p.title}</div>
                <div style={{ font: '400 12px/1.5 Archivo, sans-serif', color: '#5f5c5a', marginTop: 4 }}>{p.detail}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '14px 24px', font: '400 11px/1.5 Archivo, sans-serif', color: '#5f5c5a' }}>{silenceNote}</div>
        </div>

        <div>
          <div style={{ padding: '12px 24px', background: '#f3f2f2', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
            CHANGED SINCE 14 MAY
          </div>
          {changed.map((c, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 24px',
                borderBottom: i === changed.length - 1 ? '2px solid #201e1d' : '1px solid #eceaea',
              }}
            >
              <span style={{ font: '600 12px Archivo, sans-serif' }}>{c.field}</span>
              <span style={{ font: '600 12px Archivo, sans-serif' }}>{c.from} → {c.to}</span>
            </div>
          ))}
          <div style={{ padding: '12px 24px', background: '#f3f2f2', borderBottom: '1px solid #ddd9d7', font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: '#8a8785' }}>
            CONSENT AND ACCESS
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #eceaea' }}>
            <span style={{ font: '400 12px Archivo, sans-serif' }}>Assets and goals</span>
            <span className="tag tag-neutral">VISIBLE</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #eceaea' }}>
            <span style={{ font: '400 12px Archivo, sans-serif' }}>Documents</span>
            <span className="tag tag-outline">HIDDEN</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '2px solid #201e1d' }}>
            <span style={{ font: '400 12px Archivo, sans-serif' }}>Family members' data</span>
            <span className="tag tag-outline">HIDDEN</span>
          </div>
          <div style={{ padding: '14px 24px', font: '500 10px/1.6 ui-monospace, monospace', color: '#5f5c5a' }}>
            EVERY SCREEN YOU OPEN IS LOGGED AND VISIBLE TO THE CLIENT.
            <br />
            RULES v4.2 · PROFILE v18
          </div>
        </div>
      </div>
    </DvCard>
  );
}
