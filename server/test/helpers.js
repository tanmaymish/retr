import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/lib/logger.js';

/**
 * Boots a real server on an ephemeral port against a throwaway database, and
 * returns a client that carries cookies and the CSRF header the way a browser
 * would. Tests therefore exercise the actual middleware stack — headers, CSRF,
 * cookies and all — rather than calling handlers directly.
 */
export async function startTestServer(overrides = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'heritage-test-'));
  const config = loadConfig({
    NODE_ENV: 'test',
    DATA_DIR: dir,
    DATABASE_FILE: join(dir, 'test.db'),
    SESSION_SECRET: 'test-session-secret-that-is-long-enough-000',
    DOCUMENT_KEY: 'test-document-key-that-is-long-enough-00000',
    LOG_LEVEL: 'silent',
    CORS_ORIGINS: '',
    ...overrides,
  });
  // loadConfig resolves DATA_DIR against the server root; point it at the temp
  // directory absolutely so nothing is written into the repo.
  config.dataDir = dir;
  config.databaseFile = join(dir, 'test.db');
  config.documentDir = join(dir, 'documents');
  const { mkdirSync } = await import('node:fs');
  mkdirSync(config.documentDir, { recursive: true });

  const { app, ctx } = createApp({ config, logger: createLogger('silent') });

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const instance = {
    base,
    ctx,
    config,
    client: () => createClient(base),
    async close() {
      await new Promise((resolve) => server.close(resolve));
      ctx.db.close();
      ctx.limiter.stop();
      rmSync(dir, { recursive: true, force: true });
    },
  };

  return instance;
}

/** A cookie-jar client: one per simulated browser. */
export function createClient(base) {
  const cookies = new Map();

  function cookieHeader() {
    return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  function absorb(response) {
    const raw = response.headers.getSetCookie?.() ?? [];
    for (const line of raw) {
      const [pair] = line.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index).trim();
      const value = pair.slice(index + 1).trim();
      if (value === '') cookies.delete(name);
      else cookies.set(name, value);
    }
  }

  async function request(method, path, { body, headers = {}, raw = false } = {}) {
    const init = { method, headers: { ...headers }, redirect: 'manual' };
    const cookie = cookieHeader();
    if (cookie) init.headers.cookie = cookie;

    // The browser-equivalent behaviour: echo the CSRF cookie in the header —
    // unless the test deliberately supplied its own.
    const csrf = cookies.get('av_csrf');
    if (csrf && !['GET', 'HEAD'].includes(method) && !init.headers['x-csrf-token']) {
      init.headers['x-csrf-token'] = csrf;
    }

    if (body instanceof FormData) {
      init.body = body;
    } else if (body !== undefined) {
      init.headers['content-type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    const response = await fetch(`${base}${path}`, init);
    absorb(response);

    if (raw) return response;
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    return { status: response.status, headers: response.headers, body: data };
  }

  return {
    cookies,
    get: (path, options) => request('GET', path, options),
    post: (path, body, options) => request('POST', path, { ...options, body }),
    patch: (path, body, options) => request('PATCH', path, { ...options, body }),
    put: (path, body, options) => request('PUT', path, { ...options, body }),
    delete: (path, body, options) => request('DELETE', path, { ...options, body }),
    dropCsrf: () => cookies.delete('av_csrf'),
  };
}

let counter = 0;

/** Registers a fresh account and returns its signed-in client. */
export async function signUp(server, overrides = {}) {
  counter += 1;
  const client = server.client();
  const credentials = {
    name: `Test Person ${counter}`,
    email: `person${counter}-${Date.now()}@example.test`,
    password: 'correct horse battery staple',
    ...overrides,
  };
  const response = await client.post('/api/auth/register', credentials);
  if (response.status !== 201) {
    throw new Error(`Registration failed: ${response.status} ${JSON.stringify(response.body)}`);
  }
  return { client, credentials, user: response.body.user };
}

/** A minimal but genuinely valid PDF, so upload and extraction run for real. */
export function samplePdf(text = 'Policy Holder: Meera Sharma Expiry: 14 Mar 2032') {
  const content = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

export function uploadForm(buffer, { filename = 'policy.pdf', type = 'application/pdf', meta } = {}) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), filename);
  if (meta) form.append('meta', JSON.stringify(meta));
  return form;
}
