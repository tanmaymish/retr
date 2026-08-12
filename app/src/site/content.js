/**
 * Brand and marketing copy.
 *
 * The founder biographies, quotes and narrative sections below are the
 * founders' own words, supplied by the client. Do not embellish them, and do
 * not add claims — years, employers, achievements — that did not come from
 * them.
 *
 * Headshots: drop a square image (600×600 or larger) at
 * `app/public/founders/<id>.jpg`. Until one exists, the card falls back to a
 * monogram, which reads as intentional rather than broken.
 */

export const brand = {
  name: 'Akshayvriddhi',
  tagline: 'Prosperity with Purpose',
  promise: 'What you build deserves to continue.',
  stages: 'Create. Continue. Live. Leave a Legacy.',
};

export const founders = [
  {
    id: 'shiv-maheshwari',
    name: 'Shiv Maheshwari',
    role: 'Co-Founder',
    strapline: 'Insurance Leader • Strategist • Transformation Professional',
    linkedin: 'https://www.linkedin.com/in/shiv-maheshwari-68909a3a/',
    photo: '/founders/shiv-maheshwari.jpg',
    experience: 'More than two decades in life insurance',
    bio: [
      'With more than two decades of leadership experience within the life insurance industry, Shiv Maheshwari brings to Akshayvriddhi a rare combination of strategic thinking, distribution expertise, organisational transformation and people leadership.',
      'His professional journey at Axis Max Life Insurance has spanned leadership across agency business, agency strategy and large-scale transformation. From managing agency operations to leading strategy and transformation initiatives involving process simplification, re-engineering, sales-force automation and change management, his career has been built around one recurring question: how can institutions, people and systems become better prepared for what comes next?',
      'Today, that question has evolved. After spending decades building businesses, teams and professional credibility, Shiv believes that experience ultimately becomes valuable when it is converted into contribution. His philosophy is simple: the first phase of a career may be about proving yourself; the next should be about aligning experience with purpose.',
      'Akshayvriddhi represents that transition — an opportunity to translate decades of institutional knowledge into something deeply personal, helping individuals and families approach protection, prosperity and legacy with greater clarity.',
    ],
    quote:
      'Experience does not guarantee certainty about the future. What it gives us is perspective — and perspective can transform uncertainty into preparedness, pressure into purpose, and experience into contribution.',
    closing:
      'For Shiv, Akshayvriddhi is not simply another chapter in an insurance career. It is about making everything learned in the previous chapters useful to someone else’s future.',
    highlights: [
      'Agency business and agency strategy leadership',
      'Large-scale transformation: process simplification and re-engineering',
      'Sales-force automation and change management',
    ],
  },
  {
    id: 'vikram-rajput',
    name: 'Vikram Rajput',
    role: 'Co-Founder',
    strapline: 'Insurance Professional • Distribution Leader • Relationship Builder',
    linkedin: 'https://www.linkedin.com/in/vikram-rajput-98310218/',
    photo: '/founders/vikram-rajput.jpg',
    experience: 'Nearly two decades across insurance distribution',
    bio: [
      'Vikram Rajput brings nearly two decades of experience across insurance distribution, sales leadership, agency development, transformation and regional management.',
      'His journey through Axis Max Life Insurance has taken him from frontline sales leadership to senior partnership and regional responsibilities — providing him with something that cannot be learned from financial models alone: an understanding of people.',
      'Over the years, he has witnessed families at different stages of life make some of their most important financial decisions. He has seen aspirations being created, responsibilities increasing, priorities changing, and families trying to balance today’s needs with tomorrow’s uncertainties.',
      'For Vikram, financial protection cannot begin with a product catalogue. It must begin with a conversation — about someone’s family, their responsibilities, their ambitions, what they have already created, what they still want to create, and what they cannot afford to leave unprotected.',
    ],
    quote:
      'Behind every financial decision is a human story — a family, an ambition, a responsibility or a dream. Our responsibility is to understand that story before recommending how it should be protected.',
    closing:
      'Through Akshayvriddhi, Vikram seeks to bring the discipline and experience of institutional insurance together with the accessibility and personal attention of a trusted advisor.',
    highlights: [
      'Frontline sales leadership to regional responsibility',
      'Agency development and distribution partnerships',
      'Long-term client and advisor relationships',
    ],
  },
];

/** Creation → Continuation → Consumption → Distribution. */
export const stages = [
  {
    key: 'creation',
    label: 'Creation',
    icon: 'foundation',
    lead: 'Building careers, businesses, families, assets and ambitions.',
    body: 'Helping people build a strong foundation for their aspirations, families and financial futures.',
  },
  {
    key: 'continuation',
    label: 'Continuation',
    icon: 'security',
    lead: 'Ensuring what has been created remains protected despite uncertainty.',
    body: 'Protecting what has been created so that unexpected circumstances do not derail years of effort.',
  },
  {
    key: 'consumption',
    label: 'Consumption',
    icon: 'self_improvement',
    lead: 'The freedom to experience the life our efforts have made possible.',
    body: 'Creating the confidence to enjoy prosperity responsibly rather than spending life constantly worrying about tomorrow.',
  },
  {
    key: 'distribution',
    label: 'Distribution',
    icon: 'family_restroom',
    lead: 'Transferring wealth, values and opportunities to the people and causes that matter.',
    body: 'Helping people think beyond themselves — towards family, succession, legacy and the purposeful transfer of what they have created.',
  },
];

export const fourQuestions = [
  'What am I building?',
  'What must I protect?',
  'How can I enjoy what I have created?',
  'What will I eventually leave behind?',
];

export const promise = [
  'We will listen before we advise.',
  'We will understand before we recommend.',
  'We will explain before we ask you to decide.',
  'And we will think beyond today’s transaction towards tomorrow’s consequences.',
];

export const vision =
  'To build a trusted financial protection institution that helps individuals and families create prosperity, protect continuity, live with confidence and transfer what they have built with purpose.';

export const mission =
  'To make insurance and financial protection understandable, personal and purposeful by combining decades of industry experience, responsible guidance, human relationships and technology.';

export const foundersMessage = [
  'We have spent a significant part of our professional lives in insurance. During those years, we learned about distribution, strategy, transformation, leadership, technology and business. But our greatest lessons came from people.',
  'We learned that behind every policy is a responsibility. Behind every investment is an aspiration. Behind every nomination is someone important. And behind almost every financial decision is a simple human desire: to make tomorrow a little more secure than today.',
  'After decades of building our own professional journeys, we reached a point where experience needed to become contribution. Akshayvriddhi is that contribution.',
  'We want to create an organisation where people can discuss their financial lives openly, understand their choices clearly and make decisions confidently — without unnecessary complexity or pressure.',
  'We cannot predict every event that tomorrow will bring. But with experience, perspective and thoughtful planning, we can help people become better prepared for it.',
  'That is the Akshayvriddhi we are building.',
];

/* ── The vault product ──────────────────────────────────────────────────── */

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
    question: 'Is this a vault, or financial advice?',
    answer:
      'The vault is where your records live. The advice is the relationship around it. Akshayvriddhi exists to help you decide what to protect and why — the vault makes sure the paperwork behind those decisions is findable when it matters.',
  },
  {
    question: 'Can Akshayvriddhi staff read my documents?',
    answer:
      'Documents are encrypted with a key derived from the deployment’s master secret, so the ciphertext on disk is useless without it. Whoever operates the deployment holds that secret.',
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
