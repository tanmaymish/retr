import Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Opens the database and applies the schema. Every statement in the app is a
 * prepared statement with bound parameters — no SQL is ever built by string
 * concatenation from user input.
 */
export function openDatabase(config) {
  const db = new Database(config.databaseFile);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  // Durability over raw speed: NORMAL is safe under WAL and survives process
  // crashes; a power loss can lose the last transaction, which for this
  // workload is an acceptable trade against fsync-per-write.
  db.pragma('synchronous = NORMAL');

  db.exec(readFileSync(join(here, 'schema.sql'), 'utf8'));

  return db;
}

/** Deletes sessions that expired or were revoked more than a day ago. */
export function pruneExpiredSessions(db, now = new Date()) {
  const cutoff = new Date(now.getTime() - 24 * 3_600_000).toISOString();
  return db
    .prepare(
      `DELETE FROM sessions
        WHERE absolute_expires_at < @now
           OR idle_expires_at < @now
           OR (revoked_at IS NOT NULL AND revoked_at < @cutoff)`,
    )
    .run({ now: now.toISOString(), cutoff }).changes;
}
