import { categoryLabel } from './categories.js';

/**
 * The life journey: documents arranged as chapters rather than folders.
 *
 * Chapters come from what a document is, not from when it was uploaded — a
 * degree certificate belongs to the education chapter whether it was scanned
 * last week or twenty years ago. Within a chapter, ordering is by the date on
 * the document, falling back to when it entered the vault.
 */
const CHAPTERS = [
  {
    key: 'education',
    label: 'Education & growth',
    blurb: 'The foundation of knowledge, carefully preserved.',
    icon: 'school',
    categories: ['education'],
  },
  {
    key: 'identity',
    label: 'Who we are',
    blurb: 'The papers that prove a person exists on the record.',
    icon: 'fingerprint',
    categories: ['identity'],
  },
  {
    key: 'home',
    label: 'Home & roots',
    blurb: 'Laying roots and securing your family’s shelter.',
    icon: 'key',
    categories: ['property'],
  },
  {
    key: 'protection',
    label: 'Protection',
    blurb: 'The cover standing behind everything else.',
    icon: 'security',
    categories: ['insurance', 'medical'],
  },
  {
    key: 'assets',
    label: 'What we built',
    blurb: 'Accounts, vehicles, the things with paperwork attached.',
    icon: 'account_balance',
    categories: ['financial', 'vehicle'],
  },
  {
    key: 'legacy',
    label: 'Legacy & intent',
    blurb: 'What you have said should happen, in writing.',
    icon: 'gavel',
    categories: ['legal'],
  },
  {
    key: 'memories',
    label: 'Memories',
    blurb: 'The things with no serial number.',
    icon: 'history_edu',
    categories: ['memories'],
  },
];

export function computeTimeline(documents) {
  const chapters = CHAPTERS.map((chapter) => {
    const entries = documents
      .filter((doc) => chapter.categories.includes(doc.category))
      .map((doc) => ({
        id: doc.id,
        title: doc.title,
        subject: doc.subject ?? null,
        category: doc.category,
        categoryLabel: categoryLabel(doc.category),
        source: doc.source,
        date: doc.issuedOn ?? doc.createdAt,
        dateIsIssued: Boolean(doc.issuedOn),
        expiresOn: doc.expiresOn ?? null,
      }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return {
      ...chapter,
      entries,
      span: entries.length
        ? { from: entries[0].date, to: entries[entries.length - 1].date }
        : null,
    };
  }).filter((chapter) => chapter.entries.length > 0);

  return {
    chapters,
    documentCount: documents.length,
    emptyMessage:
      'Your journey starts with the first document. Add one and it will find its chapter here.',
  };
}
