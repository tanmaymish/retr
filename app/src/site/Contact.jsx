import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, Icon, Input, Meter, Select } from '../components/ui';
import { SitePage } from './SiteChrome';
import { submitLead } from '../lib/backend';
import { useSeo } from '../lib/seo';
import { track } from '../lib/analytics';
import { HOUSEHOLDS, INTERESTS, TIMEFRAMES } from './LeadForm';

const STEPS = [
  { key: 'you', title: 'Tell us about yourself', blurb: 'So we know who we are speaking to.' },
  { key: 'household', title: 'Who are you planning for?', blurb: 'The shape of the household changes the conversation.' },
  { key: 'needs', title: 'What would you like to talk about?', blurb: 'Pick as many as apply. Nothing is binding.' },
  { key: 'timing', title: 'When would you like to start?', blurb: 'An honest answer helps us prioritise, including “just exploring”.' },
  { key: 'review', title: 'Anything else we should know?', blurb: 'Then we will be in touch.' },
];

/**
 * Five short steps instead of one long form. Each step validates what it can
 * locally; the server validates everything again before storing anything.
 */
export default function Contact() {
  useSeo({
    title: 'Start a conversation',
    description:
      'Tell us about your household and what you would like to protect. We listen before we advise.',
    path: '/contact',
  });

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    household: '',
    interests: [],
    timeframe: '',
    message: '',
    website: '',
  });
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

  const fieldErrors = error?.fields ?? {};
  const current = STEPS[step];

  const canAdvance =
    step === 0
      ? form.name.trim().length > 1 && /.+@.+\..+/.test(form.email)
      : step === 1
        ? Boolean(form.household)
        : step === 2
          ? form.interests.length > 0
          : step === 3
            ? Boolean(form.timeframe)
            : true;

  async function submit() {
    setState('submitting');
    setError(null);
    try {
      const result = await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        household: form.household || null,
        interests: form.interests,
        timeframe: form.timeframe || null,
        message: form.message || null,
        source: 'contact',
        website: form.website,
      });
      setReference(result.reference);
      setState('done');
      track('contact_submitted', { interests: form.interests.length, timeframe: form.timeframe });
    } catch (err) {
      setError(err);
      setState('error');
      // Send them back to the step that owns the offending field.
      if (err.fields?.name || err.fields?.email || err.fields?.phone) setStep(0);
    }
  }

  if (state === 'done') {
    return (
      <SitePage>
        <section style={{ padding: '96px 0' }}>
          <div className="container" style={{ maxWidth: 620 }}>
            <Card className="stack stack-md center" style={{ alignItems: 'center' }}>
              <span
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--sage-surface)',
                  color: 'var(--sage)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name="check_circle" size={34} fill />
              </span>
              <h1 style={{ fontSize: 30 }}>Thank you, {form.name.split(' ')[0]}.</h1>
              <p className="muted" style={{ lineHeight: 1.7 }}>
                Your enquiry has reached us. Reference <strong>{reference}</strong>. Someone from the
                team will be in touch using the details you gave.
              </p>
              <div className="row wrap" style={{ gap: 10, justifyContent: 'center' }}>
                <Link to="/preparedness-check" className="btn btn-secondary">Take the preparedness check</Link>
                <Link to="/" className="btn">Back to home</Link>
              </div>
            </Card>
          </div>
        </section>
      </SitePage>
    );
  }

  return (
    <SitePage>
      <section style={{ padding: '72px 0 96px' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="stack stack-lg">
            <header className="stack stack-sm">
              <span className="caps" style={{ color: 'var(--primary)' }}>Start a conversation</span>
              <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>We listen before we advise.</h1>
              <p className="muted" style={{ maxWidth: 560, lineHeight: 1.7 }}>
                Five short questions. No obligation, and no product will be recommended before we
                understand your situation.
              </p>
            </header>

            <div className="stack stack-sm">
              <div className="row-between">
                <span className="tiny caps muted">Step {step + 1} of {STEPS.length}</span>
                {step > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={() => setStep(step - 1)}>
                    <Icon name="arrow_back" size={16} /> Back
                  </button>
                )}
              </div>
              <Meter value={((step + 1) / STEPS.length) * 100} label="Progress" height={6} />
            </div>

            <Card className="stack stack-md enter" key={current.key}>
              <div className="stack" style={{ gap: 6 }}>
                <h2 style={{ fontSize: 24 }}>{current.title}</h2>
                <p className="small muted">{current.blurb}</p>
              </div>

              {error && !Object.keys(fieldErrors).length && (
                <p className="field-error">{error.message}</p>
              )}

              {step === 0 && (
                <div className="stack stack-sm">
                  <Field label="Your name" id="c-name" error={fieldErrors.name}>
                    <Input
                      id="c-name"
                      autoComplete="name"
                      autoFocus
                      value={form.name}
                      error={fieldErrors.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </Field>
                  <Field label="Email" id="c-email" error={fieldErrors.email}>
                    <Input
                      id="c-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      error={fieldErrors.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </Field>
                  <Field label="Phone" id="c-phone" hint="Optional — but it is usually the fastest way." error={fieldErrors.phone}>
                    <Input
                      id="c-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      error={fieldErrors.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </Field>
                </div>
              )}

              {step === 1 && (
                <div className="stack stack-sm">
                  {HOUSEHOLDS.map((option) => (
                    <Choice
                      key={option.value}
                      label={option.label}
                      selected={form.household === option.value}
                      onClick={() => setForm({ ...form, household: option.value })}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="stack stack-sm">
                  {INTERESTS.map((option) => (
                    <Choice
                      key={option.value}
                      label={option.label}
                      multi
                      selected={form.interests.includes(option.value)}
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          interests: f.interests.includes(option.value)
                            ? f.interests.filter((v) => v !== option.value)
                            : [...f.interests, option.value],
                        }))
                      }
                    />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="stack stack-sm">
                  {TIMEFRAMES.map((option) => (
                    <Choice
                      key={option.value}
                      label={option.label}
                      selected={form.timeframe === option.value}
                      onClick={() => setForm({ ...form, timeframe: option.value })}
                    />
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="stack stack-md">
                  <Field label="Anything you want us to know" id="c-message" hint="Optional.">
                    <textarea
                      id="c-message"
                      className="input"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </Field>

                  <div className="stack stack-sm" style={{ padding: 16, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
                    <span className="tiny caps muted">What you are sending</span>
                    <Summary label="Name" value={form.name} />
                    <Summary label="Email" value={form.email} />
                    {form.phone && <Summary label="Phone" value={form.phone} />}
                    <Summary label="Planning for" value={labelOf(HOUSEHOLDS, form.household)} />
                    <Summary
                      label="Interested in"
                      value={form.interests.map((v) => labelOf(INTERESTS, v)).join(', ')}
                    />
                    <Summary label="Timing" value={labelOf(TIMEFRAMES, form.timeframe)} />
                  </div>
                </div>
              )}

              {/* Honeypot — hidden from people, rejected server-side if filled. */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
                <label htmlFor="c-website">Website</label>
                <input
                  id="c-website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                />
              </div>

              <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => setStep(step + 1)} disabled={!canAdvance} iconAfter="arrow_forward">
                    Continue
                  </Button>
                ) : (
                  <Button onClick={submit} loading={state === 'submitting'} icon="send">
                    Send enquiry
                  </Button>
                )}
              </div>
            </Card>

            <p className="tiny muted" style={{ lineHeight: 1.7 }}>
              We use what you send here to respond to your enquiry and for nothing else. See our{' '}
              <Link to="/privacy">privacy notice</Link>.
            </p>
          </div>
        </div>
      </section>
    </SitePage>
  );
}

function Choice({ label, selected, onClick, multi = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '16px 20px',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`,
        background: selected ? 'var(--primary-fixed)' : 'var(--surface-lowest)',
        cursor: 'pointer',
        textAlign: 'left',
        fontSize: 16,
      }}
    >
      {label}
      {selected && <Icon name={multi ? 'check_box' : 'check_circle'} size={20} style={{ color: 'var(--primary)' }} />}
    </button>
  );
}

function Summary({ label, value }) {
  return (
    <div className="row-between">
      <span className="tiny muted">{label}</span>
      <span className="small" style={{ fontWeight: 600, textAlign: 'right' }}>{value || '—'}</span>
    </div>
  );
}

function labelOf(list, value) {
  return list.find((item) => item.value === value)?.label ?? '';
}

export { Select };
