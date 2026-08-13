import { unlink, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  decryptDocument,
  deriveMasterKey,
  encryptDocument,
  newId,
  randomToken,
  sha256,
} from '../lib/crypto.js';
import { notFound } from '../lib/errors.js';

/**
 * Document storage. Ciphertext goes to disk under a random name; the database
 * holds metadata and the per-document decryption parameters. Nothing readable
 * ever touches the filesystem, and the storage name reveals nothing about the
 * document or its owner.
 */
export function createVaultService(ctx) {
  const { db, config, logger } = ctx;
  const masterKey = deriveMasterKey(config.documentKeySource);

  async function create({ userId, buffer, filename, mimeType, meta }) {
    const id = newId();
    const storageName = `${randomToken(24)}.enc`;
    const { ciphertext, salt, iv, authTag } = encryptDocument({
      masterKey,
      plaintext: buffer,
      documentId: id,
      userId,
    });

    await writeFile(join(config.documentDir, storageName), ciphertext, { mode: 0o600 });

    const now = new Date().toISOString();
    const row = {
      id,
      user_id: userId,
      title: meta.title,
      category: meta.category,
      subject: meta.subject ?? null,
      source: meta.source ?? 'user_uploaded',
      issued_on: meta.issuedOn ?? null,
      expires_on: meta.expiresOn ?? null,
      renewal_on: meta.renewalOn ?? null,
      fields_json: JSON.stringify(meta.fields ?? []),
      notes: meta.notes ?? null,
      original_name: filename,
      mime_type: mimeType,
      size_bytes: buffer.length,
      sha256: sha256(buffer),
      storage_name: storageName,
      enc_salt: salt,
      enc_iv: iv,
      enc_tag: authTag,
      created_at: now,
      updated_at: now,
    };

    try {
      db.prepare(
        `INSERT INTO documents
           (id, user_id, title, category, subject, source, issued_on, expires_on, renewal_on,
            fields_json, notes, original_name, mime_type, size_bytes, sha256, storage_name,
            enc_salt, enc_iv, enc_tag, created_at, updated_at)
         VALUES
           (@id, @user_id, @title, @category, @subject, @source, @issued_on, @expires_on, @renewal_on,
            @fields_json, @notes, @original_name, @mime_type, @size_bytes, @sha256, @storage_name,
            @enc_salt, @enc_iv, @enc_tag, @created_at, @updated_at)`,
      ).run(row);
    } catch (err) {
      // Never leave an orphaned ciphertext behind if the metadata insert fails.
      await unlink(join(config.documentDir, storageName)).catch(() => {});
      throw err;
    }

    return mapDocument(row);
  }

  /** Decrypts one document. Callers must have already checked authorisation. */
  async function readBytes(document) {
    const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(document.id);
    if (!row) throw notFound('Document not found.');
    const ciphertext = await readFile(join(config.documentDir, row.storage_name));
    return decryptDocument({
      masterKey,
      ciphertext,
      salt: row.enc_salt,
      iv: row.enc_iv,
      authTag: row.enc_tag,
      documentId: row.id,
      userId: row.user_id,
    });
  }

  async function remove({ userId, documentId }) {
    const row = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(documentId, userId);
    if (!row) return false;
    db.prepare('DELETE FROM documents WHERE id = ?').run(documentId);
    await unlink(join(config.documentDir, row.storage_name)).catch((err) => {
      // The row is gone, so the document is unreachable either way; a stale
      // ciphertext is a cleanup problem, not a correctness one.
      logger.warn('ciphertext_unlink_failed', { documentId, error: err.message });
    });
    return true;
  }

  function list(userId, { category, search, limit = 200 } = {}) {
    const rows = db
      .prepare(
        `SELECT * FROM documents
          WHERE user_id = @userId
            AND (@category IS NULL OR category = @category)
            AND (@search IS NULL OR lower(title) LIKE @like OR lower(COALESCE(subject, '')) LIKE @like)
          ORDER BY created_at DESC
          LIMIT @limit`,
      )
      .all({
        userId,
        category: category ?? null,
        search: search ?? null,
        like: search ? `%${search.toLowerCase()}%` : null,
        limit,
      });
    return rows.map(mapDocument);
  }

  function get(userId, documentId) {
    const row = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(documentId, userId);
    return row ? mapDocument(row) : null;
  }

  function getById(documentId) {
    const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(documentId);
    return row ? mapDocument(row) : null;
  }

  function update(userId, documentId, patch) {
    const existing = db
      .prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
      .get(documentId, userId);
    if (!existing) return null;

    const next = {
      title: patch.title ?? existing.title,
      category: patch.category ?? existing.category,
      subject: patch.subject === undefined ? existing.subject : patch.subject,
      source: patch.source ?? existing.source,
      issued_on: patch.issuedOn === undefined ? existing.issued_on : patch.issuedOn,
      expires_on: patch.expiresOn === undefined ? existing.expires_on : patch.expiresOn,
      renewal_on: patch.renewalOn === undefined ? existing.renewal_on : patch.renewalOn,
      fields_json: patch.fields ? JSON.stringify(patch.fields) : existing.fields_json,
      notes: patch.notes === undefined ? existing.notes : patch.notes,
      updated_at: new Date().toISOString(),
      id: documentId,
      user_id: userId,
    };

    db.prepare(
      `UPDATE documents
          SET title = @title, category = @category, subject = @subject, source = @source,
              issued_on = @issued_on, expires_on = @expires_on, renewal_on = @renewal_on,
              fields_json = @fields_json, notes = @notes, updated_at = @updated_at
        WHERE id = @id AND user_id = @user_id`,
    ).run(next);

    return mapDocument({ ...existing, ...next });
  }

  return { create, readBytes, remove, list, get, getById, update };
}

export function mapDocument(row) {
  return {
    id: row.id,
    ownerId: row.user_id,
    title: row.title,
    category: row.category,
    subject: row.subject,
    source: row.source,
    issuedOn: row.issued_on,
    expiresOn: row.expires_on,
    renewalOn: row.renewal_on,
    fields: safeParse(row.fields_json, []),
    notes: row.notes,
    originalName: row.original_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    sha256: row.sha256,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function safeParse(json, fallback) {
  try {
    const value = JSON.parse(json);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}
