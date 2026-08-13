import { asset } from '../lib/asset';

/**
 * A photograph, served as WebP with a JPEG fallback and a smaller file on
 * narrow screens.
 *
 * Every image carries explicit dimensions so the page does not jump while it
 * loads, and real alt text — decorative-looking photographs still describe
 * something, and someone is reading this with a screen reader.
 */
export function Photo({
  name,
  alt,
  width,
  height,
  priority = false,
  radius = 'var(--radius-xl)',
  style,
  className = '',
  sizes = '(max-width: 760px) 100vw, 700px',
}) {
  return (
    <picture>
      <source
        media="(max-width: 760px)"
        srcSet={asset(`images/${name}-sm.webp`)}
        type="image/webp"
      />
      <source srcSet={asset(`images/${name}.webp`)} type="image/webp" sizes={sizes} />
      <source media="(max-width: 760px)" srcSet={asset(`images/${name}-sm.jpg`)} type="image/jpeg" />
      <img
        src={asset(`images/${name}.jpg`)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        // The hero image is the largest contentful paint; everything else waits.
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={className}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: radius,
          display: 'block',
          background: 'var(--surface-container)',
          ...style,
        }}
      />
    </picture>
  );
}

/** The square portrait used on founder cards. Falls back to a monogram upstream. */
export function Portrait({ name, alt, size = 96, onError }) {
  return (
    <picture>
      <source srcSet={asset(`founders/${name}.webp`)} type="image/webp" />
      <img
        src={asset(`founders/${name}.jpg`)}
        alt={alt}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={onError}
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          objectFit: 'cover',
          // Favours the face on a square profile picture without cropping the head.
          objectPosition: 'center 22%',
          flex: 'none',
          background: 'var(--surface-container)',
        }}
      />
    </picture>
  );
}
