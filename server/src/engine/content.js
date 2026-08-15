import { newId } from '../lib/crypto.js';

/**
 * The site's words, editable without a developer.
 *
 * The governing decision: **a row here is an override, never the only copy.**
 * The client compiles its own defaults into the bundle and merges whatever this
 * returns on top. So an empty table, an unreachable server, or a half-finished
 * edit all produce the same thing — the site as shipped. The admin cannot break
 * the public site from this screen, which is the property that matters when the
 * person editing is not an engineer.
 *
 * Draft and published are two columns on one row. Publishing is a single
 * UPDATE, so there is no window in which a reader could see half a change.
 */

/** Only these keys may be edited. An unknown key is rejected, not created. */
export const EDITABLE = [
  { key: 'brand.promise', kind: 'text', label: 'Headline promise' },
  { key: 'brand.tagline', kind: 'text', label: 'Tagline' },
  { key: 'brand.audience', kind: 'text', label: 'Who it is for' },
  { key: 'hero.title', kind: 'text', label: 'Hero headline' },
  { key: 'hero.subtitle', kind: 'text', label: 'Hero sub-headline' },
  { key: 'hero.cta', kind: 'text', label: 'Hero button' },
  { key: 'whyNow', kind: 'json', label: 'Why now — the five reasons' },
  { key: 'services', kind: 'json', label: 'The seven pillars' },
  { key: 'howItWorks', kind: 'json', label: 'How an engagement runs' },
  { key: 'assurances', kind: 'json', label: 'What you can hold us to' },
  { key: 'faqs', kind: 'json', label: 'Questions people ask' },
  { key: 'scenarios', kind: 'json', label: 'Illustrative scenarios' },
  { key: 'engagement', kind: 'json', label: 'Engagement tiers' },
  { key: 'legal.registration', kind: 'text', label: 'IRDAI registration line' },
  { key: 'legal.grievance', kind: 'text', label: 'Grievance address' },
  { key: 'contact.email', kind: 'text', label: 'Contact email' },
  { key: 'contact.phone', kind: 'text', label: 'Contact phone' },
];

const BY_KEY = new Map(EDITABLE.map((entry) => [entry.key, entry]));

export function isEditable(key) {
  return BY_KEY.has(key);
}

/** Seeds a row per editable key. Safe to run on every start. */
export function ensureContentRows(db, now = new Date().toISOString()) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO content_blocks (key, kind, label, updated_at) VALUES (?, ?, ?, ?)`,
  );
  const seed = db.transaction(() => {
    for (const entry of EDITABLE) insert.run(entry.key, entry.kind, entry.label, now);
  });
  seed();
}

/**
 * What the public site fetches: published values only, and only those that have
 * one. A key that has never been published is simply absent, and the client
 * keeps its compiled default.
 */
export function publishedContent(db) {
  const rows = db
    .prepare('SELECT key, kind, published_value FROM content_blocks WHERE published_value IS NOT NULL')
    .all();

  const content = {};
  for (const row of rows) {
    if (row.kind !== 'json') {
      content[row.key] = row.published_value;
      continue;
    }
    /* A malformed JSON override must not take the site's copy down with it.
       Skipping the key falls back to the compiled default, which is exactly
       what should happen to a value that cannot be parsed. */
    try {
      content[row.key] = JSON.parse(row.published_value);
    } catch {
      continue;
    }
  }
  return content;
}

/**
 * Everything the editor needs: both values, and whether they differ.
 *
 * Ordered by the EDITABLE list rather than by key, so the editor reads down the
 * site the way the site reads — hero, then the sections under it, then the
 * legal lines at the foot. Alphabetical order puts the grievance address next
 * to the hero headline, which is nobody's mental model of the page.
 */
export function contentForEditor(db) {
  const order = new Map(EDITABLE.map((entry, index) => [entry.key, index]));
  const rows = db
    .prepare('SELECT * FROM content_blocks')
    .all()
    .sort((a, b) => (order.get(a.key) ?? 999) - (order.get(b.key) ?? 999));

  return rows.map((row) => ({
    key: row.key,
    kind: row.kind,
    label: row.label,
    draft: row.draft_value,
    published: row.published_value,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    hasUnpublishedChanges: (row.draft_value ?? null) !== (row.published_value ?? null),
  }));
}

function logRevision(db, { key, action, value, note, userId, now }) {
  db.prepare(
    `INSERT INTO content_revisions (id, key, action, value, note, created_by, created_at)
     VALUES (@id, @key, @action, @value, @note, @created_by, @created_at)`,
  ).run({ id: newId(), key, action, value: value ?? null, note: note ?? null, created_by: userId ?? null, created_at: now });
}

/** Save a draft. Never touches what the public site is serving. */
export function saveDraft(db, { key, value, note, userId }) {
  const entry = BY_KEY.get(key);
  if (!entry) throw new Error(`not editable: ${key}`);
  if (entry.kind === 'json') JSON.parse(value); // Reject malformed JSON at the door.

  const now = new Date().toISOString();
  const run = db.transaction(() => {
    db.prepare(
      `UPDATE content_blocks SET draft_value = @value, updated_at = @now, updated_by = @user WHERE key = @key`,
    ).run({ value, now, user: userId ?? null, key });
    logRevision(db, { key, action: 'save', value, note, userId, now });
  });
  run();
  return { key, savedAt: now };
}

/** Promote the draft to live, in one statement. */
export function publish(db, { key, note, userId }) {
  if (!BY_KEY.has(key)) throw new Error(`not editable: ${key}`);
  const now = new Date().toISOString();

  const run = db.transaction(() => {
    const row = db.prepare('SELECT draft_value FROM content_blocks WHERE key = ?').get(key);
    if (!row) throw new Error(`no such block: ${key}`);
    db.prepare(
      `UPDATE content_blocks SET published_value = draft_value, published_at = @now, updated_at = @now WHERE key = @key`,
    ).run({ now, key });
    logRevision(db, { key, action: 'publish', value: row.draft_value, note, userId, now });
    return row.draft_value;
  });

  return { key, publishedAt: now, value: run() };
}

/**
 * Put an earlier revision back, live, immediately.
 *
 * Reverting writes both the draft and the published value, because a revert
 * that left the draft holding the bad copy would be re-published by the next
 * person who pressed the button.
 */
export function revert(db, { revisionId, userId }) {
  const now = new Date().toISOString();

  const run = db.transaction(() => {
    const revision = db.prepare('SELECT * FROM content_revisions WHERE id = ?').get(revisionId);
    if (!revision) throw new Error('no such revision');
    if (!BY_KEY.has(revision.key)) throw new Error(`not editable: ${revision.key}`);

    db.prepare(
      `UPDATE content_blocks
          SET draft_value = @value, published_value = @value, published_at = @now, updated_at = @now, updated_by = @user
        WHERE key = @key`,
    ).run({ value: revision.value, now, user: userId ?? null, key: revision.key });

    logRevision(db, {
      key: revision.key,
      action: 'revert',
      value: revision.value,
      note: `Reverted to the revision of ${revision.created_at}`,
      userId,
      now,
    });
    return revision.key;
  });

  return { key: run(), revertedAt: now };
}

/** Discard a draft, putting the live value back into the editor. */
export function discardDraft(db, { key, userId }) {
  if (!BY_KEY.has(key)) throw new Error(`not editable: ${key}`);
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE content_blocks SET draft_value = published_value, updated_at = @now, updated_by = @user WHERE key = @key`,
  ).run({ now, user: userId ?? null, key });
  return { key, discardedAt: now };
}

export function revisions(db, { key, limit = 50 }) {
  return db
    .prepare(
      `SELECT r.id, r.key, r.action, r.value, r.note, r.created_at, u.name AS author
         FROM content_revisions r
         LEFT JOIN users u ON u.id = r.created_by
        WHERE (@key IS NULL OR r.key = @key)
        ORDER BY r.created_at DESC
        LIMIT @limit`,
    )
    .all({ key: key ?? null, limit });
}
