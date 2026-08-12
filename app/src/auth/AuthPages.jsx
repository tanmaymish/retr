import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Field, Icon, Input } from '../components/ui';
import { Mark } from '../site/Landing';
import { useAuth } from '../state/AuthContext';

function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', background: 'var(--surface)' }}>
      <div className="container" style={{ display: 'grid', placeItems: 'center', padding: '48px 20px' }}>
        <div style={{ width: 'min(440px, 100%)' }} className="stack stack-md enter">
          <Link to="/" className="row" style={{ gap: 10, color: 'var(--on-surface)', justifyContent: 'center' }}>
            <Mark />
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Heritage Ledger</strong>
          </Link>

          <Card className="stack stack-md">
            <div className="stack" style={{ gap: 6 }}>
              <h2 style={{ fontSize: 26 }}>{title}</h2>
              {subtitle && <p className="small muted">{subtitle}</p>}
            </div>
            {children}
          </Card>

          {footer && <div className="center small muted">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

/** Surfaces the server's message rather than inventing a client-side one. */
function ErrorNote({ error }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="row small"
      style={{
        background: 'var(--error-container)',
        color: 'var(--on-error-container)',
        padding: '12px 14px',
        borderRadius: 'var(--radius-lg)',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <Icon name="error" size={18} style={{ flex: 'none', marginTop: 1 }} />
      <span>{error.message}</span>
    </div>
  );
}

export function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const next = new URLSearchParams(location.search).get('next') || '/vault';

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await signIn(form);
      navigate(result.mfaRequired ? `/verify?next=${encodeURIComponent(next)}` : next, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Your vault is where you left it."
      footer={<>New here? <Link to="/create-vault">Create your vault</Link></>}
    >
      <form className="stack stack-md" onSubmit={onSubmit} noValidate>
        <ErrorNote error={error} />
        <Field label="Email address" id="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password" id="password">
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Button type="submit" loading={busy} className="btn-block">Sign in</Button>
      </form>
    </AuthShell>
  );
}

export function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: params.get('email') ?? '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const next = params.get('next') || '/onboarding';
  const fieldErrors = error?.fields ?? {};

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await register(form);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your vault."
      subtitle="One place for the documents your family may need."
      footer={<>Already have one? <Link to="/sign-in">Sign in</Link></>}
    >
      <form className="stack stack-md" onSubmit={onSubmit} noValidate>
        {!Object.keys(fieldErrors).length && <ErrorNote error={error} />}
        <Field label="Your name" id="name" error={fieldErrors.name}>
          <Input
            id="name"
            autoComplete="name"
            required
            value={form.name}
            error={fieldErrors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Email address" id="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            error={fieldErrors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field
          label="Password"
          id="password"
          error={fieldErrors.password}
          hint="At least 12 characters. A short sentence you will remember beats a short password you will not."
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            error={fieldErrors.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Button type="submit" loading={busy} className="btn-block">Create vault</Button>
      </form>
    </AuthShell>
  );
}

/** The second-factor step. The session can do nothing else until this passes. */
export function MfaChallenge() {
  const { verifyMfa } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyMfa(code);
      navigate(params.get('next') || '/vault', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="One more step."
      subtitle="Enter the six-digit code from your authenticator app, or one of your recovery codes."
    >
      <form className="stack stack-md" onSubmit={onSubmit} noValidate>
        <ErrorNote error={error} />
        <Field label="Authentication code" id="code">
          <Input
            id="code"
            inputMode="text"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ letterSpacing: '0.3em', fontSize: 20, textAlign: 'center' }}
          />
        </Field>
        <Button type="submit" loading={busy} className="btn-block">Verify</Button>
      </form>
    </AuthShell>
  );
}
