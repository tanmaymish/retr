import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  site,
  stages,
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
      <Philosophy />
      <Vision />
      <Founders />
      <TwoJourneys />
      <VisionMission />
      <StandsFor />
      <Message />
      <Promise />
      <Signature />
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
            Akshayvriddhi was born from this belief. We want to move the conversation beyond
            policies, premiums and transactions towards something much more meaningful — financial
            preparedness, continuity and responsible prosperity.
          </Body>
          <Body>
            Because insurance, when understood correctly, isn’t simply something you buy. It is a
            promise you make to the future: that the life you have worked years to build can continue
            even when circumstances change. That your family’s aspirations do not disappear with an
            unexpected event. That wealth is not only created, but protected. And that what you build
            today can become something meaningful for the generation that follows.
          </Body>
          <Body>That is the purpose behind Akshayvriddhi.</Body>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  return (
    <section id="philosophy" style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 720 }} className="stack stack-sm">
          <span className="caps" style={{ color: 'var(--primary)' }}>Our philosophy</span>
          <h2>Protect what you build. Prepare for what comes next.</h2>
          <Body>
            Life is continuously evolving. During our early years, we focus on creation — building
            careers, businesses, families, assets and ambitions. As responsibilities grow, the focus
            shifts towards continuation. With prosperity comes consumption, the freedom to experience
            the life our efforts have made possible. And eventually comes distribution — transferring
            wealth, values and opportunities to the people and causes that matter to us.
          </Body>
        </div>

        <div className="grid grid-4">
          {stages.map((stage, index) => (
            <Card key={stage.key} className="stack stack-sm">
              <div className="row-between">
                <span
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--primary-fixed)',
                    color: 'var(--primary)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={stage.icon} size={22} />
                </span>
                <span className="tiny muted">0{index + 1}</span>
              </div>
              <h4>{stage.label}</h4>
              <p className="small muted">{stage.body}</p>
            </Card>
          ))}
        </div>

        <Body style={{ maxWidth: 720 }}>
          We believe financial planning should accompany people through this entire journey — not
          appear only when a policy needs to be purchased. Our role is therefore not merely to
          provide access to financial protection. Our role is to help people make better decisions
          about the life they are building.
        </Body>
      </div>
    </section>
  );
}

function Vision() {
  return (
    <section style={{ padding: '88px 0' }}>
      <div className="container stack stack-md" style={{ maxWidth: 760 }}>
        <span className="caps" style={{ color: 'var(--primary)' }}>The founders’ vision</span>
        <h2>From experience to perspective. From perspective to purpose.</h2>
        <Body>
          For years, our founders worked within the insurance industry — building businesses,
          developing people, transforming distribution and helping protection reach thousands of
          families. But experience eventually creates a different kind of responsibility.
        </Body>
        <Body>
          After decades of professional achievement, the question is no longer simply “what can we
          build next?” It becomes: “what can everything we have learned now do for others?”
        </Body>
        <Pullquote>Akshayvriddhi is their answer.</Pullquote>
        <Body>
          The vision is to build an institution where insurance is approached not through fear,
          pressure or transactions, but through understanding, suitability, responsibility and
          long-term relationships. An institution where advice begins with listening. Where
          recommendations begin with understanding a family’s circumstances rather than choosing a
          product. Where technology makes financial planning simpler without removing the human
          relationship that creates trust. And where success is measured not merely by policies
          issued, but by the confidence and continuity those decisions create for families.
        </Body>

        <div className="grid grid-2" style={{ marginTop: 8 }}>
          {[
            'Perspective about how people’s priorities change.',
            'Perspective about how financial responsibilities evolve.',
            'Perspective about the difference between owning financial products and actually being financially prepared.',
            'Perspective about the responsibility that comes with advising someone about their family’s future.',
          ].map((line) => (
            <div key={line} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <Icon name="arrow_forward" size={18} style={{ color: 'var(--primary)', marginTop: 3, flex: 'none' }} />
              <p className="small">{line}</p>
            </div>
          ))}
        </div>

        <Body>Akshayvriddhi exists to put that perspective to work.</Body>
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

function StandsFor() {
  return (
    <section style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <div style={{ maxWidth: 620 }}>
          <h2>What Akshayvriddhi stands for.</h2>
        </div>
        <div className="grid grid-2">
          {stages.map((stage) => (
            <Card key={stage.key} className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: 'var(--on-primary)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: 'none',
                }}
              >
                <Icon name={stage.icon} size={22} />
              </span>
              <div className="stack" style={{ gap: 6 }}>
                <h4>{stage.label}</h4>
                <p className="small muted" style={{ lineHeight: 1.7 }}>{stage.body}</p>
              </div>
            </Card>
          ))}
        </div>
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

function Promise() {
  return (
    <section style={{ background: 'var(--surface-low)', padding: '88px 0' }}>
      <div className="container stack stack-md" style={{ maxWidth: 760 }}>
        <h2>The Akshayvriddhi promise.</h2>
        <div className="stack stack-sm">
          {promise.map((line) => (
            <div key={line} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <Icon name="check_circle" size={20} style={{ color: 'var(--sage)', marginTop: 2, flex: 'none' }} />
              <p style={{ fontSize: 17 }}>{line}</p>
            </div>
          ))}
        </div>
        <Body>
          Because trust in financial services should never begin with a product. It should begin with
          understanding.
        </Body>
      </div>
    </section>
  );
}

function Signature() {
  return (
    <section style={{ background: 'var(--surface-lowest)', padding: '96px 0' }}>
      <div className="container center stack stack-md" style={{ maxWidth: 680 }}>
        <h2>{brand.promise}</h2>
        <p className="muted" style={{ fontSize: 17, lineHeight: 1.7 }}>
          You spend years creating a life — a career, a family, a home, wealth, aspirations and a
          legacy. Akshayvriddhi exists to help ensure that what you create today has the strength to
          continue tomorrow.
        </p>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>
          {brand.stages}
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
          {site.vaultLaunched ? (
            <Link to="/create-vault" className="btn">Create your vault</Link>
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
