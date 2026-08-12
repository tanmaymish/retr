import { useState } from 'react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Icon, Input, Modal, Select, Spinner, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { CATEGORY_LIST, RELATIONSHIPS } from '../lib/categories';
import { initials, relationshipLabel, relativeTime } from '../lib/format';

export default function Family() {
  const { data, loading, error, reload } = useApi('/family');
  const [inviting, setInviting] = useState(false);
  const [managing, setManaging] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [inviteLink, setInviteLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  if (loading) return <Spinner />;
  if (error) return <EmptyState icon="cloud_off" title="Could not load your family list">{error.message}</EmptyState>;

  const members = data.members.filter((m) => m.status !== 'revoked');

  async function remove() {
    setBusy(true);
    try {
      await api.delete(`/family/${removing.id}`);
      toast.success(`${removing.name} no longer has access.`);
      setRemoving(null);
      reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack stack-md enter">
      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 6 }}>
          <h1 style={{ fontSize: 32 }}>Not just your documents. Your family’s too.</h1>
          <p className="muted small">
            Manage who can reach what. Every grant is visible here, and revoking one takes effect
            immediately.
          </p>
        </div>
        <Button icon="person_add" onClick={() => setInviting(true)}>Invite member</Button>
      </div>

      <div className="row wrap" style={{ gap: 10 }}>
        <Badge tone="verified" icon="verified">{data.summary.active} active</Badge>
        <Badge tone="pending" icon="pending">{data.summary.pending} pending</Badge>
        <Badge tone="primary" icon="gavel">{data.summary.trustees} trustees</Badge>
      </div>

      {members.length === 0 ? (
        <Card flat>
          <EmptyState
            icon="family_restroom"
            title="No one else can reach the vault yet"
            action={<Button onClick={() => setInviting(true)}>Invite the first person</Button>}
          >
            A vault only you can open is a filing cabinet. Invite someone and choose exactly what
            they can see.
          </EmptyState>
        </Card>
      ) : (
        <div className="grid grid-2">
          {members.map((member) => (
            <Card key={member.id} className="stack stack-sm">
              <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div className="row" style={{ gap: 14 }}>
                  <span
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--primary-fixed)',
                      color: 'var(--primary)',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      flex: 'none',
                    }}
                  >
                    {initials(member.name)}
                  </span>
                  <div className="stack" style={{ gap: 3 }}>
                    <strong>{member.name}</strong>
                    <span className="tiny muted">
                      {relationshipLabel(member.relationship)}
                      {member.isTrustee ? ' · Trustee' : ''}
                    </span>
                    <span className="tiny muted">{member.email}</span>
                  </div>
                </div>
                {member.status === 'active' ? (
                  <Badge tone="verified" icon="verified">Verified</Badge>
                ) : member.status === 'declined' ? (
                  <Badge tone="danger">Declined</Badge>
                ) : (
                  <Badge tone="pending" icon="pending">Pending invite</Badge>
                )}
              </div>

              <hr className="divider" />

              <div className="stack" style={{ gap: 6 }}>
                <span className="tiny caps muted">
                  {member.status === 'active' ? 'Shared access' : 'Proposed access'}
                </span>
                {member.grants.length === 0 && member.documentShares === 0 ? (
                  <span className="small muted">Nothing shared yet.</span>
                ) : (
                  <div className="row wrap" style={{ gap: 6 }}>
                    {member.grants.map((grant) => (
                      <Badge key={grant.category} icon={grant.canDownload ? 'download' : 'visibility'}>
                        {grant.label}
                      </Badge>
                    ))}
                    {member.documentShares > 0 && (
                      <Badge icon="description">{member.documentShares} single document{member.documentShares > 1 ? 's' : ''}</Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="row-between" style={{ marginTop: 4 }}>
                <span className="tiny muted">
                  {member.status === 'active'
                    ? member.lastActiveAt
                      ? `Last active ${relativeTime(member.lastActiveAt)}`
                      : `Accepted ${relativeTime(member.acceptedAt)}`
                    : `Invited ${relativeTime(member.invitedAt)}`}
                </span>
                <div className="row" style={{ gap: 4 }}>
                  {member.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const result = await api.post(`/family/${member.id}/resend`);
                        setInviteLink({ name: member.name, token: result.inviteToken });
                      }}
                    >
                      Resend
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setManaging(member)}>Manage access</Button>
                  <Button variant="ghost" size="sm" onClick={() => setRemoving(member)}>Remove</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <InviteModal
        open={inviting}
        onClose={() => setInviting(false)}
        onInvited={(payload) => {
          setInviting(false);
          setInviteLink(payload);
          reload();
        }}
      />

      <AccessModal
        member={managing}
        onClose={() => setManaging(null)}
        onSaved={() => { setManaging(null); reload(); toast.success('Access updated.'); }}
      />

      <InviteLinkModal payload={inviteLink} onClose={() => setInviteLink(null)} />

      <ConfirmDialog
        open={Boolean(removing)}
        title={`Remove ${removing?.name ?? ''}?`}
        description="Every document and category you shared with them is revoked immediately, and any emergency request they have running is cancelled."
        confirmLabel="Remove access"
        danger
        busy={busy}
        onConfirm={remove}
        onClose={() => setRemoving(null)}
      />
    </div>
  );
}

export function InviteModal({ open, onClose, onInvited, trusteeDefault = false }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    relationship: 'family_member',
    isTrustee: trusteeDefault,
    trusteeCategories: [],
    message: '',
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.post('/family', {
        ...form,
        message: form.message || null,
      });
      onInvited({ name: form.name, token: result.inviteToken, notice: result.inviteNotice });
      setForm({ name: '', email: '', relationship: 'family_member', isTrustee: trusteeDefault, trusteeCategories: [], message: '' });
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
      title={trusteeDefault ? 'Designate a trustee' : 'Invite a family member'}
      description={
        trusteeDefault
          ? 'Invite someone you trust to hold a key to your vault. They gain nothing today — only the ability to request access under the conditions you set.'
          : 'Invite someone to your family vault. You choose what they can see after they accept.'
      }
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={busy} disabled={!form.name || !form.email} icon="send">
            Send secure invitation
          </Button>
        </>
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}
        <Field label="Full name" id="invite-name" error={error?.fields?.name}>
          <Input id="invite-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email address" id="invite-email" error={error?.fields?.email}>
          <Input id="invite-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Relationship" id="invite-rel">
          <Select id="invite-rel" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
            {RELATIONSHIPS.map((entry) => (
              <option key={entry.value} value={entry.value}>{entry.label}</option>
            ))}
          </Select>
        </Field>

        {!trusteeDefault && (
          <label className="check">
            <input
              type="checkbox"
              checked={form.isTrustee}
              onChange={(e) => setForm({ ...form, isTrustee: e.target.checked })}
            />
            <span className="stack" style={{ gap: 0 }}>
              <strong className="small">Also make them a trustee</strong>
              <span className="tiny muted">They can request emergency access under the waiting-period protocol.</span>
            </span>
          </label>
        )}

        {form.isTrustee && (
          <div className="stack stack-sm">
            <span className="tiny caps muted">Categories they could open in an emergency</span>
            <div className="row wrap" style={{ gap: 6 }}>
              {CATEGORY_LIST.map((entry) => {
                const selected = form.trusteeCategories.includes(entry.key);
                return (
                  <button
                    key={entry.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        trusteeCategories: selected
                          ? current.trusteeCategories.filter((k) => k !== entry.key)
                          : [...current.trusteeCategories, entry.key],
                      }))
                    }
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-full)',
                      border: `1px solid ${selected ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      background: selected ? 'var(--primary)' : 'transparent',
                      color: selected ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <Icon name={entry.icon} size={14} />
                    {entry.label}
                  </button>
                );
              })}
            </div>
            <div className="row" style={{ gap: 8, alignItems: 'flex-start', padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
              <Icon name="security" size={18} style={{ color: 'var(--primary)', marginTop: 2 }} />
              <p className="tiny muted">
                A newly designated trustee cannot start an emergency request for 14 days after they
                accept. That is what stops a stolen invitation from being used the day it is taken.
              </p>
            </div>
          </div>
        )}

        <Field label="A note for them" id="invite-message" hint="Optional. Shown on the invitation.">
          <textarea
            id="invite-message"
            className="input"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

/** Category-level access, replaced wholesale so the screen matches the grant. */
function AccessModal({ member, onClose, onSaved }) {
  const [selection, setSelection] = useState(null);
  const [busy, setBusy] = useState(false);

  const current =
    selection ??
    Object.fromEntries((member?.grants ?? []).map((g) => [g.category, g.canDownload]));

  if (!member) return null;

  function toggle(key) {
    const next = { ...current };
    if (key in next) delete next[key];
    else next[key] = false;
    setSelection(next);
  }

  async function save() {
    setBusy(true);
    try {
      await api.put(`/family/${member.id}/grants`, {
        categories: Object.entries(current).map(([category, canDownload]) => ({ category, canDownload })),
      });
      setSelection(null);
      onSaved();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={() => { setSelection(null); onClose(); }}
      title={`${member.name}’s access`}
      description="Standing access to whole categories. Individual documents can also be shared one at a time."
      width={560}
      footer={
        <>
          <Button variant="secondary" onClick={() => { setSelection(null); onClose(); }}>Cancel</Button>
          <Button onClick={save} loading={busy}>Save access</Button>
        </>
      }
    >
      <div className="stack stack-sm">
        {CATEGORY_LIST.map((entry) => {
          const granted = entry.key in current;
          return (
            <div
              key={entry.key}
              className="row-between"
              style={{ padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}
            >
              <label className="check" style={{ flex: 1 }}>
                <input type="checkbox" checked={granted} onChange={() => toggle(entry.key)} />
                <span className="row" style={{ gap: 8 }}>
                  <Icon name={entry.icon} size={18} style={{ color: 'var(--primary)' }} />
                  <strong className="small">{entry.label}</strong>
                </span>
              </label>
              {granted && (
                <label className="check tiny">
                  <input
                    type="checkbox"
                    checked={current[entry.key]}
                    onChange={(e) => setSelection({ ...current, [entry.key]: e.target.checked })}
                  />
                  Can download
                </label>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

/**
 * The invitation link, shown once. No email transport is configured, and the
 * app says so rather than pretending a message went out.
 */
export function InviteLinkModal({ payload, onClose }) {
  const toast = useToast();
  if (!payload) return null;
  const url = `${window.location.origin}/invite/${payload.token}`;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Invitation ready for ${payload.name}`}
      width={560}
      footer={<Button onClick={onClose}>Done</Button>}
    >
      <div className="stack stack-md">
        <div className="row" style={{ gap: 10, alignItems: 'flex-start', padding: 14, background: 'var(--amber-surface)', color: 'var(--amber)', borderRadius: 'var(--radius-lg)' }}>
          <Icon name="info" size={18} style={{ marginTop: 2 }} />
          <p className="small">
            {payload.notice ??
              'No email is sent from this deployment. Copy this link and give it to them yourself — it works once, for them, and expires in 30 days.'}
          </p>
        </div>
        <Field label="Invitation link">
          <div className="row" style={{ gap: 8 }}>
            <Input readOnly value={url} onFocus={(e) => e.target.select()} />
            <Button
              variant="secondary"
              icon="content_copy"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success('Link copied.');
                } catch {
                  toast.error('Copy failed — select the link and copy it manually.');
                }
              }}
            >
              Copy
            </Button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}
