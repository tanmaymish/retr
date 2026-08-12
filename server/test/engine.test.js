import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { computeReadiness } from '../src/engine/readiness.js';
import { computeReminders } from '../src/engine/reminders.js';
import { computeTimeline } from '../src/engine/timeline.js';
import { extractDocumentDetails, normaliseDate } from '../src/engine/extraction.js';
import { totpCode, verifyTotp, generateSecret, base32Decode, base32Encode } from '../src/lib/totp.js';
import { encryptDocument, decryptDocument, deriveMasterKey, hashPassword, verifyPassword } from '../src/lib/crypto.js';
import { samplePdf } from './helpers.js';

const DAY = 86_400_000;
const asOf = new Date('2026-06-01T00:00:00Z');

const doc = (overrides = {}) => ({
  id: Math.random().toString(36).slice(2),
  title: 'A document',
  category: 'identity',
  source: 'user_uploaded',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('readiness', () => {
  it('scores an empty vault as exposed and names the biggest gap', () => {
    const result = computeReadiness({ documents: [], members: [], enabledCategories: [], asOf });
    assert.equal(result.band, 'exposed');
    assert.ok(result.score < 35);
    assert.ok(result.nextSteps.length > 0);
    // A vault nobody else can open is the finding, not the document count.
    assert.ok(result.breakdown.find((c) => c.key === 'trustee').pointsAvailable > 0);
  });

  it('rises as categories, essentials, trustees and members are added', () => {
    const documents = [
      doc({ title: 'Passport', category: 'identity' }),
      doc({ title: 'Health policy', category: 'insurance' }),
      doc({ title: 'Will', category: 'legal' }),
      doc({ title: 'Property deed', category: 'property' }),
    ];
    const members = [
      { isTrustee: true, status: 'active' },
      { isTrustee: false, status: 'active' },
    ];
    const before = computeReadiness({ documents: [], members: [], enabledCategories: [], asOf });
    const after = computeReadiness({ documents, members, enabledCategories: [], asOf });

    assert.ok(after.score > before.score + 30);
    assert.equal(after.breakdown.find((c) => c.key === 'trustee').score, 100);
  });

  it('counts an expired document against currency', () => {
    const documents = [doc({ title: 'Passport', expiresOn: '2020-01-01' })];
    const result = computeReadiness({ documents, members: [], enabledCategories: [], asOf });
    assert.equal(result.expiredCount, 1);
    assert.equal(result.breakdown.find((c) => c.key === 'currency').score, 0);
  });

  it('only measures the categories the owner chose', () => {
    const documents = [doc({ title: 'Passport', category: 'identity' })];
    const narrow = computeReadiness({ documents, members: [], enabledCategories: ['identity'], asOf });
    const wide = computeReadiness({ documents, members: [], enabledCategories: [], asOf });
    assert.ok(narrow.score > wide.score);
  });
});

describe('reminders', () => {
  it('raises a reminder inside the lead time for its category, not before', () => {
    const soon = new Date(asOf.getTime() + 100 * DAY).toISOString().slice(0, 10);
    const identity = computeReminders({ documents: [doc({ category: 'identity', expiresOn: soon })], asOf });
    const insurance = computeReminders({ documents: [doc({ category: 'insurance', expiresOn: soon })], asOf });

    // A passport takes months to replace; a policy renewal does not.
    assert.equal(identity.reminders.length, 1);
    assert.equal(insurance.reminders.length, 0);
  });

  it('keeps overdue items on the list and marks them', () => {
    const past = new Date(asOf.getTime() - 10 * DAY).toISOString().slice(0, 10);
    const result = computeReminders({ documents: [doc({ expiresOn: past })], asOf });
    assert.equal(result.reminders[0].overdue, true);
    assert.equal(result.reminders[0].urgency, 'overdue');
    assert.equal(result.counts.overdue, 1);
  });

  it('honours dismissals and live snoozes, and lets an expired snooze return', () => {
    const soon = new Date(asOf.getTime() + 20 * DAY).toISOString().slice(0, 10);
    const document = doc({ expiresOn: soon });
    const key = `expiry:${document.id}`;

    assert.equal(
      computeReminders({ documents: [document], states: [{ reminderKey: key, state: 'dismissed' }], asOf })
        .reminders.length,
      0,
    );
    assert.equal(
      computeReminders({
        documents: [document],
        states: [{ reminderKey: key, state: 'snoozed', snoozedUntil: new Date(asOf.getTime() + DAY).toISOString() }],
        asOf,
      }).reminders.length,
      0,
    );
    assert.equal(
      computeReminders({
        documents: [document],
        states: [{ reminderKey: key, state: 'snoozed', snoozedUntil: new Date(asOf.getTime() - DAY).toISOString() }],
        asOf,
      }).reminders.length,
      1,
    );
  });

  it('raises expiry and renewal separately for the same document', () => {
    const soon = new Date(asOf.getTime() + 20 * DAY).toISOString().slice(0, 10);
    const result = computeReminders({ documents: [doc({ category: 'insurance', expiresOn: soon, renewalOn: soon })], asOf });
    assert.equal(result.reminders.length, 2);
    assert.deepEqual(result.reminders.map((r) => r.kind).sort(), ['expiry', 'renewal']);
  });
});

describe('timeline', () => {
  it('files documents by what they are, and orders by the date on them', () => {
    const timeline = computeTimeline([
      doc({ title: 'Deed', category: 'property', issuedOn: '2018-10-04' }),
      doc({ title: 'Degree', category: 'education', issuedOn: '2009-06-01' }),
      doc({ title: 'Transcript', category: 'education', issuedOn: '2010-01-01' }),
    ]);

    assert.deepEqual(timeline.chapters.map((c) => c.key), ['education', 'home']);
    assert.deepEqual(timeline.chapters[0].entries.map((e) => e.title), ['Degree', 'Transcript']);
  });

  it('drops chapters with nothing in them', () => {
    const timeline = computeTimeline([doc({ category: 'legal' })]);
    assert.equal(timeline.chapters.length, 1);
    assert.equal(timeline.chapters[0].key, 'legacy');
  });
});

describe('extraction', () => {
  it('reads text out of a real PDF and stops each field at the next label', () => {
    const buffer = samplePdf('Provider: Star Health Policy Holder: Meera Sharma Expiry: 14 Mar 2032');
    const result = extractDocumentDetails({ buffer, filename: 'Home Insurance.pdf', mimeType: 'application/pdf' });

    assert.equal(result.textFound, true);
    assert.equal(result.suggestion.category, 'insurance');
    assert.equal(result.suggestion.expiresOn, '2032-03-14');
    // The value must not run on into the following label.
    assert.equal(result.fields.find((f) => f.label === 'Holder').value, 'Meera Sharma');
    assert.equal(result.fields.find((f) => f.label === 'Provider').value, 'Star Health');
  });

  it('says so plainly when a file has no text to read', () => {
    const result = extractDocumentDetails({
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]),
      filename: 'scan.png',
      mimeType: 'image/png',
    });
    assert.equal(result.textFound, false);
    assert.equal(result.source, 'user_uploaded');
    assert.match(result.notice, /could not read/i);
    assert.equal(result.fields.length, 0);
  });

  it('titles a document from its filename, ignoring camera-roll names', () => {
    const buffer = Buffer.from('nothing useful');
    assert.equal(
      extractDocumentDetails({ buffer, filename: 'Property Deed 2018.pdf', mimeType: 'text/plain' }).suggestion.title,
      'Property Deed 2018',
    );
    assert.equal(
      extractDocumentDetails({ buffer, filename: 'IMG_2938.jpg', mimeType: 'image/jpeg' }).suggestion.title,
      'Untitled document',
    );
  });

  it('parses the date formats people actually write, and rejects impossible ones', () => {
    assert.equal(normaliseDate('14 Mar 2032'), '2032-03-14');
    assert.equal(normaliseDate('14/03/2032'), '2032-03-14');
    assert.equal(normaliseDate('2032-03-14'), '2032-03-14');
    assert.equal(normaliseDate('01.02.99'), '1999-02-01');
    assert.equal(normaliseDate('31 Feb 2030'), null);
    assert.equal(normaliseDate('not a date'), null);
    assert.equal(normaliseDate(''), null);
  });
});

describe('crypto', () => {
  it('round-trips a document, and refuses one rebound to another owner', () => {
    const masterKey = deriveMasterKey('a test master key');
    const plaintext = Buffer.from('the contents of a private document');
    const sealed = encryptDocument({ masterKey, plaintext, documentId: 'doc-1', userId: 'user-1' });

    assert.equal(sealed.ciphertext.includes(Buffer.from('private')), false);
    assert.deepEqual(
      decryptDocument({ masterKey, ...sealed, documentId: 'doc-1', userId: 'user-1' }),
      plaintext,
    );

    // The owner and document id are authenticated: swapping either fails.
    assert.throws(() => decryptDocument({ masterKey, ...sealed, documentId: 'doc-1', userId: 'user-2' }));
    assert.throws(() => decryptDocument({ masterKey, ...sealed, documentId: 'doc-2', userId: 'user-1' }));
    assert.throws(() =>
      decryptDocument({ masterKey: deriveMasterKey('a different key'), ...sealed, documentId: 'doc-1', userId: 'user-1' }),
    );
  });

  it('hashes passwords with a per-password salt and verifies them', async () => {
    const first = await hashPassword('a long enough password');
    const second = await hashPassword('a long enough password');
    assert.notEqual(first, second);
    assert.match(first, /^scrypt\$/);

    assert.equal(await verifyPassword('a long enough password', first), true);
    assert.equal(await verifyPassword('a long enough passworD', first), false);
    assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
    assert.equal(await verifyPassword('anything', null), false);
  });
});

describe('totp', () => {
  it('accepts the current code and one step either side, and nothing else', () => {
    const secret = generateSecret();
    const now = Date.now();

    assert.equal(verifyTotp(secret, totpCode(secret, now), now), true);
    assert.equal(verifyTotp(secret, totpCode(secret, now, -1), now), true);
    assert.equal(verifyTotp(secret, totpCode(secret, now, 1), now), true);
    assert.equal(verifyTotp(secret, totpCode(secret, now, 5), now), false);
    assert.equal(verifyTotp(secret, '000000', now), totpCode(secret, now) === '000000');
    assert.equal(verifyTotp(secret, 'abcdef', now), false);
    assert.equal(verifyTotp(secret, '', now), false);
  });

  it('round-trips base32 so an authenticator app can read the secret', () => {
    const bytes = Buffer.from('heritage ledger test secret');
    assert.deepEqual(base32Decode(base32Encode(bytes)), bytes);
  });

  it('matches the RFC 6238 test vector', () => {
    // RFC 4226/6238 use the ASCII secret "12345678901234567890".
    const secret = base32Encode(Buffer.from('12345678901234567890'));
    assert.equal(totpCode(secret, 59_000), '287082');
    assert.equal(totpCode(secret, 1_111_111_109_000), '081804');
  });
});
