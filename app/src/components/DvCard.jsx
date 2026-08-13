// Plain bordered card used for the wide comparison tables (4b, 4c, 6c, 6e)
// and the hand-drawn phone mockups in turn 1, matching the export's .dv-card.
export default function DvCard({ width, children }) {
  return (
    <div
      style={{
        width: width || undefined,
        maxWidth: '100%',
        background: '#fff',
        border: '2px solid #201e1d',
        overflow: 'hidden',
        fontFamily: 'Archivo, sans-serif',
        color: '#201e1d',
        flex: 'none',
      }}
    >
      {children}
    </div>
  );
}
