/**
 * Build a Material Symbols subset containing exactly the icons this site uses.
 *
 * The full variable font is 5.2 MB — impossible to inline into the single-file
 * preview. Google Fonts will subset it to a named list, which brings the same
 * icons down to about 170 KB.
 *
 * The names are read out of `src/` rather than kept in a list beside it. A
 * hand-maintained list drifts the moment someone adds an icon, and the failure
 * is invisible in the normal build (which fetches the full font) and ugly in
 * the preview, where the missing glyph renders as its own name in small caps.
 *
 *   node app/scripts/icon-subset.mjs <outdir>
 *
 * Writes `<outdir>/inline.css` — @font-face rules with every face as a data
 * URI, ready for single-file.mjs to inline. Needs network access.
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, '..', 'src');
const out = resolve(process.argv[2] ?? join(here, '..', '.icons'));

const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const TEXT_FACES =
  'family=Manrope:wght@400;500;600;700;800' +
  '&family=Plus+Jakarta+Sans:wght@400;500;600;700' +
  '&family=Cinzel:wght@500;600;700' +
  '&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500';

const SYMBOLS_AXES = 'opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';

/** Every icon name the source passes to <Icon name> or carries as `icon:`. */
function iconNames() {
  const names = new Set();
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (!/\.(jsx?|css)$/.test(path)) continue;
      const source = readFileSync(path, 'utf8');
      for (const match of source.matchAll(/\b(?:name|icon)\s*[=:]\s*['"]([a-z0-9_]+)['"]/g)) {
        names.add(match[1]);
      }
    }
  };
  walk(SRC);
  return [...names].sort();
}

const fetchText = (url) => execFileSync('curl', ['-sS', '-A', UA, url], { encoding: 'utf8' });
const fetchBytes = (url) => execFileSync('curl', ['-sS', url], { maxBuffer: 1 << 26, encoding: 'buffer' });

/**
 * Keep the Latin faces and drop the rest.
 *
 * Google returns a face per script — Cyrillic, Greek, Vietnamese and so on.
 * Carrying all of them multiplies the file for glyph coverage this site will
 * never draw.
 */
function latinFaces(css) {
  const keep = new Set(['latin', 'latin-ext']);
  const seen = new Map();
  let out = '';
  let bytes = 0;

  for (const chunk of css.split(/\/\*\s*/).slice(1)) {
    const subset = chunk.slice(0, chunk.indexOf('*/')).trim();
    if (!keep.has(subset)) continue;
    const face = chunk.slice(chunk.indexOf('*/') + 2).match(/@font-face\s*\{[\s\S]*?\}/);
    if (!face) continue;
    const url = face[0].match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
    if (!url) continue;
    if (!seen.has(url)) {
      const buffer = fetchBytes(url);
      bytes += buffer.length;
      seen.set(url, `data:font/woff2;base64,${buffer.toString('base64')}`);
    }
    out += `${face[0].replace(url, seen.get(url))}\n`;
  }
  return { css: out, faces: seen.size, bytes };
}

const names = iconNames();
if (names.length === 0) throw new Error('found no icon names in src/ — the pattern must have changed');

const text = latinFaces(fetchText(`https://fonts.googleapis.com/css2?${TEXT_FACES}&display=swap`));

const symbolsCss = fetchText(
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:${SYMBOLS_AXES}` +
    `&icon_names=${names.join(',')}&display=swap`,
);
const symbolsUrl = symbolsCss.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
if (!symbolsUrl) throw new Error('Google Fonts returned no woff2 for the icon subset');
const symbolsFont = fetchBytes(symbolsUrl);

mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, 'inline.css'),
  text.css +
    symbolsCss.replace(
      /url\(https:\/\/fonts\.gstatic\.com\/[^)]+\)/,
      `url(data:font/woff2;base64,${symbolsFont.toString('base64')})`,
    ),
);

console.log(
  `icon subset → ${out}/inline.css  ` +
    `${names.length} icons (${(symbolsFont.length / 1024).toFixed(0)} KB), ` +
    `${text.faces} text faces (${(text.bytes / 1024).toFixed(0)} KB)`,
);
