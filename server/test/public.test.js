import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { signUp, startTestServer } from './helpers.js';
import { scorePreparedness } from '../src/engine/preparedness.js';

const WELL_PREPARED = {
  dependants: 'children',
  life_cover: 'both',
  health_cover: 'both',
  reserve: 'six_plus',
  findable: 'yes',
  intentions: 'will_registered',
};

const EXPOSED = {
  dependants: 'multiple',
  life_cover: 'none',
  health_cover: 'none',
  reserve: 'none',
  findable: 'no',
  intentions: 'none',
};

describe('preparedness check', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => server.close());

  it('serves the questions without requiring an account', async () => {
    const response = await server.client().get('/api/preparedness/questions');
    assert.equal(response.status, 200);
    assert.equal(response.body.questions.length, 6);
    // Options must not leak their scores to the client.
    assert.equal(response.body.questions[0].options[0].score, undefined);
    assert.match(response.body.disclaimer, /nothing you enter here is stored/i);
  });

  it('scores the two extremes the way a person would read them', async () => {
    const prepared = await server.client().post('/api/preparedness/score', WELL_PREPARED);
    const exposed = await server.client().post('/api/preparedness/score', EXPOSED);

    assert.equal(prepared.status, 200);
    assert.equal(prepared.body.score, 100);
    assert.equal(prepared.body.band, 'prepared');
    assert.equal(prepared.body.findings.length, 0);
    assert.ok(prepared.body.strengths.length >= 4);

    assert.equal(exposed.body.score, 0);
    assert.equal(exposed.body.band, 'exposed');
    // Ranked by what the gap actually costs: no life cover leads.
    assert.equal(exposed.body.findings[0].key, 'life_cover');
    assert.ok(exposed.body.findings.length <= 4);
  });

  it('never stores anything a visitor answers', async () => {
    await server.client().post('/api/preparedness/score', EXPOSED);
    const tables = server.ctx.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name);
    // There is nowhere for answers to have gone: no table holds them.
    assert.equal(tables.includes('preparedness_answers'), false);
    assert.equal(server.ctx.db.prepare('SELECT COUNT(*) AS c FROM leads').get().c, 0);
  });

  it('rejects answers that are not on the list', async () => {
    const response = await server.client().post('/api/preparedness/score', {
      ...WELL_PREPARED,
      life_cover: 'whatever-i-like',
    });
    assert.equal(response.status, 400);
  });

  it('treats dependants as context rather than a score', () => {
    const withDependants = scorePreparedness(WELL_PREPARED);
    const without = scorePreparedness({ ...WELL_PREPARED, dependants: 'none' });

    // The number is the same; only the way it is described changes.
    assert.equal(withDependants.score, without.score);
    assert.notEqual(withDependants.headline, without.headline);
    assert.equal(withDependants.breakdown.find((b) => b.key === 'dependants').contextual, true);
  });

  it('says plainly that it is not advice', () => {
    const result = scorePreparedness(EXPOSED);
    assert.match(result.disclaimer, /not financial or insurance advice/i);
    assert.match(result.disclaimer, /not a recommendation/i);
  });
});

describe('enquiries', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => server.close());

  const enquiry = {
    name: 'Rohan Prasad',
    email: 'rohan@example.test',
    phone: '+91 98200 12345',
    household: 'family',
    interests: ['protection_review', 'the_vault'],
    timeframe: 'this_quarter',
    message: 'We have just had a second child and want to review what is in place.',
    source: 'contact',
  };

  it('accepts an enquiry from a visitor with no account', async () => {
    const response = await server.client().post('/api/leads', enquiry);
    assert.equal(response.status, 201);
    assert.ok(response.body.reference);
    // The confirmation says what actually happens, not "check your email".
    assert.match(response.body.message, /recorded/i);
  });

  it('validates before storing', async () => {
    const bad = await server.client().post('/api/leads', { ...enquiry, email: 'not-an-email' });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.error.details.fields.email);

    const badPhone = await server.client().post('/api/leads', { ...enquiry, phone: 'call me maybe' });
    assert.equal(badPhone.status, 400);
  });

  it('rejects a bot that fills the honeypot', async () => {
    const response = await server.client().post('/api/leads', { ...enquiry, website: 'http://spam.example' });
    assert.equal(response.status, 400);
  });

  it('carries a check score through when the enquiry came from the check', async () => {
    const response = await server.client().post('/api/leads', {
      ...enquiry,
      source: 'preparedness_check',
      checkScore: 42,
    });
    assert.equal(response.status, 201);

    const row = server.ctx.db
      .prepare("SELECT * FROM leads WHERE source = 'preparedness_check' ORDER BY created_at DESC")
      .get();
    assert.equal(row.check_score, 42);
  });

  it('accepts the callback popup, which sends only a name, a phone and an email', async () => {
    const response = await server.client().post('/api/leads', {
      name: 'Ananya Iyer',
      email: 'ananya@example.test',
      phone: '+91 90000 11111',
      source: 'call_request',
    });
    assert.equal(response.status, 201);

    const row = server.ctx.db
      .prepare("SELECT * FROM leads WHERE source = 'call_request' ORDER BY created_at DESC")
      .get();
    assert.equal(row.name, 'Ananya Iyer');
    assert.equal(row.phone, '+91 90000 11111');
    // Nothing the popup does not ask for is invented on the way in.
    assert.equal(row.household, null);
    assert.equal(row.timeframe, null);
    assert.equal(row.message, null);
    assert.equal(row.interests_json, '[]');
  });

  it('keeps the lead inbox to admins', async () => {
    const anonymous = await server.client().get('/api/leads');
    assert.equal(anonymous.status, 401);

    const member = await signUp(server);
    const asMember = await member.client.get('/api/leads');
    assert.equal(asMember.status, 403);

    const admin = await signUp(server);
    server.ctx.db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(admin.user.id);

    const asAdmin = await admin.client.get('/api/leads');
    assert.equal(asAdmin.status, 200);
    assert.ok(asAdmin.body.leads.length >= 1);
    assert.equal(asAdmin.body.leads[0].status, 'new');
  });

  it('lets an admin work the inbox, and nobody else', async () => {
    const admin = await signUp(server);
    server.ctx.db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(admin.user.id);
    const member = await signUp(server);

    const created = await server.client().post('/api/leads', enquiry);
    const id = server.ctx.db.prepare('SELECT id FROM leads ORDER BY created_at DESC').get().id;
    assert.equal(created.status, 201);

    const blocked = await member.client.patch(`/api/leads/${id}`, { status: 'contacted' });
    assert.equal(blocked.status, 403);

    const updated = await admin.client.patch(`/api/leads/${id}`, {
      status: 'contacted',
      notes: 'Call booked for Tuesday.',
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.lead.status, 'contacted');
    assert.equal(updated.body.lead.notes, 'Call booked for Tuesday.');

    // Working the inbox is recorded, like everything else an admin does.
    const activity = await admin.client.get('/api/account/activity?category=account');
    assert.ok(activity.body.entries.some((e) => e.event === 'lead.updated'));
  });

  it('rate-limits enquiries so the inbox cannot be flooded', async () => {
    const limited = await startTestServer({ RATE_LIMIT_ENABLED: 'true', RATE_LIMIT_WINDOW_MS: '60000' });
    try {
      const client = limited.client();
      const statuses = [];
      for (let i = 0; i < 7; i += 1) {
        statuses.push((await client.post('/api/leads', enquiry)).status);
      }
      assert.ok(statuses.includes(429), `expected a 429 among ${statuses.join(', ')}`);
    } finally {
      await limited.close();
    }
  });
});
