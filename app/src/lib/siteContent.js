import { useSyncExternalStore } from 'react';
import { isStatic } from './backend';

/**
 * Editable copy, layered over copy that is already there.
 *
 * The rule this module exists to enforce: **the compiled default is the site's
 * copy, and the server only ever overrides it.** Nothing here can produce a
 * missing headline or an empty list, because the value returned when anything
 * goes wrong is the one the bundle already shipped with.
 *
 * That gives three failure modes, all of them invisible to a visitor:
 *
 * - the API is down, slow, or was never configured → compiled defaults;
 * - a stored override is malformed → the server omits it, so: compiled default;
 * - the fetch has not finished yet → compiled defaults, then a swap when it
 *   lands, from a cache so the swap almost never happens on a repeat visit.
 *
 * The overrides are cached in localStorage and read synchronously on the first
 * render, so a returning visitor sees the edited copy immediately rather than
 * watching it change under them.
 */

const CACHE_KEY = 'av.content.v1';
const CACHE_TTL_MS = 6 * 3_600_000;

const ENDPOINT = import.meta.env.VITE_CONTENT_ENDPOINT ?? (isStatic ? '' : '/api/content');

let overrides = readCache();
const listeners = new Set();

function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const { at, content } = JSON.parse(raw);
    if (!content || typeof content !== 'object') return {};
    // Stale cache is still better than nothing: it is served, and the fetch
    // below replaces it. Only absurdly old entries are discarded.
    if (Date.now() - at > CACHE_TTL_MS * 28) return {};
    return content;
  } catch {
    return {};
  }
}

function writeCache(content) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), content }));
  } catch {
    // Private mode or a full quota. The site works; it just re-fetches.
  }
}

function publish(next) {
  overrides = next;
  for (const listener of listeners) listener();
}

/**
 * Fetch the overrides, after paint, never blocking anything.
 *
 * There is deliberately no retry loop and no error surface. If this fails the
 * site is already showing correct copy, and hammering a server that is having
 * trouble would be the wrong response to that.
 */
export function loadSiteContent() {
  if (!ENDPOINT || typeof window === 'undefined') return;

  const run = async () => {
    try {
      const response = await fetch(ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const body = await response.json();
      if (!body || typeof body.content !== 'object' || body.content === null) return;
      writeCache(body.content);
      publish(body.content);
    } catch {
      // Offline, blocked, or no server. The compiled copy stands.
    }
  };

  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 400);
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => overrides;

/**
 * Read one block, with the compiled value as the fallback.
 *
 * `fallback` is not a nicety — it is the actual content. Every call site passes
 * the value from content.js, so an override is only ever an improvement on
 * something already correct.
 */
export function useContent(key, fallback) {
  const current = useSyncExternalStore(subscribe, snapshot, snapshot);
  const value = current[key];

  if (value === undefined || value === null) return fallback;
  // A list that arrives empty is almost always a mistake in the editor rather
  // than an intention to show nothing, so the compiled list wins.
  if (Array.isArray(fallback) && (!Array.isArray(value) || value.length === 0)) return fallback;
  if (typeof fallback === 'string' && typeof value !== 'string') return fallback;
  if (typeof fallback === 'string' && value.trim() === '') return fallback;

  return value;
}

/** The same lookup outside React, for code that is not a component. */
export function contentValue(key, fallback) {
  const value = overrides[key];
  return value === undefined || value === null ? fallback : value;
}
