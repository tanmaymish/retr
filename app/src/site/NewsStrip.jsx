import { useEffect, useState } from 'react';
import { Icon } from '../components/ui';
import { isStatic } from '../lib/backend';
import { relativeTime } from '../lib/format';

/**
 * Market and money headlines on the landing page.
 *
 * Fetched from our own server, which reads public RSS and caches it — so the
 * browser never talks to a news source directly and there is no third-party
 * script on the page.
 *
 * If there is nothing to show — a static build with no endpoint configured, a
 * feed that is down, a request that failed — this renders nothing at all. An
 * empty strip is better than a placeholder, and a placeholder headline on a
 * financial site is worse than either.
 */

const ENDPOINT = import.meta.env.VITE_NEWS_ENDPOINT || (isStatic ? '' : '/api/news');

export function NewsStrip() {
  const [items, setItems] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    if (!ENDPOINT) return undefined;
    const controller = new AbortController();

    fetch(ENDPOINT, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items.slice(0, 6) : []);
        setFetchedAt(data.fetchedAt ?? null);
      })
      .catch(() => {
        /* Nothing to show is a legitimate state, and the only honest one. */
      });

    return () => controller.abort();
  }, []);

  if (!items.length) return null;

  return (
    <section
      aria-label="Market and money headlines"
      style={{ background: 'var(--surface-lowest)', borderBottom: '1px solid var(--outline-variant)' }}
    >
      <div className="container stack stack-sm" style={{ padding: '26px 20px' }}>
        <div className="row-between wrap" style={{ gap: 12 }}>
          <span className="row" style={{ gap: 8 }}>
            <span className="live-dot" aria-hidden="true" />
            <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>Markets and money</span>
          </span>
          {fetchedAt && <span className="tiny muted">Updated {relativeTime(fetchedAt)}</span>}
        </div>

        <ul className="grid grid-3" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {items.map((item) => (
            <li key={item.link}>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="stack"
                style={{ gap: 4, color: 'inherit', textDecoration: 'none' }}
              >
                <span className="small" style={{ fontWeight: 600, lineHeight: 1.5 }}>{item.title}</span>
                <span className="tiny muted row" style={{ gap: 6 }}>
                  {item.source}
                  {item.publishedAt && <> · {relativeTime(item.publishedAt)}</>}
                  <Icon name="open_in_new" size={12} />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="tiny muted">
          Headlines from public feeds, linked to their publishers. Not our reporting, and not a view
          on anything.
        </p>
      </div>
    </section>
  );
}
