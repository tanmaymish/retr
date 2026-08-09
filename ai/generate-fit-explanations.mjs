import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { chatJSON } from './lib/github-models.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const voice = readFileSync(join(here, 'prompts/voice.md'), 'utf8');
const profile = JSON.parse(readFileSync(join(here, 'profile.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(join(here, 'products.json'), 'utf8'));
const outPath = join(here, '..', 'app', 'src', 'data', 'ai', 'fit-explanations.json');

const schemaHint = `{
  "products": {
    "<product id>": {
      "why_matched": ["short factual bullet", "..."],
      "considerations": ["short factual bullet", "..."]
    }
  }
}`;

async function main() {
  const result = { products: {} };

  for (const product of catalog.products) {
    const user = [
      `User profile: ${JSON.stringify(profile)}`,
      `Need: ${catalog.need}, gap: ₹${(catalog.gap_inr / 10000000).toFixed(1)} Cr`,
      `Product being explained: ${JSON.stringify(product)}`,
      '',
      'Write 2-3 "why_matched" bullets (only if the product genuinely fits — cite the gap, term, cover, or premium against the profile) ' +
      'and 1-2 "considerations" bullets (exclusions, waiting periods, unverified/stale pricing — use the product\'s own exclusions/premium_verified fields, do not invent new caveats). ' +
      'If commission is true, one of the considerations or why_matched bullets must disclose it plainly, in one line, without editorializing.',
    ].join('\n');

    const parsed = await chatJSON({
      system: voice,
      user,
      schemaHint: '{ "why_matched": ["..."], "considerations": ["..."] }',
    });
    result.products[product.id] = parsed;
    console.log(`generated fit explanation for product ${product.id}`);
  }

  result.generated_at = new Date().toISOString();
  result.model = process.env.AI_MODEL || 'openai/gpt-4o-mini';
  result.profile_version = 'v18';
  result.rules_version = 'v4.2';

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('wrote', outPath);
}

await main();
