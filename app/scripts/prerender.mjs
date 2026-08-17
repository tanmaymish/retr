#!/usr/bin/env node
/**
 * Build-time prerendering for the marketing pages.
 *
 * A single-page app serves crawlers an empty shell: one title, one description,
 * for every URL. Rather than migrating to a server-rendered framework for that
 * one reason, this writes a real HTML file per public route with its own title,
 * description, canonical, Open Graph tags and a readable text fallback. React
 * still takes over on load, so behaviour is unchanged for people.
 *
 * Run after `vite build`. The server prefers these files when one matches the
 * request path (see server/src/app.js).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
/* CI passes the real one from actions/configure-pages, so this default only
   affects a local build. It names the GitHub Pages address the project page
   will have, rather than a placeholder domain nobody owns. */
const SITE = process.env.SITE_URL || 'https://tanmaymish.github.io/retr';

const ROUTES = [
  {
    path: '/',
    file: 'index.html',
    title: 'Akshay Vriddhi — Prosperity with Purpose',
    description:
      'Retire without asking anyone for money. A retirement plan built on your real numbers, from an IRDAI-registered Insurance Marketing Firm founded by two people with two decades each in life insurance.',
    priority: '1.0',
    heading: 'Retire without asking anyone for money.',
    body: 'Akshay Vriddhi is an IRDAI-registered Insurance Marketing Firm. We build retirement plans for Indian households in the ten years before the salary stops: a target corpus, the gap to it, and the monthly figure that closes it — in writing, before any product is suggested. Create. Continue. Live. Leave a Legacy.',
  },
  {
    path: '/about',
    file: 'about.html',
    title: 'About — Akshay Vriddhi',
    description:
      'Akshay Vriddhi begins with experience. The philosophy, the founders, and why an advisory built on listening rather than selling.',
    priority: '0.9',
    heading: 'Experience that now has a larger purpose.',
    body: 'Founded by Shiv Maheshwari and Vikram Rajput, each with two decades in life insurance. People do not need more insurance products — they need clarity about what they are protecting and why.',
  },
  {
    path: '/services',
    file: 'services.html',
    title: 'What we do — Akshay Vriddhi',
    description:
      'Protection, retirement, education funding and the planning around them — what Akshay Vriddhi advises on, how an engagement runs, and the four commitments behind it.',
    priority: '0.9',
    heading: 'Advice across a whole financial life, not one product at a time.',
    body: 'How an engagement runs, the seven pillars it covers — corpus planning, EPF/NPS/PPF optimisation, post-retirement income design, health cover, tax structuring, estate readiness and family conversations — and who this is for.',
  },
  {
    path: '/preparedness-check',
    file: 'preparedness-check.html',
    title: 'Preparedness Check — Akshay Vriddhi',
    description:
      'Six questions about cover, reserves and whether your family could find what they need. An indicative self-assessment — no signup, nothing stored.',
    priority: '0.9',
    heading: 'Where would your family stand tomorrow?',
    body: 'Six questions, scored and stored nowhere. An indicative self-assessment, not financial or insurance advice.',
  },
  {
    path: '/calculators',
    file: 'calculators.html',
    title: 'Calculators — Akshay Vriddhi',
    description:
      'Free calculators for Indian households: retirement drawdown, education goal, NPS, EPF, SIP and step-up SIP, home loan EMI and prepayment, income tax old versus new, human life value, Sukanya Samriddhi and PPF.',
    priority: '0.9',
    heading: 'Run the numbers yourself.',
    body: 'Retirement drawdown, education goal, NPS, EPF, SIP and step-up SIP, lumpsum, home loan EMI and prepayment, income tax old versus new, human life value, Sukanya Samriddhi and PPF. Nothing you enter is sent anywhere or stored.',
  },
  {
    path: '/trust',
    file: 'trust.html',
    title: 'How we are paid — Akshay Vriddhi',
    description:
      'Akshay Vriddhi is an IRDAI-registered Insurance Marketing Firm. We earn commission from the insurers and fund houses we are empanelled with, and we will tell you what it is.',
    priority: '0.8',
    heading: 'We earn commission. Ask us the number.',
    body: 'An Insurance Marketing Firm may empanel with up to six insurers in each of life, general and health, and distribute mutual funds. We are not fee-only, not commission-free, and not a SEBI-registered Investment Adviser.',
  },
  {
    path: '/insights',
    file: 'insights.html',
    title: 'Insights — Akshay Vriddhi',
    description:
      'Plain explanations of protection, retirement and planning for Indian households — what to check, what it costs, and what nobody tells you.',
    priority: '0.8',
    heading: 'What we would tell you in the meeting.',
    body: 'Term cover versus investment, why retirement maths punishes late starters, what changes when the business and the household are the same money, and how to read a policy you already own.',
  },
  {
    path: '/contact',
    file: 'contact.html',
    title: 'Start a conversation — Akshay Vriddhi',
    description: 'Tell us about your household and what you would like to protect. We listen before we advise.',
    priority: '0.8',
    heading: 'We listen before we advise.',
    body: 'Five short questions. No obligation, and no product recommended before we understand your situation.',
  },
  {
    path: '/privacy',
    file: 'privacy.html',
    title: 'Privacy notice — Akshay Vriddhi',
    description: 'What Akshay Vriddhi stores, how it is protected, and what we do not collect.',
    priority: '0.4',
    heading: 'Privacy notice',
    body: 'Three things kept apart: your account, your encrypted vault, and enquiries. The preparedness check stores nothing.',
  },
  {
    path: '/terms',
    file: 'terms.html',
    title: 'Terms of use — Akshay Vriddhi',
    description: 'The terms under which the Akshay Vriddhi vault is provided.',
    priority: '0.4',
    heading: 'Terms of use',
    body: 'Nothing in this application is financial, insurance, tax or legal advice.',
  },
];

const shell = readFileSync(join(dist, 'index.html'), 'utf8');

for (const route of ROUTES) {
  const url = `${SITE}${route.path}`;

  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/,
      `<meta name="description" content="${escapeHtml(route.description)}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/,
      `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/,
      `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
    )
    // Crawlers resolve og:image against nothing, so it has to be absolute. The
    // path in the built HTML already carries whatever base the build used.
    .replace(/content="[^"]*\/brand\/og\.png"/g, `content="${SITE}/brand/og.png"`);

  html = html.replace(
    '</head>',
    `  <link rel="canonical" href="${url}" />\n` +
      `    <meta property="og:url" content="${url}" />\n` +
      `    <meta name="twitter:card" content="summary_large_image" />\n` +
      `    <meta name="twitter:title" content="${escapeHtml(route.title)}" />\n` +
      `    <meta name="twitter:description" content="${escapeHtml(route.description)}" />\n` +
      '  </head>',
  );

  // A readable fallback inside the mount point. React replaces it on hydrate,
  // and a crawler that runs no JavaScript still finds real content.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><main><h1>${escapeHtml(route.heading)}</h1><p>${escapeHtml(route.body)}</p></main></div>`,
  );

  writeFileSync(join(dist, route.file), html);
}

// GitHub Pages has no rewrite rules: an unknown path falls through to 404.html,
// which boots the same single-page app and routes client-side. Pages also runs
// Jekyll unless told not to, and Jekyll drops files beginning with an
// underscore.
writeFileSync(join(dist, '404.html'), readFileSync(join(dist, 'index.html')));
writeFileSync(join(dist, '.nojekyll'), '');

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (route) => `  <url>
    <loc>${SITE}${route.path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
).join('\n')}
</urlset>
`,
);

// Everything behind a sign-in is disallowed: crawling it would only ever
// produce a redirect, and the URLs say something about the people using them.
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /vault
Disallow: /vault/
Disallow: /onboarding
Disallow: /verify
Disallow: /invite/

Sitemap: ${SITE}/sitemap.xml
`,
);

mkdirSync(dist, { recursive: true });
console.log(`prerendered ${ROUTES.length} routes, sitemap.xml and robots.txt (site: ${SITE})`);

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
