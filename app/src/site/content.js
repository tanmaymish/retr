/**
 * Brand and marketing copy.
 *
 * The founder biographies, quotes and narrative sections below are the
 * founders' own words, supplied by the client. Do not embellish them, and do
 * not add claims — years, employers, achievements — that did not come from
 * them.
 *
 * Headshots live at `app/public/founders/<photo>.{webp,jpg}` and are referenced
 * by base name below. If a file is missing the card falls back to a monogram,
 * which reads as intentional rather than broken.
 *
 * NAME-TO-FACE MAPPING IS UNVERIFIED. The two supplied headshots carried no
 * identifying metadata, so the assignment below is an assumption. If it is the
 * wrong way round, swap the two `photo` values — nothing else needs changing.
 */

export const brand = {
  name: 'Akshayvriddhi',
  tagline: 'Prosperity with Purpose',
  promise: 'What you build deserves to continue.',
  stages: 'Create. Continue. Live. Leave a Legacy.',
  /* Who the firm is for. Stated plainly, because it is the thing that makes
     the rest of the copy specific rather than generic. */
  audience: 'Families and business owners in India’s smaller cities.',
};

/**
 * What the site is for.
 *
 * Akshayvriddhi is a financial advisory: protection, retirement and the
 * planning around them. The document vault is built and still runs behind
 * /sign-in, but it is not what the firm is selling, so the site does not
 * market it. Set `showVault` to true to bring its sections and links back.
 */
export const site = {
  showVault: false,
};

export const founders = [
  {
    id: 'shiv-maheshwari',
    name: 'Shiv Maheshwari',
    role: 'Co-Founder',
    strapline: 'Insurance Leader • Strategist • Transformation Professional',
    linkedin: 'https://www.linkedin.com/in/shiv-maheshwari-68909a3a/',
    photo: 'shiv-maheshwari',
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
    photo: 'vikram-rajput',
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

/**
 * What people come to an adviser with. Written as the situation, not as a
 * product — nobody wakes up wanting to buy a rider.
 */
export const problems = [
  {
    icon: 'inventory',
    title: 'Sold once, never reviewed',
    body: 'A policy taken years ago through someone who knew the family, for a salary and a household that have both changed since. Nobody has read it back to you since the day it was signed.',
  },
  {
    icon: 'storefront',
    title: 'The business and the household are the same money',
    body: 'For most people who build something in a smaller city, the shop, the land and the family run off one account. Protection built for a salary slip does not fit that life.',
  },
  {
    icon: 'hourglass_top',
    title: 'Retirement left to the last decade',
    body: 'The years that compound hardest are the early ones. Most households start in the decade when compounding has the least left to give — and there is nobody nearby whose job it is to say so sooner.',
  },
];

/**
 * Who the firm is for, and why the distance matters.
 *
 * Nothing here claims a branch, a city list or a language. Those are
 * operational facts only the founders can state, and they should be added here
 * before this is published.
 */
export const audience = {
  eyebrow: 'Who we work with',
  title: 'Advice that comes to the cities the advice usually skips.',
  lede:
    'Serious financial advice has stayed close to the metros. The households building the most — first-generation businesses, salaried families supporting parents, people whose wealth is newer than their responsibilities — are the ones with the least access to it.',
  groups: [
    {
      icon: 'store',
      title: 'Business and shop owners',
      body: 'Income that varies by season, capital tied up in stock or land, and a family whose security is not separate from the business’s.',
    },
    {
      icon: 'badge',
      title: 'Salaried professionals',
      body: 'A steady income, a home loan, and cover that was bought once — usually as an investment rather than as protection.',
    },
    {
      icon: 'diversity_1',
      title: 'Households supporting parents',
      body: 'Two generations depending on one earner, where a health event is the single largest financial risk in the house.',
    },
    {
      icon: 'auto_stories',
      title: 'First-generation wealth',
      body: 'Nobody in the family has done this before, so there is no inherited playbook — and no relative who can be asked what a term plan actually does.',
    },
  ],
};

/**
 * The advice itself.
 *
 * The scope here follows what an IRDAI-registered Insurance Marketing Firm is
 * permitted to do: solicit insurance from a limited panel of insurers, service
 * those policies, and distribute other financial products through
 * appropriately licensed Financial Services Executives. Nothing below claims a
 * specific insurer, registration or qualification — those belong to the
 * founders to state, and must be filled in before this is published.
 */
export const services = [
  {
    key: 'protection',
    icon: 'shield_with_heart',
    title: 'Protection review',
    lead: 'What would actually happen to the household income.',
    body: 'Life, health and general cover, read against what the household earns, owes and expects — so the sum assured is a number with a reason behind it rather than a number someone once suggested.',
    points: ['Existing policies read and explained', 'Gaps and overlaps identified', 'Nominations and riders checked'],
  },
  {
    key: 'retirement',
    icon: 'elderly',
    title: 'Retirement planning',
    lead: 'An income that continues when the salary stops.',
    body: 'Working backwards from the life you intend to be living, to what has to be set aside now — including the years nobody plans for, when the earning has stopped and the spending has not.',
    points: ['Target corpus and the years to build it', 'Where the income comes from, in order', 'Reviewed as the plan meets reality'],
  },
  {
    key: 'goals',
    icon: 'savings',
    title: 'Goal and wealth planning',
    lead: 'Every rupee given a job to do.',
    body: 'Education, a home, a business, a sabbatical — dated, costed and funded, so saving stops being a leftover and becomes a decision. Distributed through licensed Financial Services Executives, as the regulations require.',
    points: ['Goals dated and costed', 'Reserves before returns', 'Reviewed against inflation, not hope'],
  },
  {
    key: 'legacy',
    icon: 'diversity_3',
    title: 'Continuity and legacy',
    lead: 'What you built, reaching who you meant it to reach.',
    body: 'Nominations, documentation and intentions brought into one place, so what has been protected can actually be claimed — and so the family is not learning about any of it for the first time on the worst day.',
    points: ['Nominations reviewed across every policy', 'The family briefed while you are here', 'Intentions written down, not assumed'],
  },
];

/** How an engagement runs, in the order it runs. */
export const howItWorks = [
  {
    icon: 'hearing',
    title: 'We listen first',
    body: 'A conversation about the household, not a product pitch. What you earn, what you owe, who depends on it, and what you are trying to protect. No recommendation is made in this meeting.',
  },
  {
    icon: 'fact_check',
    title: 'We read what you already have',
    body: 'Existing policies, existing investments, existing nominations. Most people are carrying something that already works, and something that stopped working years ago. You should know which is which.',
  },
  {
    icon: 'insights',
    title: 'We map the gap',
    body: 'What is covered, what is exposed, and what each gap would actually cost if the year went badly. Written down, in numbers you can check, before anything is recommended.',
  },
  {
    icon: 'balance',
    title: 'We recommend, and explain the alternative',
    body: 'Every recommendation comes with what it costs, what it does not do, and what you could do instead — including doing nothing. If the honest answer is that you are adequately covered, that is the answer you get.',
  },
  {
    icon: 'event_repeat',
    title: 'We review it as life changes',
    body: 'A marriage, a child, a business, a move, a raise. A plan written once is a plan that will be wrong within three years, so this is a relationship rather than a transaction.',
  },
];

/** What a client can hold us to. Each of these is a commitment, not a claim. */
export const assurances = [
  {
    icon: 'record_voice_over',
    title: 'Advice before product',
    body: 'No product is named in the first conversation. If we cannot explain why something is needed in terms of your household, it should not be bought.',
  },
  {
    icon: 'currency_rupee',
    title: 'You will be told what we earn',
    body: 'Distribution is commission-based, and you are entitled to know that when you are being advised. Ask, and you will be told before you sign anything.',
  },
  {
    icon: 'description',
    title: 'It is written down',
    body: 'The gap, the recommendation and the reasoning are given to you on paper. A plan that lives only in an adviser’s memory is not a plan.',
  },
  {
    icon: 'handshake',
    title: 'The relationship outlasts the sale',
    body: 'Renewals, claims and reviews are part of the engagement. The measure of this work is whether it holds up in the year it is finally needed.',
  },
];

export const faqs = [
  {
    question: 'Is this advice, or are you selling insurance?',
    answer:
      'Both, stated plainly. Distribution is how the firm is paid, and advice is what it is paid for. That is why no product is named in the first conversation — the recommendation has to come out of your situation, not out of a target. Ask what we earn on anything recommended and you will be told before you sign.',
  },
  {
    question: 'What does the first meeting cost?',
    answer:
      'Nothing. It is a conversation about your household and what you are trying to protect. You leave it with a view of where you stand whether or not you go any further.',
  },
  {
    question: 'I already have policies. Is there any point?',
    answer:
      'Usually more than for someone with none. Most households are carrying cover taken for a salary, a family or a loan that has since changed. Reading what you already hold is the first thing we do, and finding that you are adequately covered is a legitimate outcome.',
  },
  {
    question: 'How early should retirement planning start?',
    answer:
      'Earlier than feels urgent. The years that compound hardest are the first ones, and they are the years most people spend on everything else. Starting late is not a reason to skip it — it changes what the plan has to do, not whether you need one.',
  },
  {
    question: 'What is the preparedness check?',
    answer:
      'Six questions about cover, reserves and whether your family could find what they need. It is scored, it is free, it stores nothing, and it asks for no money figures. It is an indicative self-assessment and a starting point for a conversation — not advice, and not a recommendation of any product.',
  },
  {
    question: 'Do you only work in the big cities?',
    answer:
      'The opposite. Akshayvriddhi exists because serious advice has stayed close to the metros while the households building the most are elsewhere. Smaller cities are who this firm is for, not an afterthought once the metros are covered.',
  },
  {
    question: 'My uncle already sold me a policy. Isn’t this the same thing?',
    answer:
      'It is the same industry and a different job. A policy sold by someone you trust may well be a good policy — but it was chosen for the year it was sold, and nobody has read it against your household since. We start by reading what you already hold, and telling you where it stands, including when the honest answer is that it is fine.',
  },
  {
    question: 'Who regulates this?',
    answer:
      'Insurance distribution in India is regulated by the IRDAI. Any distribution of mutual funds or pension products runs through appropriately licensed Financial Services Executives under the relevant regulator. Registration details are stated in full on our documentation.',
  },
]
