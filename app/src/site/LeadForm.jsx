import { useState } from 'react';
import { Button, Card, Field, Icon, Input } from '../components/ui';
import { api } from '../lib/api';
import { track } from '../lib/analytics';

export const INTERESTS = [
  { value: 'protection_review', label: 'A protection review' },
  { value: 'goal_planning', label: 'Planning for a goal' },
  { value: 'legacy_structuring', label: 'Legacy and succession' },
  { value: 'the_vault', label: 'The family vault' },
  { value: 'something_else', label: 'Something else' },
];

export const HOUSEHOLDS = [
  { value: 'me', label: 'Just me' },
  { value: 'me_partner', label: 'Me and my partner' },
  { value: 'family', label: 'My family' },
  { value: 'parents', label: 'My parents' },
  { value: 'other', label: 'Something else' },
];

export const TIMEFRAMES = [
  { value: 'now', label: 'Now — something has changed' },
  { value: 'this_quarter', label: 'In the next few months' },
  { value: 'this_year', label: 'Sometime this year' },
  { value: 'exploring', label: 'Just exploring' },
];

/**
 * The compact enquiry form used inside the check result and anywhere a full
 * intake would be too much. The multi-step version lives in Contact.jsx and
 * posts to the same endpoint.
 */
export function LeadForm({ source = 'contact', checkScore = null, compact = false }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [state, setState] = useState('idle'); // idle → submitting → done | error
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

  const fieldErrors = error?.fields ?? {};

  async function submit(event) {
    event.preventDefault();
    setState('submitting');
    setError(null);
    try {
      const result = await api.post('/leads', {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message || null,
        source,
        checkScore,
        website: form.website,
      });
      setReference(result.reference);
      setState('done');
      track('lead_submitted', { source });
    } catch (err) {
      setError(err);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <Card flat className="stack stack-sm" style={{ background: 'var(--sage-surface)' }}>
        <div className="row" style={{ gap: 10 }}>
          <Icon name="check_circle" size={22} style={{ color: 'var(--sage)' }} />
          <strong>Thank you — that has reached us.</strong>
        </div>
        <p className="small">
          Your reference is <strong>{reference}</strong>. Someone from the team will be in touch
          using the details you gave.
        </p>
      </Card>
    );
  }

  return (
    <form className="stack stack-sm" onSubmit={submit} noValidate>
      {error && !Object.keys(fieldErrors).length && <p className="field-error">{error.message}</p>}

      <div className={compact ? 'grid grid-2' : 'stack stack-sm'} style={compact ? { gap: 12 } : undefined}>
        <Field label="Your name" id={`${source}-name`} error={fieldErrors.name}>
          <Input
            id={`${source}-name`}
            autoComplete="name"
            required
            value={form.name}
            error={fieldErrors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email" id={`${source}-email`} error={fieldErrors.email}>
          <Input
            id={`${source}-email`}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            error={fieldErrors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Phone" id={`${source}-phone`} hint="Optional." error={fieldErrors.phone}>
        <Input
          id={`${source}-phone`}
          type="tel"
          autoComplete="tel"
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>

      {!compact && (
        <Field label="Anything you want us to know" id={`${source}-message`}>
          <textarea
            id={`${source}-message`}
            className="input"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </Field>
      )}

      {/* Honeypot. Hidden from people, irresistible to bots, rejected server-side. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor={`${source}-website`}>Website</label>
        <input
          id={`${source}-website`}
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      <Button
        type="submit"
        loading={state === 'submitting'}
        disabled={!form.name || !form.email}
        icon="send"
        className={compact ? undefined : 'btn-block'}
      >
        Start the conversation
      </Button>

      <p className="tiny muted">
        We use these details to contact you about your enquiry and nothing else.
      </p>
    </form>
  );
}
