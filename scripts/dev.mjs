#!/usr/bin/env node
/**
 * Runs the API and the Vite dev server together, and takes both down when
 * either one exits — so a crashed server never leaves an orphan client running
 * against nothing.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const processes = [
  { name: 'api', cwd: resolve(root, 'server'), args: ['run', 'dev'], colour: '[36m' },
  { name: 'web', cwd: resolve(root, 'app'), args: ['run', 'dev'], colour: '[35m' },
];

const children = processes.map(({ name, cwd, args, colour }) => {
  const child = spawn('npm', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });

  const prefix = `${colour}[${name}][0m `;
  for (const stream of [child.stdout, child.stderr]) {
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      for (const line of chunk.split('\n')) {
        if (line.trim()) process.stdout.write(prefix + line + '\n');
      }
    });
  }

  child.on('exit', (code) => {
    process.stdout.write(`${prefix}exited with code ${code}\n`);
    shutdown();
  });

  return child;
});

let shuttingDown = false;
function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill('SIGTERM');
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

console.log('\nHeritage Ledger — API on http://localhost:4000, app on http://localhost:5173\n');
