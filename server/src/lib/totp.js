import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * RFC 6238 TOTP, implemented directly on node:crypto — an authenticator app is
 * the second factor the design calls for, and it needs no third-party service
 * and no network call to verify.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

export function generateSecret(bytes = 20) {
  return base32Encode(randomBytes(bytes));
}

export function totpCode(secret, atMs = Date.now(), step = 0) {
  const counter = Math.floor(atMs / 1000 / STEP_SECONDS) + step;
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

/**
 * Accepts the current code and one step either side, which covers ordinary
 * clock drift without meaningfully widening the window.
 */
export function verifyTotp(secret, token, atMs = Date.now()) {
  const candidate = String(token ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(candidate)) return false;

  for (const step of [-1, 0, 1]) {
    const expected = totpCode(secret, atMs, step);
    if (timingSafeEqual(Buffer.from(expected), Buffer.from(candidate))) return true;
  }
  return false;
}

/** The otpauth:// URI an authenticator app scans. */
export function otpauthUri({ secret, account, issuer = 'Heritage Ledger' }) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input) {
  const clean = String(input).toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid base32 character in secret.');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}
