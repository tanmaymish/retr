import { categoryLabel } from './categories.js';

const DAY = 86_400_000;

/**
 * Reminders are derived from the documents themselves on every read — never
 * stored — so a corrected renewal date corrects its reminder immediately, and
 * a deleted document cannot leave an orphan nagging in the list.
 *
 * Lead times differ by what the deadline actually costs: a passport takes
 * months to replace, a policy renewal takes an afternoon.
 */
const LEAD_DAYS = {
  identity: 180,
  legal: 120,
  insurance: 60,
  vehicle: 45,
  property: 45,
  financial: 30,
  medical: 30,
  education: 30,
  memories: 30,
};

const ACTION_COPY = {
  identity: {
    title: (doc) => `${doc.title} renewal`,
    body: 'Renewals at this office take weeks, not days. Starting now means it is done before it matters.',
    cta: 'Start renewal',
  },
  insurance: {
    title: (doc) => `${doc.title} review`,
    body: "It is almost time for a gentle review of this policy, to check the cover still matches what your family needs.",
    cta: 'Review policy',
  },
  default: {
    title: (doc) => `${doc.title} expires`,
    body: 'This document has a date on it that is approaching. Worth handling before it lapses.',
    cta: 'Open document',
  },
};

export function computeReminders({ documents, states = [], asOf = new Date() }) {
  const stateByKey = new Map(states.map((s) => [s.reminderKey, s]));
  const now = asOf.getTime();
  const reminders = [];

  for (const doc of documents) {
    for (const [field, kind] of [
      ['expiresOn', 'expiry'],
      ['renewalOn', 'renewal'],
    ]) {
      const value = doc[field];
      if (!value) continue;
      const due = new Date(value);
      if (Number.isNaN(due.getTime())) continue;

      const daysUntil = Math.ceil((due.getTime() - now) / DAY);
      const lead = LEAD_DAYS[doc.category] ?? 45;
      // Overdue items stay on the list; future ones appear once inside the lead.
      if (daysUntil > lead) continue;

      const key = `${kind}:${doc.id}`;
      const state = stateByKey.get(key);
      if (state?.state === 'dismissed' || state?.state === 'done') continue;
      if (state?.state === 'snoozed' && state.snoozedUntil && new Date(state.snoozedUntil) > asOf) {
        continue;
      }

      const copy = ACTION_COPY[doc.category] ?? ACTION_COPY.default;
      reminders.push({
        key,
        documentId: doc.id,
        documentTitle: doc.title,
        category: doc.category,
        categoryLabel: categoryLabel(doc.category),
        kind,
        dueOn: value,
        daysUntil,
        overdue: daysUntil < 0,
        urgency: daysUntil < 0 ? 'overdue' : daysUntil <= 30 ? 'soon' : 'upcoming',
        title: copy.title(doc),
        body: copy.body,
        cta: copy.cta,
        subject: doc.subject ?? null,
      });
    }
  }

  reminders.sort((a, b) => a.daysUntil - b.daysUntil);

  return {
    reminders,
    counts: {
      total: reminders.length,
      overdue: reminders.filter((r) => r.overdue).length,
      soon: reminders.filter((r) => r.urgency === 'soon').length,
    },
    // The empty state is a real state, not an accident.
    emptyMessage:
      "Nothing needs your attention. We'll let you know gently when something requires your review.",
  };
}

/** Documents whose dates have already passed, used by the readiness score. */
export function expiredDocuments(documents, asOf = new Date()) {
  return documents.filter((doc) => doc.expiresOn && new Date(doc.expiresOn) < asOf);
}
