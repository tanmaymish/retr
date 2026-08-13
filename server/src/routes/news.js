import { Router } from 'express';

/**
 * Market and money headlines, from public RSS.
 *
 * Three things this deliberately does:
 *
 * - **Fetches server-side.** The browser never talks to the news source, so
 *   there is no key to leak (there is none to begin with), no CORS to work
 *   around, and no third-party script on the page.
 * - **Caches.** One fetch every fifteen minutes, shared by every visitor. A
 *   news strip is not worth hammering someone else's server for.
 * - **Keeps only the headline, the link, the source and the time.** We link out
 *   rather than reproduce: the article is the publisher's, not ours.
 *
 * The feeds are configurable so they can be changed without a deploy, and a
 * feed that fails is skipped rather than allowed to take the endpoint down.
 */

const CACHE_MS = 15 * 60 * 1000;
const FETCH_TIMEOUT_MS = 6000;
const MAX_ITEMS = 8;

const DEFAULT_FEEDS = [
  { name: 'Economic Times', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { name: 'Business Standard', url: 'https://www.business-standard.com/rss/finance-103.rss' },
];

let cache = { at: 0, items: [] };

/** RSS and Atom, without a parser dependency: these feeds are shallow. */
function parseFeed(xml, source) {
  const items = [];
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) ?? [];

  for (const block of blocks) {
    const title = pick(block, 'title');
    const link = pick(block, 'link') || (block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? '');
    const published = pick(block, 'pubDate') || pick(block, 'published') || pick(block, 'updated');
    if (!title || !link) continue;

    const at = Date.parse(published);
    items.push({
      title: title.slice(0, 200),
      link,
      source,
      publishedAt: Number.isNaN(at) ? null : new Date(at).toISOString(),
    });
  }
  return items;
}

function pick(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!match) return '';
  return decode(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).trim();
}

function decode(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]*>/g, '');
}

export function newsRoutes(ctx) {
  const router = Router();
  const feeds = ctx.config.newsFeeds?.length ? ctx.config.newsFeeds : DEFAULT_FEEDS;

  router.get('/news', async (_req, res) => {
    const now = Date.now();
    if (cache.items.length && now - cache.at < CACHE_MS) {
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json({ items: cache.items, fetchedAt: new Date(cache.at).toISOString(), cached: true });
      return;
    }

    const settled = await Promise.allSettled(
      feeds.map(async (feed) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
          const response = await fetch(feed.url, {
            signal: controller.signal,
            headers: { 'User-Agent': 'Akshayvriddhi/1.0 (+news strip)' },
          });
          if (!response.ok) throw new Error(`${feed.name} returned ${response.status}`);
          return parseFeed(await response.text(), feed.name);
        } finally {
          clearTimeout(timer);
        }
      }),
    );

    const items = settled
      .flatMap((outcome) => (outcome.status === 'fulfilled' ? outcome.value : []))
      .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))
      .slice(0, MAX_ITEMS);

    const failed = settled.filter((outcome) => outcome.status === 'rejected');
    if (failed.length) ctx.logger.warn('news_feed_failed', { count: failed.length });

    // A stale strip beats an empty one, but never a fabricated one.
    if (!items.length) {
      res.setHeader('Cache-Control', 'no-store');
      res.json({ items: cache.items, fetchedAt: cache.at ? new Date(cache.at).toISOString() : null, stale: true });
      return;
    }

    cache = { at: now, items };
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json({ items, fetchedAt: new Date(now).toISOString(), cached: false });
  });

  return router;
}
