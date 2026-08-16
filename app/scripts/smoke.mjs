/**
 * Does the built site actually work when you click it?
 *
 * Everything else in this repository is checked without a browser: the
 * calculators have unit tests, the API has integration tests, the build fails
 * if a page is missing. None of that catches the failure this script exists
 * for — a button that renders perfectly, is not disabled, and does nothing at
 * all when clicked.
 *
 * That shipped. Thirteen "Request a call" buttons across eight pages dispatched
 * an event to a listener that was never mounted, because the component holding
 * it returned null when the published build had no enquiry endpoint. Every
 * check passed. The site was dead in the hands of anyone using it.
 *
 * So this drives the real bundle in a real browser and asserts on behaviour:
 * the pages load, the call-to-action opens something, the calculators compute,
 * and nothing throws. It runs against `app/dist`, so it tests what is about to
 * be published rather than what the dev server happens to do.
 *
 *   npm --prefix app run smoke              # after a build
 *   VITE_BASE=/retr/ npm --prefix app run smoke
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(HERE, '..', 'dist');
const BASE = (process.env.VITE_BASE ?? '/').replace(/\/*$/, '/');
const PORT = Number(process.env.SMOKE_PORT ?? 4321);
/* The bundle under test was built to talk to an API rather than to stand alone,
   and that API is not running. See `headingOrWaiting`. */
const SERVED = process.env.SMOKE_SERVED === '1';

if (!fs.existsSync(path.join(DIST, 'index.html'))) {
  console.error(`no build at ${DIST} — run "npm --prefix app run build" first`);
  process.exit(1);
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

/* Serves dist the way a static host does, including the single-page fallback:
   an unknown path gets 404.html, which boots the app and routes client-side. */
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (!url.startsWith(BASE)) {
    res.writeHead(404).end('outside the base path');
    return;
  }
  const rel = url.slice(BASE.length) || 'index.html';
  let file = path.join(DIST, rel);
  if (!file.startsWith(DIST)) {
    res.writeHead(403).end('no');
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file = fs.existsSync(`${file}.html`) ? `${file}.html` : path.join(DIST, '404.html');
  res.writeHead(fs.existsSync(file) ? 200 : 404, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
  });
  res.end(fs.existsSync(file) ? fs.readFileSync(file) : 'not found');
});
await new Promise((resolve) => server.listen(PORT, resolve));

const failures = [];
function check(ok, what) {
  if (!ok) failures.push(what);
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${what}`);
}

/**
 * Playwright downloads a browser build pinned to its own version. Some
 * environments — CI images, this project's container — ship a shared browser at
 * PLAYWRIGHT_BROWSERS_PATH that was fetched for a different Playwright version,
 * and then the default launch fails on a path that does not exist. A revision
 * mismatch is not a reason to skip the only test that clicks anything, so fall
 * back to whatever chromium is actually on disk.
 */
async function launch() {
  try {
    return await chromium.launch();
  } catch (error) {
    const root = process.env.PLAYWRIGHT_BROWSERS_PATH;
    const found = root && fs.existsSync(root) ? findChromium(root) : null;
    if (!found) throw error;
    console.log(`(using ${found})\n`);
    return chromium.launch({ executablePath: found });
  }
}

function findChromium(root) {
  for (const entry of fs.readdirSync(root)) {
    for (const rel of ['chrome-linux/chrome', 'chrome-linux/headless_shell']) {
      const candidate = path.join(root, entry, rel);
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

const browser = await launch();
const context = await browser.newContext();

/* The build links a stylesheet from Google Fonts. A sandbox without egress
   would hang on it for the navigation timeout on every single page, so it is
   answered locally — the icon font itself is bundled and subsetted, and its
   absence is what `main.jsx` measures for and degrades around. */
await context.route('**://fonts.googleapis.com/**', (route) =>
  route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
);
await context.route('**://fonts.gstatic.com/**', (route) => route.abort());

const page = await context.newPage();

/* A thrown exception in a React tree unmounts everything below it, so any
   uncaught error is a failure even if the assertions afterwards still pass. */
const thrown = [];
page.on('pageerror', (error) => thrown.push(error.message));

const PAGES = [
  { path: '', name: 'home' },
  { path: 'calculators', name: 'calculators' },
  { path: 'preparedness-check', name: 'preparedness check' },
  { path: 'services', name: 'services' },
  { path: 'trust', name: 'how we are paid' },
  { path: 'insights', name: 'insights' },
  { path: 'about', name: 'about' },
  { path: 'contact', name: 'contact' },
];

const url = (p) => `http://localhost:${PORT}${BASE}${p}`;

/**
 * A heading — or, in served mode, an acknowledgement that this page cannot draw
 * one without its API.
 *
 * Two pages get their contents from the server rather than from the bundle: the
 * preparedness check fetches its questions, and the portal checks the session
 * before it renders anything. Built that way and run with no server up, they
 * correctly show a spinner or an unavailable state and never reach a heading.
 *
 * That is a property of the bundle, not a fault in the page, so it is not
 * guessed at: `SMOKE_SERVED=1` says which bundle this is. The default is the
 * one that gets published — static, where both pages are self-contained and a
 * missing heading is a real failure.
 */
async function headingOrWaiting(what) {
  const heading = await page.locator('h1').first().isVisible().catch(() => false);
  if (!heading && SERVED) {
    console.log(` skip  ${what} — this page needs the API, and SMOKE_SERVED is set`);
    return;
  }
  check(heading, what);
}

console.log(`\nsmoke test against ${DIST} at base ${BASE}\n`);

for (const target of PAGES) {
  await page.goto(url(target.path), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header', { timeout: 15_000 }).catch(() => {});

  await headingOrWaiting(`${target.name}: renders a heading`);

  /* The regression this file was written for. Every control that offers to put
     the visitor in touch must open the dialog — whether or not there is an
     inbox to send it to. Having nowhere to send an enquiry changes what the
     dialog says; it must never change whether the button works. */
  const ctas = page.locator('button:not([disabled])', { hasText: /request a call|talk it through|shall we call/i });
  const count = await ctas.count();
  if (count > 0) {
    await ctas.first().click();
    const dialog = await page
      .locator('[role="dialog"]')
      .first()
      .waitFor({ state: 'visible', timeout: 4000 })
      .then(() => true)
      .catch(() => false);
    check(dialog, `${target.name}: the call-to-action opens the dialog (${count} on the page)`);
    if (dialog) {
      await page.keyboard.press('Escape');
      await page.locator('[role="dialog"]').first().waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    }
  }
}

/* One calculator, end to end: the shared engine reaching the screen is the
   whole point of the static build, and a silent import failure would show as
   an empty result rather than an error. */
await page.goto(url('calculators/sip'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(600);
const figures = await page.locator('body').innerText();
check(/₹/.test(figures), 'calculators: the SIP calculator shows a rupee figure');

/* The portal is reachable by clicking, not only by typing a URL. */
await page.goto(url(''), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
check((await page.locator('a[href$="/admin"]').count()) > 0, 'home: there is a link to the founders’ portal');

await page.goto(url('admin'), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
await headingOrWaiting('admin: the portal route resolves rather than 404ing');

check(thrown.length === 0, `no uncaught exceptions${thrown.length ? `: ${thrown.join(' | ')}` : ''}`);

await browser.close();
server.close();

console.log('');
if (failures.length) {
  console.error(`${failures.length} failed:\n${failures.map((f) => `  - ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('all good');
