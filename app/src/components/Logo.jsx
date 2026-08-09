// Logo 8 from the brand exploration: a five-petal lotus outline in warm
// gold, a small navy dot above it, and the "Akshay Vridhi" wordmark.
const GOLD = '#c9a668';
const NAVY = '#1c2b45';

export function LotusMark({ size = 40 }) {
  return (
    <svg width={size} height={size * (100 / 120)} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="6" r="3.4" fill={NAVY} />
      <g stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M60,95 Q44,55 60,16 Q76,55 60,95" />
        <path d="M60,95 Q24,68 28,30 Q52,58 60,95" />
        <path d="M60,95 Q96,68 92,30 Q68,58 60,95" />
        <path d="M60,95 Q10,83 12,52 Q40,74 60,95" />
        <path d="M60,95 Q110,83 108,52 Q80,74 60,95" />
      </g>
    </svg>
  );
}

export default function Logo({ size = 40, tagline = true, align = 'center' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start' }}>
      <LotusMark size={size} />
      <div
        style={{
          fontFamily: 'Georgia, "Iowan Old Style", "Times New Roman", serif',
          fontWeight: 500,
          fontSize: size * 0.5,
          lineHeight: 1.05,
          color: NAVY,
          marginTop: size * 0.12,
          textAlign: align,
        }}
      >
        Akshay Vridhi
      </div>
      {tagline && (
        <div
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontWeight: 600,
            fontSize: Math.max(9, size * 0.185),
            letterSpacing: '.16em',
            color: NAVY,
            opacity: 0.6,
            marginTop: size * 0.14,
            textAlign: align,
          }}
        >
          PLAN · GROW · SECURE
        </div>
      )}
    </div>
  );
}
