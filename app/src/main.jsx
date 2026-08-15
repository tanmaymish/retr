import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import './styles/theme.css';
import App from './App.jsx';
import { AuthProvider } from './state/AuthContext';
import { ToastProvider } from './components/ui';
import { initAnalytics } from './lib/analytics';
import { initTelemetry } from './lib/telemetry';
import { loadSiteContent } from './lib/siteContent';

// No-op unless a provider is configured, so the default build loads no
// third-party script at all.
initAnalytics();

/* Our own collector, first-party and cookieless. Queues to localStorage and
   flushes on a timer, so the server being down costs nothing. */
initTelemetry();

/* Editable copy, fetched after paint. The compiled defaults are already on
   screen by the time this resolves, so a failure here is invisible. */
loadSiteContent();

/**
 * Reveal the icon glyphs once the icon font is actually usable.
 *
 * Icons are ligatures, so without the font the browser paints the ligature
 * *name* — a page full of TRENDING_DOWN and ARROW_FORWARD. theme.css keeps them
 * transparent until this flips, so a missing or slow font degrades to nothing
 * visible instead of to debug text.
 *
 * `document.fonts.check` needs a size and a sample string; the sample is one of
 * the ligature names we actually use, because a subsetted font can load
 * successfully and still be missing a glyph.
 */
function revealIconsWhenReady() {
  const show = () => document.documentElement.classList.add('icons-ready');

  // No Font Loading API to ask: assume the font arrives, since the alternative
  // is hiding every icon on a browser that may well have loaded it fine.
  if (!document.fonts?.ready) {
    show();
    return;
  }

  /**
   * Measure, rather than ask.
   *
   * `document.fonts.check()` answers "can anything in the stack draw this
   * string?" — and an icon name is plain ASCII, so every fallback can, and the
   * answer is always yes. Useless here.
   *
   * What we actually need to know is whether the *ligature* resolved. So draw
   * one off-screen: with the icon font active, `arrow_forward` collapses to a
   * single glyph about as wide as it is tall. Without it, the browser sets
   * thirteen letters, which is several times wider.
   */
  const usable = () => {
    const probe = document.createElement('span');
    probe.textContent = 'arrow_forward';
    probe.style.cssText =
      'position:absolute;left:-9999px;top:0;font:24px "Material Symbols Rounded";' +
      'white-space:nowrap;visibility:hidden;';
    document.body.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width > 0 && width < 48;
  };

  document.fonts.ready.then(() => {
    if (usable()) show();
  });

  /* A safety valve for a `fonts.ready` that never settles — but it re-runs the
     same check rather than revealing regardless. Showing on a timer would put
     the ligature names back on the page in exactly the case this exists to
     prevent, and the icons are decorative: every one is aria-hidden beside a
     real label, so hiding them costs nothing. */
  setTimeout(() => {
    if (usable()) show();
  }, 3000);
}
revealIconsWhenReady();

/* Every real deployment uses real URLs. The exception is the single-file
   preview build, which is opened from a sandbox that has no server behind it
   to answer /calculators — there, and only there, routes live in the hash. */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;
const basename = import.meta.env.VITE_HASH_ROUTER
  ? undefined
  : import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The router has to know it may be mounted under /<repo>/ on Pages. */}
    <Router basename={basename}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </Router>
  </StrictMode>,
);
