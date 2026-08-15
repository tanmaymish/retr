import { Router } from 'express';
import { recordAudit } from '../lib/audit.js';
import { badRequest, notFound } from '../lib/errors.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  contentForEditor,
  discardDraft,
  isEditable,
  publish,
  publishedContent,
  revert,
  revisions,
  saveDraft,
} from '../engine/content.js';
import { leadFunnel, recordBatch, trafficSummary } from '../engine/traffic.js';
import { collectSchema, contentPublishSchema, contentSaveSchema, statsQuerySchema } from '../schemas.js';

/**
 * The admin surface, and the two public endpoints that feed it.
 *
 * The two public ones come first because they are the ones that must never
 * fail in a way the visitor notices:
 *
 * - `POST /collect` answers 202 and does the write afterwards. A visitor is
 *   never made to wait on our bookkeeping, and a collector that is having a bad
 *   day slows nothing down.
 * - `GET /content` serves published overrides. If it 500s or never answers, the
 *   site renders the copy compiled into its own bundle. There is no failure
 *   mode here that produces a blank page.
 */
export function adminRoutes(ctx) {
  const { db, limiter, log } = ctx;
  const router = Router();

  /* ── Public ───────────────────────────────────────────────────────────── */

  router.post(
    '/collect',
    limiter.limit({ name: 'collect', max: 120 }),
    validateBody(collectSchema),
    (req, res) => {
      /* Answer first. The batch is small and the write is synchronous, but the
         visitor's page has no interest in either — and a failure to record a
         page view is never worth surfacing to the person who was browsing. */
      res.status(202).json({ accepted: true });

      try {
        recordBatch(db, {
          views: req.body.views,
          events: req.body.events,
          ip: req.clientIp,
          userAgent: req.get('user-agent'),
        });
      } catch (error) {
        log?.warn?.({ err: error }, 'collector write failed');
      }
    },
  );

  router.get('/content', (_req, res) => {
    try {
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
      res.json({ content: publishedContent(db) });
    } catch (error) {
      /* An empty override set is a valid answer and the site handles it by
         using its own copy. Failing the request would be worse than saying
         "nothing to override", so this degrades rather than errors. */
      log?.warn?.({ err: error }, 'content read failed');
      res.json({ content: {} });
    }
  });

  /* ── Admin ────────────────────────────────────────────────────────────── */

  const admin = Router();
  admin.use(requireAuth, requireRole('admin'));

  admin.get('/overview', validateQuery(statsQuerySchema), (req, res) => {
    res.json({
      traffic: trafficSummary(db, { days: req.query.days }),
      leads: leadFunnel(db, { days: req.query.days }),
      content: {
        blocks: db.prepare('SELECT COUNT(*) AS count FROM content_blocks').get().count,
        unpublished: contentForEditor(db).filter((b) => b.hasUnpublishedChanges).length,
      },
    });
  });

  admin.get('/traffic', validateQuery(statsQuerySchema), (req, res) => {
    res.json(trafficSummary(db, { days: req.query.days }));
  });

  admin.get('/content', (_req, res) => {
    res.json({ blocks: contentForEditor(db) });
  });

  admin.get('/content/revisions', (req, res) => {
    const key = typeof req.query.key === 'string' ? req.query.key : null;
    res.json({ revisions: revisions(db, { key }) });
  });

  admin.put('/content/:key', validateBody(contentSaveSchema), (req, res, next) => {
    try {
      if (!isEditable(req.params.key)) return next(notFound('That is not an editable block.'));
      const result = saveDraft(db, {
        key: req.params.key,
        value: req.body.value,
        note: req.body.note,
        userId: req.user.id,
      });
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'content.draft_saved',
        category: 'account',
        summary: `Saved a draft of ${req.params.key}`,
        req,
      });
      res.json(result);
    } catch (error) {
      if (error instanceof SyntaxError) return next(badRequest('That is not valid JSON.'));
      next(error);
    }
  });

  admin.post('/content/:key/publish', validateBody(contentPublishSchema), (req, res, next) => {
    try {
      if (!isEditable(req.params.key)) return next(notFound('That is not an editable block.'));
      const result = publish(db, { key: req.params.key, note: req.body.note, userId: req.user.id });
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'content.published',
        category: 'account',
        summary: `Published ${req.params.key} to the live site`,
        req,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  admin.post('/content/:key/discard', (req, res, next) => {
    try {
      if (!isEditable(req.params.key)) return next(notFound('That is not an editable block.'));
      res.json(discardDraft(db, { key: req.params.key, userId: req.user.id }));
    } catch (error) {
      next(error);
    }
  });

  admin.post('/content/revert/:revisionId', (req, res, next) => {
    try {
      const result = revert(db, { revisionId: req.params.revisionId, userId: req.user.id });
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'content.reverted',
        category: 'account',
        summary: `Reverted ${result.key} to an earlier revision`,
        req,
      });
      res.json(result);
    } catch (error) {
      if (error.message === 'no such revision') return next(notFound('No such revision.'));
      next(error);
    }
  });

  /**
   * Every lead, as a spreadsheet.
   *
   * The founders will want this in a CRM eventually, and until then the honest
   * answer is a file they can open. Streamed as text/csv with the fields
   * quoted, because a message with a comma in it is the normal case.
   */
  admin.get('/leads.csv', (_req, res) => {
    const rows = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    const columns = [
      'created_at', 'name', 'email', 'phone', 'source', 'status',
      'household', 'timeframe', 'check_score', 'message', 'notes',
    ];

    // A field starting with =, +, - or @ is executed as a formula by Excel and
    // Sheets. Prefixing with a quote makes the cell text, which is what it is.
    const cell = (value) => {
      const text = value === null || value === undefined ? '' : String(value);
      const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };

    res.set('Content-Type', 'text/csv; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="akshayvriddhi-leads-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send([columns.join(','), ...rows.map((row) => columns.map((c) => cell(row[c])).join(','))].join('\n'));
  });

  router.use('/admin', admin);
  return router;
}
