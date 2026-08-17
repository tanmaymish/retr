import { Link } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Photo } from '../components/Photo';
import { faqSchema, organizationSchema, useSeo } from '../lib/seo';
import { requestCallback } from './CallbackPopup';
import { Crest, Reveal, SectionHead } from './Section';
import { NewsStrip } from './NewsStrip';
import { LiveDrawdown } from './Drawdown';
import { CALCULATORS } from '../lib/calculatorSpecs';
import { insights } from './insights';
import { useContent } from '../lib/siteContent';
import { brand, faqs, scenarios, services, whyNow } from './content';

export default function Home() {
  useSeo({
    title: null,
    description:
      'Retire without asking anyone for money. A retirement plan built on your real numbers, from an IRDAI-registered Insurance Marketing Firm founded by two people with two decades each in life insurance.',
    path: '/',
    jsonLd: { '@context': 'https://schema.org', '@graph': [organizationSchema, faqSchema(faqs)] },
  });

  return (
    <SitePage>
      <Hero />
      <TrustBar />
      <Situation />
      <LiveDrawdown />
      <WhyNow />
      <Tools />
      <Scenarios />
      <WhatWeDo />
      <Reading />
      <FoundersTeaser />
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
    { value: '20+ Years', label: 'leadership in life insurance', note: 'Shiv Maheshwari & Vikram Rajput' },
    { value: '6 Insurers', label: 'empanelled per category', note: 'Unbiased institutional shelf' },
    { value: 'Plan First', label: 'written blueprint before products', note: 'Mathematically sound strategy' },
    { value: 'Full Disclosure', label: '100% transparent fee structure', note: 'No hidden commission agendas' },
  ];

  return (
    <section style={{ background: 'var(--wine-deep)', borderBottom: '1px solid var(--gold-line)', color: 'var(--on-band)' }}>
      <div className="container grid grid-4" style={{ padding: '36px 20px', textAlign: 'center' }}>
        {facts.map((fact, index) => (
          <Reveal key={fact.label} className="stack" delay={index * 80} style={{ gap: 4, alignItems: 'center' }}>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: '#f0dba6', letterSpacing: '0.04em' }}>
              {fact.value}
            </strong>
            <span className="small" style={{ fontWeight: 600, color: 'var(--on-band)' }}>{fact.label}</span>
            <span className="tiny" style={{ color: 'color-mix(in srgb, var(--on-band) 65%, transparent)' }}>{fact.note}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Hero() {
  const title = useContent('hero.title', 'Retire without asking anyone for money.');
  const subtitle = useContent(
    'hero.subtitle',
    'A retirement plan built on your real numbers, backed by choice across several insurers and every major fund house — not one agent’s product list.',
  );
  const cta = useContent('hero.cta', 'Get your free readiness score');
  const audience = useContent('brand.audience', brand.audience);

  return (
    <section className="hero-band masterclass-hero" style={{ padding: '128px 0 116px' }}>
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

      <div className="container stack" style={{ alignItems: 'center', gap: 24, textAlign: 'center' }}>
        <Reveal delay={40}>
          <span className="masterclass-badge">
            <span style={{ color: 'var(--gold)' }}>✦</span> PRIVATE RETIREMENT & WEALTH ADVISORY
          </span>
        </Reveal>

        <Crest />

        <Reveal
          as="h1"
          delay={120}
          className="gold-gradient-text masterclass-glow-text"
          style={{ maxWidth: '18ch', fontSize: 'clamp(36px, 5.5vw, 64px)', lineHeight: 1.1, margin: '8px 0' }}
        >
          {title}
        </Reveal>

        <Reveal
          as="p"
          delay={150}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'clamp(19px, 2.2vw, 24px)',
            color: '#f0dba6',
          }}
        >
          {audience}
        </Reveal>

        <Reveal
          as="p"
          delay={180}
          style={{
            fontSize: 'clamp(16px, 1.8vw, 19px)',
            lineHeight: 1.75,
            color: 'color-mix(in srgb, var(--on-band) 85%, transparent)',
            maxWidth: '64ch',
          }}
        >
          {subtitle}
        </Reveal>

        {/* Wealth Blueprint Highlights */}
        <Reveal delay={210} className="row wrap" style={{ gap: 10, justifyContent: 'center', margin: '6px 0' }}>
          <span className="badge badge-gold tiny" style={{ background: 'rgba(42, 12, 20, 0.6)' }}>
            Corpus Gap Analysis
          </span>
          <span className="badge badge-gold tiny" style={{ background: 'rgba(42, 12, 20, 0.6)' }}>
            SWP vs Annuity Modeling
          </span>
          <span className="badge badge-gold tiny" style={{ background: 'rgba(42, 12, 20, 0.6)' }}>
            Family Vault Protection
          </span>
        </Reveal>

        <Reveal className="row wrap" delay={240} style={{ gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <Link to="/calculators/retirement-readiness" className="btn btn-gold btn-sheen" style={{ fontSize: 16, padding: '14px 28px' }}>
            {cta}
            <Icon name="arrow_forward" size={18} />
          </Link>
          <Link to="/services" className="btn btn-on-band" style={{ fontSize: 16, padding: '14px 28px', borderColor: 'var(--gold-line)' }}>
            See how the plan is built →
          </Link>
        </Reveal>

        <Reveal
          as="p"
          delay={300}
          className="tiny"
          style={{ color: '#d9b063', marginTop: 8, letterSpacing: '0.14em', fontWeight: 600 }}
        >
          {brand.stages}
        </Reveal>
      </div>
    </section>
  );
}


/**
 * Three doors, immediately under the hero.
 *
 * Two audiences pay for advice here — people about to stop earning, and people
 * whose children have not started. Naming both, and sending each to the number
 * that answers them, does more than a paragraph explaining that we serve both.
 */
function Situation() {
  const doors = [
    {
      badge: 'TARGET CORPUS',
      icon: 'target',
      eyebrow: 'Ten years to retirement',
      title: 'What is my exact target corpus?',
      to: '/calculators/retirement-readiness',
      cta: 'Calculate target gap',
    },
    {
      badge: 'CAPITAL DRAWDOWN',
      icon: 'hourglass_bottom',
      eyebrow: 'Existing capital allocation',
      title: 'How long will my corpus last?',
      to: '/calculators/retirement-drawdown',
      cta: 'Simulate depletion year',
    },
    {
      badge: 'FUTURE MILESTONES',
      icon: 'school',
      eyebrow: 'Legacy & Higher Education',
      title: 'What is the future cost of goals?',
      to: '/calculators/education-goal',
      cta: 'Project inflation-adjusted bill',
    },
  ];

  return (
    <section style={{ padding: '88px 0 24px', background: 'var(--surface-low)' }}>
      <div className="container stack stack-lg">
        <SectionHead eyebrow="DECISION FRAMEWORKS" title="Start with the exact question you have today." lede="Run your real numbers against institutional inflation and annuity rate models." />
        <div className="grid grid-3">
          {doors.map((door, index) => (
            <Reveal key={door.to} delay={index * 90}>
              <Card
                as={Link}
                to={door.to}
                className="card-link card-gold stack stack-sm"
                style={{
                  height: '100%',
                  padding: 32,
                  background: 'var(--surface-lowest)',
                  transition: 'all 0.25s ease',
                  border: '1px solid var(--gold-line)',
                }}
              >
                <div className="row-between" style={{ alignItems: 'center' }}>
                  <span className="medallion medallion-solid" style={{ width: 48, height: 48 }}>
                    <Icon name={door.icon} size={22} />
                  </span>
                  <span className="tiny caps" style={{ color: 'var(--gold-ink)', letterSpacing: '0.14em', fontWeight: 700 }}>
                    {door.badge}
                  </span>
                </div>
                <span className="tiny caps muted" style={{ letterSpacing: '0.12em', marginTop: 8 }}>
                  {door.eyebrow}
                </span>
                <h3 style={{ fontSize: 22, lineHeight: 1.35, color: 'var(--on-surface)' }}>{door.title}</h3>
                <span className="row small" style={{ gap: 6, color: 'var(--primary)', fontWeight: 600, marginTop: 'auto', paddingTop: 12 }}>
                  {door.cta} <Icon name="arrow_forward" size={16} />
                </span>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Why the old assumptions no longer hold.
 *
 * Not "retirement planning is important" — five structural reasons a reader can
 * check against their own life. The band puts them on the brand's own ground so
 * the section reads as the argument it is.
 */
function WhyNow() {
  const reasons = useContent('whyNow', whyNow);
  return (
    <section className="band" style={{ padding: '96px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          onBand
          eyebrow="Why now"
          title="Retirement used to be funded by a pension and a joint family."
          lede="Today it has to be funded by a plan, because both of those are increasingly optional."
        />
        <div className="why-now-grid">
          {reasons.map((reason, index) => (
            <Reveal key={reason.title} delay={(index % 3) * 90}>
              <div className="band-card">
                <div className="row-between">
                  <span className="band-mark">
                    <Icon name={reason.icon} size={21} />
                  </span>
                  <span className="band-num">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h4>{reason.title}</h4>
                <p>{reason.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Three households, drawn from patterns rather than from clients.
 *
 * Every card says "illustrative scenario" on its face. These are not
 * testimonials and must never be dressed as any: a fabricated review is
 * dishonest, and for a young Insurance Marketing Firm it is also the kind of
 * thing that attracts a regulator's attention.
 */
function Scenarios() {
  const items = useContent('scenarios', scenarios);
  return (
    <section style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What this looks like"
          title="Three households, and the thing nobody had added up."
          lede="Illustrative situations built from patterns advisers see constantly — not real clients, and not testimonials."
        />
        <div className="grid grid-3">
          {items.map((item, index) => (
            <Reveal key={item.who} delay={(index % 3) * 90}>
              <Card className="stack stack-sm card-gold" style={{ height: '100%' }}>
                <div className="row" style={{ gap: 12 }}>
                  <span className="medallion medallion-solid" style={{ width: 42, height: 42, fontFamily: 'var(--font-serif)', fontSize: 19, fontWeight: 700 }}>
                    {item.initial}
                  </span>
                  <span className="stack grow" style={{ gap: 1 }}>
                    <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>{item.who}</strong>
                    <span className="tiny muted">{item.meta}</span>
                  </span>
                </div>
                <p className="small muted" style={{ lineHeight: 1.7 }}>{item.setup}</p>
                <p className="small" style={{ lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--primary)' }}>The turn: </strong>
                  <span className="muted">{item.turn}</span>
                </p>
                <span className="tiny" style={{ color: 'var(--gold-ink)', marginTop: 'auto' }}>Illustrative scenario</span>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The tools, high on the page: the thing a visitor can use before they trust
 * anyone, and the best reason to come back.
 */
function Tools() {
  /* Four, because the grid fits four across and five would leave a stray. The
     three above this section already carry drawdown, education and cover — so
     these are the next four a household actually asks about. */
  const featured = ['nps', 'epf', 'human-life-value', 'income-tax']
    .map((slug) => CALCULATORS.find((calculator) => calculator.slug === slug))
    .filter(Boolean);

  return (
    <section id="tools" style={{ padding: '40px 0 88px' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Start here"
          title="Run your own numbers first."
          lede={`${CALCULATORS.length} of them, free, with nothing behind a signup and nothing stored.`}
        />

        <div className="grid grid-3">
          {featured.map((calculator, index) => (
            <Reveal key={calculator.slug} delay={(index % 3) * 70}>
              <Card
                as={Link}
                to={`/calculators/${calculator.slug}`}
                className="card-link card-gold row"
                style={{ gap: 16, alignItems: 'flex-start', height: '100%' }}
              >
                <span className="medallion" style={{ width: 44, height: 44 }}>
                  <Icon name={calculator.icon} size={21} />
                </span>
                <span className="stack" style={{ gap: 4 }}>
                  <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{calculator.title}</strong>
                  <span className="small muted">{calculator.blurb}</span>
                </span>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="row wrap" style={{ gap: 12, justifyContent: 'center' }}>
          <Link to="/calculators" className="btn btn-secondary">
            All {CALCULATORS.length} calculators <Icon name="arrow_forward" size={18} />
          </Link>
          <Link to="/preparedness-check" className="btn">Take the preparedness check</Link>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * What we do, in four lines and a door.
 *
 * The whole of it — the problems, the services, the four stages, the steps of
 * an engagement, the commitments — is a page of its own now. What belongs here
 * is only enough to make someone want to open it.
 */
function WhatWeDo() {
  const pillars = useContent('services', services);
  return (
    <section style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What we do"
          title="Four things, done properly."
          lede="Advice across a whole financial life, not one product at a time."
        />
        <div className="grid grid-4">
          {pillars.map((service, index) => (
            <Reveal key={service.key} delay={index * 80}>
              <Card
                as={Link}
                to="/services#services"
                className="card-link card-gold stack stack-sm"
                style={{ height: '100%' }}
              >
                <span className="medallion" style={{ width: 46, height: 46 }}>
                  <Icon name={service.icon} size={22} />
                </span>
                <h4>{service.title}</h4>
                <p
                  className="small"
                  style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16.5, color: 'var(--gold-ink)' }}
                >
                  {service.lead}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal className="row" style={{ justifyContent: 'center' }}>
          <Link to="/services" className="btn btn-secondary">
            How an engagement runs <Icon name="arrow_forward" size={18} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/** The writing, linked from the landing page rather than hidden in a menu. */
function Reading() {
  return (
    <section style={{ background: 'var(--surface-container)', padding: '92px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Insights & Intelligence"
          title="What we would tell you in the meeting."
          lede="Written plainly, with no product names and no forecasts."
        />
        <div className="grid grid-3">
          {insights.slice(0, 3).map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 80}>
              <Card as={Link} to={`/insights/${post.slug}`} className="card-link card-gold stack stack-sm" style={{ height: '100%' }}>
                <span className="badge badge-gold">{post.category}</span>
                <h4>{post.title}</h4>
                <p className="small muted" style={{ lineHeight: 1.7 }}>{post.summary}</p>
                <span className="small" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  {post.readingMinutes} min read →
                </span>
              </Card>
            </Reveal>
          ))}
        </div>
        
        <NewsStrip />

        <Reveal className="row" style={{ justifyContent: 'center' }}>
          <Link to="/insights" className="btn btn-secondary">Everything we have written</Link>
        </Reveal>
      </div>
    </section>
  );
}


/**
 * Who is behind it, in a photograph and four lines.
 *
 * The bios, the vision and the message are the About page's job. What is
 * needed here is a face and a reason to go there.
 */
function FoundersTeaser() {
  return (
    <section style={{ padding: '96px 0', background: 'var(--surface-low)', borderTop: '1px solid var(--outline-variant)' }}>
      <div className="container">
        <Reveal className="founders-strip" style={{ alignItems: 'center' }}>
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gold-line)', boxShadow: 'var(--elev-3)' }}>
            <Photo
              name="founders-at-work"
              alt="Shiv Maheshwari and Vikram Rajput at a table"
              width={1400}
              height={933}
              sizes="(max-width: 900px) 100vw, 620px"
            />
          </div>
          <div className="stack stack-sm" style={{ justifyContent: 'center', padding: '12px 0' }}>
            <span className="badge badge-gold tiny" style={{ width: 'fit-content', fontSize: 11 }}>
              <Icon name="verified_user" size={14} /> FOUNDERS & ADVISORY LEADERSHIP
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 3.4vw, 42px)', lineHeight: 1.15, marginTop: 6 }}>
              Two decades each.<br />One question left over.
            </h2>
            <p className="muted" style={{ lineHeight: 1.8, fontSize: 16, maxWidth: '44ch' }}>
              Shiv Maheshwari and Vikram Rajput spent their careers inside Indian life insurance —
              agency strategy, organizational transformation, and a great many households.
            </p>
            <blockquote className="pullquote" style={{ margin: '8px 0 12px', padding: '16px 20px', background: 'var(--surface-lowest)', borderColor: 'var(--gold)' }}>
              <p style={{ fontSize: 15, fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
                “Experience ultimately becomes valuable when it is converted into contribution.”
              </p>
              <footer style={{ marginTop: 6, fontSize: 11 }}>— Shiv Maheshwari, Co-Founder</footer>
            </blockquote>
            <Link to="/about#founders" className="row small" style={{ gap: 7, color: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              Read the full leadership story <Icon name="arrow_forward" size={17} />
            </Link>
          </div>
        </Reveal>
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
          title="One conversation, and no product named in it."
          lede="Bring the numbers you ran here. We will tell you which of them matters this year."
        >
          <Reveal className="row" delay={260} style={{ justifyContent: 'center', marginTop: 10 }}>
            <button type="button" className="btn btn-gold btn-sheen" onClick={requestCallback}>
              Request a call
            </button>
          </Reveal>
        </SectionHead>
      </div>
    </section>
  );
}
