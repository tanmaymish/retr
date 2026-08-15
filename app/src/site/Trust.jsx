import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Reveal, SectionHead } from './Section';
import { requestCallback } from './CallbackPopup';
import { breadcrumbSchema, useSeo } from '../lib/seo';
import { useContent } from '../lib/siteContent';
import { assurances, engagement } from './content';

/**
 * How we are paid, and what that means for you.
 *
 * For a regulated firm this page is load-bearing rather than marketing garnish,
 * and the honest version is better copy than the dishonest one. Akshay Vriddhi
 * is an IRDAI-registered Insurance Marketing Firm: it earns commission, like
 * every licensed distributor. Nothing on this page may imply otherwise. The
 * differentiator is breadth of empanelment and being told the number — not the
 * absence of a commission that plainly exists.
 */
export default function Trust() {
  const commitments = useContent('assurances', assurances);

  useSeo({
    title: 'How we are paid',
    description:
      'Akshay Vriddhi is an IRDAI-registered Insurance Marketing Firm. We earn commission from the insurers and fund houses we are empanelled with, and we will tell you what it is. Here is the whole arrangement.',
    path: '/trust',
    jsonLd: breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'How we are paid', path: '/trust' },
    ]),
  });

  return (
    <SitePage>
      <section style={{ padding: '72px 0 40px' }}>
        <div className="container">
          <SectionHead
            as="h1"
            eyebrow="Trust"
            title="We earn commission. Ask us the number."
            lede="Most of this industry would rather you did not think about how it gets paid. The arrangement is on this page instead."
          />
        </div>
      </section>

      <section style={{ paddingBottom: 80 }}>
        <div className="container stack stack-lg">
          <div className="grid pair" style={{ maxWidth: 940, marginInline: 'auto' }}>
            {commitments.map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 90}>
                <Card className="stack stack-sm card-gold" style={{ height: '100%' }}>
                  <span className="medallion" style={{ width: 48, height: 48 }}>
                    <Icon name={item.icon} size={23} />
                  </span>
                  <h3 style={{ fontSize: 20 }}>{item.title}</h3>
                  <p className="small muted" style={{ lineHeight: 1.75 }}>{item.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Licence />
      <Engagement />
      <Privacy />
    </SitePage>
  );
}

/** What the licence actually permits — stated, because it is the differentiator. */
function Licence() {
  const facts = [
    {
      icon: 'balance',
      title: 'Up to six insurers per line',
      body: 'An Insurance Marketing Firm may empanel with up to six insurers in each of life, general and health. A corporate agent is capped at three; a tied agent has one.',
    },
    {
      icon: 'trending_up',
      title: 'Mutual funds too',
      body: 'The same registration permits distribution of mutual funds, so the plan is not forced to solve every problem with an insurance product.',
    },
    {
      icon: 'workspace_premium',
      title: 'Certified people, retrained every three years',
      body: 'Every insurance sale runs through a certified Insurance Sales Person or Financial Services Executive, and the rules require the Principal Officer and sales staff to complete recognised training on a rolling three-year cycle.',
    },
    {
      icon: 'gavel',
      title: 'What we are not',
      body: 'Not fee-only, not commission-free, and not a SEBI-registered Investment Adviser. Any firm telling you it is all three is worth a second question.',
    },
  ];

  return (
    <section style={{ background: 'var(--surface-container)', padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="The licence"
          title="What an Insurance Marketing Firm may actually do."
          lede="The abbreviation on our lockup is a registration category, not a claim. Here is what it permits."
        />
        <div className="grid pair" style={{ maxWidth: 940, marginInline: 'auto' }}>
          {facts.map((fact, index) => (
            <Reveal key={fact.title} delay={(index % 2) * 80}>
              <Card flat className="row" style={{ gap: 18, alignItems: 'flex-start', height: '100%' }}>
                <span className="medallion" style={{ width: 44, height: 44 }}>
                  <Icon name={fact.icon} size={21} />
                </span>
                <span className="stack grow" style={{ gap: 6 }}>
                  <h4>{fact.title}</h4>
                  <p className="small muted" style={{ lineHeight: 1.7 }}>{fact.body}</p>
                </span>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="tiny muted center" style={{ maxWidth: '70ch', marginInline: 'auto', lineHeight: 1.8 }}>
          Our IRDAI registration number and current empanelment list are stated on our documentation
          and in the footer of this site. Both are verifiable on the IRDAI’s own register.
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The engagement model.
 *
 * The two paid tiers carry no price. Nobody but the founders can set one, and a
 * placeholder figure on a live page for a regulated firm is worse than an
 * honest "quoted on the call". See PRICING_TBC in content.js.
 */
function Engagement() {
  const tiers = useContent('engagement', engagement);
  return (
    <section id="engagement" style={{ padding: '88px 0' }}>
      <div className="container stack stack-lg">
        <SectionHead
          eyebrow="Working together"
          title="Three ways in. The first one costs nothing."
          lede="The calculator and the first call are free. A written plan that stands on its own, whether or not you ever buy through us, is the paid tier."
        />
        <div className="grid grid-3" style={{ maxWidth: 1040, marginInline: 'auto' }}>
          {tiers.map((tier, index) => (
            <Reveal key={tier.key} delay={index * 90}>
              <Card
                className={`stack stack-sm${tier.recommended ? ' card-gold' : ''}`}
                style={{ height: '100%', padding: 28 }}
              >
                {tier.recommended && (
                  <span className="badge badge-gold" style={{ alignSelf: 'flex-start' }}>Most households</span>
                )}
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 26 }}>{tier.name}</h3>
                <strong style={{ color: 'var(--gold-ink)', fontFamily: 'var(--font-heading)', fontSize: 15 }}>
                  {tier.price ?? 'Quoted on the call'}
                </strong>
                <span className="tiny muted">{tier.priceNote}</span>
                <ul className="stack stack-sm" style={{ margin: '8px 0 0', padding: 0, listStyle: 'none' }}>
                  {tier.points.map((point) => (
                    <li key={point} className="row small" style={{ alignItems: 'flex-start', gap: 9 }}>
                      <Icon name="check" size={16} style={{ color: 'var(--gold)', marginTop: 3, flex: 'none' }} />
                      <span className="muted">{point}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`btn btn-sm${tier.recommended ? ' btn-sheen' : ' btn-secondary'}`}
                  style={{ marginTop: 'auto' }}
                  onClick={requestCallback}
                >
                  {tier.price === 'Free' ? 'Book the free call' : 'Ask what this costs'}
                </button>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal as="p" className="small muted center" style={{ maxWidth: '68ch', marginInline: 'auto', lineHeight: 1.8 }}>
          Like any licensed intermediary, we earn commission from the insurers and fund houses we
          work with — ask us the number on anything we recommend, and we will tell you. A paid
          blueprint buys you a plan that stands on its own, whether or not you ever buy a product
          through us.
        </Reveal>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section style={{ background: 'var(--surface-low)', padding: '80px 0' }}>
      <div className="container stack stack-md" style={{ maxWidth: 720 }}>
        <SectionHead eyebrow="Your details" title="What happens to what you tell us." />
        <p className="muted" style={{ lineHeight: 1.8, textAlign: 'center' }}>
          Your financial details are used only to build your plan and match you with suitable
          products. They are never sold, and never shared for unrelated marketing. You can ask for
          them to be deleted in full at any time.
        </p>
      </div>
    </section>
  );
}
