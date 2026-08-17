import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
const paths = ['/', '/calculators', '/calculators/sip', '/calculators/human-life-value', '/insights',
  '/insights/term-cover-is-not-an-investment', '/insights/reading-a-policy-you-already-own',
  '/insights/nonsense', '/about', '/contact', '/preparedness-check'];
for (const path of paths) {
  await p.goto('http://localhost:4100' + path, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  const h1s = await p.$$eval('h1', els => els.map(e => e.textContent.trim()));
  console.log(path.padEnd(46), `h1×${h1s.length}`, (h1s[0] || '(none)').slice(0, 44));
}
console.log('errors:', errs.length ? errs : 'none');
await b.close();
