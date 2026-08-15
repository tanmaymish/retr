/**
 * The one chart the site needs.
 *
 * A column per year, height proportional to the amount, and one column marked
 * because it is the year that answers the question — the age a corpus runs out,
 * or the year a fee falls due. Everything else on the page is a number in a row;
 * this is the only thing that shows a shape.
 *
 * Colours are fixed here rather than taken from the brand tokens. The brand
 * maroon (#661426) sits below the light-mode lightness band and fails
 * colourblind separation against the cream surface; #a8762f and #a02a42 clear
 * all six of the measurable data-viz checks against #fbf6ec — lightness band,
 * chroma floor, protan/deutan/tritan separation, normal-vision separation and
 * WCAG contrast. Changing them means re-running that validation.
 */

const BAR = '#a8762f';
const MARK = '#a02a42';

export function Columns({ points, markAt, aria, foot, height = 190 }) {
  const max = Math.max(...points.map((point) => point.y), 1);

  return (
    <figure className="chart" style={{ margin: 0 }}>
      <div className="chart-plot" style={{ height }} role="img" aria-label={aria}>
        {points.map((point) => {
          const marked = markAt !== null && markAt !== undefined && point.x === markAt;
          const share = Math.max(0, point.y / max);
          return (
            <span
              key={point.x}
              className={`chart-bar${marked ? ' is-marked' : ''}${point.y <= 0 ? ' is-empty' : ''}`}
              style={{
                height: `${share * 100}%`,
                background: marked || point.y <= 0 ? MARK : BAR,
              }}
            >
              <span className="chart-tip">{point.label}</span>
            </span>
          );
        })}
      </div>

      {foot && (
        <figcaption className="chart-foot">
          {foot.map((entry) => (
            <span key={entry}>{entry}</span>
          ))}
        </figcaption>
      )}
    </figure>
  );
}

/** The legend that keeps the marked column from resting on colour alone. */
export function ChartKey({ bar, mark }) {
  return (
    <div className="proplegend">
      <span><i style={{ background: BAR }} />{bar}</span>
      {mark && <span><i style={{ background: MARK }} />{mark}</span>}
    </div>
  );
}
