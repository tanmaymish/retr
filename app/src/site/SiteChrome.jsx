import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { CallbackPopup, requestCallback } from './CallbackPopup';
import { PageNav } from './PageNav';
import { asset } from '../lib/asset';
import { journey, navLinks } from './pages';
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

const LINKS = navLinks;

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
        {/* Below a comfortable desktop width the name and six nav items cannot
            both fit, so the name gives way first: the emblem still identifies
            the site, and the nav is what a visitor came here to use. */}
        <Link to="/" style={{ color: 'var(--on-surface)' }}>
          <span className="brand-full">
            <Wordmark subtitle={brand.tagline} />
          </span>
          <span className="brand-mark">
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
          {/* An admin arriving on the public site is almost always on their way
              to the portal. One click, rather than remembering a URL. */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="btn btn-sm btn-secondary hide-mobile">
              <Icon name="dashboard" size={17} />
              Portal
            </Link>
          )}
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
          <h3 style={{ fontSize: 24 }}>Want to know your number?</h3>
          <Link to="/calculators/retirement-readiness" className="btn">Get your readiness score →</Link>
        </div>
        <div className="row-between wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
          <div className="stack" style={{ gap: 12, maxWidth: 340 }}>
            <Lockup width={260} />
            <p className="small muted">{brand.promise}</p>
            <p className="small muted">{brand.audience}</p>
            <p className="tiny muted">{brand.stages}</p>
          </div>
          <div className="row wrap small" style={{ gap: 40, alignItems: 'flex-start' }}>
            {/* The same order as the nav and the pager, because it is the same
                list. Numbered, so the site reads as a route through, not a
                heap of links. */}
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">The site, in order</span>
              {journey.map((page, index) => (
                <Link key={page.path} to={page.path} className="row" style={{ gap: 9 }}>
                  <span className="tiny muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {page.label}
                </Link>
              ))}
            </div>
            <div className="stack" style={{ gap: 8 }}>
              <span className="tiny caps muted">Also</span>
              <Link to="/about#founders">The founders</Link>
              <Link to="/services#how">How we work</Link>
              <Link to="/services#faq">Questions</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
        </div>
        <div className="rule-gold" role="separator">
          <span className="diamond" aria-hidden="true">✦</span>
        </div>
        <div className="stack" style={{ gap: 6 }}>
          {/* The lockup reads "IMF". Spelled out here, because the abbreviation
              is also the International Monetary Fund, and a regulated firm
              cannot leave that ambiguous.

              THIS IS A TEMPLATE. The registration and ARN numbers, and the
              grievance address, are the founders' to supply, and the final
              wording is what a regulator and any complaint will be held
              against — it needs a compliance read before this ships. */}
          <p className="tiny muted" style={{ lineHeight: 1.8, maxWidth: '92ch' }}>
            Akshay Vriddhi IMF is registered with the Insurance Regulatory and Development Authority
            of India (IRDAI) as an Insurance Marketing Firm, Registration No. [to be stated], and is
            empanelled with the insurers listed on this site. Mutual funds are distributed under
            AMFI ARN [to be stated]. IRDAI registration does not guarantee the performance of any
            insurer or product. Insurance is the subject matter of solicitation; please read the
            policy wordings and sales brochure carefully before concluding a sale. Mutual fund
            investments are subject to market risks; read all scheme-related documents carefully.
          </p>
          <p className="tiny muted" style={{ lineHeight: 1.8, maxWidth: '92ch' }}>
            Grievances: write to [grievance address, to be stated]. Insurance complaints may also be
            escalated through the IRDAI’s grievance portal or the Insurance Ombudsman for your
            region; mutual fund complaints through SEBI’s SCORES portal. Figures shown by the
            calculators on this site are illustrative projections based on the assumptions stated
            beside them, not guarantees of future performance.
          </p>
          {/* The way in to the founders' portal. Kept here rather than in the
              client-facing columns, and deliberately not hidden: the interface
              is not the guard. Every route behind it checks the session and the
              role on the server, which answers 403 to anyone else however they
              arrived. A link that only appears once you are already signed in
              is no safer and much harder to find. */}
          <div className="row-between wrap" style={{ gap: 12 }}>
            <p className="tiny muted">
              © {new Date().getFullYear()} {brand.name}. {brand.tagline}.
            </p>
            <Link to="/admin" className="tiny muted row" style={{ gap: 5 }}>
              <Icon name="lock" size={13} />
              Founders’ portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Wraps a marketing page in the shared chrome.
 *
 * The pager comes from the path, so a page gets its place in the sequence by
 * being in the journey — not by remembering to add anything. Pages outside it
 * (a single calculator, one article) get no pager, which is right: they have
 * their own way back.
 */
export function SitePage({ children }) {
  const { pathname } = useLocation();
  return (
    <div style={{ background: 'var(--surface)' }}>
      <SiteHeader />
      {children}
      <PageNav path={pathname} />
      <SiteFooter />
      <CallbackPopup />
    </div>
  );
}
