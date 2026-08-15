import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { breadcrumbSchema, useSeo } from '../lib/seo';
import { FounderCard } from './Founders';
import { Photo } from '../components/Photo';
import { requestCallback } from './CallbackPopup';
import {
  brand,
  founders,
  foundersMessage,
  fourQuestions,
  mission,
  promise,
  vision,
} from './content';

/**
 * The full brand narrative. The copy is the founders' own — this page arranges
 * it and nothing more.
 */
export default function About() {
  const { hash } = useLocation();
  useSeo({
    title: 'About',
    description:
      'Akshayvriddhi begins with experience. The philosophy, the founders, and why an institution built on listening rather than selling.',
    path: '/about',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about' },
    ]),
  });

  // Deep links from the nav (#founders, #philosophy) need to scroll themselves:
  // the router changes the hash without reloading the document.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash]);

  return (
    <SitePage>
      <Opening />
      <Founders />
      <TwoJourneys />
      <VisionMission />
      <Message />
      <Promise />
    </SitePage>
  );
}

function Opening() {
  return (
    <section style={{ padding: '96px 0 72px' }}>
      <div className="container stack stack-md enter" style={{ maxWidth: 760 }}>
        <span className="caps" style={{ color: 'var(--primary)' }}>About {brand.name}</span>
        <h1 style={{ fontSize: 'clamp(30px, 4.4vw, 46px)' }}>
          Experience that now has a larger purpose.
        </h1>
        <div className="stack stack-sm" style={{ marginTop: 8 }}>
          <Lead>Some businesses begin with an opportunity. Akshayvriddhi begins with experience.</Lead>
          <Body>
            After decades spent understanding insurance, building distribution networks, leading
            teams, transforming businesses and — most importantly — interacting with people at
            different stages of their financial lives, our founders arrived at a simple realisation.
          </Body>
          <Pullquote>
            People do not need more insurance products. They need greater clarity about what they are
            protecting, why they are protecting it, and whether that protection will truly stand by
            them when life changes.
          </Pullquote>
          <Body>
            Insurance, understood correctly, is not something you buy. It is a promise made to the
            future: that the life you spent years building can continue when circumstances change.
            That is the purpose behind Akshayvriddhi.
          </Body>
        </div>
      </div>
    </section>
  );
}

function Founders() {
  return (
    <section id="founders" style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 620 }} className="stack stack-sm">
          <span className="caps" style={{ color: 'var(--primary)' }}>Meet the founders</span>
          <h2>Two journeys. One purpose.</h2>
        </div>

        <figure style={{ margin: 0 }}>
          <Photo
            name="founders-at-work"
            alt="Shiv Maheshwari and Vikram Rajput working through the founders’ vision — experience, perspective, purpose and impact — beneath the four stages on the wall behind them."
            width={1400}
            height={933}
            sizes="(max-width: 900px) 100vw, 1120px"
          />
          <figcaption className="tiny muted" style={{ marginTop: 10 }}>
            Experience, perspective, purpose and impact — the four ideas the practice is built on.
          </figcaption>
        </figure>
        <div className="stack stack-md">
          {founders.map((founder) => (
            <FounderCard key={founder.id} founder={founder} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TwoJourneys() {
  return (
    <section style={{ background: 'var(--band)', color: 'var(--on-band)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 720 }} className="stack stack-sm">
          <h2 style={{ color: 'var(--on-band)' }}>Strategy with empathy. Experience with accessibility.</h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: 1.75 }}>
            Their professional journeys have been different. One has spent decades looking at
            insurance through the lenses of strategy, transformation, distribution and organisational
            leadership. The other has built his experience close to markets, advisors, teams,
            customers and families. Together, those perspectives create the foundation of
            Akshayvriddhi.
          </p>
        </div>
        <div className="grid grid-4">
          {[
            { icon: 'psychology', label: 'Strategy with empathy' },
            { icon: 'handshake', label: 'Experience with accessibility' },
            { icon: 'memory', label: 'Technology with human judgement' },
            { icon: 'shield', label: 'Protection with purpose' },
          ].map((item) => (
            <div
              key={item.label}
              className="stack stack-sm"
              style={{
                padding: 22,
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <Icon name={item.icon} size={24} style={{ color: 'var(--band-accent)' }} />
              <strong style={{ fontFamily: 'var(--font-heading)' }}>{item.label}</strong>
            </div>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.78)', maxWidth: 620 }}>
          Because the future of financial advice should not force people to choose between expertise
          and personal relationships. They deserve both.
        </p>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section id="vision" style={{ padding: '88px 0' }}>
      <div className="container grid grid-2">
        <Card className="stack stack-sm">
          <span className="caps" style={{ color: 'var(--primary)' }}>Our vision</span>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.5 }}>{vision}</p>
        </Card>
        <Card className="stack stack-sm">
          <span className="caps" style={{ color: 'var(--primary)' }}>Our mission</span>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.5 }}>{mission}</p>
        </Card>
      </div>

      <div className="container stack stack-md" style={{ marginTop: 48, maxWidth: 760 }}>
        <h3>We seek to help every client answer four fundamental questions.</h3>
        <div className="stack stack-sm">
          {fourQuestions.map((question, index) => (
            <div
              key={question}
              className="row"
              style={{
                gap: 16,
                padding: '16px 20px',
                background: 'var(--surface-lowest)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--elev-1)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  fontSize: 18,
                  flex: 'none',
                }}
              >
                0{index + 1}
              </span>
              <span style={{ fontSize: 17 }}>{question}</span>
            </div>
          ))}
        </div>
        <Body>
          When these questions are answered thoughtfully, financial planning becomes more than
          numbers. It becomes life planning.
        </Body>
      </div>
    </section>
  );
}

function Message() {
  return (
    <section style={{ padding: '88px 0' }}>
      <div className="container stack stack-md" style={{ maxWidth: 760 }}>
        <span className="caps" style={{ color: 'var(--primary)' }}>A message from our founders</span>
        {foundersMessage.map((paragraph) => (
          <Body key={paragraph.slice(0, 40)}>{paragraph}</Body>
        ))}
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginTop: 8 }}>
          — Shiv Maheshwari &amp; Vikram Rajput
          <br />
          <span className="small muted" style={{ fontWeight: 400 }}>Co-Founders, Akshayvriddhi</span>
        </p>
      </div>
    </section>
  );
}

/**
 * The four lines the founders lead with, and the close.
 *
 * These used to be two sections saying much the same thing at eighty-eight
 * pixels of padding each. One section, the promise as a numbered strip above
 * the sign-off.
 */
function Promise() {
  return (
    <section style={{ background: 'var(--surface-lowest)', padding: '88px 0 96px' }}>
      <div className="container stack stack-lg" style={{ maxWidth: 820 }}>
        <div className="stack stack-sm">
          <span className="caps" style={{ color: 'var(--primary)' }}>The Akshayvriddhi promise</span>
          <div className="promise-strip">
            {promise.map((line) => (
              <p key={line} className="row" style={{ gap: 11, alignItems: 'flex-start' }}>
                <Icon name="check_circle" size={19} style={{ color: 'var(--sage)', marginTop: 3, flex: 'none' }} />
                <span style={{ fontSize: 16, lineHeight: 1.6 }}>{line}</span>
              </p>
            ))}
          </div>
        </div>

        <div className="center stack stack-md" style={{ alignItems: 'center' }}>
          <h2>{brand.promise}</h2>
          <p className="muted" style={{ fontSize: 17, lineHeight: 1.7, maxWidth: '58ch' }}>
            Trust in financial services should never begin with a product. It should begin with
            understanding.
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, letterSpacing: '0.14em', color: 'var(--gold-ink)' }}>
            {brand.stages}
          </p>
          <button type="button" className="btn btn-sheen" onClick={requestCallback}>
            Request a call
          </button>
        </div>
      </div>
    </section>
  );
}

/* Small typographic helpers, so the long-form copy stays readable. */
function Lead({ children }) {
  return (
    <p style={{ fontSize: 20, lineHeight: 1.6, fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
      {children}
    </p>
  );
}

function Body({ children, style }) {
  return (
    <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--on-surface-variant)', ...style }}>
      {children}
    </p>
  );
}

function Pullquote({ children }) {
  return (
    <p
      style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 19,
        lineHeight: 1.6,
        padding: '18px 24px',
        borderLeft: '3px solid var(--primary)',
        background: 'var(--surface-low)',
        borderRadius: 'var(--radius)',
        margin: '8px 0',
      }}
    >
      {children}
    </p>
  );
}
