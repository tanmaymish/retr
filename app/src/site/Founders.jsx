import { useState } from 'react';
import { Badge, Card, Icon } from '../components/ui';
import { Portrait } from '../components/Photo';
import { initials } from '../lib/format';

/**
 * A founder profile. `compact` is the teaser used on the home page; the full
 * version carries the biography and their own words.
 *
 * Everything rendered here comes from content.js, which holds what the founders
 * themselves supplied. Nothing is inferred or embellished.
 */
export function FounderCard({ founder, compact = false }) {
  return (
    <Card className="stack stack-md" id={compact ? undefined : founder.id}>
      <div className="row" style={{ gap: 18, alignItems: 'flex-start' }}>
        <FounderPhoto founder={founder} size={compact ? 76 : 96} />
        {/* `grow` carries min-width: 0 — without it the strapline refuses to
            wrap and pushes the card past the edge of a phone screen. */}
        <div className="stack grow" style={{ gap: 5 }}>
          <h3 style={{ fontSize: compact ? 20 : 24 }}>{founder.name}</h3>
          <span className="small" style={{ fontWeight: 600, color: 'var(--primary)' }}>{founder.role}</span>
          <span className="tiny muted">{founder.strapline}</span>
          {founder.experience && (
            <span style={{ marginTop: 4 }}>
              <Badge tone="gold" icon="workspace_premium" wrap>{founder.experience}</Badge>
            </span>
          )}
        </div>
      </div>

      {compact ? (
        <p className="small muted" style={{ lineHeight: 1.7 }}>{founder.bio[0]}</p>
      ) : (
        <div className="stack stack-sm">
          {founder.bio.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="small" style={{ lineHeight: 1.75, color: 'var(--on-surface-variant)' }}>
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {!compact && founder.highlights?.length > 0 && (
        <ul className="stack stack-sm" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {founder.highlights.map((highlight) => (
            <li key={highlight} className="row small" style={{ alignItems: 'flex-start', gap: 8 }}>
              <Icon name="check_circle" size={16} style={{ color: 'var(--sage)', marginTop: 3, flex: 'none' }} />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      )}

      {!compact && (
        <blockquote className="pullquote">
          <p>“{founder.quote}”</p>
          <footer>{founder.name} · {founder.role}</footer>
        </blockquote>
      )}

      {!compact && founder.closing && (
        <p className="small muted" style={{ lineHeight: 1.75 }}>{founder.closing}</p>
      )}

      <a
        href={founder.linkedin}
        target="_blank"
        rel="noreferrer noopener"
        className="row small"
        style={{ gap: 6 }}
      >
        <Icon name="link" size={16} />
        {founder.name} on LinkedIn
      </a>
    </Card>
  );
}

/** Falls back to a monogram until a headshot is supplied. */
export function FounderPhoto({ founder, size = 96 }) {
  const [failed, setFailed] = useState(false);

  if (failed || !founder.photo) {
    return (
      <span
        aria-hidden="true"
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          background: 'color-mix(in srgb, var(--gold-surface) 45%, transparent)',
          border: '1px solid var(--gold-line)',
          color: 'var(--primary)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: size * 0.31,
          flex: 'none',
        }}
      >
        {initials(founder.name)}
      </span>
    );
  }

  return (
    <Portrait
      name={founder.photo}
      alt={`${founder.name}, ${founder.role} of Akshayvriddhi`}
      size={size}
      onError={() => setFailed(true)}
    />
  );
}
