// Minimal client for GitHub Models (https://docs.github.com/en/github-models) —
// an OpenAI-compatible chat completions API, free at low rate limits for any
// repo with `permissions: models: read`, authenticated with the GITHUB_TOKEN
// GitHub Actions already provides (no extra secret needed in CI).
const ENDPOINT = 'https://models.github.ai/inference/chat/completions';
const DEFAULT_MODEL = process.env.AI_MODEL || 'openai/gpt-4o-mini';

export async function chatJSON({ system, user, model = DEFAULT_MODEL, schemaHint }) {
  const token = process.env.GITHUB_TOKEN || process.env.MODELS_TOKEN;
  if (!token) {
    throw new Error(
      'No token found. Set GITHUB_TOKEN (in Actions, add `permissions: models: read`) ' +
      'or MODELS_TOKEN (a PAT with models:read) for local runs.'
    );
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: schemaHint ? `${user}\n\nRespond with JSON only, matching this shape:\n${schemaHint}` : user },
  ];

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub Models request failed: ${res.status} ${res.statusText} — ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('GitHub Models returned no content: ' + JSON.stringify(data).slice(0, 500));

  try {
    return JSON.parse(content);
  } catch {
    throw new Error('Model did not return valid JSON: ' + content.slice(0, 500));
  }
}
