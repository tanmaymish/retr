import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Icon } from '../components/ui';
import { SitePage } from './SiteChrome';
import { Crest, Reveal, SectionHead } from './Section';
import { requestCallback } from './CallbackPopup';
import { useSeo } from '../lib/seo';
import { track } from '../lib/analytics';
import { CALCULATORS, GROUPS, bySlug } from '../lib/calculatorSpecs';
import { formatMoney } from '../lib/format';

/**
 * The calculators.
 *
 * One page lists them; one page runs whichever was chosen. Every calculator is
 * described by a spec — its inputs, their ranges, and the rows it returns — so
 * the page below is the only interface code, and the arithmetic lives in
 * shared/calculators.js where the tests can reach it.
 *
 * The interface follows one pattern, every time: the answer as a single large
 * number, the working underneath it as labelled rows, and sliders to change the
 * assumptions. No forms, no submit button — the number moves as you drag.
 */

export function CalculatorsHub() {
  useSeo({
    title: 'Calculators',
    description:
      'Free calculators for Indian households: SIP, step-up SIP, lumpsum, home loan EMI and prepayment, income tax old versus new, NPS, human life value, EPF, Sukanya Samriddhi and PPF.',
    path: '/calculators',
  });

  return (
    <SitePage>
      <section style={{ padding: '72px 0 48px' }}>
        <div className="container">
          <SectionHead
            as="h1"
            eyebrow="Tools"
            title="Run the numbers yourself."
            lede="The same arithmetic we use in a review. Nothing you type is stored."
          />
        </div>
      </section>

      <section style={{ paddingBottom: 96 }}>
        <div className="container stack stack-lg">
          {GROUPS.map((group) => (
            <div key={group.key} className="stack stack-md">
              <Reveal className="rule-gold lead" role="separator">
                <span>{group.label}</span>
              </Reveal>
              <div className="grid grid-3">
                {CALCULATORS.filter((c) => c.group === group.key).map((calc, index) => (
                  <Reveal key={calc.slug} delay={(index % 3) * 70}>
                    <Card
                      as={Link}
                      to={`/calculators/${calc.slug}`}
                      className="card-link card-gold row"
                      style={{ gap: 16, alignItems: 'flex-start', height: '100%' }}
                    >
                      <span className="medallion" style={{ width: 44, height: 44 }}>
                        <Icon name={calc.icon} size={21} />
                      </span>
                      <span className="stack" style={{ gap: 4 }}>
                        <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>{calc.title}</strong>
                        <span className="small muted">{calc.blurb}</span>
                      </span>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          ))}

          <Reveal>
            <Card flat className="stack stack-sm center" style={{ alignItems: 'center', padding: 32 }}>
              <Crest />
              <h3>A number is not a plan.</h3>
              <p className="small muted" style={{ maxWidth: '58ch' }}>
                Which of these matters most in your household this year is the conversation.
              </p>
              <button type="button" className="btn" onClick={requestCallback}>Talk it through</button>
            </Card>
          </Reveal>
        </div>
      </section>
    </SitePage>
  );
}

export function CalculatorPage() {
  const { slug } = useParams();
  const calc = bySlug(slug);

  useSeo({
    title: calc ? calc.title : 'Calculator',
    description: calc ? calc.blurb : 'Financial calculators for Indian households.',
    path: `/calculators/${slug}`,
    noIndex: !calc,
  });

  if (!calc) {
    return (
      <SitePage>
        <section style={{ padding: '96px 0' }}>
          <div className="container stack stack-md center" style={{ alignItems: 'center' }}>
            <h1>No such calculator.</h1>
            <Link to="/calculators" className="btn">See all calculators</Link>
          </div>
        </section>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <CalculatorRunner key={calc.slug} calc={calc} />
    </SitePage>
  );
}

function CalculatorRunner({ calc }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(calc.inputs.map((input) => [input.key, input.value])),
  );

  const result = useMemo(() => calc.run(values), [calc, values]);

  function set(key, value) {
    setValues((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <>
      <section style={{ padding: '56px 0 12px' }}>
        <div className="container stack stack-sm">
          <Link to="/calculators" className="small row" style={{ gap: 6, color: 'var(--on-surface-variant)' }}>
            <Icon name="arrow_back" size={16} /> All calculators
          </Link>
          <h1 style={{ fontSize: 'clamp(30px, 4.4vw, 46px)' }}>{calc.title}</h1>
          <p className="muted" style={{ maxWidth: '62ch', fontSize: 17, lineHeight: 1.7 }}>{calc.intro}</p>
        </div>
      </section>

      <section style={{ padding: '24px 0 96px' }}>
        <div
          className="container grid"
          style={{ gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)', gap: 28, alignItems: 'start' }}
        >
          {/* The answer, and the working under it. */}
          <Card className="stack stack-md card-gold" style={{ padding: 32 }}>
            <div className="stack" style={{ gap: 2 }}>
              <span className="eyebrow" style={{ color: 'var(--gold-ink)' }}>{result.headline.label}</span>
              <strong
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(40px, 6vw, 60px)',
                  lineHeight: 1.05,
                  color: result.headline.tone === 'danger' ? 'var(--error)' : 'var(--primary)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {result.headline.value}
              </strong>
              {result.headline.note && <span className="small muted">{result.headline.note}</span>}
            </div>

            <hr className="divider" />

            <dl className="stack" style={{ gap: 0, margin: 0 }}>
              {result.rows.map((row) => (
                <div
                  key={row.label}
                  className="row-between"
                  style={{ padding: '11px 0', borderBottom: '1px solid var(--outline-variant)' }}
                >
                  <dt className="small muted" style={{ margin: 0 }}>{row.label}</dt>
                  <dd
                    className="small"
                    style={{ margin: 0, fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            {result.split && <Proportion split={result.split} />}

            {result.note && <p className="tiny muted" style={{ lineHeight: 1.7 }}>{result.note}</p>}

            <button type="button" className="btn btn-sheen" onClick={() => { track('calculator_cta', { calculator: calc.slug }); requestCallback(); }}>
              {calc.cta}
            </button>
          </Card>

          {/* The assumptions, as sliders. */}
          <Card className="stack stack-md" style={{ padding: 28 }}>
            <h3>Adjust the assumptions</h3>
            {calc.inputs.map((input) => (
              <Slider key={input.key} input={input} value={values[input.key]} onChange={(v) => set(input.key, v)} />
            ))}
            <p className="tiny muted" style={{ lineHeight: 1.7 }}>
              Indicative only. Not advice, and not a recommendation. Returns are assumed, not promised.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}

/**
 * Two quantities that make a whole, as a bar rather than another row of digits.
 * Both segments are labelled, so identity never rests on colour alone.
 */
function Proportion({ split }) {
  const total = split.a.value + split.b.value;
  if (!(total > 0)) return null;
  const share = (split.a.value / total) * 100;

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div
        className="propbar"
        role="img"
        aria-label={`${split.a.label} ${Math.round(share)}%, ${split.b.label} ${Math.round(100 - share)}%`}
      >
        <span className="seg-a" style={{ width: `${share}%` }} />
        <span className="seg-b" style={{ width: `${100 - share}%` }} />
      </div>
      <div className="proplegend">
        <span><i style={{ background: '#a02a42' }} />{split.a.label} · <strong>{Math.round(share)}%</strong></span>
        <span><i style={{ background: 'var(--gold)' }} />{split.b.label} · <strong>{Math.round(100 - share)}%</strong></span>
      </div>
    </div>
  );
}

function Slider({ input, value, onChange }) {
  const id = `calc-${input.key}`;
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="row-between">
        <label htmlFor={id} className="small" style={{ fontWeight: 600 }}>{input.label}</label>
        <output
          htmlFor={id}
          className="small"
          style={{ fontWeight: 700, color: 'var(--primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {input.format ? input.format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="slider"
        min={input.min}
        max={input.max}
        step={input.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="row-between tiny muted">
        <span>{input.format ? input.format(input.min) : input.min}</span>
        <span>{input.format ? input.format(input.max) : input.max}</span>
      </div>
    </div>
  );
}

export { formatMoney };
