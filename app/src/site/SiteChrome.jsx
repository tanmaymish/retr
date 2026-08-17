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
    <footer style={{ background: 'var(--wine-deep)', color: 'var(--on-band)', paddingTop: 0, position: 'relative' }}>
      {/* ── Pre-Footer Enterprise CTA Banner ──────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--wine) 0%, var(--band) 100%)',
          borderBottom: '1px solid var(--gold-line)',
          padding: '48px 0',
        }}
      >
        <div className="container row-between wrap" style={{ gap: 24, alignItems: 'center' }}>
          <div className="stack" style={{ gap: 6, maxWidth: 600 }}>
            <span className="eyebrow" style={{ color: 'var(--band-accent)', fontSize: 12, letterSpacing: '0.16em' }}>
              PROSPERITY WITH PURPOSE
            </span>
            <h3 style={{ fontSize: 'clamp(22px, 3vw, 30px)', color: '#fff', margin: 0 }}>
              Ready to construct your retirement ledger?
            </h3>
            <p className="small" style={{ color: 'color-mix(in srgb, var(--on-band) 80%, transparent)', margin: 0 }}>
              Get a private, mathematically sound assessment of your cash flow and drawdown trajectory.
            </p>
          </div>
          <div className="row wrap" style={{ gap: 14 }}>
            <Link to="/calculators/retirement-readiness" className="btn btn-sheen" style={{ background: 'var(--gold-leaf)', color: 'var(--wine-deep)', fontWeight: 600 }}>
              Get your readiness score →
            </Link>
            <button type="button" className="btn btn-secondary" onClick={requestCallback} style={{ borderColor: 'var(--gold-line)', color: '#fff' }}>
              <Icon name="call" size={17} /> Request a callback
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Enterprise Footer Grid ────────────────────────────────── */}
      <div className="container stack stack-lg" style={{ padding: '64px 20px 40px' }}>
        <div className="grid grid-4" style={{ gap: 40, alignment: 'flex-start' }}>
          {/* Col 1: Brand & Institutional Identity */}
          <div className="stack" style={{ gap: 16 }}>
            <Lockup width={240} />
            <p className="small" style={{ color: 'color-mix(in srgb, var(--on-band) 75%, transparent)', lineHeight: 1.7, margin: 0 }}>
              {brand.meaning}
            </p>
            <div className="stack" style={{ gap: 8, marginTop: 4 }}>
              <span className="badge badge-gold tiny" style={{ width: 'fit-content', fontSize: 11 }}>
                <Icon name="verified_user" size={13} /> IRDAI Registered IMF
              </span>
              <span className="badge badge-gold tiny" style={{ width: 'fit-content', fontSize: 11 }}>
                <Icon name="account_balance" size={13} /> AMFI Registered Distributor
              </span>
              <span className="badge badge-gold tiny" style={{ width: 'fit-content', fontSize: 11 }}>
                <Icon name="security" size={13} /> 256-Bit Vault Security
              </span>
            </div>
          </div>

          {/* Col 2: Solutions & Engines */}
          <div className="stack" style={{ gap: 14 }}>
            <h4 style={{ color: 'var(--gold-ink)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
              Calculators & Engines
            </h4>
            <div className="stack" style={{ gap: 10, fontSize: 14 }}>
              <Link to="/calculators/retirement-readiness" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Retirement Readiness Score
              </Link>
              <Link to="/calculators/drawdown" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Live Drawdown Simulator
              </Link>
              <Link to="/calculators/annuity-vs-swp" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Annuity vs. SWP Comparison
              </Link>
              <Link to="/vault" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Family Document Vault
              </Link>
              <Link to="/scenarios" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Life Scenarios & Stress Tests
              </Link>
            </div>
          </div>

          {/* Col 3: Practice & Insights */}
          <div className="stack" style={{ gap: 14 }}>
            <h4 style={{ color: 'var(--gold-ink)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
              The Practice
            </h4>
            <div className="stack" style={{ gap: 10, fontSize: 14 }}>
              <Link to="/services#how" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                How We Work
              </Link>
              <Link to="/services#remuneration" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                How We Are Paid
              </Link>
              <Link to="/about#founders" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Leadership & Founders
              </Link>
              <Link to="/insights" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Insights & Research
              </Link>
              <Link to="/services#faq" style={{ color: 'color-mix(in srgb, var(--on-band) 85%, transparent)' }}>
                Frequently Asked Questions
              </Link>
            </div>
          </div>

          {/* Col 4: Corporate & Governance */}
          <div className="stack" style={{ gap: 14 }}>
            <h4 style={{ color: 'var(--gold-ink)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', margin: 0 }}>
              Governance & Contact
            </h4>
            <div className="stack" style={{ gap: 10, fontSize: 13, color: 'color-mix(in srgb, var(--on-band) 75%, transparent)' }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: '#fff' }}>Akshay Vriddhi IMF Pvt. Ltd.</strong><br />
                Insurance Marketing Firm & Wealth Advisory
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="mail" size={14} /> consult@akshayvriddhi.com
              </p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="location_on" size={14} /> New Delhi • NCR, India
              </p>
              <div style={{ marginTop: 6, paddingTop: 10, borderTop: '1px solid color-mix(in srgb, var(--gold-line) 30%, transparent)' }}>
                <Link to="/admin" className="row tiny" style={{ gap: 6, color: 'var(--band-accent)', fontWeight: 600 }}>
                  <Icon name="lock" size={14} /> Founders’ & Admin Portal →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="rule-gold" role="separator">
          <span className="diamond" aria-hidden="true">✦</span>
        </div>

        {/* ── Statutory Regulatory Disclosures Box ──────────────────────── */}
        <div
          style={{
            background: 'color-mix(in srgb, var(--wine) 50%, transparent)',
            border: '1px solid color-mix(in srgb, var(--gold-line) 25%, transparent)',
            borderRadius: 'var(--radius-md)',
            padding: '20px 24px',
            fontSize: 11,
            lineHeight: 1.75,
            color: 'color-mix(in srgb, var(--on-band) 65%, transparent)',
          }}
        >
          <div className="stack" style={{ gap: 10 }}>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--gold-ink)' }}>Regulatory Disclosures:</strong> Akshay Vriddhi IMF is registered with the Insurance Regulatory and Development Authority of India (IRDAI) as an Insurance Marketing Firm (Registration No. [Pending/Empanelled]) and empanelled with regulated insurance partners. Mutual funds are distributed under AMFI Registration Number ARN [Pending/Empanelled]. IRDAI registration does not guarantee the performance of any insurer or product. Insurance is the subject matter of solicitation; please read policy wordings and sales brochures carefully before concluding a sale. Mutual fund investments are subject to market risks; read all scheme-related documents carefully.
            </p>
            <p style={{ margin: 0 }}>
              <strong style={{ color: 'var(--gold-ink)' }}>Grievance Redressal & Escalation:</strong> For inquiries or complaints, write to our designated Officer at grievance@akshayvriddhi.com. Unresolved insurance grievances may be escalated via the IRDAI Bima Bharosa Portal or the Insurance Ombudsman. Mutual fund complaints may be registered on SEBI SCORES portal. Calculator figures are illustrative mathematical projections based on stated assumptions and do not constitute guaranteed future returns.
            </p>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────────── */}
        <div className="row-between wrap" style={{ gap: 14, paddingTop: 10, fontSize: 12, color: 'color-mix(in srgb, var(--on-band) 60%, transparent)' }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} {brand.name}. {brand.tagline}. All rights reserved.
          </p>
          <div className="row wrap" style={{ gap: 20 }}>
            <Link to="/privacy" style={{ color: 'inherit' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
            <Link to="/services#how" style={{ color: 'inherit' }}>IRDAI Compliance</Link>
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
