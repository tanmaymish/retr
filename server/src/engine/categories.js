/**
 * The eight categories the vault organises around, plus Memories. Order is the
 * order they appear in navigation and on the landing page.
 */
export const CATEGORIES = [
  {
    key: 'identity',
    label: 'Identity',
    icon: 'fingerprint',
    blurb: 'Passports, national IDs, birth certificates.',
    essential: ['Passport', 'Government ID', 'Birth certificate'],
  },
  {
    key: 'insurance',
    label: 'Insurance',
    icon: 'security',
    blurb: 'Life, health, home and vehicle policies.',
    essential: ['Health policy', 'Life policy'],
  },
  {
    key: 'property',
    label: 'Property',
    icon: 'home_work',
    blurb: 'Deeds, rent agreements, mortgage papers.',
    essential: ['Property deed'],
  },
  {
    key: 'financial',
    label: 'Financial',
    icon: 'account_balance',
    blurb: 'Accounts, investments, loan statements.',
    essential: ['Bank account details', 'Investment summary'],
  },
  {
    key: 'medical',
    label: 'Medical',
    icon: 'medical_services',
    blurb: 'Records, prescriptions, blood groups.',
    essential: ['Medical history'],
  },
  {
    key: 'education',
    label: 'Education',
    icon: 'school',
    blurb: 'Degrees, transcripts, certificates.',
    essential: [],
  },
  {
    key: 'vehicle',
    label: 'Vehicle',
    icon: 'directions_car',
    blurb: 'Registration, insurance, service records.',
    essential: [],
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: 'gavel',
    blurb: 'Wills, trusts, power of attorney.',
    essential: ['Will'],
  },
  {
    key: 'memories',
    label: 'Memories',
    icon: 'history_edu',
    blurb: 'Letters, photographs, the things with no serial number.',
    essential: [],
  },
];

export const CATEGORY_KEYS = CATEGORIES.map((c) => c.key);

export const categoryByKey = (key) => CATEGORIES.find((c) => c.key === key) ?? null;

export const categoryLabel = (key) => categoryByKey(key)?.label ?? key;
