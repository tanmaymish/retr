import { Link, useParams, Navigate } from 'react-router-dom';
import { findScreen, neighbours } from '../data/screens';
import Panel from '../components/Panel';
import TapFlow from './TapFlow';
import FitScore from './FitScore';
import AdvisorCoPilot from './AdvisorCoPilot';

// Screens with real logic/AI-driven content instead of static extracted
// markup. Everything else falls back to the generic panel renderer.
const CUSTOM_SCREENS = {
  '4a': TapFlow,
  '3c': FitScore,
  '4c': AdvisorCoPilot,
};

export default function ScreenView() {
  const { id } = useParams();
  const found = findScreen(id);
  if (!found) return <Navigate to="/gallery" replace />;
  const { turn, screen } = found;
  const { prev, next } = neighbours(id);
  const Custom = CUSTOM_SCREENS[id];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 24px',
          borderBottom: '2px solid var(--color-divider)',
          position: 'sticky',
          top: 0,
          background: 'var(--color-bg)',
          zIndex: 5,
        }}
      >
        <Link to="/gallery" style={{ color: 'var(--color-accent)', font: '600 11px Archivo, sans-serif' }}>
          ← MAP
        </Link>
        <Link to="/app/home" style={{ color: 'var(--color-accent)', font: '600 11px Archivo, sans-serif' }}>
          OPEN APP →
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ font: '600 10px ui-monospace, monospace', color: 'rgba(0,0,0,.5)' }}>
            TURN {turn.number} · {turn.name.toUpperCase()}
          </div>
          <div style={{ font: '600 14px Archivo, sans-serif', marginTop: 2 }}>
            {screen.id} — {screen.label}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {prev && (
            <Link to={`/screen/${prev.id}`} className="btn btn-secondary" style={{ fontSize: 11 }}>
              ← {prev.id}
            </Link>
          )}
          {next && (
            <Link to={`/screen/${next.id}`} className="btn btn-secondary" style={{ fontSize: 11 }}>
              {next.id} →
            </Link>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
          padding: '32px 24px',
          overflowX: 'auto',
        }}
      >
        {Custom ? (
          <Custom />
        ) : (
          screen.panels.map((panel, i) => <Panel key={i} panel={panel} />)
        )}
      </div>
    </div>
  );
}
