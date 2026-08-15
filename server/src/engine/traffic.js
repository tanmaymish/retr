import { createHash, randomBytes } from 'node:crypto';
import { newId } from '../lib/crypto.js';

/**
 * Site traffic: how it is counted, and what is deliberately not counted.
 *
 * This is a first-party collector. Nothing is sent to a third party, no script
 * is loaded from anyone else's domain, and there is no cookie — which means no
 * consent banner, and nothing to leak.
 *
 * Counting visitors without identifying them is the whole trick. A visitor is
 * a hash of coarse request attributes (address, user agent, the day) with a
 * server-side secret that rotates daily. Two page views from one person on one
 * day collapse to one visitor; the same person tomorrow is a different hash,
 * and nothing here can be joined back to a real identity — not by us, and not
 * by anyone who ends up with a copy of the database.
 */

/* The salt lives in memory and changes when the process restarts. A restart
   therefore over-counts visitors slightly on the day it happens, which is the
   right way round: a durable salt would make the hashes durable too. */
const SALT = randomBytes(32).toString('hex');

export function dayOf(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function visitorHash({ ip, userAgent, day }) {
  return createHash('sha256').update(`${SALT}|${day}|${ip ?? ''}|${userAgent ?? ''}`).digest('hex').slice(0, 32);
}

const DEVICES = new Set(['mobile', 'tablet', 'desktop']);

/** The referrer's host, or null. A full URL can carry a query string. */
export function referrerHost(referrer) {
  if (!referrer) return null;
  try {
    return new URL(referrer).hostname.replace(/^www\./, '').slice(0, 120) || null;
  } catch {
    return null;
  }
}

/**
 * Write a batch of collected hits.
 *
 * One transaction for the whole batch: a partial write is worse than no write,
 * and better-sqlite3 is synchronous so this is the cheap option rather than the
 * expensive one. The rollup is updated in the same transaction, which is what
 * lets the raw rows be deleted later without losing the history.
 */
export function recordBatch(db, { views = [], events = [], visitor, day, ip, userAgent }) {
  const hash = visitor ?? visitorHash({ ip, userAgent, day: day ?? dayOf() });
  const stamp = day ?? dayOf();
  const now = new Date().toISOString();

  const insertView = db.prepare(
    `INSERT INTO page_views (id, path, referrer_host, device, country, visitor_hash, dwell_ms, created_at)
     VALUES (@id, @path, @referrer_host, @device, @country, @visitor_hash, @dwell_ms, @created_at)`,
  );
  const insertEvent = db.prepare(
    `INSERT INTO site_events (id, name, path, props_json, visitor_hash, created_at)
     VALUES (@id, @name, @path, @props_json, @visitor_hash, @created_at)`,
  );
  const markVisitor = db.prepare(
    `INSERT OR IGNORE INTO daily_visitors (day, path, visitor_hash) VALUES (?, ?, ?)`,
  );
  const bumpStats = db.prepare(
    `INSERT INTO daily_stats (day, path, views, visitors) VALUES (@day, @path, 1, @visitors)
       ON CONFLICT(day, path) DO UPDATE SET
         views = views + 1,
         visitors = visitors + @visitors`,
  );

  const write = db.transaction(() => {
    for (const view of views) {
      insertView.run({
        id: newId(),
        path: view.path,
        referrer_host: referrerHost(view.referrer),
        device: DEVICES.has(view.device) ? view.device : null,
        country: view.country ?? null,
        visitor_hash: hash,
        dwell_ms: Number.isInteger(view.dwellMs) ? view.dwellMs : null,
        created_at: now,
      });

      // `changes` is 1 only the first time this visitor is seen on this path
      // today, which is exactly when the visitor count should move.
      const firstToday = markVisitor.run(stamp, view.path, hash).changes;
      bumpStats.run({ day: stamp, path: view.path, visitors: firstToday });
    }

    for (const event of events) {
      insertEvent.run({
        id: newId(),
        name: event.name,
        path: event.path ?? null,
        props_json: event.props ? JSON.stringify(event.props) : null,
        visitor_hash: hash,
        created_at: now,
      });
    }
  });

  write();
  return { views: views.length, events: events.length };
}

/**
 * Delete raw rows older than the retention window.
 *
 * The rollup is never touched. That is the point of having one: traffic history
 * survives for ever as counts, while the row-level detail — which is the only
 * part with any re-identification risk at all — has a short life.
 */
export function pruneTraffic(db, { days = 90, now = new Date() } = {}) {
  const cutoff = new Date(now.getTime() - days * 86_400_000).toISOString();
  const cutoffDay = cutoff.slice(0, 10);

  const run = db.transaction(() => ({
    views: db.prepare('DELETE FROM page_views WHERE created_at < ?').run(cutoff).changes,
    events: db.prepare('DELETE FROM site_events WHERE created_at < ?').run(cutoff).changes,
    visitors: db.prepare('DELETE FROM daily_visitors WHERE day < ?').run(cutoffDay).changes,
  }));

  return run();
}

/** Totals, the day-by-day series, and the leaderboards, for a window of days. */
export function trafficSummary(db, { days = 30, now = new Date() } = {}) {
  const from = new Date(now.getTime() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const rawFrom = new Date(now.getTime() - (days - 1) * 86_400_000).toISOString();

  const totals = db
    .prepare('SELECT COALESCE(SUM(views), 0) AS views, COALESCE(SUM(visitors), 0) AS visitors FROM daily_stats WHERE day >= ?')
    .get(from);

  const series = db
    .prepare(
      `SELECT day, SUM(views) AS views, SUM(visitors) AS visitors
         FROM daily_stats WHERE day >= ? GROUP BY day ORDER BY day`,
    )
    .all(from);

  const pages = db
    .prepare(
      `SELECT path, SUM(views) AS views, SUM(visitors) AS visitors
         FROM daily_stats WHERE day >= ? GROUP BY path ORDER BY views DESC LIMIT 25`,
    )
    .all(from);

  /* Referrers, devices and events come from the raw tables, so they only cover
     the retention window. The dashboard says so rather than implying the
     numbers reach back as far as the totals do. */
  const referrers = db
    .prepare(
      `SELECT COALESCE(referrer_host, 'direct') AS source, COUNT(*) AS views
         FROM page_views WHERE created_at >= ? GROUP BY source ORDER BY views DESC LIMIT 15`,
    )
    .all(rawFrom);

  const devices = db
    .prepare(
      `SELECT COALESCE(device, 'unknown') AS device, COUNT(*) AS views
         FROM page_views WHERE created_at >= ? GROUP BY device ORDER BY views DESC`,
    )
    .all(rawFrom);

  const events = db
    .prepare(
      `SELECT name, COUNT(*) AS count FROM site_events
        WHERE created_at >= ? GROUP BY name ORDER BY count DESC LIMIT 25`,
    )
    .all(rawFrom);

  return { days, from, totals, series, pages, referrers, devices, events };
}

/** How enquiries are arriving, and what became of them. */
export function leadFunnel(db, { days = 30, now = new Date() } = {}) {
  const from = new Date(now.getTime() - (days - 1) * 86_400_000).toISOString();
  return {
    byStatus: db
      .prepare('SELECT status, COUNT(*) AS count FROM leads GROUP BY status ORDER BY count DESC')
      .all(),
    bySource: db
      .prepare('SELECT source, COUNT(*) AS count FROM leads WHERE created_at >= ? GROUP BY source ORDER BY count DESC')
      .all(from),
    recent: db.prepare('SELECT COUNT(*) AS count FROM leads WHERE created_at >= ?').get(from).count,
    total: db.prepare('SELECT COUNT(*) AS count FROM leads').get().count,
  };
}
