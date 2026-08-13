import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  hkdfSync,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// scrypt parameters. N=2^15 with r=8, p=1 costs ~32 MB and ~100 ms per hash on
// commodity hardware — comfortably above the OWASP floor while staying inside
// Node's default 32 MB memory cap for scrypt.
const SCRYPT = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };

export const newId = () => randomUUID();

/** Hashes a password with a per-password random salt. Format is self-describing so parameters can be raised later without invalidating old hashes. */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(normalize(password), salt, SCRYPT.keylen, SCRYPT);
  return [
    'scrypt',
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString('base64'),
    Buffer.from(derived).toString('base64'),
  ].join('$');
}

/** Constant-time password check. Never throws on malformed stored hashes — it returns false. */
export async function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, N, r, p, saltB64, hashB64] = parts;
  try {
    const salt = Buffer.from(saltB64, 'base64');
    const expected = Buffer.from(hashB64, 'base64');
    const derived = await scryptAsync(normalize(password), salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      maxmem: SCRYPT.maxmem,
    });
    return timingSafeEqual(Buffer.from(derived), expected);
  } catch {
    return false;
  }
}

/** Unicode-normalise so the same typed password matches across input methods. */
function normalize(password) {
  return String(password).normalize('NFKC');
}

/** 256 bits of entropy, URL-safe. Used for session and CSRF tokens. */
export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Session tokens are stored only as HMACs. A database leak therefore does not
 * hand out live sessions, and lookups stay a single indexed equality check.
 */
export function hmac(secret, value) {
  return createHmac('sha256', secret).update(String(value)).digest('base64url');
}

export function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

export function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Vault encryption. Every document gets its own key, derived from the master
 * key with HKDF over a random per-document salt, so one leaked document key
 * cannot decrypt anything else. AES-256-GCM binds the ciphertext to the
 * document id and owner via additional authenticated data: a row swapped
 * between users in the database fails to decrypt rather than opening.
 */
export function encryptDocument({ masterKey, plaintext, documentId, userId }) {
  const salt = randomBytes(16);
  const key = Buffer.from(hkdfSync('sha256', masterKey, salt, 'akshayvridhi:document', 32));
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(Buffer.from(`${userId}:${documentId}`, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return {
    ciphertext,
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function decryptDocument({ masterKey, ciphertext, salt, iv, authTag, documentId, userId }) {
  const key = Buffer.from(
    hkdfSync('sha256', masterKey, Buffer.from(salt, 'base64'), 'akshayvridhi:document', 32),
  );
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAAD(Buffer.from(`${userId}:${documentId}`, 'utf8'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

/** Stretches the configured passphrase into a 32-byte master key. */
export function deriveMasterKey(source) {
  return createHash('sha256').update(`akshayvridhi:vault:${source}`).digest();
}
