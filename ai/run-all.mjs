// Runs all three generators in sequence so a single GitHub Action step (or
// local `node ai/run-all.mjs`) refreshes every AI-driven screen's content.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const scripts = ['generate-advisor.mjs', 'generate-fit-explanations.mjs', 'generate-faq.mjs'];

for (const script of scripts) {
  console.log(`\n=== ${script} ===`);
  await import(join(here, script).startsWith('file:') ? join(here, script) : `file://${join(here, script)}`);
}
