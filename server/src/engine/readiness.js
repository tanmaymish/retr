import { CATEGORIES } from './categories.js';

/**
 * Legacy readiness: how much of what a family would actually need is in the
 * vault, and findable by someone other than the owner.
 *
 * Deliberately not a grade of the person. Each component says what it measures
 * and what would move it, because the number on its own is not the message —
 * the missing thing is.
 */
const COMPONENTS = [
  { key: 'coverage', label: 'Categories covered', weight: 30 },
  { key: 'essentials', label: 'Essential documents', weight: 25 },
  { key: 'currency', label: 'Nothing expired', weight: 15 },
  { key: 'trustee', label: 'A trustee is in place', weight: 20 },
  { key: 'reachable', label: 'Someone else can reach it', weight: 10 },
];

export function computeReadiness({ documents, members, enabledCategories, asOf = new Date() }) {
  const chosen = enabledCategories?.length
    ? CATEGORIES.filter((c) => enabledCategories.includes(c.key))
    : CATEGORIES;

  const documentsByCategory = new Map();
  for (const doc of documents) {
    const list = documentsByCategory.get(doc.category) ?? [];
    list.push(doc);
    documentsByCategory.set(doc.category, list);
  }

  const filledCategories = chosen.filter((c) => (documentsByCategory.get(c.key) ?? []).length > 0);
  const emptyCategories = chosen.filter((c) => (documentsByCategory.get(c.key) ?? []).length === 0);

  // Essentials are matched loosely against document titles: a family looking
  // for "the will" does not care that the file is called "Will (final).pdf".
  const essentials = [];
  for (const category of chosen) {
    for (const essential of category.essential) {
      const present = (documentsByCategory.get(category.key) ?? []).some((doc) =>
        looksLike(doc.title, essential),
      );
      essentials.push({ category: category.key, label: essential, present });
    }
  }
  const essentialsPresent = essentials.filter((e) => e.present).length;

  const expired = documents.filter((doc) => doc.expiresOn && new Date(doc.expiresOn) < asOf);

  const activeTrustees = members.filter((m) => m.isTrustee && m.status === 'active');
  const activeMembers = members.filter((m) => m.status === 'active');

  const scores = {
    coverage: chosen.length ? filledCategories.length / chosen.length : 0,
    essentials: essentials.length ? essentialsPresent / essentials.length : 1,
    currency: documents.length ? 1 - expired.length / documents.length : 1,
    trustee: activeTrustees.length ? 1 : 0,
    reachable: activeMembers.length ? Math.min(1, activeMembers.length / 2) : 0,
  };

  const breakdown = COMPONENTS.map((component) => {
    const score = clamp01(scores[component.key]);
    return {
      key: component.key,
      label: component.label,
      weight: component.weight,
      score: Math.round(score * 100),
      pointsAvailable: Math.round((1 - score) * component.weight),
      note: noteFor(component.key, {
        chosen,
        filledCategories,
        emptyCategories,
        essentials,
        essentialsPresent,
        expired,
        activeTrustees,
        activeMembers,
        documents,
      }),
    };
  });

  const score = Math.round(
    breakdown.reduce((total, c) => total + (c.score / 100) * c.weight, 0),
  );

  return {
    score,
    band: band(score),
    breakdown,
    // What to do next, in the order that adds the most.
    nextSteps: [...breakdown]
      .filter((c) => c.pointsAvailable > 0)
      .sort((a, b) => b.pointsAvailable - a.pointsAvailable)
      .slice(0, 3)
      .map((c) => ({ key: c.key, label: c.label, points: c.pointsAvailable, note: c.note })),
    missingEssentials: essentials.filter((e) => !e.present),
    emptyCategories: emptyCategories.map((c) => c.key),
    expiredCount: expired.length,
    note:
      score >= 90
        ? 'Nothing needs your attention. Everything a family would look for is here and reachable.'
        : null,
  };
}

function looksLike(title, essential) {
  const haystack = String(title).toLowerCase();
  const words = essential.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (!words.length) return haystack.includes(essential.toLowerCase());
  return words.some((word) => haystack.includes(word));
}

const clamp01 = (value) => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));

function band(score) {
  if (score >= 85) return 'secure';
  if (score >= 60) return 'building';
  if (score >= 35) return 'started';
  return 'exposed';
}

function noteFor(key, ctx) {
  switch (key) {
    case 'coverage':
      return ctx.emptyCategories.length
        ? `${ctx.emptyCategories.length} of your ${ctx.chosen.length} categories are still empty: ${ctx.emptyCategories.slice(0, 3).map((c) => c.label).join(', ')}.`
        : 'Every category you chose has something in it.';
    case 'essentials': {
      const missing = ctx.essentials.filter((e) => !e.present);
      return missing.length
        ? `Missing: ${missing.slice(0, 3).map((e) => e.label.toLowerCase()).join(', ')}.`
        : 'The documents a family looks for first are all here.';
    }
    case 'currency':
      return ctx.expired.length
        ? `${ctx.expired.length} document${ctx.expired.length > 1 ? 's have' : ' has'} passed its expiry date.`
        : 'Nothing in the vault has expired.';
    case 'trustee':
      return ctx.activeTrustees.length
        ? `${ctx.activeTrustees.length} trustee${ctx.activeTrustees.length > 1 ? 's' : ''} accepted and standing by.`
        : 'No one can recover this vault if you cannot. A trustee is the single biggest thing missing.';
    case 'reachable':
      return ctx.activeMembers.length
        ? `${ctx.activeMembers.length} family member${ctx.activeMembers.length > 1 ? 's have' : ' has'} accepted access.`
        : 'Nobody else has accepted access yet. A vault only you can open is a filing cabinet.';
    default:
      return '';
  }
}
