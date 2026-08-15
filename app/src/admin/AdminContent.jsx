import { useEffect, useState } from 'react';
import { Badge, Button, Card, EmptyState, Icon, Spinner, useToast } from '../components/ui';
import { useApi } from '../lib/useApi';
import { api } from '../lib/api';
import { formatDateTime, relativeTime } from '../lib/format';

/**
 * The site's words, editable by the people whose words they are.
 *
 * Three properties this screen is built around, all of them about what happens
 * when the person editing is not an engineer:
 *
 * - **Saving is not publishing.** A draft changes nothing a visitor sees. The
 *   button that changes the live site says so and is the only one that does.
 * - **Nothing here can empty the site.** Each block falls back to the copy
 *   compiled into the bundle, so a blanked field or a broken structure means
 *   the original text, not a gap.
 * - **Every version is recoverable.** The history beside each block puts an
 *   earlier version back, live, in one click.
 */
export default function AdminContent() {
  const { data, loading, error, reload } = useApi('/admin/content');
  const [openKey, setOpenKey] = useState(null);

  if (loading) return <Spinner label="Loading the content" />;
  if (error) {
    return (
      <EmptyState icon="cloud_off" title="Content could not load">
        {error.message}
      </EmptyState>
    );
  }

  const blocks = data.blocks ?? [];
  const pending = blocks.filter((b) => b.hasUnpublishedChanges);

  return (
    <div className="stack stack-lg enter">
      <div className="stack" style={{ gap: 6 }}>
        <h1 style={{ fontSize: 30 }}>Content</h1>
        <p className="small muted" style={{ maxWidth: '68ch', lineHeight: 1.7 }}>
          Edit any block and save it as a draft. Nothing reaches the live site until you publish it,
          and anything published can be put back in one click. A block left empty falls back to the
          copy the site was built with, so nothing here can leave a blank on the page.
        </p>
      </div>

      {pending.length > 0 && (
        <Card className="row card-gold" style={{ gap: 12 }}>
          <Icon name="edit_note" size={20} style={{ color: 'var(--gold-ink)' }} />
          <span className="small">
            <strong>{pending.length} unpublished {pending.length === 1 ? 'draft' : 'drafts'}.</strong>{' '}
            The live site still shows the previous copy for {pending.map((b) => b.label).join(', ')}.
          </span>
        </Card>
      )}

      <div className="stack stack-sm">
        {blocks.map((block) => (
          <Block
            key={block.key}
            block={block}
            open={openKey === block.key}
            onToggle={() => setOpenKey(openKey === block.key ? null : block.key)}
            onChanged={reload}
          />
        ))}
      </div>
    </div>
  );
}

function Block({ block, open, onToggle, onChanged }) {
  const toast = useToast();
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(null);

  // The editor starts from the draft, falling back to what is live. An empty
  // box means "no override", which is a legitimate state, not a mistake.
  useEffect(() => {
    if (open) setValue(block.draft ?? block.published ?? '');
  }, [open, block.draft, block.published]);

  const isJson = block.kind === 'json';
  const invalid = isJson && value.trim() !== '' && !isParseable(value);

  async function run(label, work) {
    setBusy(true);
    try {
      await work();
      toast.success(label);
      onChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function showHistory() {
    if (history) return setHistory(null);
    try {
      const body = await api.get(`/admin/content/revisions?key=${encodeURIComponent(block.key)}`);
      setHistory(body.revisions ?? []);
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <Card className="stack stack-sm">
      <button type="button" className="admin-block-head" onClick={onToggle}>
        <span className="stack" style={{ gap: 3, minWidth: 0 }}>
          <span className="row" style={{ gap: 9 }}>
            <strong style={{ fontFamily: 'var(--font-heading)', fontSize: 15 }}>{block.label}</strong>
            {block.hasUnpublishedChanges && <Badge tone="gold">Draft</Badge>}
            {isJson && <span className="tiny muted">structured</span>}
          </span>
          <span className="tiny muted">
            {block.publishedAt
              ? `Live since ${relativeTime(block.publishedAt)}`
              : 'Never published — the site is using its built-in copy'}
          </span>
        </span>
        <Icon name={open ? 'expand_less' : 'expand_more'} size={20} />
      </button>

      {open && (
        <div className="stack stack-sm">
          <textarea
            className="admin-editor"
            rows={isJson ? 14 : 4}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            spellCheck={!isJson}
            aria-label={block.label}
            aria-invalid={invalid}
          />

          {invalid && (
            <p className="field-error">
              That is not valid structured content, so it cannot be saved. Check for a missing comma
              or bracket — or press Discard to start again from what is live.
            </p>
          )}

          <div className="row wrap" style={{ gap: 10 }}>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || invalid}
              onClick={() =>
                run('Draft saved. The live site is unchanged.', () =>
                  api.put(`/admin/content/${block.key}`, { value }),
                )
              }
            >
              Save draft
            </Button>

            <Button
              size="sm"
              icon="publish"
              disabled={busy || invalid}
              onClick={() =>
                run('Published. The live site now shows this.', async () => {
                  await api.put(`/admin/content/${block.key}`, { value });
                  await api.post(`/admin/content/${block.key}/publish`, {});
                })
              }
            >
              Publish to the live site
            </Button>

            <Button
              size="sm"
              variant="ghost"
              disabled={busy || !block.hasUnpublishedChanges}
              onClick={() =>
                run('Draft discarded.', () => api.post(`/admin/content/${block.key}/discard`, {}))
              }
            >
              Discard draft
            </Button>

            <Button size="sm" variant="ghost" onClick={showHistory}>
              {history ? 'Hide history' : 'History'}
            </Button>
          </div>

          {history && <History entries={history} onChanged={onChanged} />}
        </div>
      )}
    </Card>
  );
}

function History({ entries, onChanged }) {
  const toast = useToast();
  if (entries.length === 0) return <p className="small muted">No changes recorded yet.</p>;

  async function revert(entry) {
    try {
      await api.post(`/admin/content/revert/${entry.id}`, {});
      toast.success('Reverted. That version is live again.');
      onChanged();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div className="stack" style={{ gap: 0, marginTop: 4 }}>
      {entries.map((entry) => (
        <div key={entry.id} className="admin-revision">
          <span className="stack" style={{ gap: 2, minWidth: 0 }}>
            <span className="row" style={{ gap: 8 }}>
              <Badge tone={entry.action === 'publish' ? 'gold' : undefined}>{entry.action}</Badge>
              <span className="tiny muted">
                {formatDateTime(entry.created_at)}
                {entry.author ? ` · ${entry.author}` : ''}
              </span>
            </span>
            <span className="tiny muted admin-revision-preview">{preview(entry.value)}</span>
          </span>
          {/* Every recorded version can be restored, including a draft that was
              never published — sometimes the good copy is the one somebody
              saved and then talked themselves out of. */}
          <Button size="sm" variant="ghost" onClick={() => revert(entry)}>
            Put this back
          </Button>
        </div>
      ))}
    </div>
  );
}

function isParseable(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

function preview(value) {
  if (!value) return 'empty';
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > 110 ? `${flat.slice(0, 110)}…` : flat;
}
