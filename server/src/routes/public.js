import { Router } from 'express';
import { z } from 'zod';
import { recordAudit } from '../lib/audit.js';
import { newId } from '../lib/crypto.js';
import { notFound } from '../lib/errors.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { QUESTIONS, scorePreparedness } from '../../../shared/preparedness.js';
import { leadPatchSchema, leadQuerySchema, leadSchema, preparednessSchema } from '../schemas.js';

/**
 * Everything the marketing site needs, and nothing else.
 *
 * Two rules hold here. The preparedness check stores nothing — answers are
 * scored and thrown away, so a visitor who does not get in touch leaves no
 * trace. And a lead is never joined to vault data: an enquiry is an enquiry,
 * not an account.
 */
export function publicRoutes(ctx) {
  const { db, limiter } = ctx;
  const router = Router();

  router.get('/preparedness/questions', (_req, res) => {
    res.json({
      questions: QUESTIONS.map((q) => ({
        key: q.key,
        question: q.question,
        help: q.help ?? null,
        options: q.options.map((o) => ({ value: o.value, label: o.label })),
      })),
      disclaimer:
        'Six questions, scored on our server. Nothing you enter here is stored, and the result is an indicative self-assessment rather than advice.',
    });
  });

  router.post(
    '/preparedness/score',
    limiter.limit({ name: 'preparedness', max: 30 }),
    validateBody(preparednessSchema),
    (req, res) => {
      // Deliberately stateless: scored and returned, never written down.
      res.json(scorePreparedness(req.body));
    },
  );

  router.post('/leads', limiter.limit({ name: 'leads', max: 5 }), validateBody(leadSchema), (req, res, next) => {
    try {
      const now = new Date().toISOString();
      const lead = {
        id: newId(),
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone ?? null,
        household: req.body.household ?? null,
        interests_json: JSON.stringify(req.body.interests ?? []),
        timeframe: req.body.timeframe ?? null,
        message: req.body.message ?? null,
        source: req.body.source,
        check_score: req.body.checkScore ?? null,
        ip: req.clientIp ?? null,
        user_agent: (req.get('user-agent') ?? '').slice(0, 300) || null,
        created_at: now,
        updated_at: now,
      };

      db.prepare(
        `INSERT INTO leads
           (id, name, email, phone, household, interests_json, timeframe, message,
            source, check_score, ip, user_agent, created_at, updated_at)
         VALUES
           (@id, @name, @email, @phone, @household, @interests_json, @timeframe, @message,
            @source, @check_score, @ip, @user_agent, @created_at, @updated_at)`,
      ).run(lead);

      ctx.logger.info('lead_received', { source: lead.source });

      // Deliberately says what actually happens next, rather than promising a
      // reply nothing in this deployment can send.
      res.status(201).json({
        ok: true,
        reference: lead.id.slice(0, 8).toUpperCase(),
        message:
          'Thank you — your enquiry has been recorded. Someone from the team will be in touch using the details you gave.',
      });
    } catch (err) {
      next(err);
    }
  });

  // ── Admin ────────────────────────────────────────────────────────────────

  router.get('/leads', requireAuth, requireRole('admin'), validateQuery(leadQuerySchema), (req, res) => {
    const { status, limit } = req.validatedQuery;
    const rows = db
      .prepare(
        `SELECT * FROM leads
          WHERE (@status IS NULL OR status = @status)
          ORDER BY created_at DESC
          LIMIT @limit`,
      )
      .all({ status: status ?? null, limit });

    const counts = db
      .prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status')
      .all();

    res.json({
      leads: rows.map(mapLead),
      counts: Object.fromEntries(counts.map((row) => [row.status, row.count])),
    });
  });

  router.patch(
    '/leads/:id',
    requireAuth,
    requireRole('admin'),
    validateBody(leadPatchSchema),
    (req, res, next) => {
      try {
        const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
        if (!existing) throw notFound('No such enquiry.');

        db.prepare('UPDATE leads SET status = @status, notes = @notes, updated_at = @now WHERE id = @id').run({
          id: existing.id,
          status: req.body.status ?? existing.status,
          notes: req.body.notes === undefined ? existing.notes : req.body.notes,
          now: new Date().toISOString(),
        });

        recordAudit(ctx, {
          userId: req.user.id,
          event: 'lead.updated',
          category: 'account',
          summary: `Enquiry from ${existing.name} marked ${req.body.status ?? existing.status}`,
          req,
          meta: { leadId: existing.id },
        });

        res.json({ lead: mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(existing.id)) });
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete('/leads/:id', requireAuth, requireRole('admin'), (req, res, next) => {
    try {
      const changes = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id).changes;
      if (!changes) throw notFound('No such enquiry.');
      recordAudit(ctx, {
        userId: req.user.id,
        event: 'lead.deleted',
        category: 'account',
        summary: 'Enquiry deleted',
        req,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

function mapLead(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    household: row.household,
    interests: JSON.parse(row.interests_json || '[]'),
    timeframe: row.timeframe,
    message: row.message,
    source: row.source,
    checkScore: row.check_score,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const leadStatuses = z.enum(['new', 'contacted', 'qualified', 'closed', 'archived']);
