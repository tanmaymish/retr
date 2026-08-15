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
import { brand, faqs, services } from './content';

export default function Home() {
  useSeo({
    title: null,
    description:
      'Akshayvriddhi — prosperity with purpose. Protection, retirement and financial planning advice from two founders with two decades each in life insurance. We listen before we advise.',
    path: '/',
    jsonLd: { '@context': 'https://schema.org', '@graph': [organizationSchema, faqSchema(faqs)] },
  });

  return (
    <SitePage>
      <NewsStrip />
      <Hero />
      <TrustBar />
      <Situation />
      <LiveDrawdown />
      <Tools />
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
    { value: 'Two decades', label: 'each, in life insurance', note: 'Shiv Maheshwari and Vikram Rajput' },
    { value: 'Smaller cities', label: 'are who we are for', note: 'Not an afterthought after the metros' },
    { value: 'No cost', label: 'for the first conversation', note: 'And no product named in it' },
    { value: 'Six questions', label: 'to see where you stand', note: 'Scored, and stored nowhere' },
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

function Hero() {
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

        <Reveal as="h1" delay={120} style={{ color: 'var(--on-band)', maxWidth: '22ch' }}>
          Enough to retire on. Enough to educate them.
        </Reveal>

        <Reveal
          as="p"
          delay={150}
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 21,
            color: 'var(--band-accent)',
          }}
        >
          {brand.audience}
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
          Two numbers decide most of a household’s life. We help you find both, and then
          fund them.
        </Reveal>

        <Reveal className="row wrap" delay={240} style={{ gap: 14, justifyContent: 'center', marginTop: 10 }}>
          <Link to="/preparedness-check" className="btn btn-gold btn-sheen">
            Take the preparedness check
            <Icon name="arrow_forward" size={18} />
          </Link>
          <button type="button" className="btn btn-on-band" onClick={requestCallback}>
            Talk to a founder
          </button>
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
      icon: 'hourglass_bottom',
      eyebrow: 'Retiring soon',
      title: 'Will the money last?',
      to: '/calculators/retirement-drawdown',
      cta: 'See the year it runs out',
    },
    {
      icon: 'school',
      eyebrow: 'Children to educate',
      title: 'What will it cost?',
      to: '/calculators/education-goal',
      cta: 'See the bill in that year',
    },
    {
      icon: 'shield_with_heart',
      eyebrow: 'Something to protect',
      title: 'Is the cover enough?',
      to: '/calculators/human-life-value',
      cta: 'See the gap',
    },
  ];

  return (
    <section style={{ padding: '76px 0 12px' }}>
      <div className="container stack stack-lg">
        <SectionHead eyebrow="Where you are" title="Start with the question you actually have." />
        <div className="grid grid-3">
          {doors.map((door, index) => (
            <Reveal key={door.to} delay={index * 90}>
              <Card
                as={Link}
                to={door.to}
                className="card-link card-gold stack stack-sm"
                style={{ height: '100%', padding: 28 }}
              >
                <span className="medallion medallion-solid" style={{ width: 50, height: 50 }}>
                  <Icon name={door.icon} size={24} />
                </span>
                <span className="tiny caps" style={{ color: 'var(--gold-ink)', letterSpacing: '0.14em' }}>
                  {door.eyebrow}
                </span>
                <h3 style={{ fontSize: 24 }}>{door.title}</h3>
                <span className="row small" style={{ gap: 6, color: 'var(--primary)', fontWeight: 600, marginTop: 'auto' }}>
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
 * The tools, high on the page: the thing a visitor can use before they trust
 * anyone, and the best reason to come back.
 */
function Tools() {
  /* Four, because the grid fits four across and five would leave a stray. The
     three above this section already carry drawdown, education and cover — so
     these are the next four a household actually asks about. */
  const featured = ['nps', 'sip', 'income-tax', 'home-loan-emi']
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
  return (
    <section style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What we do"
          title="Four things, done properly."
          lede="Advice across a whole financial life, not one product at a time."
        />
        <div className="grid grid-4">
          {services.map((service, index) => (
            <Reveal key={service.key} delay={index * 80}>
              <Card
                as={Link}
                to="/services#services"
                className="card-link stack stack-sm"
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
          eyebrow="Insights"
          title="What we would tell you in the meeting."
          lede="Written plainly, with no product names and no forecasts."
        />
        <div className="grid grid-3">
          {insights.slice(0, 3).map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 80}>
              <Card as={Link} to={`/insights/${post.slug}`} className="card-link stack stack-sm" style={{ height: '100%' }}>
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
    <section style={{ padding: '88px 0' }}>
      <div className="container">
        <Reveal className="founders-strip">
          <Photo
            name="founders-at-work"
            alt="Shiv Maheshwari and Vikram Rajput at a table, working through the founders’ vision beneath a wall showing the four stages: create, continue, consume, distribute."
            width={1400}
            height={933}
            sizes="(max-width: 900px) 100vw, 620px"
          />
          <div className="stack stack-sm" style={{ justifyContent: 'center' }}>
            <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>The people behind it</span>
            <h2 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)' }}>Two decades each. One question left over.</h2>
            <p className="muted" style={{ lineHeight: 1.75, maxWidth: '44ch' }}>
              Shiv Maheshwari and Vikram Rajput spent their careers inside life insurance —
              distribution, strategy, transformation, and a great many households. Then: what can
              all of it now do for someone else?
            </p>
            <Link to="/about#founders" className="row small" style={{ gap: 7, color: 'var(--primary)', fontWeight: 600, marginTop: 4 }}>
              Read their story <Icon name="arrow_forward" size={17} />
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
