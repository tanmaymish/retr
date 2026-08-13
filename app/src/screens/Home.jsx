import { Link } from 'react-router-dom';
import { turns } from '../data/screens';
import Logo from '../components/Logo';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function Home() {
  useDocumentTitle('Design gallery');
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 24px 64px' }}>
      <header style={{ padding: '40px 0 28px', borderBottom: '2px solid var(--color-divider)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <Logo size={44} align="left" />
          <div style={{ display: 'flex', gap: 8, flex: 'none' }}>
            <Link to="/ask" className="btn btn-secondary" style={{ fontSize: 11 }}>
              ASK ABOUT YOUR MONEY →
            </Link>
            <Link to="/site/home" className="btn btn-primary" style={{ fontSize: 11 }}>
              OPEN THE WEBSITE →
            </Link>
          </div>
        </div>
        <h1 style={{ margin: '10px 0 8px', fontSize: 34 }}>Design gallery</h1>
        <p style={{ maxWidth: 640, opacity: 0.75, fontSize: 14, lineHeight: 1.6 }}>
          This is the full Claude Design handoff — 27 screens across six design turns, most of
          them alternate explorations rather than one flow. For the real, single navigable
          product built from these (Home, Wealth, Goals, Vault, Profile), see{' '}
          <Link to="/site/home" style={{ color: 'var(--color-accent)' }}>the website</Link>, or{' '}
          <Link to="/app/home" style={{ color: 'var(--color-accent)' }}>the phone app</Link> — same
          features, different chrome. Screens 3c, 4c and{' '}
          <Link to="/ask" style={{ color: 'var(--color-accent)' }}>Ask</Link> are wired to a GitHub
          Models AI pipeline that runs via GitHub Actions — everything else here is static
          wireframe copy.
        </p>
      </header>

      {turns.map((turn) => (
        <section key={turn.id} style={{ padding: '28px 0', borderBottom: '2px solid var(--color-divider)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
            <span
              style={{
                font: '600 10px ui-monospace, Menlo, monospace',
                padding: '3px 7px',
                background: 'var(--color-text)',
                color: '#fff',
              }}
            >
              {turn.number}
            </span>
            <span style={{ font: '600 15px Archivo, sans-serif' }}>{turn.name}</span>
          </div>
          <p style={{ maxWidth: 760, fontSize: 12.5, lineHeight: 1.6, opacity: 0.65, margin: '0 0 16px' }}>
            {turn.description}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
            {turn.screens.map((screen) => (
              <Link
                key={screen.id}
                to={`/screen/${screen.id}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  border: '1px solid var(--color-divider)',
                  color: 'inherit',
                }}
                className="screen-card"
              >
                <span
                  style={{
                    font: '600 10.5px ui-monospace, Menlo, monospace',
                    padding: '2px 6px',
                    background: 'rgba(0,0,0,.08)',
                  }}
                >
                  {screen.id}
                </span>
                <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.4 }}>{screen.label}</div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
