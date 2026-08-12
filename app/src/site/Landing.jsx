import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { initials } from '../lib/format';
import { assurances, faqs, founders, howItWorks, problems } from './content';
import { CATEGORY_LIST } from '../lib/categories';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div style={{ background: 'var(--surface)' }}>
      <SiteHeader user={user} />
      <Hero user={user} />
      <Problems />
      <Categories />
      <HowItWorks />
      <Founders />
      <Assurances />
      <Faqs />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}

function SiteHeader({ user }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(252, 249, 248, 0.86)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--outline-variant)',
      }}
    >
      <div className="container row-between" style={{ height: 68 }}>
        <Link to="/" className="row" style={{ gap: 10, color: 'var(--on-surface)', textDecoration: 'none' }}>
          <Mark />
          <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Heritage Ledger</strong>
        </Link>

        <nav className="row" style={{ gap: 28 }} aria-label="Primary">
          <a href="#how" className="small muted hide-mobile">How it works</a>
          <a href="#founders" className="small muted hide-mobile">Founders</a>
          <a href="#security" className="small muted hide-mobile">Security</a>
          <a href="#faq" className="small muted hide-mobile">Questions</a>
        </nav>

        <div className="row" style={{ gap: 10 }}>
          {user ? (
            <Link to="/vault" className="btn btn-sm">Open my vault</Link>
          ) : (
            <>
              <Link to="/sign-in" className="small" style={{ color: 'var(--on-surface)' }}>Sign in</Link>
              <Link to="/create-vault" className="btn btn-sm">Create your vault</Link>
            </>
          )}
          <button className="btn btn-ghost show-mobile" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
      {open && (
        <div className="container stack stack-sm show-mobile" style={{ paddingBottom: 16 }}>
          <a href="#how" onClick={() => setOpen(false)}>How it works</a>
          <a href="#founders" onClick={() => setOpen(false)}>Founders</a>
          <a href="#security" onClick={() => setOpen(false)}>Security</a>
          <a href="#faq" onClick={() => setOpen(false)}>Questions</a>
        </div>
      )}
    </header>
  );
}

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
        fontSize: size * 0.4,
        flex: 'none',
      }}
    >
      HL
    </span>
  );
}

function Hero({ user }) {
  return (
    <section style={{ padding: '96px 0 80px' }}>
      <div className="container">
        <div style={{ maxWidth: 720 }} className="stack stack-md enter">
          <Badge tone="primary" icon="lock">Private by default</Badge>
          <h1>
            Everything important.
            <br />
            Safe for everyone who matters.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.6, color: 'var(--on-surface-variant)', maxWidth: 560 }}>
            Keep your family’s most important documents organised, protected and ready whenever life
            needs them — and make sure the right people can reach them when you cannot.
          </p>
          <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
            <Link to={user ? '/vault' : '/create-vault'} className="btn">
              {user ? 'Open my vault' : 'Create your vault'}
              <Icon name="arrow_forward" size={18} />
            </Link>
            <a href="#how" className="btn btn-secondary">See how it works</a>
          </div>
          <p className="tiny muted" style={{ marginTop: 4 }}>
            No card required. Your vault is encrypted document by document.
          </p>
        </div>
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section style={{ background: 'var(--surface-container)', padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <h2 className="center">Important things shouldn’t be this hard to find.</h2>
        <div className="grid grid-3">
          {problems.map((item) => (
            <Card key={item.title} className="stack stack-sm center" style={{ alignItems: 'center' }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-fixed)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={item.icon} size={24} />
              </span>
              <h4>{item.title}</h4>
              <p className="small muted">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 520 }}>
          <h2>One place for everything that matters.</h2>
          <p className="muted" style={{ marginTop: 12 }}>
            Nine categories, each one shaped around what a family actually goes looking for.
          </p>
        </div>
        <div className="grid grid-4">
          {CATEGORY_LIST.map((category) => (
            <Card key={category.key} flat className="stack stack-sm">
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--primary-fixed)',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={category.icon} size={20} />
              </span>
              <h4>{category.label}</h4>
              <p className="small muted">{category.blurb}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 560 }}>
          <span className="caps" style={{ color: 'var(--primary)' }}>How it works</span>
          <h2 style={{ marginTop: 12 }}>Five things happen, and none of them need you to be technical.</h2>
        </div>
        <ol className="stack stack-md" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {howItWorks.map((step, index) => (
            <li key={step.title}>
              <Card className="row" style={{ alignItems: 'flex-start', gap: 20 }}>
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary)',
                    color: 'var(--on-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: 'none',
                  }}
                >
                  <Icon name={step.icon} size={22} />
                </span>
                <div className="stack" style={{ gap: 6 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="tiny muted">STEP {index + 1}</span>
                    <h4>{step.title}</h4>
                  </div>
                  <p className="muted small">{step.body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * The founders. Profiles marked `placeholder` render the name, role and a link
 * to their real LinkedIn, and say plainly that the profile is still being
 * written — rather than filling the space with claims nobody made.
 */
function Founders() {
  return (
    <section id="founders" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 620 }}>
          <span className="caps" style={{ color: 'var(--primary)' }}>The people behind it</span>
          <h2 style={{ marginTop: 12 }}>Built by two people who kept watching families lose the paperwork.</h2>
          <p className="muted" style={{ marginTop: 12 }}>
            Heritage Ledger exists because the hardest part of a difficult month is rarely the
            decision — it is finding the document that lets you make it.
          </p>
        </div>

        <div className="grid grid-2">
          {founders.map((founder) => (
            <Card key={founder.id} className="stack stack-md">
              <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
                <FounderPhoto founder={founder} />
                <div className="stack" style={{ gap: 4 }}>
                  <h3>{founder.name}</h3>
                  <span className="small muted">{founder.role}</span>
                  {founder.experienceYears && (
                    <Badge tone="verified" icon="workspace_premium">
                      {founder.experienceYears}+ years
                    </Badge>
                  )}
                </div>
              </div>

              <p className={founder.placeholder ? 'small muted' : 'small'} style={{ lineHeight: 1.65 }}>
                {founder.bio}
              </p>

              {founder.highlights.length > 0 && (
                <ul className="stack stack-sm" style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
                  {founder.highlights.map((highlight) => (
                    <li key={highlight} className="row small" style={{ alignItems: 'flex-start', gap: 8 }}>
                      <Icon name="check_circle" size={16} style={{ color: 'var(--sage)', marginTop: 3 }} />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="row-between">
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="row small"
                  style={{ gap: 6 }}
                >
                  <Icon name="link" size={16} />
                  View LinkedIn profile
                </a>
                {founder.placeholder && (
                  <span className="tiny muted" title="Fill this in from app/src/site/content.js">
                    Profile in progress
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Falls back to a monogram when no headshot has been supplied yet. */
function FounderPhoto({ founder }) {
  const [failed, setFailed] = useState(false);
  const size = 84;

  if (founder.placeholder || failed) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          background: 'var(--primary-fixed)',
          color: 'var(--primary)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 26,
          flex: 'none',
        }}
      >
        {initials(founder.name)}
      </span>
    );
  }

  return (
    <img
      src={founder.photo}
      alt={founder.name}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      style={{ width: size, height: size, borderRadius: 'var(--radius-full)', objectFit: 'cover', flex: 'none' }}
    />
  );
}

function Assurances() {
  return (
    <section id="security" style={{ background: 'var(--primary)', color: 'var(--on-primary)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 560 }}>
          <span className="caps" style={{ color: 'var(--primary-fixed-dim)' }}>Security</span>
          <h2 style={{ marginTop: 12, color: 'var(--on-primary)' }}>
            The protections are specific, so you can check them.
          </h2>
        </div>
        <div className="grid grid-2">
          {assurances.map((item) => (
            <div
              key={item.title}
              className="stack stack-sm"
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Icon name={item.icon} size={24} style={{ color: 'var(--primary-fixed-dim)' }} />
              <h4 style={{ color: 'var(--on-primary)' }}>{item.title}</h4>
              <p className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faqs() {
  return (
    <section id="faq" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg" style={{ maxWidth: 820 }}>
        <h2>Questions people actually ask.</h2>
        <div className="stack stack-sm">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              style={{
                background: 'var(--surface-lowest)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 22px',
                boxShadow: 'var(--elev-1)',
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, listStyle: 'none' }}>
                <span className="row-between">
                  {faq.question}
                  <Icon name="expand_more" size={20} />
                </span>
              </summary>
              <p className="small muted" style={{ marginTop: 12, lineHeight: 1.65 }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section style={{ background: 'var(--surface-lowest)', padding: '96px 0' }}>
      <div className="container center stack stack-md" style={{ maxWidth: 640 }}>
        <h2>Because someday, someone you love may need it.</h2>
        <p className="muted">
          Insurance details. Property papers. Identity documents. Keep the things your family may
          need somewhere they can actually find them.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
          <Link to="/create-vault" className="btn">Start securing your legacy</Link>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer style={{ background: 'var(--surface-container)', padding: '40px 0' }}>
      <div className="container row-between wrap" style={{ gap: 20 }}>
        <div className="stack" style={{ gap: 4 }}>
          <strong style={{ fontFamily: 'var(--font-heading)' }}>Heritage Ledger</strong>
          <span className="tiny muted">A secure family digital vault.</span>
        </div>
        <div className="row wrap small muted" style={{ gap: 24 }}>
          <Link to="/sign-in">Sign in</Link>
          <a href="#security">Security protocol</a>
          <a href="#faq">Questions</a>
        </div>
      </div>
    </footer>
  );
}
