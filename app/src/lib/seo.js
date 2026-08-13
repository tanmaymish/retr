import { useEffect } from 'react';
import { asset } from './asset';

const SITE_NAME = 'Akshayvriddhi';
const DEFAULT_DESCRIPTION =
  'Akshayvriddhi — prosperity with purpose. Protection, retirement and financial planning for families and business owners in India’s smaller cities, from two founders with two decades each in life insurance.';

/**
 * Per-page metadata for a single-page app.
 *
 * Titles, descriptions, canonicals, Open Graph and JSON-LD are written into the
 * document head as each route mounts. Combined with the build-time prerender
 * (scripts/prerender.mjs), crawlers get real HTML with the right tags rather
 * than an empty shell.
 */
export function useSeo({ title, description, path, type = 'website', jsonLd, noIndex = false }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Prosperity with Purpose`;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    const url = path ? `${origin}${path}` : origin;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:site_name', SITE_NAME);
    const ogImage = `${origin}${asset('brand/og.png')}`;
    setMeta('property', 'og:image', ogImage);
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);
    setJsonLd(jsonLd ?? null);
  }, [title, description, path, type, jsonLd, noIndex]);
}

function setMeta(attribute, key, content) {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setCanonical(url) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

/** One managed JSON-LD block, replaced per route rather than accumulated. */
function setJsonLd(data) {
  const existing = document.head.querySelector('script[data-seo-jsonld]');
  if (existing) existing.remove();
  if (!data) return;

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-seo-jsonld', '');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: SITE_NAME,
  slogan: 'Prosperity with Purpose',
  description: DEFAULT_DESCRIPTION,
  logo: asset('brand/logo.png'),
  areaServed: 'IN',
  founder: [
    {
      '@type': 'Person',
      name: 'Shiv Maheshwari',
      jobTitle: 'Co-Founder',
      sameAs: 'https://www.linkedin.com/in/shiv-maheshwari-68909a3a/',
    },
    {
      '@type': 'Person',
      name: 'Vikram Rajput',
      jobTitle: 'Co-Founder',
      sameAs: 'https://www.linkedin.com/in/vikram-rajput-98310218/',
    },
  ],
};

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function breadcrumbSchema(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.path,
    })),
  };
}
