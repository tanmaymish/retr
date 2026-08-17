#!/usr/bin/env node
/**
 * Initialises Neon PostgreSQL schema for Heritage Ledger / Akshay Vriddhi.
 */
import pkg from 'pg';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { Client } = pkg;
const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(here, '..', 'src', 'db', 'schema.pg.sql');

const connectionString = process.env.DATABASE_URL || process.argv[2];

if (!connectionString) {
  console.error('Usage: DATABASE_URL=<url> node scripts/init-neon.mjs OR node scripts/init-neon.mjs <url>');
  process.exit(1);
}

async function run() {
  console.log('⚡ Connecting to Neon PostgreSQL...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Neon database successfully!');

    console.log('📜 Applying database schema...');
    const sql = readFileSync(schemaPath, 'utf8');
    await client.query(sql);
    console.log('🎉 Schema applied successfully! All 18 tables are initialized.');

    // Verify table creation
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    
    console.log(`\n📊 Total Public Tables in Neon Database (${res.rows.length}):`);
    res.rows.forEach(r => console.log(`   - ${r.table_name}`));

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
