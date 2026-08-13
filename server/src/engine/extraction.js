import { inflateSync } from 'node:zlib';
import { CATEGORY_KEYS } from './categories.js';

/**
 * Smart upload: read what we can out of the file itself, and be honest about
 * the rest.
 *
 * Every field comes back with the evidence it was drawn from and a confidence,
 * and nothing is saved until the owner has reviewed it. A guess presented as a
 * fact is worse than an empty field, so low-confidence guesses are returned
 * marked as such rather than silently written.
 */

const CATEGORY_HINTS = {
  identity: ['passport', 'aadhaar', 'aadhar', 'pan card', 'driving licence', 'driver licence', 'birth certificate', 'voter', 'national id', 'visa'],
  insurance: ['insurance', 'policy', 'premium', 'sum assured', 'cover note', 'mediclaim', 'term plan', 'assured'],
  property: ['deed', 'sale agreement', 'lease', 'rent agreement', 'mortgage', 'khata', 'property tax', 'title'],
  financial: ['bank', 'statement', 'demat', 'mutual fund', 'portfolio', 'loan', 'fixed deposit', 'account number', 'invoice'],
  medical: ['medical', 'prescription', 'diagnosis', 'discharge summary', 'blood group', 'lab report', 'vaccination'],
  education: ['degree', 'transcript', 'marksheet', 'certificate of completion', 'diploma', 'convocation', 'b.sc', 'b.tech'],
  vehicle: ['registration certificate', 'rc book', 'vehicle', 'chassis', 'odometer', 'puc', 'motor'],
  legal: ['will', 'testament', 'power of attorney', 'trust deed', 'affidavit', 'notary', 'succession'],
  memories: ['letter', 'photograph', 'album', 'diary', 'memoir'],
};

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * @param {object} input
 * @param {Buffer} input.buffer     the uploaded bytes
 * @param {string} input.filename   original filename
 * @param {string} input.mimeType
 */
export function extractDocumentDetails({ buffer, filename, mimeType }) {
  const text = readText(buffer, mimeType);
  const haystack = `${filename} ${text}`.toLowerCase();

  const category = inferCategory(haystack);
  const title = inferTitle(filename, text);
  const dates = findDates(text);
  const fields = [];

  const provider = findLabelled(text, ['insurer', 'provider', 'issued by', 'company', 'bank', 'authority']);
  if (provider) fields.push(field('Provider', provider, 'medium', 'Read from the document text.'));

  const holder = findLabelled(text, ['policy holder', 'policyholder', 'name of insured', 'holder', 'account holder', 'name']);
  if (holder) fields.push(field('Holder', holder, 'medium', 'Read from the document text.'));

  const number = findLabelled(text, ['policy no', 'policy number', 'account no', 'account number', 'registration no', 'certificate no']);
  if (number) fields.push(field('Reference number', number, 'medium', 'Read from the document text.'));

  const amount = findAmount(text);
  if (amount) fields.push(field('Amount', amount, 'low', 'The largest currency figure on the page — check it is the one you meant.'));

  const expiry = dates.expiry ?? null;
  const renewal = dates.renewal ?? null;
  const issued = dates.issued ?? null;

  if (expiry) fields.push(field('Expires on', expiry, 'high', 'Found next to the word "expiry" or "valid until".'));
  if (renewal) fields.push(field('Renewal date', renewal, 'high', 'Found next to the word "renewal" or "due".'));
  if (issued) fields.push(field('Issued on', issued, 'medium', 'Found next to the word "issued" or "date of issue".'));

  const extractedAnything = fields.length > 0 || category.confidence !== 'none';

  return {
    // What the review screen pre-fills. Nothing here is saved until confirmed.
    suggestion: {
      title,
      category: category.key,
      subject: holder ?? null,
      issuedOn: issued,
      expiresOn: expiry,
      renewalOn: renewal,
    },
    fields,
    categoryConfidence: category.confidence,
    source: extractedAnything ? 'auto_extracted' : 'user_uploaded',
    textFound: text.length > 0,
    // Said plainly on the review screen when it applies.
    notice: text.length
      ? 'We read these details from the document. Check each one before saving.'
      : 'We could not read text out of this file, so nothing was filled in for you. Scanned images and photos usually need the details typed in.',
  };
}

function field(label, value, confidence, evidence) {
  return { label, value: String(value).slice(0, 200), confidence, evidence, confirmed: false };
}

/**
 * Text extraction without a PDF library: plain text is read directly, and PDF
 * content streams are inflated and stripped of their text-showing operators.
 * It handles ordinary generated PDFs; scans have no text layer and correctly
 * come back empty rather than fabricated.
 */
function readText(buffer, mimeType) {
  try {
    if (mimeType.startsWith('text/')) return buffer.toString('utf8').slice(0, 200_000);
    if (mimeType === 'application/pdf') return readPdfText(buffer);
  } catch {
    // Extraction is best-effort by design: a malformed file must not fail the
    // upload, it just means the owner types the details in.
  }
  return '';
}

function readPdfText(buffer) {
  const chunks = [];
  const raw = buffer.toString('latin1');
  const streamPattern = /stream\r?\n([\s\S]*?)endstream/g;
  let match;
  let budget = 60; // cap the work a single upload can cost

  while ((match = streamPattern.exec(raw)) !== null && budget > 0) {
    budget -= 1;
    const slice = Buffer.from(match[1], 'latin1');
    let content = '';
    try {
      content = inflateSync(slice).toString('latin1');
    } catch {
      content = slice.toString('latin1');
    }
    if (!/(TJ|Tj)\b/.test(content)) continue;
    for (const [, literal] of content.matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj?/g)) {
      chunks.push(literal.replace(/\\([()\\])/g, '$1'));
    }
    for (const [, array] of content.matchAll(/\[((?:[^\][]|\\.)*)\]\s*TJ/g)) {
      for (const [, literal] of array.matchAll(/\(((?:\\.|[^\\()])*)\)/g)) {
        chunks.push(literal.replace(/\\([()\\])/g, '$1'));
      }
    }
  }

  return chunks.join(' ').replace(/\s+/g, ' ').slice(0, 200_000);
}

function inferCategory(haystack) {
  let best = { key: 'identity', hits: 0 };
  for (const key of CATEGORY_KEYS) {
    const hints = CATEGORY_HINTS[key] ?? [];
    const hits = hints.filter((hint) => haystack.includes(hint)).length;
    if (hits > best.hits) best = { key, hits };
  }
  return {
    key: best.hits ? best.key : 'identity',
    confidence: best.hits >= 2 ? 'high' : best.hits === 1 ? 'medium' : 'none',
  };
}

function inferTitle(filename, text) {
  const base = filename
    .replace(/\.[a-z0-9]{1,5}$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (base && !/^(scan|img|image|document|untitled|doc)\s*\d*$/i.test(base)) {
    return titleCase(base).slice(0, 120);
  }
  const firstLine = text.split(/\s{3,}|\.\s/)[0]?.trim();
  if (firstLine && firstLine.length > 4 && firstLine.length < 80) return titleCase(firstLine);
  return 'Untitled document';
}

function titleCase(value) {
  return value.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/**
 * PDF text arrives as one long space-joined line, so a greedy match runs
 * straight past the value and into the next label — "Meera Sharma Expiry".
 * Every capture is therefore cut at the first token that starts another field.
 */
const LABEL_STOPS = new RegExp(
  `\\b(?:${[
    'insurer', 'provider', 'issued by', 'issued', 'company', 'bank', 'authority',
    'policy holder', 'policyholder', 'name of insured', 'holder', 'account holder', 'name',
    'policy no', 'policy number', 'account no', 'account number', 'registration no',
    'certificate no', 'expiry', 'expires', 'valid until', 'valid till', 'renewal',
    'renew by', 'due date', 'next premium', 'date of issue', 'issue date', 'commencement',
    'sum assured', 'premium', 'address', 'date of birth', 'dob', 'nominee',
  ].join('|')})\\b`,
  'i',
);

function findLabelled(text, labels) {
  for (const label of labels) {
    const pattern = new RegExp(`${escapeRegExp(label)}\\s*[:\\-]?\\s*([A-Za-z0-9 .,&'()/-]{3,60})`, 'i');
    const match = text.match(pattern);
    if (!match) continue;

    const value = match[1]
      .split(LABEL_STOPS)[0]
      .replace(/[\s.,:;-]+$/, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // A stray number or a one-word fragment is not worth pre-filling a field with.
    if (value.length >= 3 && !/^\d{1,4}$/.test(value)) return value;
  }
  return null;
}

function findAmount(text) {
  const matches = [...text.matchAll(/(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi)].map((m) =>
    Number(m[1].replace(/,/g, '')),
  );
  if (!matches.length) return null;
  const largest = Math.max(...matches.filter(Number.isFinite));
  return Number.isFinite(largest) ? `₹${largest.toLocaleString('en-IN')}` : null;
}

/** Pulls dates out of the text and works out which deadline each one is. */
function findDates(text) {
  const result = { expiry: null, renewal: null, issued: null };
  const contexts = [
    ['expiry', ['expiry', 'expires', 'valid until', 'valid till', 'date of expiry']],
    ['renewal', ['renewal', 'renew by', 'due date', 'next premium']],
    ['issued', ['issued', 'date of issue', 'issue date', 'commencement']],
  ];

  for (const [key, labels] of contexts) {
    for (const label of labels) {
      const pattern = new RegExp(`${escapeRegExp(label)}[^0-9]{0,20}(${DATE_SOURCE})`, 'i');
      const match = text.match(pattern);
      const parsed = match ? normaliseDate(match[1]) : null;
      if (parsed) {
        result[key] = parsed;
        break;
      }
    }
  }
  return result;
}

const DATE_SOURCE =
  '\\d{1,2}[\\s./-]{1,2}(?:\\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\\s./-]{1,2}\\d{2,4}|\\d{4}-\\d{2}-\\d{2}';

/** Returns YYYY-MM-DD, or null when the value is not a date we can trust. */
export function normaliseDate(value) {
  if (!value) return null;
  const raw = String(value).trim().toLowerCase();

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return validate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const parts = raw.split(/[\s./-]+/).filter(Boolean);
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const monthPart = parts[1];
  const month = /^\d+$/.test(monthPart) ? Number(monthPart) : MONTHS[monthPart.slice(0, 3)];
  let year = Number(parts[2]);
  if (!Number.isFinite(year)) return null;
  if (year < 100) year += year < 70 ? 2000 : 1900;

  return validate(year, month, day);
}

function validate(year, month, day) {
  if (![year, month, day].every(Number.isFinite)) return null;
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
