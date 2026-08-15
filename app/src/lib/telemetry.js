/**
 * First-party analytics that survive the server being down.
 *
 * The site is often served from a static host with the API somewhere else, so
 * the collector is the part most likely to be unreachable — a cold start, a
 * deploy, a network the visitor is walking out of. None of that is allowed to
 * cost a page view or, worse, be visible to the person browsing.
 *
 * So nothing is sent immediately. Hits go into a queue in localStorage and are
 * flushed on a timer, when the tab is hidden, and when the browser says the
 * network came back. A failed flush puts the batch back. A queue that grows
 * past its ceiling drops its *oldest* entries, because in a backlog the recent
 * ones are the ones worth keeping.
 *
 * There is no cookie and no identifier. Visitors are counted server-side by a
 * hash that rotates daily and cannot be joined to anything.
 */

import { isStatic } from './backend';

const KEY = 'av.telemetry.q';
const MAX_QUEUED = 200;
const FLUSH_EVERY_MS = 15_000;
const BATCH = 50;

/* Where the collector lives. Same-origin for the served app; for a static
   build it has to be told, and if it is not told, telemetry is simply off —
   which is the correct default for a site that may be someone's fork. */
const ENDPOINT = import.meta.env.VITE_COLLECT_ENDPOINT ?? (isStatic ? '' : '/api/collect');

export const telemetryEnabled = Boolean(ENDPOINT) && typeof window !== 'undefined';

let timer = null;
let flushing = false;

/** localStorage throws in private modes and when full; never let that matter. */
function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(queue) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(queue));
  } catch {
    /* Full or blocked. The queue simply does not persist across reloads, which
       is a smaller loss than an exception thrown from a page view. */
  }
}

function enqueue(entry) {
  if (!telemetryEnabled) return;
  const queue = read();
  queue.push(entry);
  // Drop from the front: a long backlog means old hits, and the recent ones
  // are the ones anybody will look at.
  write(queue.slice(-MAX_QUEUED));
  schedule();
}

function schedule() {
  if (timer || !telemetryEnabled) return;
  timer = setTimeout(() => {
    timer = null;
    flush();
  }, FLUSH_EVERY_MS);
}

/**
 * Send what is queued.
 *
 * `keepalive` lets the request outlive the page during an unload, which is the
 * moment the last and most interesting hit usually happens. A rejected or
 * failed send returns the batch to the front of the queue for the next attempt.
 */
export async function flush({ beacon = false } = {}) {
  if (!telemetryEnabled || flushing) return;

  const queue = read();
  if (queue.length === 0) return;

  const batch = queue.slice(0, BATCH);
  const rest = queue.slice(BATCH);
  const payload = {
    views: batch.filter((e) => e.t === 'v').map((e) => e.d),
    events: batch.filter((e) => e.t === 'e').map((e) => e.d),
  };

  flushing = true;
  write(rest);

  try {
    /* On unload, sendBeacon is the only thing the browser reliably completes.
       It cannot report failure, so anything it takes is treated as delivered —
       the alternative is re-sending everything after every page close. */
    if (beacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      if (!navigator.sendBeacon(ENDPOINT, blob)) write([...batch, ...rest]);
      return;
    }

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    /* A 4xx means this batch will never be accepted, so retrying it for ever
       would block everything behind it. Anything else is treated as temporary
       and the batch goes back. */
    if (!response.ok && response.status < 400) write([...batch, ...rest]);
  } catch {
    write([...batch, ...rest]);
  } finally {
    flushing = false;
    if (read().length > 0) schedule();
  }
}

const device = () => {
  if (typeof window === 'undefined') return undefined;
  const w = window.innerWidth;
  if (w < 760) return 'mobile';
  if (w < 1100) return 'tablet';
  return 'desktop';
};

let openedAt = Date.now();
let currentPath = null;
let firstView = true;

/**
 * A page view, queued the moment it happens.
 *
 * An earlier version held the view back until the visitor navigated away, so
 * it could be sent with the time spent on it. That quietly lost the commonest
 * visit there is: land on one page, read it, close the tab. Nothing was ever
 * enqueued, because there was never a second view to trigger the first.
 *
 * So the view goes out on arrival, and the time spent follows separately as an
 * event when — and only when — the browser gives us the chance to send it.
 */
export function recordView(path) {
  if (!telemetryEnabled) return;

  flushDwell();
  currentPath = path;
  openedAt = Date.now();

  // The referrer is only meaningful for the first page of a visit; after that
  // it is our own site, which tells us nothing about where anyone came from.
  const external =
    firstView && document.referrer && !document.referrer.startsWith(window.location.origin);
  firstView = false;

  enqueue({ t: 'v', d: { path, device: device(), ...(external ? { referrer: document.referrer } : {}) } });
}

/** How long the page just left was open, as an event rather than a second view. */
function flushDwell() {
  if (currentPath === null) return;
  const ms = Date.now() - openedAt;
  const path = currentPath;
  currentPath = null;
  // Under a second is a redirect or a mis-click, not a reading.
  if (ms >= 1000) enqueue({ t: 'e', d: { name: 'page_dwell', path, props: { ms } } });
}

/** A named thing somebody did. Counts and labels only. */
export function recordEvent(name, props) {
  if (!telemetryEnabled) return;
  enqueue({ t: 'e', d: { name, path: lastPath ?? undefined, props } });
}

/**
 * Start listening.
 *
 * `visibilitychange` rather than `unload`: it is the only lifecycle event that
 * fires reliably on mobile, where a tab is backgrounded and killed rather than
 * closed.
 */
export function initTelemetry() {
  if (!telemetryEnabled) return;

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'hidden') return;
    flushDwell();
    flush({ beacon: true });
  });

  // A full navigation away fires pagehide but not always visibilitychange, and
  // it is the last moment anything can be sent.
  window.addEventListener('pagehide', () => {
    flushDwell();
    flush({ beacon: true });
  });

  // A queue left over from a session that ended offline goes out now.
  window.addEventListener('online', () => flush());
  flush();
}
