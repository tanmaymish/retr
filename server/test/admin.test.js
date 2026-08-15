import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { signUp, startTestServer } from './helpers.js';
import { dayOf, pruneTraffic, recordBatch, trafficSummary, visitorHash } from '../src/engine/traffic.js';
import { publish, publishedContent, revert, revisions, saveDraft } from '../src/engine/content.js';

async function asAdmin(server) {
  const account = await signUp(server);
  server.ctx.db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(account.user.id);
  return account;
}

describe('the collector', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('accepts a batch and answers without making the visitor wait for the write', async () => {
    const response = await server.client().post('/api/collect', {
      views: [{ path: '/', device: 'desktop', referrer: 'https://www.google.com/search?q=x' }],
      events: [{ name: 'calculator_cta', path: '/', props: { calculator: 'retirement-readiness' } }],
    });

    assert.equal(response.status, 202);
    assert.equal(response.body.accepted, true);

    const views = server.ctx.db.prepare('SELECT * FROM page_views').all();
    assert.equal(views.length, 1);
    assert.equal(views[0].path, '/');
    // The full referring URL carried a query string; only the host is kept.
    assert.equal(views[0].referrer_host, 'google.com');

    const events = server.ctx.db.prepare('SELECT * FROM site_events').all();
    assert.equal(events.length, 1);
    assert.equal(events[0].name, 'calculator_cta');
  });

  it('never stores anything that identifies the visitor', async () => {
    await server.client().post('/api/collect', { views: [{ path: '/contact' }] });
    const row = server.ctx.db.prepare("SELECT * FROM page_views WHERE path = '/contact'").get();

    const columns = Object.keys(row);
    for (const forbidden of ['ip', 'user_agent', 'email', 'name']) {
      assert.ok(!columns.includes(forbidden), `page_views must not carry ${forbidden}`);
    }
    // The hash is opaque and fixed-width; it is not an address in disguise.
    assert.match(row.visitor_hash, /^[a-f0-9]{32}$/);
  });

  it('turns away a batch that is too large, or shaped wrongly', async () => {
    const huge = await server.client().post('/api/collect', {
      views: Array.from({ length: 200 }, () => ({ path: '/' })),
    });
    assert.equal(huge.status, 400);

    const wrong = await server.client().post('/api/collect', { views: [{ path: 42 }] });
    assert.equal(wrong.status, 400);

    // Property bags carry counts and labels, never nested objects.
    const nested = await server.client().post('/api/collect', {
      events: [{ name: 'x', props: { nested: { a: 1 } } }],
    });
    assert.equal(nested.status, 400);
  });

  it('needs no session, because a visitor does not have one', async () => {
    const response = await server.client().post('/api/collect', { views: [{ path: '/insights' }] });
    assert.equal(response.status, 202);
  });
});

describe('counting visitors without identifying them', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('counts one person twice on a page as one visitor and two views', () => {
    const { db } = server.ctx;
    const visitor = visitorHash({ ip: '203.0.113.9', userAgent: 'Test', day: dayOf() });

    recordBatch(db, { views: [{ path: '/pricing' }], visitor });
    recordBatch(db, { views: [{ path: '/pricing' }], visitor });

    const row = db.prepare("SELECT * FROM daily_stats WHERE path = '/pricing'").get();
    assert.equal(row.views, 2);
    assert.equal(row.visitors, 1);
  });

  it('counts two people as two visitors', () => {
    const { db } = server.ctx;
    recordBatch(db, { views: [{ path: '/two' }], visitor: 'a'.repeat(32) });
    recordBatch(db, { views: [{ path: '/two' }], visitor: 'b'.repeat(32) });

    const row = db.prepare("SELECT * FROM daily_stats WHERE path = '/two'").get();
    assert.equal(row.views, 2);
    assert.equal(row.visitors, 2);
  });

  it('gives the same person a different hash tomorrow', () => {
    const today = visitorHash({ ip: '203.0.113.9', userAgent: 'Test', day: '2026-08-15' });
    const tomorrow = visitorHash({ ip: '203.0.113.9', userAgent: 'Test', day: '2026-08-16' });
    assert.notEqual(today, tomorrow);
  });

  it('writes the whole batch or none of it', () => {
    const { db } = server.ctx;
    const before = db.prepare('SELECT COUNT(*) AS n FROM page_views').get().n;

    // A path of the wrong type blows up inside the transaction.
    assert.throws(() =>
      recordBatch(db, {
        views: [{ path: '/ok' }, { path: { not: 'a string' } }],
        visitor: 'c'.repeat(32),
      }),
    );

    const after = db.prepare('SELECT COUNT(*) AS n FROM page_views').get().n;
    assert.equal(after, before, 'the good row from a failed batch must not survive');
  });
});

describe('traffic retention', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('drops the raw rows and keeps the rollup for ever', () => {
    const { db } = server.ctx;
    recordBatch(db, { views: [{ path: '/old' }], visitor: 'd'.repeat(32) });

    // Age the raw rows past the window without touching daily_stats.
    const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
    db.prepare('UPDATE page_views SET created_at = ?').run(old);
    db.prepare('UPDATE daily_visitors SET day = ?').run(old.slice(0, 10));

    const pruned = pruneTraffic(db, { days: 90 });
    assert.ok(pruned.views >= 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM page_views').get().n, 0);

    const rollup = db.prepare("SELECT * FROM daily_stats WHERE path = '/old'").get();
    assert.ok(rollup, 'the rollup outlives the rows it was built from');
    assert.equal(rollup.views, 1);
  });
});

describe('editing the site’s words', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('keeps a draft off the public site until it is published', () => {
    const { db } = server.ctx;
    saveDraft(db, { key: 'brand.promise', value: 'A draft nobody has approved' });

    assert.equal(publishedContent(db)['brand.promise'], undefined, 'a draft is not live');

    publish(db, { key: 'brand.promise' });
    assert.equal(publishedContent(db)['brand.promise'], 'A draft nobody has approved');
  });

  it('refuses a key that is not on the editable list', () => {
    assert.throws(() => saveDraft(server.ctx.db, { key: 'users.password_hash', value: 'x' }));
  });

  it('refuses malformed JSON before it can reach the site', () => {
    assert.throws(() => saveDraft(server.ctx.db, { key: 'faqs', value: '{not json' }));
  });

  it('falls back to the compiled copy when a published value cannot be parsed', () => {
    const { db } = server.ctx;
    // Corrupt the stored value directly, the way a bad restore might.
    db.prepare("UPDATE content_blocks SET published_value = '{{{' WHERE key = 'faqs'").run();
    const content = publishedContent(db);
    assert.equal(content.faqs, undefined, 'an unparseable override is omitted, not thrown');
    // And it does not take the rest of the content down with it.
    assert.equal(typeof content['brand.promise'], 'string');
  });

  it('puts an earlier revision back, live, in one move', () => {
    const { db } = server.ctx;
    saveDraft(db, { key: 'brand.tagline', value: 'The good one' });
    publish(db, { key: 'brand.tagline' });

    saveDraft(db, { key: 'brand.tagline', value: 'The regrettable one' });
    publish(db, { key: 'brand.tagline' });
    assert.equal(publishedContent(db)['brand.tagline'], 'The regrettable one');

    const good = revisions(db, { key: 'brand.tagline' }).find((r) => r.value === 'The good one');
    revert(db, { revisionId: good.id });

    assert.equal(publishedContent(db)['brand.tagline'], 'The good one');
    // The draft moves too, so the next publish cannot resurrect the bad copy.
    const row = db.prepare("SELECT draft_value FROM content_blocks WHERE key = 'brand.tagline'").get();
    assert.equal(row.draft_value, 'The good one');
  });
});

describe('the admin API', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('serves published content to anyone, without a session', async () => {
    saveDraft(server.ctx.db, { key: 'brand.promise', value: 'Live copy' });
    publish(server.ctx.db, { key: 'brand.promise' });

    const response = await server.client().get('/api/content');
    assert.equal(response.status, 200);
    assert.equal(response.body.content['brand.promise'], 'Live copy');
  });

  it('shuts everything else to anyone who is not an admin', async () => {
    for (const path of ['/api/admin/overview', '/api/admin/traffic', '/api/admin/content', '/api/admin/leads.csv']) {
      assert.equal((await server.client().get(path)).status, 401, `${path} must reject anonymous`);
    }

    const member = await signUp(server);
    for (const path of ['/api/admin/overview', '/api/admin/content', '/api/admin/leads.csv']) {
      assert.equal((await member.client.get(path)).status, 403, `${path} must reject a member`);
    }
  });

  it('gives an admin the overview, the traffic and the editor', async () => {
    const admin = await asAdmin(server);
    recordBatch(server.ctx.db, { views: [{ path: '/' }], visitor: 'e'.repeat(32) });

    const overview = await admin.client.get('/api/admin/overview');
    assert.equal(overview.status, 200);
    assert.ok(overview.body.traffic.totals.views >= 1);
    assert.ok(Array.isArray(overview.body.traffic.series));
    assert.ok(typeof overview.body.leads.total === 'number');

    const content = await admin.client.get('/api/admin/content');
    assert.equal(content.status, 200);
    assert.ok(content.body.blocks.length > 0);
    assert.ok(content.body.blocks.every((b) => 'hasUnpublishedChanges' in b));
  });

  it('saves, publishes and reverts over HTTP', async () => {
    const admin = await asAdmin(server);

    const saved = await admin.client.put('/api/admin/content/hero.title', { value: 'A new headline' });
    assert.equal(saved.status, 200);
    // Saving alone changes nothing the public can see.
    assert.equal((await server.client().get('/api/content')).body.content['hero.title'], undefined);

    const published = await admin.client.post('/api/admin/content/hero.title/publish', {});
    assert.equal(published.status, 200);
    assert.equal((await server.client().get('/api/content')).body.content['hero.title'], 'A new headline');

    const history = await admin.client.get('/api/admin/content/revisions?key=hero.title');
    assert.ok(history.body.revisions.length >= 2, 'both the save and the publish are recorded');
  });

  it('will not edit a block that is not on the list', async () => {
    const admin = await asAdmin(server);
    const response = await admin.client.put('/api/admin/content/anything.else', { value: 'x' });
    assert.equal(response.status, 404);
  });

  it('exports the leads as a spreadsheet that will not run formulas', async () => {
    const admin = await asAdmin(server);
    server.ctx.db
      .prepare(
        `INSERT INTO leads (id, name, email, source, status, message, created_at, updated_at)
         VALUES ('csv-1', '=cmd|calc', 'a@b.com', 'contact', 'new', 'Has, a comma', '2026-01-01', '2026-01-01')`,
      )
      .run();

    const response = await admin.client.get('/api/admin/leads.csv');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/csv/);

    const csv = response.text ?? response.body;
    const text = typeof csv === 'string' ? csv : JSON.stringify(csv);
    // The formula is neutralised, and the comma inside a field is quoted.
    assert.ok(text.includes("'=cmd|calc"), 'a leading = must be escaped for Excel');
    assert.ok(text.includes('"Has, a comma"'));
  });
});

describe('the traffic summary', () => {
  let server;
  before(async () => {
    server = await startTestServer();
  });
  after(async () => {
    await server.close();
  });

  it('ranks pages, referrers and events, and totals the window', () => {
    const { db } = server.ctx;
    for (let i = 0; i < 5; i++) {
      recordBatch(db, {
        views: [{ path: '/', referrer: 'https://news.ycombinator.com/', device: 'mobile' }],
        events: [{ name: 'drawdown_open' }],
        visitor: `${i}`.repeat(32),
      });
    }
    recordBatch(db, { views: [{ path: '/contact' }], visitor: 'f'.repeat(32) });

    const summary = trafficSummary(db, { days: 30 });
    assert.equal(summary.totals.views, 6);
    assert.equal(summary.totals.visitors, 6);
    assert.equal(summary.pages[0].path, '/');
    assert.equal(summary.pages[0].views, 5);
    assert.equal(summary.referrers[0].source, 'news.ycombinator.com');
    assert.equal(summary.events[0].name, 'drawdown_open');
    assert.equal(summary.events[0].count, 5);
    assert.ok(summary.devices.some((d) => d.device === 'mobile'));
  });
});
