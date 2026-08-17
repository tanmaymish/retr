#!/usr/bin/env node
import { openDatabase } from '../src/db/index.js';
import { loadConfig } from '../src/config.js';
import { hashPassword, newId } from '../src/lib/crypto.js';
import pkg from 'pg';

const email = process.argv[2] || 'admin@akshayvriddhi.com';
const password = process.argv[3] || 'AdminPassword123!';
const name = 'Founders Admin';

async function seedLocalSQLite() {
  console.log('🌱 Seeding Admin account in local SQLite DB...');
  const config = loadConfig();
  const db = openDatabase(config);

  const normalized = email.toLowerCase();
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM users WHERE email_normalized = ?').get(normalized);
  if (existing) {
    db.prepare("UPDATE users SET password_hash = ?, role = 'admin', updated_at = ? WHERE id = ?")
      .run(passwordHash, now, existing.id);
    console.log(`✅ Local SQLite user updated: ${email} -> ADMIN`);
  } else {
    const id = newId();
    db.prepare(`
      INSERT INTO users (id, email, email_normalized, password_hash, name, role, password_changed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'admin', ?, ?, ?)
    `).run(id, email, normalized, passwordHash, name, now, now, now);
    console.log(`✅ Local SQLite user created: ${email} -> ADMIN`);
  }
  db.close();
}

async function seedNeonPostgres() {
  const dbUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_ThZNva4tybP0@ep-plain-dew-axuyme1t-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require";
  console.log('⚡ Seeding Admin account in Neon PostgreSQL DB...');
  
  const { Client } = pkg;
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    const normalized = email.toLowerCase();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const res = await client.query('SELECT id FROM users WHERE email_normalized = $1', [normalized]);
    if (res.rows.length > 0) {
      await client.query("UPDATE users SET password_hash = $1, role = 'admin', updated_at = $2 WHERE id = $3", [passwordHash, now, res.rows[0].id]);
      console.log(`✅ Neon PostgreSQL user updated: ${email} -> ADMIN`);
    } else {
      const id = newId();
      await client.query(`
        INSERT INTO users (id, email, email_normalized, password_hash, name, role, password_changed_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'admin', $6, $7, $8)
      `, [id, email, normalized, passwordHash, name, now, now, now]);
      console.log(`✅ Neon PostgreSQL user created: ${email} -> ADMIN`);
    }
  } catch (err) {
    console.error('⚠️ Neon seed notice:', err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await seedLocalSQLite();
  await seedNeonPostgres();
  console.log('\n🎉 Admin account credentials created/updated successfully!');
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Password: ${password}\n`);
}

main();
