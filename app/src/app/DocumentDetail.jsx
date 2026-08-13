import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
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
import { CATEGORY_LIST, categoryIcon } from '../lib/categories';
import { formatBytes, formatDate, relationshipLabel } from '../lib/format';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { data, loading, error, reload } = useApi(`/documents/${id}`);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading) return <Spinner label="Opening document" />;
  if (error) {
    return (
      <EmptyState icon="lock" title="Not available">
        {error.message}
        <div style={{ marginTop: 16 }}>
          <Link to="/vault/documents" className="btn btn-secondary btn-sm">Back to documents</Link>
        </div>
      </EmptyState>
    );
  }

  const { document, permission, shares } = data;
  const isOwner = permission.via === 'owner';

  async function remove() {
    setBusy(true);
    try {
      await api.delete(`/documents/${document.id}`);
      toast.success('Document removed from the vault.');
      navigate('/vault/documents');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack stack-md enter" style={{ maxWidth: 1000 }}>
      <Link to="/vault/documents" className="row small muted" style={{ gap: 6 }}>
        <Icon name="arrow_back" size={16} /> Documents
      </Link>

      <div className="row-between wrap" style={{ gap: 16 }}>
        <div className="row" style={{ gap: 16 }}>
          <span
            style={{
              width: 56,
              height: 56,
              borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-fixed)',
              color: 'var(--primary)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name={categoryIcon(document.category)} size={28} />
          </span>
          <div className="stack" style={{ gap: 4 }}>
            <h1 style={{ fontSize: 30 }}>{document.title}</h1>
            <div className="row wrap" style={{ gap: 8 }}>
              <Badge>{document.categoryLabel ?? document.category}</Badge>
              {document.subject && <Badge icon="person">{document.subject}</Badge>}
              {!isOwner && <Badge tone="primary" icon="folder_shared">Shared with you</Badge>}
            </div>
          </div>
        </div>

        <div className="row wrap" style={{ gap: 8 }}>
          <ViewButton documentId={document.id} />
          {permission.canDownload && <DownloadButton document={document} />}
          {isOwner && (
            <>
              <Button variant="secondary" icon="share" onClick={() => setSharing(true)}>Share</Button>
              <Button variant="secondary" icon="edit" onClick={() => setEditing(true)}>Edit</Button>
              <Button variant="ghost" icon="delete" onClick={() => setConfirmDelete(true)}>Delete</Button>
            </>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)' }}>
        <div className="stack stack-md">
          <Card className="stack stack-sm">
            <h4>Details</h4>
            <Detail label="Issued on" value={formatDate(document.issuedOn)} />
            <Detail label="Expires on" value={formatDate(document.expiresOn)} warn={document.expiresOn && new Date(document.expiresOn) < new Date()} />
            <Detail label="Renewal due" value={formatDate(document.renewalOn)} />
            <Detail label="File" value={`${document.originalName} · ${formatBytes(document.sizeBytes)}`} />
            <Detail label="Added" value={formatDate(document.createdAt)} />
            {document.notes && (
              <>
                <hr className="divider" />
                <span className="tiny caps muted">Notes</span>
                <p className="small">{document.notes}</p>
              </>
            )}
          </Card>

          {document.fields?.length > 0 && (
            <Card className="stack stack-sm">
              <div className="row" style={{ gap: 8 }}>
                <Icon name="auto_awesome" size={18} style={{ color: 'var(--primary)' }} />
                <h4>Extracted fields</h4>
              </div>
              {document.fields.map((field) => (
                <div key={field.label} className="row-between" style={{ padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
                  <span className="small muted">{field.label}</span>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="small">{field.value}</span>
                    {field.confirmed ? (
                      <Badge tone="verified" icon="check_circle">Confirmed</Badge>
                    ) : (
                      <Badge tone="pending">Unreviewed</Badge>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="stack stack-md">
          <Card className="stack stack-sm">
            <h4>Who can see this</h4>
            {!isOwner ? (
              <p className="small muted">
                Shared with you via {permission.via.replace('_', ' ')}.
                {permission.canDownload ? ' You can download a copy.' : ' You can view it, not download it.'}
              </p>
            ) : shares?.length ? (
              shares.map((share) => (
                <div key={share.memberId} className="row-between" style={{ padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
                  <div className="stack" style={{ gap: 2 }}>
                    <strong className="small">{share.name}</strong>
                    <span className="tiny muted">
                      {relationshipLabel(share.relationship)} · {share.canDownload ? 'View + download' : 'View only'}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      await api.delete(`/documents/${document.id}/shares/${share.memberId}`);
                      toast.success(`${share.name} can no longer see this.`);
                      reload();
                    }}
                  >
                    Revoke
                  </button>
                </div>
              ))
            ) : (
              <p className="small muted">
                Only you. Private by default — sharing is always something you switch on.
              </p>
            )}
          </Card>

          <Card flat className="stack stack-sm">
            <div className="row" style={{ gap: 8 }}>
              <Icon name="enhanced_encryption" size={18} style={{ color: 'var(--sage)' }} />
              <strong className="small">Encrypted at rest</strong>
            </div>
            <p className="tiny muted">
              AES-256-GCM with a key unique to this document. The checksum below is of the original
              file, so you can verify nothing changed.
            </p>
            <code className="tiny muted" style={{ wordBreak: 'break-all' }}>{document.sha256}</code>
          </Card>
        </div>
      </div>

      {isOwner && (
        <>
          <EditModal
            open={editing}
            document={document}
            onClose={() => setEditing(false)}
            onSaved={() => { setEditing(false); reload(); toast.success('Details updated.'); }}
          />
          <ShareModal
            open={sharing}
            document={document}
            onClose={() => setSharing(false)}
            onShared={() => { setSharing(false); reload(); }}
          />
          <ConfirmDialog
            open={confirmDelete}
            title="Delete this document?"
            description="The file and its encrypted copy are removed immediately. This cannot be undone."
            confirmLabel="Delete permanently"
            danger
            busy={busy}
            onConfirm={remove}
            onClose={() => setConfirmDelete(false)}
          />
        </>
      )}
    </div>
  );
}

function Detail({ label, value, warn }) {
  return (
    <div className="row-between" style={{ padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
      <span className="small muted">{label}</span>
      <span className="small" style={{ fontWeight: 600, color: warn ? 'var(--error)' : undefined }}>{value}</span>
    </div>
  );
}

/** Opens the decrypted file in a new tab via a short-lived object URL. */
function ViewButton({ documentId }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      icon="visibility"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const url = await api.fileUrl(documentId);
          window.open(url, '_blank', 'noopener,noreferrer');
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      View
    </Button>
  );
}

function DownloadButton({ document: doc }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="secondary"
      icon="download"
      loading={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const url = await api.fileUrl(doc.id, { download: true });
          const link = window.document.createElement('a');
          link.href = url;
          link.download = doc.originalName;
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (err) {
          toast.error(err.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      Download
    </Button>
  );
}

function EditModal({ open, document, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm({
        title: document.title,
        category: document.category,
        subject: document.subject ?? '',
        issuedOn: document.issuedOn ?? '',
        expiresOn: document.expiresOn ?? '',
        renewalOn: document.renewalOn ?? '',
        notes: document.notes ?? '',
      });
      setError(null);
    }
  }, [open, document]);

  if (!open || !form) return null;

  async function save() {
    setBusy(true);
    try {
      await api.patch(`/documents/${document.id}`, {
        title: form.title,
        category: form.category,
        subject: form.subject || null,
        issuedOn: form.issuedOn || null,
        expiresOn: form.expiresOn || null,
        renewalOn: form.renewalOn || null,
        notes: form.notes || null,
      });
      onSaved();
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
      title="Edit details"
      width={600}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={save} loading={busy}>Save changes</Button>
        </>
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}
        <Field label="Title" id="edit-title" error={error?.fields?.title}>
          <Input id="edit-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <div className="grid grid-2">
          <Field label="Category" id="edit-category">
            <Select id="edit-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORY_LIST.map((entry) => (
                <option key={entry.key} value={entry.key}>{entry.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Subject" id="edit-subject">
            <Input id="edit-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-3">
          <Field label="Issued" id="edit-issued">
            <Input id="edit-issued" type="date" value={form.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} />
          </Field>
          <Field label="Expires" id="edit-expires" error={error?.fields?.expiresOn}>
            <Input id="edit-expires" type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} />
          </Field>
          <Field label="Renewal" id="edit-renewal">
            <Input id="edit-renewal" type="date" value={form.renewalOn} onChange={(e) => setForm({ ...form, renewalOn: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes" id="edit-notes">
          <textarea id="edit-notes" className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

function ShareModal({ open, document, onClose, onShared }) {
  const toast = useToast();
  const { data } = useApi('/family', { skip: !open });
  const [memberId, setMemberId] = useState('');
  const [canDownload, setCanDownload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const members = (data?.members ?? []).filter((m) => m.status === 'active');

  async function share() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/documents/${document.id}/shares`, { memberId, canDownload });
      const member = members.find((m) => m.id === memberId);
      toast.success(`Shared safely with ${member?.name ?? 'them'}.`);
      onShared();
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
      title="Share document"
      description={document.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={share} disabled={!memberId} loading={busy} icon="send">Share safely</Button>
        </>
      }
    >
      <div className="stack stack-md">
        {error && <p className="field-error">{error.message}</p>}

        {members.length === 0 ? (
          <EmptyState icon="group_add" title="No one to share with yet">
            Invite a family member first, and they will appear here once they accept.
            <div style={{ marginTop: 14 }}>
              <Link to="/vault/family" className="btn btn-secondary btn-sm">Go to family</Link>
            </div>
          </EmptyState>
        ) : (
          <>
            <Field label="Sharing with" id="member">
              <Select id="member" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                <option value="">Choose someone…</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} — {relationshipLabel(member.relationship)}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="stack stack-sm">
              <span className="tiny caps muted">Access controls</span>
              <div className="row" style={{ gap: 10, padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
                <Icon name="visibility" size={20} style={{ color: 'var(--primary)' }} />
                <div className="stack grow" style={{ gap: 0 }}>
                  <strong className="small">View document</strong>
                  <span className="tiny muted">Always included — they can read and review it.</span>
                </div>
                <Badge tone="verified" icon="check">On</Badge>
              </div>
              <label className="check" style={{ padding: 12, background: 'var(--surface-low)', borderRadius: 'var(--radius-lg)' }}>
                <input type="checkbox" checked={canDownload} onChange={(e) => setCanDownload(e.target.checked)} />
                <span className="stack" style={{ gap: 0 }}>
                  <strong className="small">Download document</strong>
                  <span className="tiny muted">They can save an offline copy you cannot revoke.</span>
                </span>
              </label>
            </div>

            <div className="row" style={{ gap: 8, alignItems: 'flex-start' }}>
              <Icon name="lock" size={16} style={{ color: 'var(--sage)', marginTop: 2 }} />
              <p className="tiny muted">
                Private by default. Only you decide who sees this, and access can be revoked at any
                time — it takes effect on their very next click.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
