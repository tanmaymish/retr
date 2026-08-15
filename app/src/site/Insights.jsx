import { Link, useParams } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Crest, Reveal, SectionHead } from './Section';
import { requestCallback } from './CallbackPopup';
import { useSeo } from '../lib/seo';
import { formatDate } from '../lib/format';
import { insightBySlug, insights } from './insights';
import { shareable } from './content';

/** The writing: an index, and a reader. Both are plain on purpose. */

export function InsightsIndex() {
  useSeo({
    title: 'Insights',
    description:
      'Plain explanations of protection, retirement and planning for Indian households — what to check, what it costs, and what nobody tells you.',
    path: '/insights',
  });

  const [lead, ...rest] = insights;

  return (
    <SitePage>
      <section style={{ padding: '72px 0 40px' }}>
        <div className="container">
          <SectionHead
            as="h1"
            eyebrow="Insights"
            title="What we would tell you in the meeting."
            lede="No product names, no forecasts. The things worth understanding before a decision."
          />
        </div>
      </section>

      <section style={{ paddingBottom: 96 }}>
        <div className="container stack stack-lg">
          <Reveal>
            <Card as={Link} to={`/insights/${lead.slug}`} className="card-link card-gold stack stack-sm" style={{ padding: 36 }}>
              <span className="row" style={{ gap: 10 }}>
                <span className="badge badge-gold">{lead.category}</span>
                <span className="tiny muted">{lead.readingMinutes} min read</span>
              </span>
              <h2 style={{ fontSize: 'clamp(26px, 3.4vw, 38px)', maxWidth: '24ch' }}>{lead.title}</h2>
              <p className="muted" style={{ maxWidth: '66ch', fontSize: 17, lineHeight: 1.75 }}>{lead.summary}</p>
              <span className="row small" style={{ gap: 6, color: 'var(--primary)', fontWeight: 600 }}>
                Read it <Icon name="arrow_forward" size={16} />
              </span>
            </Card>
          </Reveal>

          <Reveal>
            <Card flat className="stack stack-md" style={{ padding: 32 }}>
              <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>Worth forwarding</span>
              <ul className="oneliners">
                {shareable.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </Card>
          </Reveal>

          <div className="grid grid-3">
            {rest.map((post, index) => (
              <Reveal key={post.slug} delay={(index % 3) * 80}>
                <Card as={Link} to={`/insights/${post.slug}`} className="card-link stack stack-sm" style={{ height: '100%' }}>
                  <span className="row" style={{ gap: 10 }}>
                    <span className="badge">{post.category}</span>
                    <span className="tiny muted">{post.readingMinutes} min</span>
                  </span>
                  <h4>{post.title}</h4>
                  <p className="small muted" style={{ lineHeight: 1.7 }}>{post.summary}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SitePage>
  );
}

export function InsightPost() {
  const { slug } = useParams();
  const post = insightBySlug(slug);

  useSeo({
    title: post ? post.title : 'Insights',
    description: post ? post.summary : 'Insights from Akshay Vriddhi.',
    path: `/insights/${slug}`,
    type: 'article',
    noIndex: !post,
  });

  if (!post) {
    return (
      <SitePage>
        <section style={{ padding: '96px 0' }}>
          <div className="container stack stack-md center" style={{ alignItems: 'center' }}>
            <h1>We have not written that one.</h1>
            <Link to="/insights" className="btn">See what we have written</Link>
          </div>
        </section>
      </SitePage>
    );
  }

  const others = insights.filter((other) => other.slug !== post.slug).slice(0, 2);

  return (
    <SitePage>
      <article>
        <section style={{ padding: '56px 0 24px' }}>
          <div className="container stack stack-sm" style={{ maxWidth: 760 }}>
            <Link to="/insights" className="small row" style={{ gap: 6, color: 'var(--on-surface-variant)' }}>
              <Icon name="arrow_back" size={16} /> All insights
            </Link>
            <span className="row" style={{ gap: 10 }}>
              <span className="badge badge-gold">{post.category}</span>
              <span className="tiny muted">{post.readingMinutes} min read · updated {formatDate(post.updated)}</span>
            </span>
            <h1 style={{ fontSize: 'clamp(32px, 4.8vw, 52px)' }}>{post.title}</h1>
            <p className="muted" style={{ fontSize: 19, lineHeight: 1.7 }}>{post.summary}</p>
          </div>
        </section>

        <section style={{ padding: '8px 0 40px' }}>
          <div className="container stack stack-md" style={{ maxWidth: 720 }}>
            {post.body.map((block, index) => <Block key={index} block={block} />)}

            <hr className="divider" style={{ marginTop: 12 }} />
            <p className="tiny muted" style={{ lineHeight: 1.7 }}>
              General information, not advice. Rules and rates change — check anything you are about
              to act on against your own situation.
            </p>
          </div>
        </section>

        <section style={{ paddingBottom: 96 }}>
          <div className="container stack stack-lg" style={{ maxWidth: 900 }}>
            <Card flat className="stack stack-sm center" style={{ alignItems: 'center', padding: 32 }}>
              <Crest />
              <h3>Reading about it only gets you so far.</h3>
              <p className="small muted" style={{ maxWidth: '54ch' }}>
                Which part applies to your household takes one conversation. It costs nothing.
              </p>
              <button type="button" className="btn btn-sheen" onClick={requestCallback}>Request a call</button>
            </Card>

            <div className="grid grid-2">
              {others.map((other) => (
                <Card key={other.slug} as={Link} to={`/insights/${other.slug}`} className="card-link stack stack-sm">
                  <span className="tiny caps muted">Read next</span>
                  <h4>{other.title}</h4>
                  <p className="small muted">{other.summary}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </article>
    </SitePage>
  );
}

function Block({ block }) {
  if (block.type === 'h') return <h3 style={{ marginTop: 12 }}>{block.text}</h3>;
  if (block.type === 'list') {
    return (
      <ul className="stack stack-sm" style={{ margin: 0, paddingLeft: 0, listStyle: 'none' }}>
        {block.items.map((item) => (
          <li key={item} className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
            <Icon name="check" size={17} style={{ color: 'var(--gold)', marginTop: 4, flex: 'none' }} />
            <span style={{ lineHeight: 1.8 }}>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.type === 'callout') {
    return (
      <blockquote className="pullquote" style={{ marginBlock: 8 }}>
        <p>{block.text}</p>
      </blockquote>
    );
  }
  return <p style={{ fontSize: 17.5, lineHeight: 1.85 }}>{block.text}</p>;
}
