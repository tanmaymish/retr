/**
 * Analytics, behind one interface.
 *
 * Providers are chosen by environment variable, never hardcoded, and nothing
 * loads at all unless one is configured — so the default build ships with no
 * third-party script, no cookie banner obligation, and no requests leaving the
 * page. Swapping provider means changing an env var, not the code.
 *
 *   VITE_ANALYTICS_PROVIDER = plausible | ga | clarity
 *   VITE_ANALYTICS_ID       = domain / measurement id / project id
 *   VITE_ANALYTICS_HOST     = optional self-hosted endpoint (Plausible)
 */
const provider = import.meta.env.VITE_ANALYTICS_PROVIDER ?? '';
const id = import.meta.env.VITE_ANALYTICS_ID ?? '';
const host = import.meta.env.VITE_ANALYTICS_HOST ?? '';

let loaded = false;

export function initAnalytics() {
  if (loaded || !provider || !id || typeof document === 'undefined') return;
  loaded = true;

  if (provider === 'plausible') {
    inject(`${host || 'https://plausible.io'}/js/script.js`, { 'data-domain': id, defer: '' });
    window.plausible = window.plausible || ((...args) => (window.plausible.q ??= []).push(args));
    return;
  }

  if (provider === 'ga') {
    inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, { async: '' });
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    // No automatic page_view: routing is client-side, so pages are sent by hand.
    window.gtag('config', id, { send_page_view: false, anonymize_ip: true });
    return;
  }

  if (provider === 'clarity') {
    inject(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`, { async: '' });
  }
}

function inject(src, attributes = {}) {
  const script = document.createElement('script');
  script.src = src;
  for (const [key, value] of Object.entries(attributes)) script.setAttribute(key, value);
  document.head.appendChild(script);
}

/** A page view. Called by the router, because the router is what changes pages. */
export function trackPageView(path) {
  if (!loaded) return;
  if (provider === 'plausible') window.plausible?.('pageview', { u: location.origin + path });
  if (provider === 'ga') window.gtag?.('event', 'page_view', { page_path: path });
}

/**
 * A named event. Properties are limited to counts, scores and enum-ish labels
 * on purpose — nothing identifying a person is ever sent to a third party.
 */
export function track(event, properties = {}) {
  if (!loaded) return;
  if (provider === 'plausible') window.plausible?.(event, { props: properties });
  if (provider === 'ga') window.gtag?.('event', event, properties);
}

export const analyticsEnabled = Boolean(provider && id);
