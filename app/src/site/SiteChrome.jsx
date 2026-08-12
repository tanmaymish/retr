import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { brand } from './content';

/** The wordmark. Used on the site, the auth screens and the app shell. */
export function Mark({ size = 36 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-md)',
        background: 'var(--primary)',
        color: 'var(--on-primary)',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: size * 0.38,
        letterSpacing: '-0.02em',
        flex: 'none',
      }}
    >
      AV
    </span>
  );
}

export function Wordmark({ size = 36, subtitle }) {
  return (
    <span className="row" style={{ gap: 10 }}>
      <Mark size={size} />
      <span className="stack" style={{ gap: 0 }}>
        <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 17, letterSpacing: '-0.01em' }}>
          {brand.name}
        </strong>
        {subtitle && <span className="tiny muted">{subtitle}</span>}
      </span>
    </span>
  );
}

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/about#founders', label: 'Founders' },
  { to: '/#vault', label: 'The vault' },
  { to: '/preparedness-check', label: 'Preparedness check' },
  { to: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(252, 249, 248, 0.88)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--outline-variant)',
      }}
    >
      <div className="container row-between" style={{ height: 72 }}>
        <Link to="/" style={{ color: 'var(--on-surface)' }}>
          <Wordmark subtitle={brand.tagline} />
        </Link>

        <nav className="row hide-mobile" style={{ gap: 28 }} aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink key={link.label} to={link.to} className="small" style={{ color: 'var(--on-surface-variant)' }}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="row" style={{ gap: 10 }}>
          {user ? (
            <Link to="/vault" className="btn btn-sm">Open my vault</Link>
          ) : (
            <>
              <Link to="/sign-in" className="small hide-mobile" style={{ color: 'var(--on-surface)' }}>
                Sign in
              </Link>
              <Link to="/create-vault" className="btn btn-sm">Create your vault</Link>
            </>
          )}
          <button className="btn btn-ghost show-mobile" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {open && (
        <div className="container stack stack-sm show-mobile" style={{ paddingBottom: 18 }}>
          {LINKS.map((link) => (
            <Link key={link.label} to={link.to} onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
          {!user && <Link to="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer style={{ background: 'var(--surface-container)', padding: '48px 0 40px' }}>
      <div className="container stack stack-md">
        <div
          className="row-between wrap"
          style={{
            gap: 16,
            padding: '28px 0 32px',
            borderBottom: '1px solid var(--outline-variant)',
            marginBottom: 12,
          }}
        >
          <h3 style={{ fontSize: 24 }}>Have something worth protecting?</h3>
          <Link to="/contact" className="btn">Start a conversation →</Link>
        </div>
        <div className="row-between wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 8, maxWidth: 340 }}>
            <Wordmark />
            <p className="small muted">{brand.promise}</p>
            <p className="tiny muted">{brand.stages}</p>
          </div>
          <div className="row wrap small" style={{ gap: 40, alignItems: 'flex-start' }}>
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">Company</span>
              <Link to="/about">About us</Link>
              <Link to="/about#founders">Founders</Link>
              <Link to="/about#vision">Vision and mission</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">The vault</span>
              <Link to="/#how">How it works</Link>
              <Link to="/#security">Security</Link>
              <Link to="/preparedness-check">Preparedness check</Link>
              <Link to="/#faq">Questions</Link>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">Account</span>
              <Link to="/sign-in">Sign in</Link>
              <Link to="/create-vault">Create your vault</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <hr className="divider" />
        <p className="tiny muted">
          © {new Date().getFullYear()} {brand.name}. {brand.tagline}.
        </p>
      </div>
    </footer>
  );
}

/** Wraps a marketing page in the shared chrome. */
export function SitePage({ children }) {
  return (
    <div style={{ background: 'var(--surface)' }}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
