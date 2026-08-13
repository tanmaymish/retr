import { Link } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { FounderCard } from './Founders';
import { Photo } from '../components/Photo';
import { faqSchema, organizationSchema, useSeo } from '../lib/seo';
import { requestCallback } from './CallbackPopup';
import { Crest, Reveal, SectionHead } from './Section';
import { NewsStrip } from './NewsStrip';
import { CALCULATORS } from '../lib/calculatorSpecs';
import { insights } from './insights';
import { assurances, audience, brand, faqs, founders, howItWorks, problems, services, stages } from './content';

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
      <Tools />
      <Stages />
      <Problems />
      <Audience />
      <Services />
      <HowItWorks />
      <Reading />
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

        <Reveal as="h1" delay={120} style={{ color: 'var(--on-band)', maxWidth: '21ch' }}>
          What you build deserves to continue.
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
          Protection, retirement and the planning around them — from two founders with two
          decades each in life insurance.
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
          Four stages of life, not four products.
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
          eyebrow="Why people come to us"
          title="Most households are not underinsured. They are unreviewed."
          lede="What happens when decisions taken years apart are never read together."
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

/** Who this is for. The reason the rest of the copy is specific. */
function Audience() {
  return (
    <section id="who" style={{ padding: '20px 0 92px' }}>
      <div className="container stack stack-lg">
        <SectionHead eyebrow={audience.eyebrow} title={audience.title} lede={audience.lede} />
        <div className="grid grid-4">
          {audience.groups.map((group, index) => (
            <Reveal key={group.title} delay={index * 80}>
              <Card flat className="stack stack-sm" style={{ height: '100%' }}>
                <span className="medallion" style={{ width: 44, height: 44 }}>
                  <Icon name={group.icon} size={21} />
                </span>
                <h4>{group.title}</h4>
                <p className="small muted" style={{ lineHeight: 1.7 }}>{group.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** What the firm actually does. */
function Services() {
  return (
    <section id="services" style={{ background: 'var(--surface-container)', padding: '96px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What we do"
          title="Advice across the whole of a financial life, not one product at a time."
          lede="Four conversations, held over the years it takes to build something and the years it has to last."
        />
        {/* Four services, so two by two rather than three and a stray. */}
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', maxWidth: 980, width: '100%', marginInline: 'auto' }}
        >
          {services.map((service, index) => (
            <Reveal key={service.key} delay={(index % 2) * 90}>
              <Card className="stack stack-sm card-gold" style={{ height: '100%' }}>
                <span className="medallion" style={{ width: 52, height: 52 }}>
                  <Icon name={service.icon} size={24} />
                </span>
                <h3 style={{ marginTop: 4 }}>{service.title}</h3>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: 'var(--gold-ink)',
                  }}
                >
                  {service.lead}
                </p>
                <p className="small muted" style={{ lineHeight: 1.75 }}>{service.body}</p>
                <ul className="stack" style={{ gap: 8, margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                  {service.points.map((point) => (
                    <li key={point} className="row small" style={{ alignItems: 'flex-start', gap: 9 }}>
                      <Icon name="check" size={16} style={{ color: 'var(--gold)', marginTop: 3, flex: 'none' }} />
                      <span className="muted">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn" onClick={requestCallback}>
            Talk through your situation
          </button>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The tools, high on the page: the thing a visitor can use before they trust
 * anyone, and the best reason to come back.
 */
function Tools() {
  const featured = ['human-life-value', 'sip', 'home-loan-emi', 'income-tax', 'nps', 'ppf']
    .map((slug) => CALCULATORS.find((calculator) => calculator.slug === slug))
    .filter(Boolean);

  return (
    <section id="tools" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Start here"
          title="Run your own numbers first."
          lede="Eleven of them, free, with nothing behind a signup and nothing stored."
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
            All eleven calculators <Icon name="arrow_forward" size={18} />
          </Link>
          <Link to="/preparedness-check" className="btn">Take the preparedness check</Link>
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

function HowItWorks() {
  return (
    <section id="how" style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="How we work"
          title="How an engagement actually runs."
          lede="In this order, every time. The first meeting names no product."
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
          eyebrow="What you can hold us to"
          title="Four commitments, each one specific enough to be broken."
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
            <button type="button" className="btn btn-gold btn-sheen" onClick={requestCallback}>
              Request a call
            </button>
          </Reveal>
        </SectionHead>
      </div>
    </section>
  );
}
