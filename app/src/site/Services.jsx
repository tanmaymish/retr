import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Reveal, SectionHead } from './Section';
import { requestCallback } from './CallbackPopup';
import { breadcrumbSchema, faqSchema, useSeo } from '../lib/seo';
import { assurances, audience, brand, faqs, howItWorks, problems, services, stages } from './content';

/**
 * What we do.
 *
 * These sections used to live on the landing page, which meant a visitor met
 * the whole firm in one scroll and stopped reading somewhere in the middle.
 * They are a page now: why people come, what we advise on, the stages it runs
 * across, how an engagement actually works, and what can be held against us.
 */
export default function Services() {
  const { hash } = useLocation();

  useSeo({
    title: 'What we do',
    description:
      'Protection, retirement, education funding and the planning around them — what Akshayvriddhi advises on, how an engagement runs, and the four commitments behind it.',
    path: '/services',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'What we do', path: '/services' },
        ]),
        faqSchema(faqs),
      ],
    },
  });

  // The footer deep-links to #how and #faq, and the router only changes the
  // hash — nothing scrolls unless we do it.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <SitePage>
      <Opening />
      <Problems />
      <What />
      <Stages />
      <HowItWorks />
      <Who />
      <Assurances />
      <Faqs />
    </SitePage>
  );
}

function Opening() {
  return (
    <section style={{ padding: '72px 0 40px' }}>
      <div className="container">
        <SectionHead
          as="h1"
          eyebrow="What we do"
          title="Advice across a whole financial life, not one product at a time."
          lede="Four conversations, held over the years it takes to build something and the years it has to last."
        />
      </div>
    </section>
  );
}

function Problems() {
  return (
    <section style={{ padding: '40px 0 80px' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Why people come to us"
          title="Most households are not underinsured. They are unreviewed."
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

function What() {
  return (
    <section id="services" style={{ background: 'var(--surface-container)', padding: '96px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead eyebrow="The advice" title="Four things, done properly." />
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
          eyebrow={brand.stages}
          title="Four stages of life, not four products."
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
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.16em', color: 'var(--gold-ink)' }}
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

function Who() {
  return (
    <section id="who" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead eyebrow={audience.eyebrow} title={audience.title} />
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

function Assurances() {
  return (
    <section style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="What you can hold us to"
          title="Four commitments, each one specific enough to be broken."
        />
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
        <Reveal className="row" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn btn-sheen" onClick={requestCallback}>
            Ask us yours
          </button>
        </Reveal>
      </div>
    </section>
  );
}
