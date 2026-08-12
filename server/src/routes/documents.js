import { Router } from 'express';
import multer from 'multer';
import { recordAudit } from '../lib/audit.js';
import { newId } from '../lib/crypto.js';
import { badRequest, notFound, unsupportedMediaType, conflict } from '../lib/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { extractDocumentDetails } from '../engine/extraction.js';
import { categoryLabel } from '../engine/categories.js';
import { documentMetaSchema, documentPatchSchema, documentQuerySchema, shareSchema } from '../schemas.js';

/**
 * Accepted types, with the byte signature each one must actually start with.
 * The browser-supplied content type is a hint, not evidence: a .exe renamed to
 * .pdf is rejected here, not on the way back out.
 */
const ACCEPTED = {
  'application/pdf': { ext: 'pdf', magic: [[0x25, 0x50, 0x44, 0x46]] },
  'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  'image/png': { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] },
  'text/plain': { ext: 'txt', magic: null },
};

export function documentRoutes(ctx) {
  const { db, config, vault, access } = ctx;
  const router = Router();

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.uploads.maxBytes, files: 1, fields: 20 },
    fileFilter(_req, file, callback) {
      if (!ACCEPTED[file.mimetype]) {
        callback(unsupportedMediaType('Upload a PDF, JPG, PNG, WebP or text file.'));
        return;
      }
      callback(null, true);
    },
  });

  router.use(requireAuth);

  router.get('/', validateQuery(documentQuerySchema), (req, res) => {
    const { category, search, limit } = req.validatedQuery;
    const documents = vault.list(req.user.id, { category, search, limit });
    res.json({ documents: documents.map((doc) => withShareCount(db, doc)) });
  });

  router.post('/', upload.single('file'), async (req, res, next) => {
    try {
      if (!req.file) throw badRequest('Choose a file to secure.');

      const count = db
        .prepare('SELECT COUNT(*) AS count FROM documents WHERE user_id = ?')
        .get(req.user.id).count;
      if (count >= config.uploads.maxDocumentsPerUser) {
        throw conflict(`This vault holds the maximum of ${config.uploads.maxDocumentsPerUser} documents.`);
      }

      assertMagicBytes(req.file);

      const extraction = extractDocumentDetails({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
      });

      // Anything the client sent alongside the file wins over what we guessed.
      const submitted = parseMeta(req.body?.meta);
      const meta = {
        ...extraction.suggestion,
        ...submitted,
        source: submitted.source ?? extraction.source,
        fields: submitted.fields ?? extraction.fields,
      };

      const parsed = documentMetaSchema.safeParse(meta);
      if (!parsed.success) {
        throw badRequest('The document details are incomplete.', {
          fields: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.') || '_', i.message])),
        });
      }

      const document = await vault.create({
        userId: req.user.id,
        buffer: req.file.buffer,
        filename: req.file.originalname,
        mimeType: req.file.mimetype,
        meta: parsed.data,
      });

      recordAudit(ctx, {
        userId: req.user.id,
        event: 'document.uploaded',
        category: 'documents',
        summary: `Document uploaded: ${document.title}`,
        req,
        meta: { documentId: document.id, category: document.category },
      });

      res.status(201).json({
        document: withShareCount(db, document),
        extraction: {
          fields: extraction.fields,
          categoryConfidence: extraction.categoryConfidence,
          textFound: extraction.textFound,
          notice: extraction.notice,
          suggestion: extraction.suggestion,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', (req, res, next) => {
    try {
      const document = vault.getById(req.params.id);
      access.requireDocumentAccess({ document, viewerId: req.user.id });
      const permission = access.permissionForDocument({ document, viewerId: req.user.id });

      res.json({
        document: withShareCount(db, document),
        permission,
        shares: permission.via === 'owner' ? listShares(db, document.id) : undefined,
      });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', validateBody(documentPatchSchema), (req, res, next) => {
    try {
      const updated = vault.update(req.user.id, req.params.id, req.body);
      if (!updated) throw notFound('Document not found.');

      recordAudit(ctx, {
        userId: req.user.id,
        event: 'document.updated',
        category: 'documents',
        summary: `Details updated: ${updated.title}`,
        req,
        meta: { documentId: updated.id, changed: Object.keys(req.body) },
      });
      res.json({ document: withShareCount(db, updated) });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const existing = vault.get(req.user.id, req.params.id);
      if (!existing) throw notFound('Document not found.');

      await vault.remove({ userId: req.user.id, documentId: req.params.id });
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'document.deleted',
        category: 'documents',
        summary: `Document removed: ${existing.title}`,
        req,
        meta: { documentId: existing.id },
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  /** Streams the decrypted bytes. Every read is logged, including trustee reads. */
  router.get('/:id/file', async (req, res, next) => {
    try {
      const document = vault.getById(req.params.id);
      const download = req.query.disposition === 'attachment';
      const permission = access.requireDocumentAccess({
        document,
        viewerId: req.user.id,
        download,
      });

      const bytes = await vault.readBytes(document);

      if (permission.via !== 'owner') {
        recordAudit(ctx, {
          userId: document.ownerId,
          actorLabel: req.user.name,
          event: download ? 'document.downloaded' : 'document.viewed',
          category: 'sharing',
          summary: `${req.user.name} ${download ? 'downloaded' : 'opened'} ${document.title}`,
          req,
          meta: { documentId: document.id, via: permission.via },
        });
      }

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Length', String(bytes.length));
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader(
        'Content-Disposition',
        `${download ? 'attachment' : 'inline'}; filename="${sanitiseFilename(document.originalName)}"`,
      );
      // The file is user-supplied: never let the browser guess its type, and
      // never let it run as script in this origin.
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.send(bytes);
    } catch (err) {
      next(err);
    }
  });

  // ── Sharing ──────────────────────────────────────────────────────────────

  router.get('/:id/shares', (req, res, next) => {
    try {
      const document = vault.get(req.user.id, req.params.id);
      if (!document) throw notFound('Document not found.');
      res.json({ shares: listShares(db, document.id) });
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/shares', validateBody(shareSchema), (req, res, next) => {
    try {
      const document = vault.get(req.user.id, req.params.id);
      if (!document) throw notFound('Document not found.');

      const member = access.getMember(req.user.id, req.body.memberId);
      if (!member) throw badRequest('That person is not in your family list.');
      if (member.status === 'revoked') throw badRequest('That person’s access has been revoked.');

      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO document_shares (id, user_id, document_id, member_id, can_download, expires_at, granted_at)
         VALUES (@id, @userId, @documentId, @memberId, @canDownload, @expiresAt, @grantedAt)
         ON CONFLICT (document_id, member_id) DO UPDATE SET
           can_download = excluded.can_download,
           expires_at = excluded.expires_at,
           granted_at = excluded.granted_at,
           revoked_at = NULL`,
      ).run({
        id: newId(),
        userId: req.user.id,
        documentId: document.id,
        memberId: member.id,
        canDownload: req.body.canDownload ? 1 : 0,
        expiresAt: req.body.expiresAt ?? null,
        grantedAt: now,
      });

      ctx.notifications.record({
        userId: req.user.id,
        channel: 'in_app',
        subject: `Shared: ${document.title}`,
        body: `${member.name} can now ${req.body.canDownload ? 'view and download' : 'view'} ${document.title}.`,
      });
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'share.granted',
        category: 'sharing',
        summary: `Permission granted: ${document.title} — shared with ${member.name} (${member.relationship.replace('_', ' ')})`,
        req,
        meta: { documentId: document.id, memberId: member.id, canDownload: req.body.canDownload },
      });

      res.status(201).json({ shares: listShares(db, document.id) });
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id/shares/:memberId', (req, res, next) => {
    try {
      const document = vault.get(req.user.id, req.params.id);
      if (!document) throw notFound('Document not found.');

      const changed = db
        .prepare(
          `UPDATE document_shares SET revoked_at = ?
            WHERE document_id = ? AND member_id = ? AND user_id = ? AND revoked_at IS NULL`,
        )
        .run(new Date().toISOString(), document.id, req.params.memberId, req.user.id).changes;
      if (!changed) throw notFound('That share does not exist.');

      const member = access.getMember(req.user.id, req.params.memberId);
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'share.revoked',
        category: 'sharing',
        summary: `Access revoked: ${document.title} — ${member?.name ?? 'a family member'} can no longer see it`,
        req,
        meta: { documentId: document.id, memberId: req.params.memberId },
      });
      res.json({ shares: listShares(db, document.id) });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function listShares(db, documentId) {
  return db
    .prepare(
      `SELECT s.id, s.member_id, s.can_download, s.granted_at, s.expires_at,
              m.name, m.relationship, m.status
         FROM document_shares s
         JOIN members m ON m.id = s.member_id
        WHERE s.document_id = ? AND s.revoked_at IS NULL
        ORDER BY s.granted_at DESC`,
    )
    .all(documentId)
    .map((row) => ({
      id: row.id,
      memberId: row.member_id,
      name: row.name,
      relationship: row.relationship,
      memberStatus: row.status,
      canDownload: Boolean(row.can_download),
      grantedAt: row.granted_at,
      expiresAt: row.expires_at,
    }));
}

function withShareCount(db, document) {
  const shared = db
    .prepare('SELECT COUNT(*) AS count FROM document_shares WHERE document_id = ? AND revoked_at IS NULL')
    .get(document.id).count;
  return { ...document, categoryLabel: categoryLabel(document.category), sharedWithCount: shared };
}

function parseMeta(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw badRequest('The document details were not valid JSON.');
  }
}

function assertMagicBytes(file) {
  const spec = ACCEPTED[file.mimetype];
  if (!spec?.magic) return;
  const header = file.buffer.subarray(0, 8);
  const ok = spec.magic.some((signature) => signature.every((byte, index) => header[index] === byte));
  if (!ok) {
    throw unsupportedMediaType(
      `That file says it is ${file.mimetype}, but its contents are not. Upload the original file.`,
    );
  }
}

/** Strips anything that could break out of the Content-Disposition header. */
function sanitiseFilename(name) {
  return String(name).replace(/[^A-Za-z0-9._ -]/g, '_').slice(0, 100) || 'document';
}
