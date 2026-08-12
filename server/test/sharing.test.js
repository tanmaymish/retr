import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { samplePdf, signUp, startTestServer, uploadForm } from './helpers.js';

const DAY = 86_400_000;

describe('family, sharing and the trustee protocol', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => server.close());

  async function upload(client, meta) {
    const response = await client.post(
      '/api/documents',
      uploadForm(samplePdf('Health Insurance Policy'), { filename: 'Health Insurance.pdf', meta }),
    );
    assert.equal(response.status, 201);
    return response.body.document;
  }

  /** Owner invites someone, that someone registers and accepts. */
  async function invite(owner, options = {}) {
    const inviteeEmail = `invitee-${Math.random().toString(36).slice(2)}@example.test`;
    const created = await owner.client.post('/api/family', {
      name: options.name ?? 'Meera Sharma',
      email: inviteeEmail,
      relationship: options.relationship ?? 'mother',
      isTrustee: options.isTrustee ?? false,
      trusteeCategories: options.trusteeCategories ?? [],
    });
    assert.equal(created.status, 201);

    const invitee = await signUp(server, { email: inviteeEmail, name: options.name ?? 'Meera Sharma' });
    const accepted = await invitee.client.post('/api/invites/accept', { token: created.body.inviteToken });
    assert.equal(accepted.status, 200);

    return { invitee, member: created.body.member, token: created.body.inviteToken };
  }

  it('invites a family member who accepts and appears as active', async () => {
    const owner = await signUp(server);
    const { member } = await invite(owner);

    const family = await owner.client.get('/api/family');
    const found = family.body.members.find((m) => m.id === member.id);
    assert.equal(found.status, 'active');
    assert.equal(found.hasAccount, true);
    assert.equal(family.body.summary.active, 1);
  });

  it('shows an invitation before it is accepted and burns the token afterwards', async () => {
    const owner = await signUp(server);
    const email = `preview-${Date.now()}@example.test`;
    const created = await owner.client.post('/api/family', {
      name: 'Rajeev Sharma',
      email,
      relationship: 'father',
      isTrustee: true,
      trusteeCategories: ['medical', 'legal'],
    });

    const preview = await server.client().get(`/api/invites/${created.body.inviteToken}`);
    assert.equal(preview.status, 200);
    assert.equal(preview.body.invite.isTrustee, true);
    assert.equal(preview.body.invite.waitingPeriodDays, 14);
    assert.deepEqual(
      preview.body.invite.trusteeCategories.map((c) => c.label),
      ['Medical', 'Legal'],
    );

    const invitee = await signUp(server, { email, name: 'Rajeev Sharma' });
    await invitee.client.post('/api/invites/accept', { token: created.body.inviteToken });

    // The link is single-use.
    const reused = await server.client().get(`/api/invites/${created.body.inviteToken}`);
    assert.equal(reused.status, 404);
  });

  it('shares one document, and shares nothing else with it', async () => {
    const owner = await signUp(server);
    const shared = await upload(owner.client, { title: 'Health Insurance Policy', category: 'insurance' });
    const secret = await upload(owner.client, { title: 'Will', category: 'legal' });
    const { invitee, member } = await invite(owner);

    const grant = await owner.client.post(`/api/documents/${shared.id}/shares`, {
      memberId: member.id,
      canDownload: false,
    });
    assert.equal(grant.status, 201);

    const visible = await invitee.client.get(`/api/documents/${shared.id}`);
    assert.equal(visible.status, 200);
    assert.equal(visible.body.permission.via, 'document_share');
    assert.equal(visible.body.permission.canDownload, false);

    // View is allowed…
    assert.equal((await invitee.client.get(`/api/documents/${shared.id}/file`)).status, 200);
    // …download is not.
    const download = await invitee.client.get(`/api/documents/${shared.id}/file?disposition=attachment`);
    assert.equal(download.status, 403);

    // And the document that was not shared stays invisible.
    assert.equal((await invitee.client.get(`/api/documents/${secret.id}`)).status, 404);

    const inbox = await invitee.client.get('/api/shared-with-me');
    assert.equal(inbox.body.documents.length, 1);
    assert.equal(inbox.body.documents[0].title, 'Health Insurance Policy');
    // The screen labels each shared document with whose vault it came from.
    assert.equal(inbox.body.documents[0].ownerName, owner.user.name);
    assert.equal(inbox.body.memberships[0].ownerName, owner.user.name);
  });

  it('revokes a share immediately', async () => {
    const owner = await signUp(server);
    const document = await upload(owner.client, { title: 'Property Deed', category: 'property' });
    const { invitee, member } = await invite(owner);

    await owner.client.post(`/api/documents/${document.id}/shares`, { memberId: member.id, canDownload: true });
    assert.equal((await invitee.client.get(`/api/documents/${document.id}`)).status, 200);

    await owner.client.delete(`/api/documents/${document.id}/shares/${member.id}`);
    assert.equal((await invitee.client.get(`/api/documents/${document.id}`)).status, 404);
  });

  it('grants access to a whole category, and takes it back when the member is removed', async () => {
    const owner = await signUp(server);
    await upload(owner.client, { title: 'Medical Record', category: 'medical' });
    await upload(owner.client, { title: 'Bank Statement', category: 'financial' });
    const { invitee, member } = await invite(owner);

    await owner.client.put(`/api/family/${member.id}/grants`, {
      categories: [{ category: 'medical', canDownload: true }],
    });

    const inbox = await invitee.client.get('/api/shared-with-me');
    assert.equal(inbox.body.documents.length, 1);
    assert.equal(inbox.body.documents[0].category, 'medical');
    assert.equal(inbox.body.documents[0].canDownload, true);

    await owner.client.delete(`/api/family/${member.id}`);
    assert.equal((await invitee.client.get('/api/shared-with-me')).body.documents.length, 0);
  });

  it('will not let a stranger share a document they do not own', async () => {
    const owner = await signUp(server);
    const stranger = await signUp(server);
    const document = await upload(owner.client, { title: 'Passport', category: 'identity' });
    const { member } = await invite(owner);

    const attempt = await stranger.client.post(`/api/documents/${document.id}/shares`, {
      memberId: member.id,
      canDownload: true,
    });
    assert.equal(attempt.status, 404);
  });

  it('holds a new trustee to the waiting period before they can request anything', async () => {
    const owner = await signUp(server);
    const { invitee } = await invite(owner, {
      isTrustee: true,
      trusteeCategories: ['legal', 'insurance'],
      relationship: 'legal_counsel',
    });

    const trusteeships = await invitee.client.get('/api/emergency/trusteeships');
    assert.equal(trusteeships.body.trusteeships.length, 1);
    assert.equal(trusteeships.body.trusteeships[0].canInitiate, false);

    const attempt = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'Testing the protocol before the cooling-off period has passed.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    assert.equal(attempt.status, 403);
  });

  it('requires every confirmation before the protocol starts', async () => {
    const owner = await signUp(server);
    const { invitee, member } = await invite(owner, { isTrustee: true, trusteeCategories: ['legal'] });
    backdateAcceptance(server, member.id, 20);

    const partial = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'A verified emergency has occurred and access is needed.',
      confirmations: ['verified_emergency'],
    });
    assert.equal(partial.status, 400);
  });

  it('runs the full emergency protocol: request, notify, wait, unlock, and open only the designated categories', async () => {
    const owner = await signUp(server);
    const willId = (await upload(owner.client, { title: 'Will', category: 'legal' })).id;
    await upload(owner.client, { title: 'Medical Record', category: 'medical' });

    const { invitee, member } = await invite(owner, { isTrustee: true, trusteeCategories: ['legal'] });
    backdateAcceptance(server, member.id, 20);

    const started = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'Verified emergency — the owner is in hospital and cannot respond.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    assert.equal(started.status, 201);
    const requestId = started.body.request.id;
    assert.equal(started.body.request.status, 'waiting');
    assert.equal(started.body.request.waitingPeriodDays, 14);
    // The owner is notified on every channel the protocol promises.
    assert.equal(started.body.request.notificationCount, 4);

    // The owner sees it, and the vault stays shut while the clock runs.
    const owned = await owner.client.get('/api/emergency/requests');
    assert.equal(owned.body.openCount, 1);
    const dashboard = await owner.client.get('/api/dashboard');
    assert.equal(dashboard.body.openAccessRequests.length, 1);

    const early = await invitee.client.get(`/api/emergency/requests/${requestId}/documents`);
    assert.equal(early.status, 403);
    assert.equal((await invitee.client.get(`/api/documents/${willId}`)).status, 404);

    // Wind the clock past the unlock time.
    server.ctx.db
      .prepare('UPDATE access_requests SET unlock_at = ? WHERE id = ?')
      .run(new Date(Date.now() - 1000).toISOString(), requestId);

    const opened = await invitee.client.get(`/api/emergency/requests/${requestId}/documents`);
    assert.equal(opened.status, 200);
    // Only the designated category, even though the vault holds more.
    assert.equal(opened.body.documents.length, 1);
    assert.equal(opened.body.documents[0].title, 'Will');
    assert.ok(opened.body.accessExpiresAt);

    const file = await invitee.client.get(`/api/documents/${willId}/file`);
    assert.equal(file.status, 200);

    // The owner's activity log records what the trustee did, by name.
    const activity = await owner.client.get('/api/account/activity?category=trustees');
    assert.ok(activity.body.entries.some((e) => e.event === 'emergency.initiated'));
    assert.ok(activity.body.entries.some((e) => e.event === 'emergency.vault_listed'));
  });

  it('lets the owner deny a request and closes it immediately', async () => {
    const owner = await signUp(server);
    const willId = (await upload(owner.client, { title: 'Will', category: 'legal' })).id;
    const { invitee, member } = await invite(owner, { isTrustee: true, trusteeCategories: ['legal'] });
    backdateAcceptance(server, member.id, 20);

    const started = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'Verified emergency — requesting access to the legal documents.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    const requestId = started.body.request.id;

    const denied = await owner.client.post(`/api/emergency/requests/${requestId}/deny`);
    assert.equal(denied.status, 200);
    assert.equal(denied.body.request.status, 'denied');

    // Even after the clock passes, a denied request never opens.
    server.ctx.db
      .prepare('UPDATE access_requests SET unlock_at = ? WHERE id = ?')
      .run(new Date(Date.now() - 1000).toISOString(), requestId);

    assert.equal((await invitee.client.get(`/api/emergency/requests/${requestId}/documents`)).status, 403);
    assert.equal((await invitee.client.get(`/api/documents/${willId}`)).status, 404);
  });

  it('lets a trustee withdraw their own request', async () => {
    const owner = await signUp(server);
    const { invitee, member } = await invite(owner, { isTrustee: true, trusteeCategories: ['legal'] });
    backdateAcceptance(server, member.id, 20);

    const started = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'Started this by mistake and withdrawing it right away.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    const cancelled = await invitee.client.post(`/api/emergency/requests/${started.body.request.id}/cancel`);
    assert.equal(cancelled.status, 200);

    const owned = await owner.client.get('/api/emergency/requests');
    assert.equal(owned.body.openCount, 0);
  });

  it('will not let a non-trustee start the protocol', async () => {
    const owner = await signUp(server);
    const { invitee, member } = await invite(owner, { isTrustee: false });
    backdateAcceptance(server, member.id, 20);

    const attempt = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'I am not a trustee but I would like to try this anyway.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    assert.equal(attempt.status, 403);
  });

  it('keeps a request on the waiting period it started with, even if the setting changes', async () => {
    const owner = await signUp(server);
    const { invitee, member } = await invite(owner, { isTrustee: true, trusteeCategories: ['legal'] });
    backdateAcceptance(server, member.id, 20);

    const started = await invitee.client.post('/api/emergency/requests', {
      ownerId: owner.user.id,
      reason: 'Verified emergency, starting the protocol under the current settings.',
      confirmations: ['verified_emergency', 'owner_notified', 'actions_audited'],
    });
    const unlockAt = started.body.request.unlockAt;

    await owner.client.patch('/api/account/security', { waitingPeriodDays: 1 });

    const reread = await owner.client.get(`/api/emergency/requests/${started.body.request.id}`);
    assert.equal(reread.body.request.unlockAt, unlockAt);
    assert.equal(reread.body.request.waitingPeriodDays, 14);
  });
});

/** Moves a member's acceptance into the past so the cooling-off period has passed. */
function backdateAcceptance(server, memberId, days) {
  server.ctx.db
    .prepare('UPDATE members SET accepted_at = ? WHERE id = ?')
    .run(new Date(Date.now() - days * DAY).toISOString(), memberId);
}
