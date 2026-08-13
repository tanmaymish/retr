import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { CallbackPopup, requestCallback } from './CallbackPopup';
import { asset } from '../lib/asset';
import { brand } from './content';

/**
 * The emblem from the logo: the crescent, the figure, the rising arrow and the
 * bars. `size` is its height; the artwork keeps its own proportions.
 * Decorative by default, because the name is set beside it in text.
 */
export function Mark({ size = 36, alt = '' }) {
  return (
    <img
      src={asset("brand/mark.png")}
      alt={alt}
      width={Math.round(size * 0.859)}
      height={size}
      style={{ height: size, width: 'auto', flex: 'none', display: 'block' }}
    />
  );
}

/** The full lockup — emblem, name, IMF line — as supplied by the founders. */
export function Lockup({ width = 260 }) {
  return (
    <img
      src={asset("brand/logo.png")}
      alt={`${brand.name} — ${brand.tagline}`}
      style={{ width, maxWidth: '100%', height: 'auto', display: 'block' }}
    />
  );
}

export function Wordmark({ size = 44, subtitle }) {
  return (
    <span className="row" style={{ gap: 12 }}>
      <Mark size={size} />
      <span className="stack" style={{ gap: 2 }}>
        <strong className="wordmark-type" style={{ fontSize: Math.max(14, size * 0.35) }}>{brand.name}</strong>
        {subtitle && <span className="tiny muted">{subtitle}</span>}
      </span>
    </span>
  );
}

const LINKS = [
  { to: '/about', label: 'About' },
  { to: '/about#founders', label: 'Founders' },
  { to: '/#who', label: 'Who we help' },
  { to: '/#services', label: 'What we do' },
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
        background: 'var(--surface-veil)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--outline-variant)',
      }}
    >
      <div className="container row-between" style={{ height: 72 }}>
        {/* Narrow screens get the emblem alone: the name set in wide capitals
            is too long to share a 390px bar with the call to action. */}
        <Link to="/" style={{ color: 'var(--on-surface)' }}>
          <span className="hide-mobile">
            <Wordmark subtitle={brand.tagline} />
          </span>
          <span className="show-mobile">
            <Mark size={40} alt={brand.name} />
          </span>
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
            <button type="button" className="btn btn-sm btn-sheen" onClick={requestCallback}>
              <Icon name="call" size={18} />
              Request a call
            </button>
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
          <div className="stack" style={{ gap: 12, maxWidth: 340 }}>
            <Lockup width={260} />
            <p className="small muted">{brand.promise}</p>
            <p className="small muted">{brand.audience}</p>
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
              <span className="tiny caps muted">Advice</span>
              <Link to="/#services">What we do</Link>
              <Link to="/#how">How we work</Link>
              <Link to="/preparedness-check">Preparedness check</Link>
              <Link to="/#faq">Questions</Link>
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">Legal</span>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="rule-gold" role="separator">
          <span className="diamond" aria-hidden="true">✦</span>
        </div>
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
      <CallbackPopup />
    </div>
  );
}
