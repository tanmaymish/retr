import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Field, Icon, Input, Modal } from '../components/ui';
import { canSubmitLeads, submitLead } from '../lib/backend';
import { track } from '../lib/analytics';
import { useAuth } from '../state/AuthContext';
import { brand, founders } from './content';

/**
 * The callback prompt.
 *
 * It asks for a name, a phone number and an email address, and it posts to the
 * same `/leads` endpoint as the contact page — a lead is a lead, whichever door
 * it came through.
 *
 * Three rules keep it from becoming the kind of popup people install blockers
 * for. It waits for a sign that the visitor is actually reading; it appears at
 * most once, ever, on a device; and dismissing it is one key, one click outside,
 * or one button. Nothing on this site is gated behind it.
 *
 * A fourth rule, learned the hard way: **the button always opens something.**
 * There are thirteen "Request a call" buttons across the site, and every one of
 * them calls `requestCallback()` below. If this component ever returns null,
 * all thirteen become dead controls that swallow a click in silence — which is
 * exactly what happened when the published build had no enquiry endpoint
 * configured. Not being able to *receive* an enquiry is a reason to say so, in
 * the dialog, with a route that does work. It is not a reason to stop opening
 * the dialog.
 */

const STORAGE_KEY = 'akshayvriddhi.callback.v1';
const OPEN_EVENT = 'akshayvriddhi:callback';

/**
 * Opens the callback dialog from anywhere — a header button, a call to action
 * at the end of a page. Unlike the automatic prompt this always opens, because
 * the visitor asked for it.
 */
export function requestCallback() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

/** Seconds of reading, or share of the page scrolled, before it asks. */
const DWELL_MS = 25_000;
const SCROLL_SHARE = 0.4;

/** Pages where asking again would be noise. */
const SKIP_PATHS = ['/contact', '/privacy', '/terms'];

function alreadyAnswered() {
  try {
    return Boolean(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    // Private browsing with storage disabled: fall back to asking once per page
    // load rather than failing.
    return false;
  }
}

function remember(outcome) {
  try {
    window.localStorage.setItem(STORAGE_KEY, `${outcome}:${new Date().toISOString()}`);
  } catch {
    /* Nothing we can do, and nothing that should break the page. */
  }
}

export function CallbackPopup() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const armed = useRef(false);
  const answered = useRef(null);

  /* Whether to raise the prompt *unasked*. Interrupting someone to ask for a
     phone number there is nowhere to send is the one version of this popup that
     deserves the blocker — so when there is no inbox the site stays quiet and
     waits to be asked. Clicking a button is being asked. */
  const autoAsk = !user && !SKIP_PATHS.includes(pathname) && canSubmitLeads;

  const show = useCallback(() => {
    if (armed.current) return;
    armed.current = true;
    setOpen(true);
    track('callback_prompt_shown', { path: window.location.pathname });
  }, []);

  // Asked for explicitly: always opens, whatever happened before.
  useEffect(() => {
    const onRequest = () => {
      setOpen(true);
      track('callback_prompt_shown', { path: window.location.pathname, trigger: 'asked' });
    };
    window.addEventListener(OPEN_EVENT, onRequest);
    return () => window.removeEventListener(OPEN_EVENT, onRequest);
  }, []);

  useEffect(() => {
    if (!autoAsk || alreadyAnswered()) return undefined;

    const timer = setTimeout(show, DWELL_MS);

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= SCROLL_SHARE) show();
    };

    // Leaving towards the browser chrome usually means leaving the site. Only
    // meaningful with a mouse, so it is left off touch screens.
    const onMouseOut = (event) => {
      if (!event.relatedTarget && event.clientY <= 0) show();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseout', onMouseOut);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [show, autoAsk]);

  // Closing after a successful enquiry is not a dismissal, and must not be
  // recorded or reported as one.
  function close() {
    setOpen(false);
    if (answered.current === 'submitted') return;
    remember('dismissed');
    track('callback_prompt_dismissed');
  }

  return (
    <Modal
      open={open}
      onClose={close}
      /* Asking "shall we call you?" and then admitting we cannot take the
         number is a bad sequence. When there is no inbox the dialog says what
         it actually is from the title down. */
      title={canSubmitLeads ? 'Shall we call you?' : 'Speak to the founders'}
      width={520}
    >
      {canSubmitLeads ? (
        <CallbackForm
          onDone={() => {
            answered.current = 'submitted';
            remember('submitted');
          }}
          onDismiss={close}
        />
      ) : (
        <DirectRoutes onDismiss={close} />
      )}
    </Modal>
  );
}

/**
 * What the dialog shows when the site has no inbox behind it.
 *
 * The founders' LinkedIn profiles are the only contact route this site can
 * honestly offer today — they are real, they are already published on the About
 * page, and a message sent there reaches a person. A phone number and an email
 * address belong here too, and will as soon as the founders supply them; until
 * then this does not invent either.
 */
export function DirectRoutes({ onDismiss }) {
  return (
    <div className="stack stack-sm">
      <p className="small muted">
        The enquiry form on this site is not connected to an inbox yet, so anything typed into one
        would not reach anybody. Rather than take your details and lose them, here is the way
        through that does work.
      </p>

      <div className="stack" style={{ gap: 8 }}>
        {founders.map((founder) => (
          <a
            key={founder.id}
            className="btn btn-secondary btn-block"
            href={founder.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => track('direct_contact', { via: 'linkedin', founder: founder.id })}
          >
            <Icon name="open_in_new" size={17} />
            Message {founder.name}
          </a>
        ))}
      </div>

      <p className="tiny muted">
        Both founders read their own messages. {brand.name} will never ask you for a payment, a
        one-time password or your policy credentials over any channel.
      </p>

      <Button type="button" variant="ghost" onClick={onDismiss} className="btn-block">
        Close
      </Button>
    </div>
  );
}

function CallbackForm({ onDone, onDismiss }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', consent: false, website: '' });
  const [state, setState] = useState('idle'); // idle → submitting → done | error
  const [error, setError] = useState(null);
  const [reference, setReference] = useState(null);

  const fieldErrors = error?.fields ?? {};
  const ready = form.name.trim() && form.phone.trim() && form.email.trim() && form.consent;

  async function submit(event) {
    event.preventDefault();
    if (!ready) return;
    setState('submitting');
    setError(null);
    try {
      const result = await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone,
        source: 'call_request',
        website: form.website,
      });
      setReference(result.reference);
      setState('done');
      onDone();
      track('lead_submitted', { source: 'call_request' });
    } catch (err) {
      setError(err);
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div className="stack stack-sm">
        <div className="row" style={{ gap: 10 }}>
          <Icon name="check_circle" size={22} style={{ color: 'var(--sage)' }} />
          <strong>Thank you — that has reached us.</strong>
        </div>
        <p className="small">
          Your reference is <strong>{reference}</strong>. Someone from {brand.name} will call you on
          the number you gave.
        </p>
        <Button onClick={onDismiss} className="btn-block">Back to the site</Button>
      </div>
    );
  }

  return (
    <form className="stack stack-sm" onSubmit={submit} noValidate>
      <p className="small muted">
        Leave your details and one of the founders will call you — no obligation, and nothing on
        this site is behind this form.
      </p>

      {error && !Object.keys(fieldErrors).length && <p className="field-error">{error.message}</p>}

      <Field label="Your name" id="cb-name" error={fieldErrors.name}>
        <Input
          id="cb-name"
          autoComplete="name"
          required
          value={form.name}
          error={fieldErrors.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
      </Field>

      <Field label="Phone number" id="cb-phone" error={fieldErrors.phone}>
        <Input
          id="cb-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          value={form.phone}
          error={fieldErrors.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </Field>

      <Field label="Email" id="cb-email" error={fieldErrors.email}>
        <Input
          id="cb-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          error={fieldErrors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </Field>

      <label className="check small">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
        />
        <span>
          You may contact me about this enquiry. I understand these details are used for that and
          nothing else.
        </span>
      </label>

      {/* Honeypot. Hidden from people, irresistible to bots, rejected server-side. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="cb-website">Website</label>
        <input
          id="cb-website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      <div className="row" style={{ gap: 10, marginTop: 4 }}>
        <Button type="submit" loading={state === 'submitting'} disabled={!ready} icon="call" className="grow">
          Request a call
        </Button>
        <Button type="button" variant="ghost" onClick={onDismiss}>Not now</Button>
      </div>
    </form>
  );
}
