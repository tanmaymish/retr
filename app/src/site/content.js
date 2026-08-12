/**
 * Marketing copy and founder profiles.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * FOUNDERS — READ BEFORE PUBLISHING
 *
 * The two founders below are real people. Their names and LinkedIn links are
 * real; everything marked `placeholder: true` is NOT. Nothing about a real
 * person's career should be invented, so those fields are deliberately empty
 * scaffolding for you to fill in from what they actually tell you.
 *
 * To finish a profile:
 *   1. Drop a headshot at  app/public/founders/<id>.jpg  (square, 600×600+).
 *      Until then the card shows a monogram, which looks intentional.
 *   2. Replace `role`, `bio`, `highlights` and `experienceYears` with real
 *      details from them or from their own LinkedIn "About" section.
 *   3. Set `placeholder: false`. The "profile in progress" note disappears and
 *      the highlights start rendering.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const founders = [
  {
    id: 'vikram-rajput',
    name: 'Vikram Rajput',
    role: 'Co-founder',
    linkedin: 'https://www.linkedin.com/in/vikram-rajput-98310218/',
    photo: '/founders/vikram-rajput.jpg',
    placeholder: true,
    experienceYears: null,
    bio: 'Add Vikram’s background here — the practice he has built, the clients he has served, and why a family vault is the problem he wanted to solve.',
    highlights: [],
  },
  {
    id: 'shiv-maheshwari',
    name: 'Shiv Maheshwari',
    role: 'Co-founder',
    linkedin: 'https://www.linkedin.com/in/shiv-maheshwari-68909a3a/',
    photo: '/founders/shiv-maheshwari.jpg',
    placeholder: true,
    experienceYears: null,
    bio: 'Add Shiv’s background here — his field, the work he is known for, and what he has seen families get wrong when records go missing.',
    highlights: [],
  },
];

export const problems = [
  { icon: 'chat', title: 'Lost in group chats', body: 'The policy number someone sent in 2019, buried under four hundred messages.' },
  { icon: 'mail', title: 'Buried in inboxes', body: 'A renewal notice that arrived while you were away, and was never seen again.' },
  { icon: 'folder_open', title: 'Scattered in drawers', body: 'The deed is somewhere in the house. Probably. Nobody else knows where.' },
];

export const howItWorks = [
  {
    icon: 'upload_file',
    title: 'Add a document',
    body: 'Drop in a PDF or a photo. We read the details out of it — provider, holder, dates — and show you what we found before anything is saved.',
  },
  {
    icon: 'lock',
    title: 'It is encrypted before it lands',
    body: 'Every file gets its own key and is encrypted with AES-256-GCM before it touches disk. Nothing readable is ever written down.',
  },
  {
    icon: 'notifications_active',
    title: 'Deadlines find you',
    body: 'Expiry and renewal dates become reminders with enough lead time to actually act — six months for a passport, not six days.',
  },
  {
    icon: 'family_restroom',
    title: 'The right people can reach it',
    body: 'Share one document or a whole category. Every grant is visible, every access is logged, and anything can be revoked in one click.',
  },
  {
    icon: 'gavel',
    title: 'A trustee holds the spare key',
    body: 'Name someone you trust. They cannot open anything today — only request access, which you can deny for fourteen days before it opens.',
  },
];

export const assurances = [
  {
    icon: 'enhanced_encryption',
    title: 'Encrypted per document',
    body: 'Each file is sealed with its own key, derived from a master key the database never contains. A stolen database row decrypts nothing.',
  },
  {
    icon: 'visibility',
    title: 'Every access is logged',
    body: 'When a trustee or family member opens something, it appears in your activity log with their name on it. Including reads.',
  },
  {
    icon: 'schedule',
    title: 'Time is the safeguard',
    body: 'Emergency access takes fourteen days by default and notifies you the whole way through. A stolen invitation cannot be used the day it is taken.',
  },
  {
    icon: 'key_off',
    title: 'Revocation is immediate',
    body: 'Access is resolved fresh on every single read. Nothing is cached, so taking a permission away takes effect on the next click, not the next login.',
  },
];

export const faqs = [
  {
    question: 'What happens if I am not around?',
    answer:
      'A trustee you have designated can start the emergency access protocol. You are notified across every channel, and you have the full waiting period — fourteen days by default — to deny it. If you cannot respond, access opens automatically, limited to the categories you designated for that trustee.',
  },
  {
    question: 'Can Heritage Ledger staff read my documents?',
    answer:
      'Documents are encrypted with a key derived from the deployment’s master secret, so the ciphertext on disk is useless without it. Whoever operates the deployment holds that secret — if that is you, it is genuinely only you.',
  },
  {
    question: 'What can a trustee see before an emergency?',
    answer:
      'Nothing. A trustee holds a key to a request procedure, not to your vault. Until a request completes they see only that they are a trustee, and for which categories.',
  },
  {
    question: 'How do you extract details from a document?',
    answer:
      'We read the text layer of the file on our own server — no third-party service — and pull out dates, providers and reference numbers. Every field comes back marked with how confident we are, and nothing is saved until you have reviewed it. If a file is a scan with no text, we say so rather than guessing.',
  },
  {
    question: 'What if I want to leave?',
    answer:
      'Delete your account and every document and its ciphertext is removed in the same transaction. There is no soft-delete holding pen.',
  },
];
