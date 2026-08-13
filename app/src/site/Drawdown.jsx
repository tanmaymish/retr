import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { Reveal } from './Section';
import { Columns, ChartKey } from './Chart';
import { requestCallback } from './CallbackPopup';
import { track } from '../lib/analytics';
import { drawdown } from '../../../shared/calculators.js';
import { formatMoney } from '../lib/format';

/**
 * The landing page's one interactive moment.
 *
 * A retiree's real question — does the money last? — answered in two sliders
 * and a falling chart, before any copy has asked them to believe anything. It
 * is the same engine the full calculator uses, cut down to the two inputs that
 * move the answer most.
 */

const money = (value) => formatMoney(value, { compact: true });

export function LiveDrawdown() {
  const [corpus, setCorpus] = useState(15000000);
  const [spend, setSpend] = useState(60000);

  const result = useMemo(
    () => drawdown({ corpus, monthlySpend: spend, returnPct: 7, inflationPct: 6, currentAge: 60, until: 95 }),
    [corpus, spend],
  );

  const survives = result.ranOutAt === null;
  const points = useMemo(
    () =>
      [{ x: 60, y: corpus, label: `Age 60: ${money(corpus)}` }].concat(
        result.series.map((point) => ({ x: point.age, y: point.balance, label: `Age ${point.age}: ${money(point.balance)}` })),
      ),
    [corpus, result],
  );

  return (
    <section style={{ padding: '84px 0' }}>
      <div className="container">
        <Reveal>
          <Card className="card-gold" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="drawdown-split">
              <div className="stack stack-md" style={{ padding: 34 }}>
                <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>Retiring soon</span>
                <h2 style={{ fontSize: 'clamp(28px, 3.6vw, 42px)' }}>Will it last?</h2>
                <p className="muted" style={{ maxWidth: '38ch', lineHeight: 1.7 }}>
                  Retire at 60. Spend a little more each year, because everything costs a little
                  more each year. Drag, and watch.
                </p>

                <MiniSlider
                  label="Corpus at 60"
                  value={corpus}
                  min={2000000}
                  max={60000000}
                  step={500000}
                  onChange={setCorpus}
                />
                <MiniSlider
                  label="Spending a month"
                  value={spend}
                  min={20000}
                  max={250000}
                  step={5000}
                  onChange={setSpend}
                />

                <div className="row wrap" style={{ gap: 12, marginTop: 4 }}>
                  <Link
                    to="/calculators/retirement-drawdown"
                    className="btn btn-secondary btn-sm"
                    onClick={() => track('drawdown_open')}
                  >
                    All five assumptions <Icon name="arrow_forward" size={16} />
                  </Link>
                  <button type="button" className="btn btn-sm btn-sheen" onClick={requestCallback}>
                    Talk to a founder
                  </button>
                </div>
              </div>

              <div className="stack stack-sm drawdown-figure" style={{ padding: 34 }}>
                <span className="tiny caps muted">
                  {survives ? 'On these numbers' : 'On these numbers, the money runs out at'}
                </span>
                <strong
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(46px, 7vw, 76px)',
                    lineHeight: 1,
                    color: survives ? 'var(--primary)' : '#a02a42',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {survives ? 'It lasts' : `Age ${result.ranOutAt}`}
                </strong>
                <p className="small muted">
                  {survives
                    ? `Still ${money(result.endingBalance)} left at 95.`
                    : `${result.lastsYears} years funded. Then ${95 - result.ranOutAt} years that are not.`}
                </p>

                <Columns
                  points={points}
                  markAt={result.ranOutAt}
                  height={168}
                  aria={
                    survives
                      ? 'Corpus from age 60 to 95, never exhausted.'
                      : `Corpus falling from ${money(corpus)} at 60 to nothing at ${result.ranOutAt}.`
                  }
                  foot={['Age 60', 'Age 95']}
                />
                <ChartKey bar="Corpus remaining" mark={survives ? null : `Unfunded, from ${result.ranOutAt}`} />
                <p className="tiny muted" style={{ lineHeight: 1.7 }}>
                  Assumes 7% on the corpus and 6% inflation on spending. Indicative, not advice.
                </p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function MiniSlider({ label, value, min, max, step, onChange }) {
  const id = `dd-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row-between">
        <label htmlFor={id} className="small" style={{ fontWeight: 600 }}>{label}</label>
        <output
          htmlFor={id}
          className="small"
          style={{ fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {money(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
