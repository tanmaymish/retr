import { useEffect, useState } from 'react';
import { Icon } from '../components/ui';
import { isStatic } from '../lib/backend';
import { relativeTime } from '../lib/format';

const ENDPOINT = import.meta.env.VITE_NEWS_ENDPOINT || (isStatic ? '' : '/api/news');

export function NewsStrip() {
  const [items, setItems] = useState([]);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!ENDPOINT) return undefined;
    const controller = new AbortController();

    fetch(ENDPOINT, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items.slice(0, 4) : []);
        setFetchedAt(data.fetchedAt ?? null);
      })
      .catch(() => {});

    return () => controller.abort();
  }, []);

  if (!items.length) return null;

  return (
    <div
      className="card-gold"
      style={{
        background: 'var(--surface-low)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '1px solid var(--gold-line)',
        marginTop: 24,
      }}
    >
      <div className="row-between" style={{ marginBottom: isExpanded ? 16 : 0, alignItems: 'center' }}>
        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <span className="live-dot" aria-hidden="true" />
          <span className="eyebrow" style={{ color: 'var(--gold-ink)', fontSize: 12, letterSpacing: '0.14em' }}>
            Live Market & Policy Briefings
          </span>
        </div>
        <div className="row" style={{ gap: 12, alignItems: 'center' }}>
          {fetchedAt && <span className="tiny muted">Updated {relativeTime(fetchedAt)}</span>}
          <button
            type="button"
            className="btn btn-secondary tiny"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ padding: '4px 10px', height: 'auto', fontSize: 12 }}
          >
            {isExpanded ? 'Collapse' : 'Show Headlines'} <Icon name={isExpanded ? 'expand_less' : 'expand_more'} size={14} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="stack" style={{ gap: 14 }}>
          <div className="grid grid-2" style={{ gap: 14 }}>
            {items.map((item) => (
              <a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="choice"
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                <div className="row-between" style={{ width: '100%', alignItems: 'center' }}>
                  <span className="badge badge-gold tiny" style={{ fontSize: 10, padding: '2px 8px' }}>
                    {item.source || 'Market News'}
                  </span>
                  {item.publishedAt && <span className="tiny muted">{relativeTime(item.publishedAt)}</span>}
                </div>
                <span className="small" style={{ fontWeight: 600, lineHeight: 1.45, color: 'var(--on-surface)' }}>
                  {item.title}
                </span>
                <span className="tiny row" style={{ gap: 4, color: 'var(--primary)', fontWeight: 500, marginTop: 4 }}>
                  Read coverage <Icon name="open_in_new" size={12} />
                </span>
              </a>
            ))}
          </div>
          <p className="tiny muted" style={{ fontSize: 11, margin: 0 }}>
            Curated headlines from public feeds linked directly to publishers. Provided for contextual awareness.
          </p>
        </div>
      )}
    </div>
  );
}

