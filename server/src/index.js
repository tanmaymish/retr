import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLogger } from './lib/logger.js';
import { pruneExpiredSessions } from './db/index.js';
import { pruneTraffic } from './engine/traffic.js';

const config = loadConfig();
const logger = createLogger(config.logLevel);

let started;
try {
  started = createApp({ config, logger });
} catch (err) {
  logger.error('startup_failed', { message: err.message });
  process.exit(1);
}

const { app, ctx } = started;

const server = app.listen(config.port, config.host, () => {
  logger.info('server_started', {
    port: config.port,
    env: config.nodeEnv,
    client: ctx.config.clientDir,
  });
});

// Housekeeping: expired sessions are already rejected on use; this only keeps
// the table from growing without bound.
const sweeper = setInterval(() => {
  try {
    const removed = pruneExpiredSessions(ctx.db);
    if (removed) logger.debug('sessions_pruned', { removed });

    /* Raw page views and events have a ninety-day life; the daily rollup they
       feed is kept for ever. Traffic history therefore survives as counts while
       the row-level detail — the only part carrying any re-identification risk
       — does not accumulate. */
    const traffic = pruneTraffic(ctx.db, { days: ctx.config.trafficRetentionDays });
    if (traffic.views || traffic.events) logger.debug('traffic_pruned', traffic);
  } catch (err) {
    logger.warn('housekeeping_failed', { error: err.message });
  }
}, 3_600_000);
sweeper.unref();

function shutdown(signal) {
  logger.info('shutting_down', { signal });
  server.close(() => {
    try {
      ctx.db.close();
    } catch {
      // Already closed; nothing to do.
    }
    process.exit(0);
  });
  // Do not hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
