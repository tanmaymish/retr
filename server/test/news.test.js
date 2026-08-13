import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import express from 'express';
import { loadConfig } from '../src/config.js';
import { newsRoutes } from '../src/routes/news.js';

/**
 * The news strip reads someone else's feed, so the tests cover the two things
 * that actually go wrong in production: a feed that returns nonsense, and a
 * feed that is simply down.
 */

const FEED = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Rupee closes higher]]></title><link>https://example.test/a</link><pubDate>Wed, 13 Aug 2026 08:00:00 GMT</pubDate></item>
<item><title>Sensex &amp; Nifty end flat</title><link>https://example.test/b</link><pubDate>Wed, 13 Aug 2026 07:00:00 GMT</pubDate></item>
<item><title>Missing its link</title><pubDate>Wed, 13 Aug 2026 06:00:00 GMT</pubDate></item>
</channel></rss>`;

describe('news', () => {
  let upstream;
  let api;
  let base;

  before(async () => {
    const feeds = express();
    feeds.get('/feed.xml', (_req, res) => res.type('application/xml').send(FEED));
    feeds.get('/broken.xml', (_req, res) => res.status(500).send('nope'));
    upstream = feeds.listen(0);
    const feedPort = upstream.address().port;

    process.env.SESSION_SECRET = 'x'.repeat(40);
    process.env.DOCUMENT_KEY = 'y'.repeat(40);
    const config = loadConfig(process.env);
    config.newsFeeds = [
      { name: 'Test Wire', url: `http://127.0.0.1:${feedPort}/feed.xml` },
      { name: 'Broken Wire', url: `http://127.0.0.1:${feedPort}/broken.xml` },
    ];

    const app = express();
    app.use('/api', newsRoutes({ config, logger: { warn() {}, info() {} } }));
    api = app.listen(0);
    base = `http://127.0.0.1:${api.address().port}`;
  });

  after(() => {
    upstream?.close();
    api?.close();
  });

  it('returns headlines with their source and time, newest first', async () => {
    const response = await fetch(`${base}/api/news`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.items.length, 2, 'the item with no link is dropped');
    assert.equal(body.items[0].title, 'Rupee closes higher');
    assert.equal(body.items[0].source, 'Test Wire');
    assert.ok(body.items[0].publishedAt > body.items[1].publishedAt, 'newest first');
  });

  it('decodes entities and strips CDATA rather than showing the markup', async () => {
    const body = await (await fetch(`${base}/api/news`)).json();
    const titles = body.items.map((item) => item.title);
    assert.ok(titles.includes('Sensex & Nifty end flat'), titles.join(' | '));
    assert.ok(!titles.some((title) => title.includes('CDATA') || title.includes('&amp;')));
  });

  it('carries on when one feed is down', async () => {
    // The broken feed is in the list above; the response still has the other's
    // items rather than failing the request.
    const response = await fetch(`${base}/api/news`);
    assert.equal(response.status, 200);
    assert.ok((await response.json()).items.length > 0);
  });

  it('keeps only what it is entitled to keep', async () => {
    const body = await (await fetch(`${base}/api/news`)).json();
    // Headline, link, source, time — we link out rather than reproduce.
    assert.deepEqual(Object.keys(body.items[0]).sort(), ['link', 'publishedAt', 'source', 'title']);
  });
});
