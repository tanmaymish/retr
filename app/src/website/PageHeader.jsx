export default function PageHeader({ kicker, title, description }) {
  return (
    <header style={{ marginBottom: 28 }}>
      {kicker && (
        <div style={{ font: '600 10px Archivo, sans-serif', letterSpacing: '.12em', color: 'var(--color-accent)', marginBottom: 8 }}>
          {kicker}
        </div>
      )}
      <h1 style={{ margin: '0 0 8px', fontSize: 30 }}>{title}</h1>
      {description && (
        <p style={{ maxWidth: 620, opacity: 0.7, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{description}</p>
      )}
    </header>
  );
}
