import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Reveal, SectionHead } from './Section';
import { requestCallback } from './CallbackPopup';
import { breadcrumbSchema, faqSchema, useSeo } from '../lib/seo';
import { useContent } from '../lib/siteContent';
import { audience, brand, faqs, howItWorks, services, stages } from './content';

/**
 * What we do.
 *
 * How an engagement runs, the seven pillars it runs across, the four life
 * stages behind them, and who this is actually for.
 *
 * The commitments and the commercial arrangement are not here — they are the
 * /trust page, because "how you get paid" deserves its own address rather than
 * a card near the bottom of a services page.
 */
export default function Services() {
  const { hash } = useLocation();

  useSeo({
    title: 'What we do',
    description:
      'Retirement corpus planning, EPF/NPS/PPF optimisation, post-retirement income design, health cover, tax structuring, estate readiness and family conversations — the seven things Akshayvriddhi advises on, and how an engagement runs.',
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
      <How />
      <What />
      <Stages />
      <Who />
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
          lede="Seven pillars, held over the years it takes to build something and the years it has to last."
        />
      </div>
    </section>
  );
}

function How() {
  const steps = useContent('howItWorks', howItWorks);
  return (
    <section id="how" style={{ padding: '40px 0 88px' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="How we work"
          title="How an engagement actually runs."
          lede="In this order, every time. The first meeting names no product, and the plan arrives in writing before one is suggested."
        />
        <ol className="stack stack-md" style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 880, width: '100%', marginInline: 'auto' }}>
          {steps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 70}>
              <Card className="row card-gold" style={{ alignItems: 'flex-start', gap: 20 }}>
                <span className="medallion medallion-solid" style={{ width: 46, height: 46, borderRadius: 'var(--radius-md)' }}>
                  <Icon name={step.icon} size={22} />
                </span>
                <div className="stack grow" style={{ gap: 6 }}>
                  <div className="row wrap" style={{ gap: 10 }}>
                    <span
                      className="tiny"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.16em', color: 'var(--gold-ink)' }}
                    >
                      STEP {index + 1}
                    </span>
                    <h4>{step.title}</h4>
                  </div>
                  <p className="muted small" style={{ lineHeight: 1.7 }}>{step.body}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

function What() {
  const pillars = useContent('services', services);
  return (
    <section id="services" style={{ background: 'var(--surface-container)', padding: '96px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="The advice"
          title="Seven pillars."
          lede="Each one carries a promise — what you get — and then the substance behind it."
        />
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', width: '100%' }}
        >
          {pillars.map((service, index) => (
            <Reveal key={service.key} delay={(index % 2) * 90}>
              <Card className="stack stack-sm card-gold" style={{ height: '100%' }}>
                <span className="medallion" style={{ width: 52, height: 52 }}>
                  <Icon name={service.icon} size={24} />
                </span>
                <span className="tiny" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.16em', color: 'var(--gold-ink)' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 style={{ marginTop: 2 }}>{service.title}</h3>
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
            <Reveal key={stage.key} delay={index * 90}>
              <div className="band-card">
                <div className="row-between">
                  <span className="band-mark">
                    <Icon name={stage.icon} size={21} />
                  </span>
                  <span className="band-num">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h4>{stage.label}</h4>
                <p>{stage.lead}</p>
              </div>
            </Reveal>
          ))}
        </div>
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


function Faqs() {
  const questions = useContent('faqs', faqs);
  return (
    <section id="faq" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg" style={{ maxWidth: 820 }}>
        <SectionHead eyebrow="Questions" title="Questions people actually ask." />
        <div className="stack stack-sm">
          {questions.map((faq) => (
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
