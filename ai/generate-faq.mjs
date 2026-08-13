import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chatJSON } from './lib/github-models.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const voice = readFileSync(join(here, 'prompts/voice.md'), 'utf8');
const profile = JSON.parse(readFileSync(join(here, 'profile.json'), 'utf8'));
const outPath = join(here, '..', 'app', 'src', 'data', 'ai', 'faq.json');

const QUESTIONS = [
  "If my income stopped today, how long could my family manage?",
  "Why is my protection gap ₹1.2 Cr and not some other number?",
  "Am I saving enough for retirement?",
  "Is ₹5L of health cover enough for my family?",
  "What happens to my goals if I can't fund all of them?",
  "Is my emergency reserve big enough?",
];

const user = [
  `User profile: ${JSON.stringify(profile)}`,
  '',
  'For each of these questions, write a grounded answer (2-4 sentences) using only the numbers in the profile:',
  ...QUESTIONS.map((q, i) => `${i + 1}. ${q}`),
].join('\n');

async function main() {
  const parsed = await chatJSON({
    system: voice,
    user,
    schemaHint: '{ "answers": ["answer to question 1", "answer to question 2", "..."] }',
  });

  const answers = parsed.answers || [];
  const items = QUESTIONS.map((question, i) => ({ question, answer: answers[i] || '' }));

  const result = {
    items,
    generated_at: new Date().toISOString(),
    model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
    profile_version: 'v18',
    rules_version: 'v4.2',
    note: 'Answers are generated ahead of time by a scheduled pipeline against a fixed demo profile — not live, freeform chat.',
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('wrote', outPath);
}

await main();
