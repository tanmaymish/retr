import { Link } from 'react-router-dom';
import { Badge, Card, Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { SitePage } from './SiteChrome';
import { FounderCard } from './Founders';
import { Photo } from '../components/Photo';
import { CATEGORY_LIST } from '../lib/categories';
import { faqSchema, organizationSchema, useSeo } from '../lib/seo';
import { requestCallback } from './CallbackPopup';
import { assurances, brand, faqs, founders, howItWorks, problems, site, stages } from './content';

export default function Home() {
  const { user } = useAuth();
  useSeo({
    title: null,
    description:
      'Akshayvriddhi — prosperity with purpose. Protection advice grounded in two decades of insurance experience, and a secure family vault for the documents your family may need.',
    path: '/',
    jsonLd: { '@context': 'https://schema.org', '@graph': [organizationSchema, faqSchema(faqs)] },
  });

  return (
    <SitePage>
      <Hero user={user} />
      <TrustBar />
      <Stages />
      <Problems />
      <VaultIntro />
      <Categories />
      <HowItWorks />
      <FoundersTeaser />
      <Assurances />
      <Faqs />
      <ClosingCta />
    </SitePage>
  );
}

/**
 * Credibility, stated in facts that can be checked rather than invented
 * statistics. Every line here is either the founders' own stated experience or
 * something the software verifiably does.
 */
function TrustBar() {
  const facts = [
    { value: 'Two decades', label: 'each, in life insurance', note: 'Shiv Maheshwari and Vikram Rajput' },
    { value: 'AES-256-GCM', label: 'per document', note: 'Its own key, before it touches disk' },
    { value: '14 days', label: 'trustee waiting period', note: 'And you can stop it at any point' },
    { value: '9', label: 'categories covered', note: 'Identity through to legacy' },
  ];

  return (
    <section style={{ borderTop: '1px solid var(--outline-variant)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div className="container grid grid-4" style={{ padding: '32px 20px' }}>
        {facts.map((fact) => (
          <div key={fact.label} className="stack" style={{ gap: 2 }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color: 'var(--primary)' }}>
              {fact.value}
            </strong>
            <span className="small">{fact.label}</span>
            <span className="tiny muted">{fact.note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Hero({ user }) {
  return (
    <section style={{ padding: '88px 0 80px' }}>
      <div
        className="container grid hero-grid"
        style={{ gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)', alignItems: 'center', gap: 48 }}
      >
        <div className="stack stack-md enter">
          <span style={{ alignSelf: 'flex-start' }}>
            <Badge tone="primary" icon="verified">{brand.tagline}</Badge>
          </span>
          <h1>
            What you build
            <br />
            deserves to continue.
          </h1>
          <p style={{ fontSize: 19, lineHeight: 1.65, color: 'var(--on-surface-variant)', maxWidth: 620 }}>
            You spend years creating a life — a career, a family, a home, wealth, aspirations and a
            legacy. Akshayvriddhi exists to help ensure that what you create today has the strength
            to continue tomorrow.
          </p>
          <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
            <Link to="/preparedness-check" className="btn">
              Take the preparedness check
              <Icon name="arrow_forward" size={18} />
            </Link>
            {user ? (
              <Link to="/vault" className="btn btn-secondary">Open my vault</Link>
            ) : site.vaultLaunched ? (
              <Link to="/create-vault" className="btn btn-secondary">Create your vault</Link>
            ) : (
              <button type="button" className="btn btn-secondary" onClick={requestCallback}>
                Talk to a founder
              </button>
            )}
          </div>
          <p className="tiny muted" style={{ marginTop: 6 }}>{brand.stages}</p>
        </div>

        {/* The four directions the brand is organised around, in one image. */}
        <Photo
          name="four-directions"
          alt="A walker at a mountain path pausing at a signpost pointing towards clarity, protection, prosperity and legacy."
          width={1400}
          height={933}
          priority
          sizes="(max-width: 900px) 100vw, 620px"
        />
      </div>
    </section>
  );
}

/** Creation → Continuation → Consumption → Distribution, the spine of the brand. */
function Stages() {
  return (
    <section style={{ background: 'var(--band)', color: 'var(--on-band)', padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <div className="stack" style={{ gap: 20 }}>
          {/* The four words under the logo, set the way the logo sets them. */}
          <div className="rule-gold lead on-dark" role="separator" style={{ maxWidth: 720 }}>
            <span>Creation · Continuation · Consumption · Distribution</span>
          </div>
          <h2 style={{ maxWidth: 620, color: 'var(--on-band)' }}>
            Financial planning should accompany the whole journey — not appear only when a policy
            needs to be bought.
          </h2>
        </div>
        <div className="grid grid-4">
          {stages.map((stage, index) => (
            <div
              key={stage.key}
              className="stack stack-sm"
              style={{
                padding: 24,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="row-between">
                <Icon name={stage.icon} size={24} style={{ color: 'var(--band-accent)' }} />
                <span className="tiny" style={{ color: 'rgba(255,255,255,0.5)' }}>0{index + 1}</span>
              </div>
              <h4 style={{ color: 'var(--on-band)' }}>{stage.label}</h4>
              <p className="small" style={{ color: 'rgba(255,255,255,0.75)' }}>{stage.lead}</p>
            </div>
          ))}
        </div>
        <p className="small" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 620 }}>
          These aren’t simply four financial stages. They are four stages of life — and Akshayvriddhi
          intends to stand beside its clients through each one.
        </p>
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <div className="center" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2>Important things shouldn’t be this hard to find.</h2>
          <p className="muted" style={{ marginTop: 12 }}>
            Protection only works if the paperwork behind it can be found by the people who need it.
          </p>
        </div>
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

function VaultIntro() {
  return (
    <section id="vault" style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-md" style={{ maxWidth: 760 }}>
        <div className="row wrap" style={{ gap: 12 }}>
          <span className="caps" style={{ color: 'var(--primary)' }}>The Akshayvriddhi vault</span>
          {!site.vaultLaunched && <Badge tone="gold" icon="schedule">In private preview</Badge>}
        </div>
        <h2>A place where what you have protected can actually be found.</h2>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.7 }}>
          Behind every policy is a responsibility. Behind every nomination is someone important. The
          vault is where those records live — encrypted, organised, and reachable by the people you
          choose, at the moment they need them.
        </p>
        <div className="row wrap" style={{ gap: 12, marginTop: 8 }}>
          {site.vaultLaunched ? (
            <Link to="/create-vault" className="btn">Create your vault</Link>
          ) : (
            <button type="button" className="btn" onClick={requestCallback}>
              Ask for early access
            </button>
          )}
          <a href="#how" className="btn btn-secondary">See how it works</a>
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

function FoundersTeaser() {
  return (
    <section style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 640 }}>
          <span className="caps" style={{ color: 'var(--primary)' }}>The people behind it</span>
          <h2 style={{ marginTop: 12 }}>From experience to perspective. From perspective to purpose.</h2>
          <p className="muted" style={{ marginTop: 12 }}>
            After decades inside the insurance industry — building businesses, developing people and
            helping protection reach thousands of families — our founders arrived at a different
            question: what can everything we have learned now do for others?
          </p>
        </div>
        <Photo
          name="founders-at-work"
          alt="Shiv Maheshwari and Vikram Rajput at a table, working through the founders’ vision beneath a wall showing the four stages: create, continue, consume, distribute."
          width={1400}
          height={933}
          sizes="(max-width: 900px) 100vw, 1120px"
        />

        <div className="grid grid-2">
          {founders.map((founder) => (
            <FounderCard key={founder.id} founder={founder} compact />
          ))}
        </div>
        <Link to="/about#founders" className="btn btn-secondary" style={{ alignSelf: 'flex-start' }}>
          Read their full story <Icon name="arrow_forward" size={18} />
        </Link>
      </div>
    </section>
  );
}

function Assurances() {
  return (
    <section id="security" style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 560 }}>
          <span className="caps" style={{ color: 'var(--primary)' }}>Security</span>
          <h2 style={{ marginTop: 12 }}>The protections are specific, so you can check them.</h2>
        </div>
        <div className="grid grid-2">
          {assurances.map((item) => (
            <Card key={item.title} className="stack stack-sm">
              <Icon name={item.icon} size={24} style={{ color: 'var(--primary)' }} />
              <h4>{item.title}</h4>
              <p className="small muted">{item.body}</p>
            </Card>
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
              <p className="small muted" style={{ marginTop: 12, lineHeight: 1.7 }}>{faq.answer}</p>
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
      <div className="container center stack stack-md" style={{ maxWidth: 660 }}>
        <h2>Because someday, someone you love may need it.</h2>
        <p className="muted" style={{ fontSize: 17 }}>
          Insurance details. Property papers. Identity documents. Keep the things your family may
          need somewhere they can actually find them.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
          {site.vaultLaunched ? (
            <Link to="/create-vault" className="btn">Start securing your legacy</Link>
          ) : (
            <button type="button" className="btn" onClick={requestCallback}>
              Request a call
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
