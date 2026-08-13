import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Field,
  Icon,
  Input,
  Modal,
  Select,
  Spinner,
  useToast,
} from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { useAuth } from '../state/AuthContext';
import { formatDate, relativeTime } from '../lib/format';

export default function Security() {
  const { user, refresh, signOut } = useAuth();
  const health = useApi('/account/security-health');
  const sessions = useApi('/auth/sessions');
  const toast = useToast();
  const navigate = useNavigate();

  const [mfaOpen, setMfaOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function reloadAll() {
    health.reload();
    sessions.reload();
    refresh();
  }

  return (
    <div className="stack stack-lg enter" style={{ maxWidth: 900 }}>
      <div className="stack" style={{ gap: 8 }}>
        <h1 style={{ fontSize: 34 }}>Your security is our legacy.</h1>
        <p className="muted">
          The protections on your vault, and what each one actually does. Everything here is
          switchable by you and by nobody else.
        </p>
      </div>

      <Card className="stack stack-md">
        <div className="row-between wrap" style={{ gap: 12 }}>
          <div className="row" style={{ gap: 12 }}>
            <Icon name="security" size={24} style={{ color: 'var(--primary)' }} />
            <div className="stack" style={{ gap: 2 }}>
              <h4>Two-factor authentication</h4>
              <p className="small muted">
                A password can be guessed or reused. A code that changes every 30 seconds cannot be.
              </p>
            </div>
          </div>
          {user?.mfaEnabled ? (
            <Badge tone="verified" icon="check_circle">Active</Badge>
          ) : (
            <Badge tone="pending">Off</Badge>
          )}
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          {user?.mfaEnabled ? (
            <>
              <Button variant="secondary" size="sm" icon="key" onClick={() => setRecoveryCodes('regenerate')}>
                New recovery codes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setDisableOpen(true)}>Turn off</Button>
              {health.data && (
                <span className="tiny muted" style={{ alignSelf: 'center' }}>
                  {health.data.health.unusedRecoveryCodes} recovery codes unused ·
                  {' '}enrolled {formatDate(health.data.health.mfaEnrolledAt)}
                </span>
              )}
            </>
          ) : (
            <Button size="sm" icon="qr_code_2" onClick={() => setMfaOpen(true)}>Set up authenticator</Button>
          )}
        </div>
      </Card>

      <Card className="stack stack-md">
        <div className="row" style={{ gap: 12 }}>
          <Icon name="hourglass_empty" size={24} style={{ color: 'var(--primary)' }} />
          <div className="stack" style={{ gap: 2 }}>
            <h4>Emergency access protocol</h4>
            <p className="small muted">
              How long a trustee must wait after requesting access before it opens — and how long you
              have to stop it.
            </p>
          </div>
        </div>
        <WaitingPeriod current={user?.waitingPeriodDays ?? 14} onSaved={reloadAll} />
        <p className="tiny muted">
          Changing this does not affect a request already running. Those keep the period they started
          with, so nobody can shorten a live countdown.
        </p>
      </Card>

      <Card className="stack stack-md">
        <div className="row-between">
          <div className="row" style={{ gap: 12 }}>
            <Icon name="devices" size={24} style={{ color: 'var(--primary)' }} />
            <h4>Active sessions</h4>
          </div>
          {sessions.data?.sessions?.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const result = await api.post('/auth/sessions/revoke-others');
                toast.success(`Signed out ${result.revoked} other session${result.revoked === 1 ? '' : 's'}.`);
                sessions.reload();
              }}
            >
              Sign out everywhere else
            </Button>
          )}
        </div>
        {sessions.loading ? (
          <Spinner />
        ) : (
          (sessions.data?.sessions ?? []).map((session) => (
            <div
              key={session.id}
              className="row-between"
              style={{ padding: '12px 0', borderTop: '1px solid var(--outline-variant)' }}
            >
              <div className="row" style={{ gap: 12 }}>
                <Icon name={/iOS|Android/.test(session.device) ? 'smartphone' : 'laptop_mac'} size={20} />
                <div className="stack" style={{ gap: 2 }}>
                  <strong className="small">{session.device}</strong>
                  <span className="tiny muted">
                    {session.current ? 'Current session' : `Last active ${relativeTime(session.lastSeenAt)}`}
                    {session.ip ? ` · ${session.ip}` : ''}
                  </span>
                </div>
              </div>
              {session.current ? (
                <Badge tone="verified">This device</Badge>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await api.delete(`/auth/sessions/${session.id}`);
                    toast.success('Signed that device out.');
                    sessions.reload();
                  }}
                >
                  Sign out
                </Button>
              )}
            </div>
          ))
        )}
      </Card>

      <Card className="stack stack-md">
        <div className="row" style={{ gap: 12 }}>
          <Icon name="key" size={24} style={{ color: 'var(--primary)' }} />
          <div className="stack" style={{ gap: 2 }}>
            <h4>Password</h4>
            <p className="small muted">
              Last changed {formatDate(health.data?.health?.passwordChangedAt)}. Changing it signs
              every other device out.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setPasswordOpen(true)} style={{ alignSelf: 'flex-start' }}>
          Change password
        </Button>
      </Card>

      <Card flat className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <Icon name="lock" size={20} style={{ color: 'var(--sage)', marginTop: 2 }} />
        <p className="small muted">
          Every document is encrypted with its own key before it is written to disk, using AES-256-GCM.
          The ciphertext is bound to your account, so a row copied out of the database into another
          account fails to decrypt rather than opening.
        </p>
      </Card>

      <Card className="stack stack-sm" style={{ borderColor: 'var(--error)' }}>
        <h4 style={{ color: 'var(--error)' }}>Delete this vault</h4>
        <p className="small muted">
          Every document, every share and every trustee designation is removed, along with the
          encrypted files themselves. There is no holding pen and no undo.
        </p>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} style={{ alignSelf: 'flex-start' }}>
          Delete vault permanently
        </Button>
      </Card>

      <MfaSetupModal
        open={mfaOpen}
        onClose={() => setMfaOpen(false)}
        onEnabled={(codes) => { setMfaOpen(false); setRecoveryCodes(codes); reloadAll(); }}
      />
      <PasswordModal open={passwordOpen} onClose={() => setPasswordOpen(false)} onSaved={reloadAll} />
      <RecoveryCodesModal
        value={recoveryCodes}
        onClose={() => setRecoveryCodes(null)}
        onGenerated={reloadAll}
      />
      <DisableMfaModal open={disableOpen} onClose={() => setDisableOpen(false)} onDone={reloadAll} />
      <DeleteVaultModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={async () => {
          await signOut();
          navigate('/', { replace: true });
        }}
      />
    </div>
  );
}

function WaitingPeriod({ current, onSaved }) {
  const [days, setDays] = useState(String(current));
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  return (
    <div className="row wrap" style={{ gap: 12, alignItems: 'flex-end' }}>
      <Field label="Waiting period" id="waiting">
        <Select id="waiting" value={days} onChange={(event) => setDays(event.target.value)} style={{ width: 200 }}>
          {[3, 7, 14, 21, 30, 60].map((option) => (
            <option key={option} value={option}>{option} days</option>
          ))}
        </Select>
      </Field>
      <Button
        variant="secondary"
        size="sm"
        loading={busy}
        disabled={Number(days) === current}
        onClick={async () => {
          setBusy(true);
          try {
            await api.patch('/account/security', { waitingPeriodDays: Number(days) });
            toast.success('Protocol updated.');
            onSaved();
          } catch (err) {
            toast.error(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Save
      </Button>
    </div>
  );
}

/**
 * Enrolment shows the secret for manual entry alongside the otpauth URI. No QR
 * image is generated here — that would mean shipping a library to render
 * something every authenticator app also accepts as text.
 */
function MfaSetupModal({ open, onClose, onEnabled }) {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function begin() {
    setBusy(true);
    setError(null);
    try {
      setSetup(await api.post('/auth/mfa/setup'));
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.post('/auth/mfa/enable', { code });
      setCode('');
      setSetup(null);
      onEnabled(result.recoveryCodes);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => { setSetup(null); setCode(''); onClose(); }}
      title="Set up two-factor authentication"
      width={560}
      footer={
        setup ? (
          <>
            <Button variant="secondary" onClick={() => { setSetup(null); onClose(); }}>Cancel</Button>
            <Button onClick={enable} loading={busy} disabled={code.length < 6}>Turn on</Button>
          </>
        ) : (
          <Button onClick={begin} loading={busy}>Start setup</Button>
        )
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}
        {!setup ? (
          <p className="small muted">
            You will need an authenticator app — Google Authenticator, 1Password, Aegis, or any other
            TOTP app. We will show you a secret to add, then confirm it with one code.
          </p>
        ) : (
          <>
            <Field label="Add this secret to your authenticator app" hint="Most apps accept it typed in as a setup key.">
              <div className="row" style={{ gap: 8 }}>
                <Input readOnly value={setup.secret} onFocus={(event) => event.target.select()} />
                <Button
                  variant="secondary"
                  icon="content_copy"
                  onClick={async () => {
                    await navigator.clipboard.writeText(setup.secret).catch(() => {});
                    toast.success('Secret copied.');
                  }}
                >
                  Copy
                </Button>
              </div>
            </Field>
            <a href={setup.otpauthUri} className="small">Or open it directly in your authenticator app →</a>
            <Field label="Enter the six-digit code it shows" id="mfa-code">
              <Input
                id="mfa-code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                style={{ letterSpacing: '0.3em', fontSize: 20, textAlign: 'center' }}
              />
            </Field>
          </>
        )}
      </div>
    </Modal>
  );
}

function RecoveryCodesModal({ value, onClose, onGenerated }) {
  const [codes, setCodes] = useState(Array.isArray(value) ? value : null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  if (!value) return null;
  const needsPassword = value === 'regenerate' && !codes;

  async function regenerate() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.post('/auth/mfa/recovery-codes', { password });
      setCodes(result.recoveryCodes);
      setPassword('');
      onGenerated();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => { setCodes(null); onClose(); }}
      title="Recovery codes"
      description="Each code works once, if you ever lose your authenticator. Keep them somewhere that is not this vault."
      width={520}
      footer={
        needsPassword ? (
          <Button onClick={regenerate} loading={busy} disabled={!password}>Generate new codes</Button>
        ) : (
          <Button onClick={() => { setCodes(null); onClose(); }}>I have saved them</Button>
        )
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}
        {needsPassword ? (
          <Field label="Confirm your password" id="rc-password" hint="Generating a new set stops the old codes working.">
            <Input
              id="rc-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Field>
        ) : (
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontFamily: 'ui-monospace, monospace' }}
          >
            {(codes ?? []).map((code) => (
              <code key={code} style={{ background: 'var(--surface-low)', padding: '10px 14px', borderRadius: 'var(--radius)' }}>
                {code}
              </code>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DisableMfaModal({ open, onClose, onDone }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Turn off two-factor authentication?"
      description="Your vault falls back to a password alone. Your recovery codes stop working."
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Keep it on</Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={!password}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await api.post('/auth/mfa/disable', { password });
                toast.success('Two-factor authentication turned off.');
                setPassword('');
                onClose();
                onDone();
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
          >
            Turn off
          </Button>
        </>
      }
    >
      <div className="stack stack-sm">
        {error && <p className="field-error">{error.message}</p>}
        <Field label="Confirm your password" id="disable-password">
          <Input id="disable-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function PasswordModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            loading={busy}
            disabled={!form.currentPassword || !form.newPassword}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                const result = await api.post('/auth/password', form);
                toast.success(
                  result.otherSessionsSignedOut
                    ? `Password changed. ${result.otherSessionsSignedOut} other session${result.otherSessionsSignedOut === 1 ? '' : 's'} signed out.`
                    : 'Password changed.',
                );
                setForm({ currentPassword: '', newPassword: '' });
                onClose();
                onSaved();
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
          >
            Change password
          </Button>
        </>
      }
    >
      <div className="stack stack-md">
        {error && !error.fields?.newPassword && <p className="field-error">{error.message}</p>}
        <Field label="Current password" id="current">
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          />
        </Field>
        <Field
          label="New password"
          id="new"
          error={error?.fields?.newPassword}
          hint="At least 12 characters."
        >
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

function DeleteVaultModal({ open, onClose, onDeleted }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this vault permanently?"
      description="Everything in it goes: documents, encrypted files, shares, trustee designations and the activity log."
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Keep my vault</Button>
          <Button
            variant="danger"
            loading={busy}
            disabled={!password || confirm !== 'DELETE'}
            onClick={async () => {
              setBusy(true);
              setError(null);
              try {
                await api.delete('/auth/account', { password, confirm: 'DELETE' });
                onDeleted();
              } catch (err) {
                setError(err);
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete everything
          </Button>
        </>
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}
        <Field label="Your password" id="delete-password">
          <Input id="delete-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Field label="Type DELETE to confirm" id="delete-confirm">
          <Input id="delete-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}
