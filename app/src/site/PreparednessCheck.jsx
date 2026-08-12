import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, Icon, Meter, Spinner } from '../components/ui';
import { SitePage } from './SiteChrome';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { useSeo } from '../lib/seo';
import { track } from '../lib/analytics';
import { LeadForm } from './LeadForm';

/**
 * Six questions, scored on the server, stored nowhere.
 *
 * This is the interactive proof the site rests on: it demonstrates the thinking
 * before asking anyone for their details, and it is honest about being an
 * indicative self-assessment rather than advice.
 */
export default function PreparednessCheck() {
  useSeo({
    title: 'Preparedness Check',
    description:
      'Six questions about cover, reserves and whether your family could find what they need. An indicative self-assessment — no signup, nothing stored.',
    path: '/preparedness-check',
  });

  const { data, loading, error } = useApi('/preparedness/questions');
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [scoring, setScoring] = useState(false);
  const [failure, setFailure] = useState(null);

  const questions = data?.questions ?? [];
  const current = questions[step];
  const progress = questions.length ? (step / questions.length) * 100 : 0;

  async function choose(value) {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);

    if (step < questions.length - 1) {
      setStep(step + 1);
      return;
    }

    setScoring(true);
    setFailure(null);
    try {
      const scored = await api.post('/preparedness/score', next);
      setResult(scored);
      track('preparedness_completed', { score: scored.score, band: scored.band });
    } catch (err) {
      setFailure(err);
    } finally {
      setScoring(false);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setResult(null);
    setFailure(null);
  }

  return (
    <SitePage>
      <section style={{ padding: '72px 0 96px' }}>
        <div className="container" style={{ maxWidth: 860 }}>
          {loading ? (
            <Spinner label="Loading the check" />
          ) : error ? (
            <EmptyState icon="cloud_off" title="The check is unavailable right now">
              {error.message}
            </EmptyState>
          ) : result ? (
            <Result result={result} onRestart={restart} />
          ) : scoring ? (
            <Spinner label="Working out where you stand" />
          ) : (
            <div className="stack stack-lg">
              <header className="stack stack-sm">
                <span className="caps" style={{ color: 'var(--primary)' }}>Preparedness check</span>
                <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
                  Where would your family stand tomorrow?
                </h1>
                <p className="muted" style={{ maxWidth: 620, lineHeight: 1.7 }}>
                  Six questions. No signup, no amounts, nothing stored — the answers are scored on
                  our server and thrown away.
                </p>
              </header>

              <div className="stack stack-sm">
                <div className="row-between">
                  <span className="tiny caps muted">Question {step + 1} of {questions.length}</span>
                  {step > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>
                      <Icon name="arrow_back" size={16} /> Back
                    </button>
                  )}
                </div>
                <Meter value={progress} label="Progress through the check" height={6} />
              </div>

              {failure && <p className="field-error">{failure.message}</p>}

              <div key={current.key} className="stack stack-md enter">
                <div className="stack" style={{ gap: 6 }}>
                  <h2 style={{ fontSize: 26 }}>{current.question}</h2>
                  {current.help && <p className="muted small">{current.help}</p>}
                </div>

                <div className="stack stack-sm" role="group" aria-label={current.question}>
                  {current.options.map((option) => {
                    const selected = answers[current.key] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => choose(option.value)}
                        aria-pressed={selected}
                        className="card"
                        style={{
                          textAlign: 'left',
                          cursor: 'pointer',
                          padding: '18px 22px',
                          border: `2px solid ${selected ? 'var(--primary)' : 'transparent'}`,
                          background: selected ? 'var(--primary-fixed)' : 'var(--surface-lowest)',
                        }}
                      >
                        <span className="row-between">
                          <span style={{ fontSize: 16 }}>{option.label}</span>
                          <Icon name="arrow_forward" size={18} style={{ color: 'var(--primary)' }} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="tiny muted">{data.disclaimer}</p>
            </div>
          )}
        </div>
      </section>
    </SitePage>
  );
}

function Result({ result, onRestart }) {
  const tone =
    result.score >= 85 ? 'sage' : result.score >= 65 ? 'primary' : result.score >= 40 ? 'amber' : 'error';

  return (
    <div className="stack stack-lg enter">
      <header className="stack stack-sm">
        <span className="caps" style={{ color: 'var(--primary)' }}>Your result</span>
        <h1 style={{ fontSize: 'clamp(26px, 3.6vw, 38px)' }}>{result.headline}</h1>
      </header>

      <Card className="stack stack-md">
        <div className="row-between wrap" style={{ gap: 16 }}>
          <div className="row" style={{ gap: 16, alignItems: 'baseline' }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 56, lineHeight: 1 }}>
              {result.score}
            </strong>
            <span className="muted">out of 100</span>
          </div>
          <Badge tone={tone === 'sage' ? 'verified' : tone === 'error' ? 'danger' : 'primary'}>
            {result.band.replace(/_/g, ' ')}
          </Badge>
        </div>
        <Meter value={result.score} tone={tone} label="Preparedness score" height={10} />
      </Card>

      {result.findings.length > 0 && (
        <section className="stack stack-sm">
          <h3>What stands out</h3>
          {result.findings.map((finding, index) => (
            <Card key={finding.key} className="row" style={{ gap: 16, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--radius-full)',
                  background: index === 0 ? 'var(--error-container)' : 'var(--surface-container)',
                  color: index === 0 ? 'var(--on-error-container)' : 'var(--on-surface-variant)',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 14,
                  flex: 'none',
                }}
              >
                {index + 1}
              </span>
              <div className="stack" style={{ gap: 4 }}>
                <strong>{finding.title}</strong>
                <p className="small muted" style={{ lineHeight: 1.7 }}>{finding.body}</p>
              </div>
            </Card>
          ))}
        </section>
      )}

      {result.strengths.length > 0 && (
        <Card flat className="stack stack-sm">
          <h4>Already in place</h4>
          {result.strengths.map((strength) => (
            <div key={strength} className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <Icon name="check_circle" size={16} style={{ color: 'var(--sage)', marginTop: 3, flex: 'none' }} />
              <span className="small">{strength}</span>
            </div>
          ))}
        </Card>
      )}

      <Card className="stack stack-md" style={{ background: 'var(--primary-fixed)' }}>
        <div className="stack" style={{ gap: 6 }}>
          <h3>Talk it through with us</h3>
          <p className="small" style={{ lineHeight: 1.7 }}>
            A score is a starting point, not a plan. Tell us where to reach you and we will go
            through what this means for your household — beginning with listening, as we always do.
          </p>
        </div>
        <LeadForm source="preparedness_check" checkScore={result.score} compact />
      </Card>

      <div className="row-between wrap" style={{ gap: 12 }}>
        <Button variant="ghost" icon="restart_alt" onClick={onRestart}>Take it again</Button>
        <Link to="/about" className="btn btn-secondary">Read why we built this</Link>
      </div>

      <p className="tiny muted" style={{ lineHeight: 1.7 }}>{result.disclaimer}</p>
    </div>
  );
}
