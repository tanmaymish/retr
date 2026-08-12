/**
 * Mirrors the server's category list (server/src/engine/categories.js) so the
 * marketing site and the empty states can render before any API call. The
 * server remains authoritative: /api/reference/categories returns the same
 * list, and the app uses that once it is signed in.
 */
export const CATEGORY_LIST = [
  { key: 'identity', label: 'Identity', icon: 'fingerprint', blurb: 'Passports, national IDs, birth certificates.' },
  { key: 'insurance', label: 'Insurance', icon: 'security', blurb: 'Life, health, home and vehicle policies.' },
  { key: 'property', label: 'Property', icon: 'home_work', blurb: 'Deeds, rent agreements, mortgage papers.' },
  { key: 'financial', label: 'Financial', icon: 'account_balance', blurb: 'Accounts, investments, loan statements.' },
  { key: 'medical', label: 'Medical', icon: 'medical_services', blurb: 'Records, prescriptions, blood groups.' },
  { key: 'education', label: 'Education', icon: 'school', blurb: 'Degrees, transcripts, certificates.' },
  { key: 'vehicle', label: 'Vehicle', icon: 'directions_car', blurb: 'Registration, insurance, service records.' },
  { key: 'legal', label: 'Legal', icon: 'gavel', blurb: 'Wills, trusts, power of attorney.' },
  { key: 'memories', label: 'Memories', icon: 'history_edu', blurb: 'Letters, photographs, the things with no serial number.' },
];

export const categoryByKey = (key) => CATEGORY_LIST.find((c) => c.key === key);
export const categoryIcon = (key) => categoryByKey(key)?.icon ?? 'description';
export const categoryLabel = (key) => categoryByKey(key)?.label ?? key;

export const RELATIONSHIPS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'partner', label: 'Partner' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'family_member', label: 'Family member' },
  { value: 'legal_counsel', label: 'Legal counsel' },
  { value: 'trusted_friend', label: 'Trusted friend' },
  { value: 'other', label: 'Other' },
];
