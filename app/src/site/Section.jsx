import { useEffect, useRef, useState } from 'react';

/**
 * The marketing page's two shared pieces: how a section announces itself, and
 * how anything on it arrives.
 */

/**
 * Reveals its children as they enter the viewport.
 *
 * One observer per element, disconnected on the first intersection — this runs
 * on a page with sixty of them, and a listener that keeps firing after it has
 * done its job is a scroll janking waiting to happen. Anything already on
 * screen at mount is shown immediately rather than fading in under the reader.
 */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, style, ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return undefined;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`reveal${shown ? ' is-in' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** The gold rule with the lockup's diamond, centred. */
export function Crest({ className = '' }) {
  return (
    <Reveal as="span" className={`crest ${className}`.trim()} aria-hidden="true">
      <span>✦</span>
    </Reveal>
  );
}

/**
 * A section's opening: crest, eyebrow, heading, standfirst — always centred,
 * always to the same measure.
 */
export function SectionHead({ eyebrow, title, lede, onBand = false, children }) {
  return (
    <div className={`section-head${onBand ? ' on-band' : ''}`}>
      <Crest />
      {eyebrow && (
        <Reveal as="span" className="eyebrow" delay={60}>
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" delay={120} style={{ color: onBand ? 'var(--on-band)' : undefined }}>
        {title}
      </Reveal>
      {lede && (
        <Reveal as="p" className="lede" delay={180}>
          {lede}
        </Reveal>
      )}
      {children}
    </div>
  );
}
