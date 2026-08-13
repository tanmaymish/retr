import express from 'express';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { openDatabase, pruneExpiredSessions } from './db/index.js';
import { createLogger } from './lib/logger.js';
import { loadConfig } from './config.js';
import { createSessionService } from './services/sessions.js';
import { createVaultService } from './services/vault.js';
import { createAccessService } from './services/access.js';
import { createNotificationService } from './services/notifications.js';
import { createRateLimiter } from './middleware/rateLimit.js';
import { clientIp, cors, securityHeaders } from './middleware/security.js';
import { csrfProtection } from './middleware/csrf.js';
import { loadSession } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errors.js';
import { unauthorized } from './lib/errors.js';
import { authRoutes } from './routes/auth.js';
import { accountRoutes } from './routes/account.js';
import { documentRoutes } from './routes/documents.js';
import { familyRoutes, inviteRoutes } from './routes/family.js';
import { emergencyRoutes } from './routes/emergency.js';
import { overviewRoutes } from './routes/overview.js';
import { newsRoutes } from './routes/news.js';
import { publicRoutes } from './routes/public.js';
import { CATEGORIES } from './engine/categories.js';

/**
 * Builds the application. Everything it needs is passed in or derived from
 * config, and nothing is read from module scope — which is what lets the tests
 * run several isolated instances in one process.
 */
export function createApp(options = {}) {
  const config = options.config ?? loadConfig();
  const logger = options.logger ?? createLogger(config.logLevel);
  const db = options.db ?? openDatabase(config);

  const ctx = { config, logger, db };
  ctx.sessions = createSessionService(ctx);
  ctx.vault = createVaultService(ctx);
  ctx.access = createAccessService(ctx);
  ctx.notifications = createNotificationService(ctx);
  ctx.limiter = createRateLimiter(config);

  pruneExpiredSessions(db);

  const app = express();
  app.disable('x-powered-by');
  // Only trust proxy headers when the deployment actually sits behind one.
  app.set('trust proxy', config.trustProxy ? 1 : false);

  app.use(clientIp(config));
  app.use(securityHeaders(config));
  app.use(cors(config));
  app.use(express.json({ limit: '256kb' }));
  app.use(cookieParser());
  app.use(loadSession(ctx));
  app.use(ctx.limiter.limit({ name: 'global', max: config.rateLimit.globalMax }));

  const api = express.Router();
  api.use(csrfProtection(ctx));

  api.get('/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Public reference data — no user data, safe before sign-in.
  api.get('/reference/categories', (_req, res) => {
    res.json({ categories: CATEGORIES });
  });

  api.use('/auth', authRoutes(ctx));
  api.use('/invites', inviteRoutes(ctx));
  // The marketing surface: public endpoints, plus the admin-only lead inbox
  // which guards itself.
  api.use('/', publicRoutes(ctx));
  api.use('/', newsRoutes(ctx));

  // Past this point a session must have cleared its MFA challenge. A
  // half-authenticated session can reach the auth routes above and nothing else.
  api.use(requireCompleteSession);

  api.use('/account', accountRoutes(ctx));
  api.use('/documents', documentRoutes(ctx));
  api.use('/family', familyRoutes(ctx));
  api.use('/emergency', emergencyRoutes(ctx));
  api.use('/', overviewRoutes(ctx));

  app.use('/api', api);

  // In production the same server hands out the built client, which keeps the
  // app same-origin and means no CORS and no cross-site cookies at all.
  const indexFile = join(config.clientDir, 'index.html');
  if (existsSync(indexFile)) {
    app.use(
      express.static(config.clientDir, {
        index: false,
        maxAge: '1h',
        setHeaders(res, filePath) {
          // Hashed asset filenames may be cached hard; index.html never is.
          if (/\/assets\//.test(filePath)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        },
      }),
    );
    // Marketing routes are prerendered at build time (app/scripts/prerender.mjs)
    // so a crawler gets that page's own title, description and canonical rather
    // than the shared shell. Anything else falls back to the SPA entry point.
    app.get(/^(?!\/api\/).*/, (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');

      const slug = req.path === '/' ? 'index' : req.path.replace(/^\/|\/$/g, '');
      if (/^[a-z0-9-]{1,60}$/.test(slug)) {
        const prerendered = join(config.clientDir, `${slug}.html`);
        if (existsSync(prerendered)) {
          res.sendFile(prerendered);
          return;
        }
      }

      res.sendFile(indexFile);
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler(ctx));

  app.locals.ctx = ctx;
  return { app, ctx };
}

function requireCompleteSession(req, _res, next) {
  if (req.session?.mfa_pending) {
    return next(unauthorized('Finish the two-factor step to continue.'));
  }
  next();
}
