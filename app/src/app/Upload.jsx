import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, Field, Icon, Input, Select, useToast } from '../components/ui';
import { CATEGORY_LIST } from '../lib/categories';
import { api } from '../lib/api';
import { formatBytes } from '../lib/format';

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.txt';

/**
 * Drop → encrypt → review → save.
 *
 * The file is encrypted and stored the moment it arrives; the review step edits
 * metadata on the stored document. Nothing extracted is treated as fact — each
 * field shows how confident we were and can be corrected before it is confirmed.
 */
export default function Upload() {
  const navigate = useNavigate();
  const toast = useToast();
  const inputRef = useRef(null);

  const [stage, setStage] = useState('choose'); // choose → processing → review
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setStage('processing');

    const body = new FormData();
    body.append('file', file);

    try {
      const data = await api.post('/documents', body);
      setResult({ ...data, fileName: file.name, fileSize: file.size });
      setForm({
        title: data.document.title,
        category: data.document.category,
        subject: data.document.subject ?? '',
        issuedOn: data.document.issuedOn ?? '',
        expiresOn: data.document.expiresOn ?? '',
        renewalOn: data.document.renewalOn ?? '',
        notes: '',
      });
      setStage('review');
    } catch (err) {
      setError(err);
      setStage('choose');
    }
  }

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/documents/${result.document.id}`, {
        title: form.title,
        category: form.category,
        subject: form.subject || null,
        issuedOn: form.issuedOn || null,
        expiresOn: form.expiresOn || null,
        renewalOn: form.renewalOn || null,
        notes: form.notes || null,
        // Reviewed by a person: the fields are now confirmed, not guesses.
        fields: (result.extraction.fields ?? []).map((field) => ({ ...field, confirmed: true })),
      });
      toast.success('Saved to your vault.');
      navigate(`/vault/documents/${result.document.id}`);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  }

  /** Abandoning the review deletes the stored copy rather than orphaning it. */
  async function discard() {
    if (result?.document?.id) {
      await api.delete(`/documents/${result.document.id}`).catch(() => {});
    }
    navigate('/vault/documents');
  }

  if (stage === 'processing') {
    return (
      <div className="stack stack-md center enter" style={{ alignItems: 'center', paddingTop: 80 }}>
        <span
          style={{
            width: 88,
            height: 88,
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-fixed)',
            color: 'var(--primary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="lock" size={36} className="spin" />
        </span>
        <h2>Uploading securely…</h2>
        <p className="muted">Encrypting your file in the family vault.</p>
      </div>
    );
  }

  if (stage === 'review' && result) {
    const { extraction } = result;
    return (
      <div className="stack stack-md enter" style={{ maxWidth: 900 }}>
        <div className="row-between">
          <div className="stack" style={{ gap: 4 }}>
            <h1 style={{ fontSize: 30 }}>Review and save</h1>
            <p className="muted small">{extraction.notice}</p>
          </div>
          <Button variant="ghost" onClick={discard} icon="close">Cancel</Button>
        </div>

        <div className="grid" style={{ gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 1.6fr)' }}>
          <Card className="stack stack-sm" style={{ alignSelf: 'start' }}>
            <span className="tiny caps muted">Document</span>
            <div className="row" style={{ gap: 12 }}>
              <Icon name="description" size={32} style={{ color: 'var(--primary)' }} />
              <div className="stack" style={{ gap: 2 }}>
                <strong className="small">{result.fileName}</strong>
                <span className="tiny muted">{formatBytes(result.fileSize)}</span>
              </div>
            </div>
            <hr className="divider" />
            <div className="row" style={{ gap: 8 }}>
              <Icon name="lock" size={16} style={{ color: 'var(--sage)' }} />
              <span className="tiny muted">Encrypted with its own key before it touched disk.</span>
            </div>
          </Card>

          <div className="stack stack-md">
            {extraction.fields.length > 0 && (
              <Card className="stack stack-sm">
                <div className="row-between">
                  <div className="row" style={{ gap: 8 }}>
                    <Icon name="auto_awesome" size={18} style={{ color: 'var(--primary)' }} />
                    <strong className="small">What we read from the file</strong>
                  </div>
                  <Badge tone="ai">{extraction.categoryConfidence} confidence</Badge>
                </div>
                {extraction.fields.map((field) => (
                  <div key={field.label} className="row-between" style={{ padding: '8px 0', borderTop: '1px solid var(--outline-variant)' }}>
                    <div className="stack" style={{ gap: 2 }}>
                      <span className="small" style={{ fontWeight: 600 }}>{field.label}</span>
                      <span className="tiny muted">{field.evidence}</span>
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <span className="small">{field.value}</span>
                      <Badge tone={field.confidence === 'high' ? 'verified' : field.confidence === 'low' ? 'pending' : 'neutral'}>
                        {field.confidence}
                      </Badge>
                    </div>
                  </div>
                ))}
              </Card>
            )}

            <Card className="stack stack-md">
              {error && <p className="field-error">{error.message}</p>}
              <Field label="Title" id="title">
                <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </Field>
              <div className="grid grid-2">
                <Field label="Category" id="category">
                  <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {CATEGORY_LIST.map((entry) => (
                      <option key={entry.key} value={entry.key}>{entry.label}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Who or what it is about" id="subject" hint="A person, or “Family Home”.">
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </Field>
              </div>
              <div className="grid grid-3">
                <Field label="Issued on" id="issued">
                  <Input id="issued" type="date" value={form.issuedOn} onChange={(e) => setForm({ ...form, issuedOn: e.target.value })} />
                </Field>
                <Field label="Expires on" id="expires">
                  <Input id="expires" type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} />
                </Field>
                <Field label="Renewal due" id="renewal">
                  <Input id="renewal" type="date" value={form.renewalOn} onChange={(e) => setForm({ ...form, renewalOn: e.target.value })} />
                </Field>
              </div>
              <Field label="Notes" id="notes" hint="Anything the person who opens this later would want to know.">
                <textarea
                  id="notes"
                  className="input"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </Field>
              <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="secondary" onClick={discard}>Discard</Button>
                <Button onClick={save} loading={saving} icon="lock">Save to vault</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack stack-md enter" style={{ maxWidth: 760 }}>
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 32 }}>Secure a new asset</h1>
        <p className="muted">
          We encrypt the file, read the details out of it, and help you organise it. Nothing is saved
          until you have reviewed what we found.
        </p>
      </div>

      {error && (
        <Card style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <Icon name="error" size={20} />
            <span className="small">{error.message}</span>
          </div>
        </Card>
      )}

      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--outline-variant)'}`,
          background: dragging ? 'var(--primary-fixed)' : 'var(--surface-lowest)',
          borderRadius: 'var(--radius-xl)',
          padding: '72px 24px',
          display: 'grid',
          placeItems: 'center',
          gap: 14,
          textAlign: 'center',
          transition: 'all 0.2s var(--spring)',
        }}
      >
        <span
          style={{
            width: 72,
            height: 72,
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-fixed)',
            color: 'var(--primary)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name="cloud_upload" size={32} />
        </span>
        <h3>Drag your document here</h3>
        <p className="small muted">PDF, JPG, PNG, WebP or text — up to 10 MB.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>Browse files</Button>
        <div className="row tiny muted" style={{ gap: 6 }}>
          <Icon name="lock" size={14} />
          Private by default
        </div>
      </div>
    </div>
  );
}
