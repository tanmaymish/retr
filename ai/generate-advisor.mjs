import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chatJSON } from './lib/github-models.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const voice = readFileSync(join(here, 'prompts/voice.md'), 'utf8');
const profile = JSON.parse(readFileSync(join(here, 'profile.json'), 'utf8'));
const outPath = join(here, '..', 'app', 'src', 'data', 'ai', 'advisor.json');

const user = [
  `Client profile for an advisor meeting in 40 minutes: ${JSON.stringify(profile)}`,
  '',
  'Write the advisor co-pilot briefing for this client. Produce:',
  '- "discussion_points": exactly 3 items, each { "title": short heading, "detail": 1-2 sentences }, ranked by ' +
    'urgency, covering the life event, any goal or funding conflict, and the emergency reserve — grounded only in the given numbers.',
  '- "silence_note": one sentence naming how many of the 3 points need no new product purchase, if that is true from the data; ' +
    'otherwise state plainly that a product is likely needed.',
  '- "changed_since": an array of { "field": string, "from": string, "to": string } for whatever in the profile plausibly ' +
    'changed because of the life event (dependents count, expenses, required cover, goal count) — use the profile\'s own numbers, do not invent unrelated fields.',
].join('\n');

async function main() {
  const parsed = await chatJSON({
    system: voice,
    user,
    schemaHint: `{
  "discussion_points": [{ "title": "...", "detail": "..." }],
  "silence_note": "...",
  "changed_since": [{ "field": "...", "from": "...", "to": "..." }]
}`,
  });

  const result = {
    ...parsed,
    generated_at: new Date().toISOString(),
    model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
    profile_version: 'v18',
    rules_version: 'v4.2',
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('wrote', outPath);
}

await main();
