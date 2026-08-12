#!/usr/bin/env node
/**
 * Promotes or demotes an account.
 *
 *   npm --prefix server run role -- shiv@example.com admin
 *   npm --prefix server run role -- shiv@example.com member
 *
 * Roles are set here rather than through the API on purpose: there is no
 * self-service path to admin, so no request — however crafted — can grant it.
 */
import { openDatabase } from '../src/db/index.js';
import { loadConfig } from '../src/config.js';

const [email, role = 'admin'] = process.argv.slice(2);

if (!email) {
  console.error('Usage: node scripts/set-role.mjs <email> [admin|member]');
  process.exit(1);
}
if (!['admin', 'member'].includes(role)) {
  console.error(`Unknown role "${role}". Use admin or member.`);
  process.exit(1);
}

const db = openDatabase(loadConfig());
const user = db.prepare('SELECT id, email, role FROM users WHERE email_normalized = ?').get(email.toLowerCase());

if (!user) {
  console.error(`No account found for ${email}. Create the account first, then run this again.`);
  process.exit(1);
}

db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, new Date().toISOString(), user.id);
console.log(`${user.email}: ${user.role} → ${role}`);

// A role change takes effect on the next request, so existing sessions are
// left alone deliberately — this is a privilege grant, not a security event
// that should sign anyone out.
db.close();
