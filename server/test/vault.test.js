import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { samplePdf, signUp, startTestServer, uploadForm } from './helpers.js';

describe('the vault', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => server.close());

  async function upload(client, options = {}) {
    const response = await client.post(
      '/api/documents',
      uploadForm(samplePdf(options.text ?? 'Policy Holder: Meera Sharma Expiry: 14 Mar 2032'), {
        filename: options.filename ?? 'Home Insurance.pdf',
        meta: options.meta,
      }),
    );
    return response;
  }

  it('stores a document, reads its details out of the file, and never writes plaintext to disk', async () => {
    const { client } = await signUp(server);
    const response = await upload(client);

    assert.equal(response.status, 201);
    const { document, extraction } = response.body;
    assert.equal(document.title, 'Home Insurance');
    assert.equal(document.category, 'insurance');
    assert.equal(document.expiresOn, '2032-03-14');
    assert.equal(document.source, 'auto_extracted');
    assert.ok(extraction.fields.some((f) => f.label === 'Holder'));
    assert.equal(extraction.textFound, true);

    // The stored bytes must not contain the plaintext marker.
    const { readdirSync, readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const files = readdirSync(server.config.documentDir);
    assert.equal(files.length, 1);
    const stored = readFileSync(join(server.config.documentDir, files[0]));
    assert.equal(stored.includes(Buffer.from('Meera Sharma')), false);
    assert.equal(stored.includes(Buffer.from('%PDF')), false);
  });

  it('gives the original bytes back to the owner', async () => {
    const { client } = await signUp(server);
    const { body } = await upload(client);

    const file = await client.get(`/api/documents/${body.document.id}/file`, { raw: true });
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('content-type'), 'application/pdf');
    assert.match(file.headers.get('content-disposition'), /^inline/);
    assert.equal(file.headers.get('cache-control'), 'private, no-store');

    const bytes = Buffer.from(await file.arrayBuffer());
    assert.equal(bytes.subarray(0, 4).toString(), '%PDF');
    assert.ok(bytes.includes(Buffer.from('Meera Sharma')));
  });

  it('rejects a file whose contents do not match its declared type', async () => {
    const { client } = await signUp(server);
    const form = new FormData();
    form.append('file', new Blob([Buffer.from('MZ\x90\x00 this is an executable')], { type: 'application/pdf' }), 'x.pdf');

    const response = await client.post('/api/documents', form);
    assert.equal(response.status, 415);
  });

  it('rejects a file type that is not on the list', async () => {
    const { client } = await signUp(server);
    const form = new FormData();
    form.append('file', new Blob([Buffer.from('#!/bin/sh')], { type: 'application/x-sh' }), 'run.sh');

    const response = await client.post('/api/documents', form);
    assert.equal(response.status, 415);
  });

  it('refuses an upload larger than the limit', async () => {
    const small = await startTestServer({ MAX_UPLOAD_BYTES: '2048' });
    try {
      const { client } = await signUp(small);
      const big = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(4096, 0x20)]);
      const form = new FormData();
      form.append('file', new Blob([big], { type: 'application/pdf' }), 'big.pdf');

      const response = await client.post('/api/documents', form);
      assert.equal(response.status, 413);
    } finally {
      await small.close();
    }
  });

  it('keeps one vault entirely out of another', async () => {
    const owner = await signUp(server);
    const stranger = await signUp(server);
    const { body } = await upload(owner.client);
    const id = body.document.id;

    // Reported as missing, not forbidden: the API does not confirm the id exists.
    assert.equal((await stranger.client.get(`/api/documents/${id}`)).status, 404);
    assert.equal((await stranger.client.get(`/api/documents/${id}/file`)).status, 404);
    assert.equal((await stranger.client.patch(`/api/documents/${id}`, { title: 'Mine now' })).status, 404);
    assert.equal((await stranger.client.delete(`/api/documents/${id}`)).status, 404);

    const list = await stranger.client.get('/api/documents');
    assert.equal(list.body.documents.length, 0);

    // And the owner's copy is untouched.
    const check = await owner.client.get(`/api/documents/${id}`);
    assert.equal(check.body.document.title, 'Home Insurance');
  });

  it('edits and deletes a document, and removes its ciphertext', async () => {
    const { client } = await signUp(server);
    const { body } = await upload(client);

    const patched = await client.patch(`/api/documents/${body.document.id}`, {
      title: 'Home Insurance 2032',
      subject: 'Family Home',
      renewalOn: '2026-10-20',
    });
    assert.equal(patched.status, 200);
    assert.equal(patched.body.document.title, 'Home Insurance 2032');
    assert.equal(patched.body.document.renewalOn, '2026-10-20');

    const { readdirSync } = await import('node:fs');
    assert.equal(readdirSync(server.config.documentDir).length >= 1, true);

    const removed = await client.delete(`/api/documents/${body.document.id}`);
    assert.equal(removed.status, 200);
    assert.equal((await client.get(`/api/documents/${body.document.id}`)).status, 404);
  });

  it('validates document details rather than storing whatever arrives', async () => {
    const { client } = await signUp(server);
    const response = await upload(client, {
      meta: { title: 'Fine', category: 'not-a-category' },
    });
    assert.equal(response.status, 400);

    const badDate = await upload(client, { meta: { title: 'Fine', category: 'legal', expiresOn: '2025-02-30' } });
    assert.equal(badDate.status, 400);
  });

  it('derives reminders from the dates on documents and lets them be dismissed', async () => {
    const { client } = await signUp(server);
    const soon = new Date(Date.now() + 20 * 86_400_000).toISOString().slice(0, 10);
    await upload(client, {
      filename: 'Passport.pdf',
      meta: { title: 'Passport', category: 'identity', expiresOn: soon, subject: 'Saanvi' },
    });

    const reminders = await client.get('/api/reminders');
    assert.equal(reminders.body.reminders.length, 1);
    assert.equal(reminders.body.reminders[0].urgency, 'soon');
    assert.equal(reminders.body.reminders[0].documentTitle, 'Passport');

    const dismissed = await client.put(`/api/reminders/${reminders.body.reminders[0].key}`, {
      state: 'dismissed',
    });
    assert.equal(dismissed.body.reminders.length, 0);

    // Deleting the document cannot leave an orphan reminder behind.
    const docs = await client.get('/api/documents');
    await client.delete(`/api/documents/${docs.body.documents[0].id}`);
    assert.equal((await client.get('/api/reminders')).body.reminders.length, 0);
  });

  it('scores readiness from what is actually in the vault', async () => {
    const { client } = await signUp(server);
    const empty = await client.get('/api/readiness');
    assert.equal(empty.body.score < 30, true);
    assert.equal(empty.body.band, 'exposed');
    assert.ok(empty.body.nextSteps.length);

    await upload(client, { filename: 'Will.pdf', meta: { title: 'Will', category: 'legal' } });
    const after = await client.get('/api/readiness');
    assert.equal(after.body.score > empty.body.score, true);
  });

  it('arranges documents into life-journey chapters', async () => {
    const { client } = await signUp(server);
    await upload(client, {
      filename: 'BSc Degree.pdf',
      meta: { title: 'B.Sc. Degree', category: 'education', issuedOn: '2009-06-01' },
    });
    await upload(client, {
      filename: 'Property Deed.pdf',
      meta: { title: 'Property Deed', category: 'property', issuedOn: '2018-10-04' },
    });

    const timeline = await client.get('/api/timeline');
    const keys = timeline.body.chapters.map((c) => c.key);
    assert.deepEqual(keys, ['education', 'home']);
    assert.equal(timeline.body.chapters[0].entries[0].title, 'B.Sc. Degree');
  });

  it('reports the dashboard from live data', async () => {
    const { client, user } = await signUp(server);
    await upload(client);

    const dashboard = await client.get('/api/dashboard');
    assert.equal(dashboard.status, 200);
    assert.equal(dashboard.body.greeting.name, user.name.split(' ')[0]);
    assert.equal(dashboard.body.stats.documents, 1);
    assert.equal(dashboard.body.stats.addedThisWeek, 1);
    assert.equal(dashboard.body.recentDocuments[0].categoryLabel, 'Insurance');
  });

  it('writes an activity entry for every action on the vault', async () => {
    const { client } = await signUp(server);
    const { body } = await upload(client);
    await client.patch(`/api/documents/${body.document.id}`, { title: 'Renamed' });

    const activity = await client.get('/api/account/activity');
    const events = activity.body.entries.map((e) => e.event);
    assert.ok(events.includes('document.uploaded'));
    assert.ok(events.includes('document.updated'));
    assert.ok(events.includes('account.created'));

    const filtered = await client.get('/api/account/activity?category=documents');
    assert.equal(filtered.body.entries.every((e) => e.category === 'documents'), true);
  });
});
