import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Icon, Modal, Spinner, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { InviteLinkModal, InviteModal } from './Family';
import { categoryIcon } from '../lib/categories';
import { countdownParts, formatDate, formatDateTime, relationshipLabel, relativeTime } from '../lib/format';

/**
 * Both sides of the trustee relationship on one screen: the trustees you have
 * designated (and any request running against your vault), and the vaults you
 * hold a key to.
 */
export default function Trustees() {
  const family = useApi('/family');
  const requests = useApi('/emergency/requests');
  const trusteeships = useApi('/emergency/trusteeships');
  const [inviting, setInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState(null);

  if (family.loading || requests.loading || trusteeships.loading) return <Spinner />;

  const trustees = (family.data?.members ?? []).filter((m) => m.isTrustee && m.status !== 'revoked');
  const openRequests = (requests.data?.requests ?? []).filter((r) => r.status === 'waiting');
  const history = (requests.data?.requests ?? []).filter((r) => r.status !== 'waiting');

  function reloadAll() {
    family.reload();
    requests.reload();
    trusteeships.reload();
  }

  return (
    <div className="stack stack-lg enter">
      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 style={{ fontSize: 32 }}>Trustees</h1>
          <p className="muted small">
            A trustee holds a key to a procedure, not to your vault. They see nothing until a request
            completes — and you can stop one at any point in the window.
          </p>
        </div>
        <Button icon="person_add" onClick={() => setInviting(true)}>Designate trustee</Button>
      </div>

      {openRequests.map((request) => (
        <OwnerRequestCard key={request.id} request={request} onResolved={reloadAll} />
      ))}

      <section className="stack stack-md">
        <h3>Your trustees</h3>
        {trustees.length === 0 ? (
          <Card flat>
            <EmptyState
              icon="gavel"
              title="No trustee named yet"
              action={<Button onClick={() => setInviting(true)}>Designate a trustee</Button>}
            >
              If you cannot open the vault, nobody can. A trustee is the single biggest thing most
              vaults are missing.
            </EmptyState>
          </Card>
        ) : (
          <div className="grid grid-2">
            {trustees.map((trustee) => (
              <Card key={trustee.id} className="stack stack-sm">
                <div className="row-between">
                  <div className="stack" style={{ gap: 2 }}>
                    <strong>{trustee.name}</strong>
                    <span className="tiny muted">{relationshipLabel(trustee.relationship)} · {trustee.email}</span>
                  </div>
                  {trustee.status === 'active' ? (
                    <Badge tone="verified" icon="verified_user">Active</Badge>
                  ) : (
                    <Badge tone="pending">Pending</Badge>
                  )}
                </div>
                <hr className="divider" />
                <span className="tiny caps muted">Could open in an emergency</span>
                {trustee.trusteeCategories.length ? (
                  <div className="row wrap" style={{ gap: 6 }}>
                    {trustee.trusteeCategories.map((key, index) => (
                      <Badge key={key} icon={categoryIcon(key)}>{trustee.trusteeCategoryLabels[index]}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="small muted">No categories designated — they could open nothing.</span>
                )}
                <div className="row" style={{ gap: 8, marginTop: 6 }}>
                  <Icon name="hourglass_empty" size={16} style={{ color: 'var(--primary)' }} />
                  <span className="tiny muted">
                    {trustee.status === 'active'
                      ? `Accepted ${relativeTime(trustee.acceptedAt)}`
                      : `Invited ${relativeTime(trustee.invitedAt)}`}
                  </span>
                </div>
                <Link to="/vault/family" className="tiny">Manage in family →</Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {trusteeships.data?.trusteeships?.length > 0 && (
        <section className="stack stack-md">
          <h3>Vaults you are a trustee for</h3>
          {trusteeships.data.trusteeships.map((trusteeship) => (
            <TrusteeshipCard key={trusteeship.memberId} trusteeship={trusteeship} onChange={reloadAll} />
          ))}
        </section>
      )}

      {history.length > 0 && (
        <section className="stack stack-sm">
          <h3>Past access requests</h3>
          {history.map((request) => (
            <Card key={request.id} flat className="row-between wrap" style={{ gap: 12 }}>
              <div className="stack" style={{ gap: 2 }}>
                <strong className="small">{request.memberName}</strong>
                <span className="tiny muted">
                  Started {formatDateTime(request.initiatedAt)} · {request.reason}
                </span>
              </div>
              <Badge tone={request.status === 'granted' ? 'danger' : 'neutral'}>
                {request.status === 'denied'
                  ? 'Denied by you'
                  : request.status === 'cancelled'
                    ? 'Withdrawn'
                    : request.status === 'granted'
                      ? 'Access granted'
                      : request.status}
              </Badge>
            </Card>
          ))}
        </section>
      )}

      <InviteModal
        open={inviting}
        trusteeDefault
        onClose={() => setInviting(false)}
        onInvited={(payload) => { setInviting(false); setInviteLink(payload); reloadAll(); }}
      />
      <InviteLinkModal payload={inviteLink} onClose={() => setInviteLink(null)} />
    </div>
  );
}

/** The owner's view of a live request: the countdown, and the way to stop it. */
function OwnerRequestCard({ request, onResolved }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const remaining = useCountdown(request.unlockAt);

  async function deny() {
    setBusy(true);
    try {
      await api.post(`/emergency/requests/${request.id}/deny`);
      toast.success('Request denied. Your vault stays closed.');
      setConfirm(false);
      onResolved();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }} className="stack stack-md">
      <div className="row" style={{ gap: 14, alignItems: 'flex-start' }}>
        <Icon name="gavel" size={28} />
        <div className="stack" style={{ gap: 6 }}>
          <h3 style={{ color: 'inherit' }}>Emergency access requested</h3>
          <p className="small">
            <strong>{request.memberName}</strong> ({relationshipLabel(request.relationship)}) started the
            protocol {relativeTime(request.initiatedAt)}. If you are safe, deny it now.
          </p>
          <p className="small" style={{ fontStyle: 'italic' }}>“{request.reason}”</p>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 12 }}>
        {[
          { value: remaining.days, label: 'days' },
          { value: remaining.hours, label: 'hours' },
          { value: remaining.minutes, label: 'min' },
          { value: remaining.seconds, label: 'sec' },
        ].map((part) => (
          <div
            key={part.label}
            style={{
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 'var(--radius-lg)',
              padding: '10px 16px',
              minWidth: 74,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 700 }}>
              {String(part.value).padStart(2, '0')}
            </div>
            <div className="tiny">{part.label}</div>
          </div>
        ))}
      </div>

      <div className="row-between wrap" style={{ gap: 12 }}>
        <span className="tiny">
          Opens {formatDateTime(request.unlockAt)} · {request.notificationCount} notifications recorded
        </span>
        <Button variant="danger" icon="verified_user" onClick={() => setConfirm(true)}>
          I am safe — deny access
        </Button>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Deny this request?"
        description={`${request.memberName} will be told the request was closed because you confirmed you are safe. The vault stays shut.`}
        confirmLabel="Deny access"
        busy={busy}
        onConfirm={deny}
        onClose={() => setConfirm(false)}
      />
    </Card>
  );
}

/** The trustee's view: what they may do, and the state of any request. */
function TrusteeshipCard({ trusteeship, onChange }) {
  const toast = useToast();
  const [initiating, setInitiating] = useState(false);
  const [documents, setDocuments] = useState(null);
  const request = trusteeship.request;
  const remaining = useCountdown(request?.unlockAt);

  async function openVault() {
    try {
      const data = await api.get(`/emergency/requests/${request.id}/documents`);
      setDocuments(data);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Card className="stack stack-md">
      <div className="row-between wrap" style={{ gap: 12 }}>
        <div className="row" style={{ gap: 14 }}>
          <span
            style={{
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-fixed)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="account_balance" size={24} />
          </span>
          <div className="stack" style={{ gap: 2 }}>
            <strong>{trusteeship.ownerName}’s vault</strong>
            <span className="tiny muted">
              Trustee since {formatDate(trusteeship.acceptedAt)} · {trusteeship.waitingPeriodDays}-day protocol
            </span>
          </div>
        </div>
        <Badge tone={request?.status === 'granted' ? 'danger' : 'verified'} icon="shield">
          {request?.status === 'granted' ? 'Access open' : request?.status === 'waiting' ? 'Request running' : 'Standing by'}
        </Badge>
      </div>

      <div className="stack stack-sm">
        <span className="tiny caps muted">You could open</span>
        <div className="row wrap" style={{ gap: 6 }}>
          {trusteeship.categories.length ? (
            trusteeship.categories.map((category) => (
              <Badge key={category.key} icon={categoryIcon(category.key)}>{category.label}</Badge>
            ))
          ) : (
            <span className="small muted">No categories designated.</span>
          )}
        </div>
      </div>

      {!request || ['denied', 'cancelled', 'expired'].includes(request.status) ? (
        <div className="row-between wrap" style={{ gap: 12 }}>
          <p className="small muted" style={{ maxWidth: 460 }}>
            {trusteeship.canInitiate
              ? 'You may start the emergency access protocol. The owner is notified immediately and can stop it at any point in the waiting period.'
              : `You cannot start a request until ${formatDate(trusteeship.eligibleAt)} — ${trusteeship.waitingPeriodDays} days after accepting the role.`}
          </p>
          <Button
            variant="danger"
            icon="key"
            disabled={!trusteeship.canInitiate}
            onClick={() => setInitiating(true)}
          >
            Initiate access protocol
          </Button>
        </div>
      ) : request.status === 'waiting' ? (
        <div className="stack stack-sm" style={{ padding: 16, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
          <div className="row-between wrap" style={{ gap: 10 }}>
            <strong className="small">Waiting period active</strong>
            <span className="small">
              {remaining.days}d {remaining.hours}h {remaining.minutes}m remaining
            </span>
          </div>
          <p className="tiny muted">
            {trusteeship.ownerName} is being notified — {request.notificationCount} notifications recorded
            across email, SMS and push. The vault stays encrypted until {formatDateTime(request.unlockAt)}.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              size="sm"
              icon="cancel"
              onClick={async () => {
                await api.post(`/emergency/requests/${request.id}/cancel`);
                toast.success('Request withdrawn.');
                onChange();
              }}
            >
              Cancel request
            </Button>
          </div>
        </div>
      ) : (
        <div className="stack stack-sm" style={{ padding: 16, background: 'var(--amber-surface)', borderRadius: 'var(--radius-lg)' }}>
          <strong className="small" style={{ color: 'var(--amber)' }}>Access granted</strong>
          <p className="tiny" style={{ color: 'var(--amber)' }}>
            The waiting period completed. Access closes {formatDate(request.accessExpiresAt)}. Everything
            you open is recorded in {trusteeship.ownerName}’s activity log.
          </p>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Button size="sm" icon="folder_open" onClick={openVault}>Open designated documents</Button>
          </div>
        </div>
      )}

      <InitiateModal
        open={initiating}
        trusteeship={trusteeship}
        onClose={() => setInitiating(false)}
        onStarted={() => { setInitiating(false); onChange(); }}
      />

      <Modal
        open={Boolean(documents)}
        onClose={() => setDocuments(null)}
        title={`${trusteeship.ownerName}’s designated documents`}
        width={640}
      >
        <div className="stack stack-sm">
          {documents?.documents?.length ? (
            documents.documents.map((document) => (
              <Link
                key={document.id}
                to={`/vault/documents/${document.id}`}
                className="row-between"
                style={{ padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)', color: 'inherit' }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <Icon name={categoryIcon(document.category)} size={20} style={{ color: 'var(--primary)' }} />
                  <div className="stack" style={{ gap: 0 }}>
                    <strong className="small">{document.title}</strong>
                    <span className="tiny muted">{document.categoryLabel}</span>
                  </div>
                </div>
                <Icon name="chevron_right" size={18} />
              </Link>
            ))
          ) : (
            <EmptyState icon="folder_off" title="Nothing in the designated categories" />
          )}
        </div>
      </Modal>
    </Card>
  );
}

const CONFIRMATIONS = [
  {
    key: 'verified_emergency',
    text: 'I confirm I have verified the emergency according to the agreed family protocol, and that opening this vault is strictly necessary.',
  },
  {
    key: 'owner_notified',
    text: 'I understand the owner will be notified continuously and has full authority to cancel this request at any time.',
  },
  {
    key: 'actions_audited',
    text: 'I acknowledge that everything I do inside the vault is logged and audited.',
  },
];

function InitiateModal({ open, trusteeship, onClose, onStarted }) {
  const toast = useToast();
  const [checked, setChecked] = useState([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const ready = CONFIRMATIONS.every((c) => checked.includes(c.key)) && reason.trim().length >= 10;

  async function start() {
    setBusy(true);
    setError(null);
    try {
      await api.post('/emergency/requests', {
        ownerId: trusteeship.ownerId,
        reason: reason.trim(),
        confirmations: checked,
      });
      toast.success('Protocol started. The owner has been notified.');
      onStarted();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Initiate emergency access"
      width={620}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" icon="lock_open" disabled={!ready} loading={busy} onClick={start}>
            Confirm initiation
          </Button>
        </>
      }
    >
      <div className="stack stack-md">
        <div className="row" style={{ gap: 12, alignItems: 'flex-start', padding: 14, background: 'var(--error-container)', color: 'var(--on-error-container)', borderRadius: 'var(--radius-lg)' }}>
          <Icon name="warning" size={20} style={{ marginTop: 2 }} />
          <p className="small">
            You are about to trigger the emergency access protocol for{' '}
            <strong>{trusteeship.ownerName}’s vault</strong>. They will be notified immediately across
            every registered channel, and access opens automatically after{' '}
            {trusteeship.waitingPeriodDays} days unless they stop it.
          </p>
        </div>

        {error && <p className="field-error">{error.message}</p>}

        <Field label="What has happened?" id="reason" hint="Recorded in the owner's activity log, in your words.">
          <textarea
            id="reason"
            className="input"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Describe the situation that makes this necessary."
          />
        </Field>

        <div className="stack stack-sm">
          <span className="tiny caps muted">Mandatory verification</span>
          {CONFIRMATIONS.map((confirmation) => (
            <label key={confirmation.key} className="check" style={{ padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
              <input
                type="checkbox"
                checked={checked.includes(confirmation.key)}
                onChange={(event) =>
                  setChecked((list) =>
                    event.target.checked
                      ? [...list, confirmation.key]
                      : list.filter((k) => k !== confirmation.key),
                  )
                }
              />
              <span className="small">{confirmation.text}</span>
            </label>
          ))}
          {!ready && (
            <span className="tiny muted">
              Every box must be checked, and the reason must say something, before this can proceed.
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

/** Ticks once a second so the countdown is honest rather than decorative. */
function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (!target) return countdownParts(0);
  return countdownParts(new Date(target).getTime() - now);
}
