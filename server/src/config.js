import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
export const serverRoot = resolve(here, '..');
export const repoRoot = resolve(serverRoot, '..');

const truthy = new Set(['1', 'true', 'yes', 'on']);

function bool(value, fallback) {
  if (value === undefined || value === '') return fallback;
  return truthy.has(String(value).toLowerCase());
}

function int(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) throw new Error(`Expected an integer, received "${value}"`);
  return n;
}

function list(value, fallback) {
  if (!value) return fallback;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Reads configuration from the environment and fails fast on anything that
 * would be unsafe in production. Secrets are never defaulted in production:
 * a missing SESSION_SECRET or DOCUMENT_KEY there is a startup error, not a
 * silently generated ephemeral value.
 */
export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const problems = [];

  function secret(name, minBytes = 32) {
    const raw = env[name];
    if (raw) {
      if (Buffer.from(raw, 'utf8').length < minBytes) {
        problems.push(`${name} must be at least ${minBytes} characters.`);
      }
      return raw;
    }
    if (isProduction) {
      problems.push(`${name} is required in production. Generate one with: openssl rand -base64 48`);
      return '';
    }
    // Development and test only: an ephemeral secret. Restarting invalidates
    // every session and every stored document, which is fine outside prod.
    return randomBytes(48).toString('base64');
  }

  const sessionSecret = secret('SESSION_SECRET');
  const documentKeySource = secret('DOCUMENT_KEY');

  const dataDir = resolve(serverRoot, env.DATA_DIR || 'data');
  const config = {
    nodeEnv,
    isProduction,
    isTest,
    port: int(env.PORT, 4000),
    host: env.HOST || '0.0.0.0',
    trustProxy: bool(env.TRUST_PROXY, false),
    dataDir,
    databaseFile: env.DATABASE_FILE
      ? resolve(serverRoot, env.DATABASE_FILE)
      : resolve(dataDir, 'akshayvridhi.db'),
    documentDir: resolve(dataDir, 'documents'),
    sessionSecret,
    documentKeySource,
    // Where the browser app is served from. Same-origin in production (the API
    // serves the built SPA), so CORS stays off unless explicitly configured.
    corsOrigins: list(env.CORS_ORIGINS, isProduction ? [] : ['http://localhost:5173']),
    cookie: {
      name: env.SESSION_COOKIE_NAME || 'av_session',
      csrfName: env.CSRF_COOKIE_NAME || 'av_csrf',
      secure: bool(env.COOKIE_SECURE, isProduction),
      sameSite: env.COOKIE_SAMESITE || 'lax',
      domain: env.COOKIE_DOMAIN || undefined,
    },
    session: {
      // Sliding window: a session dies this long after the last request…
      idleTtlMs: int(env.SESSION_IDLE_TTL_MINUTES, 60 * 12) * 60_000,
      // …and unconditionally this long after it was created.
      absoluteTtlMs: int(env.SESSION_ABSOLUTE_TTL_HOURS, 24 * 14) * 3_600_000,
    },
    auth: {
      maxFailedLogins: int(env.MAX_FAILED_LOGINS, 8),
      lockoutMs: int(env.LOCKOUT_MINUTES, 15) * 60_000,
      minPasswordLength: int(env.MIN_PASSWORD_LENGTH, 12),
      allowRegistration: bool(env.ALLOW_REGISTRATION, true),
    },
    uploads: {
      maxBytes: int(env.MAX_UPLOAD_BYTES, 10 * 1024 * 1024),
      maxDocumentsPerUser: int(env.MAX_DOCUMENTS_PER_USER, 200),
    },
    rateLimit: {
      // Disabled in tests unless a test explicitly turns it on, so integration
      // tests do not trip over each other's request counts.
      enabled: bool(env.RATE_LIMIT_ENABLED, !isTest),
      windowMs: int(env.RATE_LIMIT_WINDOW_MS, 60_000),
      globalMax: int(env.RATE_LIMIT_GLOBAL_MAX, 300),
      authMax: int(env.RATE_LIMIT_AUTH_MAX, 10),
      aiMax: int(env.RATE_LIMIT_AI_MAX, 12),
    },
    ai: {
      // Optional. Without a token the narrative endpoints fall back to the
      // deterministic engine copy — the app is fully functional without AI.
      token: env.MODELS_TOKEN || env.GITHUB_TOKEN || '',
      model: env.AI_MODEL || 'openai/gpt-4o-mini',
      endpoint: env.AI_ENDPOINT || 'https://models.github.ai/inference/chat/completions',
      timeoutMs: int(env.AI_TIMEOUT_MS, 20_000),
    },
    clientDir: resolve(repoRoot, env.CLIENT_DIR || 'app/dist'),
    logLevel: env.LOG_LEVEL || (isTest ? 'silent' : 'info'),
  };

  if (config.cookie.sameSite && !['lax', 'strict', 'none'].includes(config.cookie.sameSite)) {
    problems.push('COOKIE_SAMESITE must be one of: lax, strict, none.');
  }
  if (isProduction && !config.cookie.secure) {
    problems.push('COOKIE_SECURE must not be disabled in production.');
  }
  if (config.auth.minPasswordLength < 8) {
    problems.push('MIN_PASSWORD_LENGTH must be at least 8.');
  }

  if (problems.length) {
    throw new Error(`Invalid configuration:\n  - ${problems.join('\n  - ')}`);
  }

  for (const dir of [config.dataDir, config.documentDir]) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  return config;
}
