import { Link } from 'react-router-dom';
import { Badge, Card, Icon } from '../components/ui';
import { useAuth } from '../state/AuthContext';
import { SitePage } from './SiteChrome';
import { FounderCard } from './Founders';
import { Photo } from '../components/Photo';
import { CATEGORY_LIST } from '../lib/categories';
import { faqSchema, organizationSchema, useSeo } from '../lib/seo';
import { requestCallback } from './CallbackPopup';
import { Crest, Reveal, SectionHead } from './Section';
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
    <section style={{ background: 'var(--surface-lowest)', borderBottom: '1px solid var(--outline-variant)' }}>
      <div className="container grid grid-4" style={{ padding: '40px 20px', textAlign: 'center' }}>
        {facts.map((fact, index) => (
          <Reveal key={fact.label} className="stack" delay={index * 80} style={{ gap: 4, alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 26, color: 'var(--primary)' }}>
              {fact.value}
            </strong>
            <span className="small">{fact.label}</span>
            <span className="tiny muted">{fact.note}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Hero({ user }) {
  return (
    <section className="hero-band" style={{ padding: '120px 0 108px' }}>
      <div className="hero-media" aria-hidden="true">
        <Photo
          name="four-directions"
          alt=""
          width={1400}
          height={933}
          priority
          radius="0"
          sizes="100vw"
        />
      </div>

      <div className="container stack" style={{ alignItems: 'center', gap: 22, textAlign: 'center' }}>
        <Crest />
        <Reveal
          as="span"
          className="eyebrow"
          delay={60}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'var(--band-accent)',
          }}
        >
          {brand.tagline}
        </Reveal>

        <Reveal as="h1" delay={120} style={{ color: 'var(--on-band)', maxWidth: '16ch' }}>
          What you build deserves to continue.
        </Reveal>

        <Reveal
          as="p"
          delay={180}
          style={{
            fontSize: 19,
            lineHeight: 1.7,
            color: 'color-mix(in srgb, var(--on-band) 82%, transparent)',
            maxWidth: '62ch',
          }}
        >
          You spend years creating a life — a career, a family, a home, wealth, aspirations and a
          legacy. Akshayvriddhi exists to help ensure that what you create today has the strength
          to continue tomorrow.
        </Reveal>

        <Reveal className="row wrap" delay={240} style={{ gap: 14, justifyContent: 'center', marginTop: 10 }}>
          <Link to="/preparedness-check" className="btn btn-gold btn-sheen">
            Take the preparedness check
            <Icon name="arrow_forward" size={18} />
          </Link>
          {user ? (
            <Link to="/vault" className="btn btn-on-band">Open my vault</Link>
          ) : site.vaultLaunched ? (
            <Link to="/create-vault" className="btn btn-on-band">Create your vault</Link>
          ) : (
            <button type="button" className="btn btn-on-band" onClick={requestCallback}>
              Talk to a founder
            </button>
          )}
        </Reveal>

        <Reveal
          as="p"
          delay={300}
          className="tiny"
          style={{ color: 'color-mix(in srgb, var(--on-band) 62%, transparent)', marginTop: 4, letterSpacing: '0.1em' }}
        >
          {brand.stages}
        </Reveal>
      </div>
    </section>
  );
}

/** Creation → Continuation → Consumption → Distribution, the spine of the brand. */
function Stages() {
  return (
    <section className="band" style={{ padding: '96px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          onBand
          eyebrow="Creation · Continuation · Consumption · Distribution"
          title="Financial planning should accompany the whole journey — not appear only when a policy needs to be bought."
        />
        <div className="grid grid-4">
          {stages.map((stage, index) => (
            <Reveal
              key={stage.key}
              className="stack stack-sm"
              delay={index * 90}
              style={{
                padding: 26,
                borderRadius: 'var(--radius-lg)',
                background: 'color-mix(in srgb, var(--on-band) 6%, transparent)',
                border: '1px solid var(--gold-line)',
              }}
            >
              <div className="row-between">
                <Icon name={stage.icon} size={24} style={{ color: 'var(--band-accent)' }} />
                <span
                  className="tiny"
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.14em',
                    color: 'color-mix(in srgb, var(--on-band) 50%, transparent)',
                  }}
                >
                  0{index + 1}
                </span>
              </div>
              <h4 style={{ color: 'var(--on-band)' }}>{stage.label}</h4>
              <p className="small" style={{ color: 'color-mix(in srgb, var(--on-band) 76%, transparent)' }}>
                {stage.lead}
              </p>
            </Reveal>
          ))}
        </div>
        <Reveal
          as="p"
          className="small center"
          style={{ color: 'color-mix(in srgb, var(--on-band) 72%, transparent)', maxWidth: '62ch', margin: '0 auto' }}
        >
          These aren’t simply four financial stages. They are four stages of life — and Akshayvriddhi
          intends to stand beside its clients through each one.
        </Reveal>
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="The problem"
          title="Important things shouldn’t be this hard to find."
          lede="Protection only works if the paperwork behind it can be found by the people who need it."
        />
        <div className="grid grid-3">
          {problems.map((item, index) => (
            <Reveal key={item.title} delay={index * 90}>
            <Card className="stack stack-sm center card-gold" style={{ alignItems: 'center', height: '100%' }}>
              <span className="medallion" style={{ width: 52, height: 52 }}>
                <Icon name={item.icon} size={24} />
              </span>
              <h4>{item.title}</h4>
              <p className="small muted">{item.body}</p>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function VaultIntro() {
  return (
    <section id="vault" style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-md">
        <SectionHead
          eyebrow="The Akshayvriddhi vault"
          title="A place where what you have protected can actually be found."
          lede="Behind every policy is a responsibility. Behind every nomination is someone important. The vault is where those records live — encrypted, organised, and reachable by the people you choose, at the moment they need them."
        >
          {!site.vaultLaunched && (
            <Reveal delay={240}>
              <Badge tone="gold" icon="schedule">In private preview</Badge>
            </Reveal>
          )}
        </SectionHead>
        <Reveal className="row wrap" delay={300} style={{ gap: 12, justifyContent: 'center' }}>
          {site.vaultLaunched ? (
            <Link to="/create-vault" className="btn">Create your vault</Link>
          ) : (
            <button type="button" className="btn" onClick={requestCallback}>
              Ask for early access
            </button>
          )}
          <a href="#how" className="btn btn-secondary">See how it works</a>
        </Reveal>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section style={{ padding: '80px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What it holds"
          title="One place for everything that matters."
          lede="Nine categories, each one shaped around what a family actually goes looking for."
        />
        <div className="grid grid-4">
          {CATEGORY_LIST.map((category, index) => (
            <Reveal key={category.key} delay={(index % 5) * 70}>
            <Card flat className="stack stack-sm" style={{ height: '100%' }}>
              <span className="medallion" style={{ width: 42, height: 42 }}>
                <Icon name={category.icon} size={20} />
              </span>
              <h4>{category.label}</h4>
              <p className="small muted">{category.blurb}</p>
            </Card>
            </Reveal>
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
        <SectionHead
          eyebrow="How it works"
          title="Five things happen, and none of them need you to be technical."
        />
        <ol className="stack stack-md" style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 860, width: '100%', marginInline: 'auto' }}>
          {howItWorks.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 70}>
              <Card className="row card-gold" style={{ alignItems: 'flex-start', gap: 20 }}>
                <span
                  className="medallion medallion-solid"
                  style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)' }}
                >
                  <Icon name={step.icon} size={22} />
                </span>
                <div className="stack" style={{ gap: 6 }}>
                  <div className="row" style={{ gap: 10 }}>
                    <span
                      className="tiny"
                      style={{
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.16em',
                        color: 'var(--gold-ink)',
                      }}
                    >
                      STEP {index + 1}
                    </span>
                    <h4>{step.title}</h4>
                  </div>
                  <p className="muted small">{step.body}</p>
                </div>
              </Card>
            </Reveal>
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
        <SectionHead
          eyebrow="The people behind it"
          title="From experience to perspective. From perspective to purpose."
          lede="After decades inside the insurance industry — building businesses, developing people and helping protection reach thousands of families — our founders arrived at a different question: what can everything we have learned now do for others?"
        />
        <Photo
          name="founders-at-work"
          alt="Shiv Maheshwari and Vikram Rajput at a table, working through the founders’ vision beneath a wall showing the four stages: create, continue, consume, distribute."
          width={1400}
          height={933}
          sizes="(max-width: 900px) 100vw, 1120px"
        />

        <div className="grid grid-2" style={{ maxWidth: 1040, width: '100%', marginInline: 'auto' }}>
          {founders.map((founder) => (
            <FounderCard key={founder.id} founder={founder} compact />
          ))}
        </div>
        <Reveal className="row" style={{ justifyContent: 'center' }}>
          <Link to="/about#founders" className="btn btn-secondary">
            Read their full story <Icon name="arrow_forward" size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Assurances() {
  return (
    <section id="security" style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Security"
          title="The protections are specific, so you can check them."
        />
        {/* Four cards, so two by two rather than three and a stray. */}
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', maxWidth: 940, width: '100%', marginInline: 'auto' }}
        >
          {assurances.map((item, index) => (
            <Reveal key={item.title} delay={(index % 2) * 90}>
            <Card className="stack stack-sm card-gold" style={{ height: '100%' }}>
              <Icon name={item.icon} size={24} style={{ color: 'var(--primary)' }} />
              <h4>{item.title}</h4>
              <p className="small muted">{item.body}</p>
            </Card>
            </Reveal>
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
        <SectionHead eyebrow="Questions" title="Questions people actually ask." />
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
    <section className="band" style={{ padding: '104px 0' }}>
      <div className="container stack stack-md">
        <SectionHead
          onBand
          eyebrow={brand.stages}
          title="Because someday, someone you love may need it."
          lede="Insurance details. Property papers. Identity documents. Keep the things your family may need somewhere they can actually find them."
        >
          <Reveal className="row" delay={260} style={{ justifyContent: 'center', marginTop: 10 }}>
            {site.vaultLaunched ? (
              <Link to="/create-vault" className="btn btn-gold btn-sheen">Start securing your legacy</Link>
            ) : (
              <button type="button" className="btn btn-gold btn-sheen" onClick={requestCallback}>
                Request a call
              </button>
            )}
          </Reveal>
        </SectionHead>
      </div>
    </section>
  );
}
