/**
 * Fold a built `dist/` into one self-contained HTML file.
 *
 * The preview is opened in a sandbox with no network and no server: no CDN,
 * no font host, and nothing to answer a request for /calculators. So every
 * stylesheet, script, image and font is inlined as a data URI, and the build
 * that feeds this one uses the hash router.
 *
 * The point of generating it from `dist/` rather than writing a preview by
 * hand is that it cannot drift from the site. Whatever the last build produced
 * is what the preview shows.
 *
 *   VITE_HASH_ROUTER=1 VITE_STATIC=1 npm run build --workspace app
 *   node app/scripts/single-file.mjs [outfile]
 *
 * The artifact host supplies its own <html>, <head> and <body>, so what is
 * written here is page content only — a <title>, the styles, the mount point
 * and the script.
 */

import { readFileSync, readdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(here, '..', 'dist');
const out = resolve(process.argv[2] ?? join(here, '..', 'preview.html'));

const MIME = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/**
 * Every image the site can ask for, as a data URI keyed by the URL `asset()`
 * would have produced.
 *
 * Rewriting the bundle's strings would not work: the picture element builds its
 * paths at runtime from a base name, so there is no literal to find. The map
 * below is handed to `asset()` instead, which looks its answer up in it.
 */
function assetMap() {
  const map = {};
  let bytes = 0;

  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      const mime = MIME[path.slice(path.lastIndexOf('.'))];
      if (!mime) continue;
      const buffer = readFileSync(path);
      bytes += buffer.length;
      map[`/${relative(DIST, path)}`] = `data:${mime};base64,${buffer.toString('base64')}`;
    }
  };

  for (const dir of ['brand', 'images', 'founders']) {
    const path = join(DIST, dir);
    if (existsSync(path)) walk(path);
  }
  return { map, bytes };
}

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

const cssFile = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
const jsFile = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
if (!cssFile || !jsFile) throw new Error('dist/index.html has no stylesheet or script to inline');

/* The stylesheet still opens with @import lines pointing at Google Fonts. The
   sandbox blocks them, and the faces are carried inline below instead. */
const css = readFileSync(join(DIST, cssFile.replace(/^\//, '')), 'utf8')
  .replace(/@import\s+(url\()?["'][^"']*fonts\.googleapis\.com[^"']*["']\)?\s*;/g, '');
const js = readFileSync(join(DIST, jsFile.replace(/^\//, '')), 'utf8');
const assets = assetMap();

/* The webfonts. Google Fonts is unreachable from the sandbox and the CSP
   blocks it anyway, so the faces the design depends on are carried inline;
   anything not found falls back to the stack already declared in theme.css. */
const FONT_DIR = process.env.PREVIEW_FONT_DIR;
let fontCss = '';
if (FONT_DIR && existsSync(FONT_DIR)) {
  const sheet = join(FONT_DIR, 'inline.css');
  if (existsSync(sheet)) fontCss = readFileSync(sheet, 'utf8');
}

const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Akshayvriddhi';

writeFileSync(
  out,
  [
    `<title>${title}</title>`,
    fontCss ? `<style>${fontCss}</style>` : '',
    `<style>${css}</style>`,
    '<div id="root"></div>',
    `<script>globalThis.__INLINE_ASSETS__=${JSON.stringify(assets.map)};</script>`,
    `<script type="module">${js}</script>`,
  ]
    .filter(Boolean)
    .join('\n'),
);

const bytes = readFileSync(out).length;
console.log(
  `single file → ${out}  ${(bytes / 1024 / 1024).toFixed(2)} MB  ` +
    `(${Object.keys(assets.map).length} assets, ${(assets.bytes / 1024).toFixed(0)} KB` +
    `${fontCss ? '; fonts inlined' : '; NO FONTS'})`,
);
