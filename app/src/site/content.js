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
  /* अक्षय + वृद्धि — growth that does not perish. It describes a cash-flow
     strategy, not just a pleasant-sounding word, and the site says so plainly
     because it happens to be true. */
  meaning: 'Akshaya (अक्षय) — imperishable, undiminishing. Vriddhi (वृद्धि) — growth. Wealth built to keep growing quietly in the background, rather than being drawn down to nothing.',
  promise: 'Retire without asking anyone for money.',
  stages: 'Create. Continue. Live. Leave a Legacy.',
  /* Who the firm is for. Not a 25-year-old opening a first SIP: someone who has
     run a household for two decades and has started doing a private, anxious
     calculation about what happens when the salary stops. */
  audience: 'For people between 45 and 60, doing the arithmetic on what comes next.',
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
  'To build the retirement Indian families were never given a template for — a clear, written plan, backed by real choice across insurers and fund houses, that turns one lump of savings into a paycheque that outlives you, rather than the other way around.';

/** Why the old assumptions no longer hold. Structural reasons, not adjectives. */
export const whyNow = [
  {
    icon: 'account_balance',
    title: 'The safety net most people still count on does not fully exist',
    body: 'Private-sector India has no state pension comparable to the UK or US. Employees’ Provident Fund (EPF) and the National Pension System (NPS) are the main formal pillars, and neither was designed on its own to replace most of a senior urban income for 25 to 30 non-earning years.',
  },
  {
    icon: 'diversity_1',
    title: 'The joint-family net is thinning',
    body: 'Smaller families, adult children in another city or country, rising individual costs. Fewer households can quietly absorb an ageing parent’s shortfall the way the last generation did. That is not a judgement — it is a planning input.',
  },
  {
    icon: 'hourglass_bottom',
    title: 'Retirements are longer than the plans built for them',
    body: 'Someone retiring at 60 today can reasonably plan for 25 to 30 more years. A corpus sized for a few years of rest runs out mid-plan. The arithmetic has to assume a long life, not an average one.',
  },
  {
    icon: 'ecg_heart',
    title: 'Healthcare costs rise faster than everything else',
    body: 'Medical costs in India have consistently outrun headline inflation. A retirement budget indexed only to general inflation falls short exactly where it matters most — in the years health spending climbs.',
  },
  {
    icon: 'trending_down',
    title: 'The first five years carry outsized risk',
    body: 'A downturn early in drawdown can permanently impair a corpus meant to last decades, even when long-run average returns turn out fine. Almost no self-directed plan accounts for the sequence of returns.',
  },
];

/**
 * Composite situations, built from patterns advisers see constantly.
 *
 * NOT REAL CLIENTS AND NOT TESTIMONIALS. Every one is labelled as illustrative
 * on the page for exactly that reason: a fabricated review is the kind of thing
 * that draws regulatory attention to a young Insurance Marketing Firm, and it
 * is dishonest besides.
 */
export const scenarios = [
  {
    initial: 'S',
    who: 'The Sharmas, Pune',
    meta: 'Him: 54, manager at a state-owned company · Her: 51, runs the house and a small tuition class',
    setup:
      'a provident fund, a small pension account the employer opened years ago, and a life policy a brother-in-law sold him in 2003 that he is still not sure what it does. He assumed all three added up to something decent. Nobody had ever added them up.',
    turn:
      'The total covered barely 40% of what the household spends today — and their daughter’s wedding sat unbudgeted inside the same ten-year window as his retirement. The fix was not dramatic: redirect one maturing FD, raise the NPS contribution modestly, and separate the wedding fund from the retirement fund so one stopped quietly eating the other.',
  },
  {
    initial: 'R',
    who: 'Rekha, Bengaluru',
    meta: '47, marketing lead, single, ageing parents in a smaller town',
    setup:
      'Saving hard for her own retirement, and separately, quietly worried about her parents’ finances — but she had never actually looked at their accounts, because asking felt intrusive.',
    turn:
      'A nomination check on her father’s accounts found two mutual fund folios still naming a relative who had died. A five-minute fix that, left alone, would have meant months of legal delay at the worst possible time. The retirement plan and the parent check became one conversation instead of two.',
  },
  {
    initial: 'A',
    who: 'Anand, Ahmedabad',
    meta: '58, business owner, two years from stepping back',
    setup:
      'A WhatsApp forward had convinced him that withdrawing his full NPS corpus at 60 was tax-free and unrestricted. It is neither — a portion must be annuitised, and the rules have changed more than once.',
    turn:
      'Correcting one wrong assumption eighteen months early changed how he structured contributions for the remaining working years. A small, boring adjustment that would have been an expensive surprise made two years too late.',
  },
];

/** Lines written to be lifted whole — a section header, a card, a forward. */
export const shareable = [
  'Your provident fund was never the whole plan. It was the down payment on one.',
  'A pension is something your father might have had. A plan is something you build.',
  'Nobody plans to run out of money at 78. They just never checked at 55.',
  'The best gift for your children is not an inheritance. It is never having to worry about you.',
  'You have been the money uncle for everyone else’s decisions. Who is doing that maths for you?',
  'The first five years of retirement decide the next twenty-five. Plan them on purpose.',
];

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
    body: 'Taken years ago through someone who knew the family. Nobody has read it back to you since.',
  },
  {
    icon: 'storefront',
    title: 'The business and the household are the same money',
    body: 'The shop, the land and the family run off one account. Cover built for a salary slip does not fit that.',
  },
  {
    icon: 'hourglass_top',
    title: 'Retirement left to the last decade',
    body: 'The years that compound hardest are the early ones — and nobody nearby whose job it is to say so.',
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
  title: 'People in the ten years before the salary stops.',
  lede:
    'Not a first SIP. Someone who has run a household for two decades and has started doing the arithmetic privately.',
  groups: [
    {
      icon: 'badge',
      title: 'Salaried, 45 to 60',
      body: 'EPF, an NPS account HR opened, some funds, and a policy a relative sold you. Nobody has ever added them up.',
    },
    {
      icon: 'store',
      title: 'Business owners stepping back',
      body: 'The business was the pension plan. Now it needs converting into one that pays monthly without you in it.',
    },
    {
      icon: 'diversity_1',
      title: 'Sandwiched between two generations',
      body: 'Ageing parents in another city, children not yet independent, and one plan expected to carry all three.',
    },
    {
      icon: 'person',
      title: 'Planning alone',
      body: 'No spouse’s income to fall back on, and no second opinion at the dining table. The margin for error is thinner.',
    },
  ],
};


/**
 * The seven service pillars.
 *
 * Each carries a one-line promise (what the household gets) and then the
 * substance (what is actually done), always in that order.
 *
 * REGULATORY BOUNDARY. Akshayvriddhi is an IRDAI-registered Insurance
 * Marketing Firm, not a SEBI-registered Investment Adviser. Insurance sits
 * squarely inside the licence; NPS, EPF, PPF and mutual fund content must stay
 * generic and educational. A specific "buy this much of that security"
 * instruction is investment advice in the SEBI sense and needs a separate
 * registration. Keep the copy below on the right side of that line.
 */
export const services = [
  {
    key: 'corpus',
    icon: 'target',
    title: 'Retirement corpus and goal planning',
    lead: 'Know your number — not a guess, a calculated one.',
    body: 'The corpus required to fund your target lifestyle from your planned retirement age to a conservative life expectancy, adjusted for realistic inflation and a post-retirement real return — then the exact monthly saving that closes the gap to what you already hold.',
    points: [
      'A target corpus, with every assumption stated',
      'The gap between that and where you stand today',
      'The monthly figure that closes it',
    ],
  },
  {
    key: 'accounts',
    icon: 'savings',
    title: 'EPF, NPS and PPF optimisation',
    lead: 'Make the accounts you already have pull their full weight before adding anything new.',
    body: 'Whether your pension account is on active or automatic allocation, and whether the main tier alone is enough. The extra fifty-thousand-rupee deduction the National Pension System allows on top of your usual limit. Voluntary top-ups to the provident fund weighed against further pension contributions. And whether your employer’s structure even captures the share of basic pay now deductible under the new tax regime.',
    points: [
      'What each account is actually doing',
      'Deductions being left on the table',
      'Whether your employer’s structure captures them',
    ],
  },
  {
    key: 'income',
    icon: 'payments',
    title: 'Post-retirement income design',
    lead: 'Turn a lump sum into a monthly paycheque built to last.',
    body: 'A bucket strategy — near-term spending in low-volatility instruments, mid-term balanced, long-term still growing — with a withdrawal plan sized to survive a bad first five years, laddered Senior Citizen Savings Scheme deposits, and a clear-eyed comparison of an annuity against the alternatives for the pension portion the rules require you to annuitise.',
    points: [
      'Buckets by when the money is needed, not by product',
      'A withdrawal rate that survives a bad opening decade',
      'Annuity compared honestly, not assumed',
    ],
  },
  {
    key: 'health',
    icon: 'ecg_heart',
    title: 'Health and longevity protection',
    lead: 'Make sure a single hospitalisation cannot unravel thirty years of saving.',
    body: 'A gap analysis of existing cover against realistic post-retirement medical costs, attention to the pre-existing-disease waiting periods that make buying fresh cover at 58 far harder than topping up cover held since 45, a super top-up layer, and the long-term-care conversation most families avoid until it is urgent.',
    points: [
      'Cover measured against real medical inflation',
      'Waiting periods, before they matter',
      'The long-term-care conversation, early',
    ],
  },
  {
    key: 'tax',
    icon: 'receipt_long',
    title: 'Tax-efficient structuring',
    lead: 'Keep more of what you have already earned — legally, every year.',
    body: 'Old against new regime is not a one-time decision; it can be reassessed most years, and the right answer moves as income shifts towards interest and pension. Alongside that: the larger deduction on interest income that only applies once you are a senior citizen, capital gains harvested deliberately across holdings, and where relevant, legitimate family structures.',
    points: [
      'The regime choice, revisited yearly',
      'Deductions that only apply after 60',
      'Gains harvested deliberately, not by accident',
    ],
  },
  {
    key: 'estate',
    icon: 'family_restroom',
    title: 'Estate and succession readiness',
    lead: 'Make sure your family never has to fight — or beg a bank — for what is already theirs.',
    body: 'Somewhere in India today a family is standing in a bank branch with a death certificate and a folder, because a nomination form from twelve years ago was never updated. It is the most preventable grief in personal finance. A will checklist, a nomination audit across every bank, provident fund, pension, mutual fund and insurance account, joint-holding structure, and a healthcare power of attorney set up before it is ever needed.',
    points: [
      'A nomination audit across every account',
      'A will checklist, and the nudge to finish it',
      'Healthcare power of attorney, arranged early',
    ],
  },
  {
    key: 'family',
    icon: 'diversity_3',
    title: 'Family conversations and legacy',
    lead: 'Have the money conversation with your children before a crisis forces it.',
    body: 'A facilitated, values-first conversation — not only "here is my net worth" but "here is what I want for you, and here is what I need from you". The discussion most Indian families quietly avoid until an emergency makes it unavoidable.',
    points: [
      'What you want for them, said out loud',
      'What you need from them, said out loud',
      'Held before it is an emergency',
    ],
  },
];

/** How an engagement runs. Genuinely sequential, so the numbering is honest. */
export const howItWorks = [
  {
    icon: 'call',
    title: 'A free 20-minute readiness call',
    body: 'No commitment and no product pitch. Three questions: when do you want to stop active income, what does a comfortable month cost you today, and what have you already built.',
  },
  {
    icon: 'fact_check',
    title: 'Complete financial and risk discovery',
    body: 'A structured intake of every account, obligation, dependant and health consideration. The unglamorous part self-directed planning skips, and where most planning errors actually live.',
  },
  {
    icon: 'description',
    title: 'Your retirement blueprint',
    body: 'A written document: target corpus, the gap to where you stand, a year-by-year contribution and allocation path, and a tax roadmap — delivered before any specific product is suggested.',
  },
  {
    icon: 'balance',
    title: 'Product selection, across insurers — not just one',
    body: 'Where insurance or a fund solves part of the gap, it is matched against our empanelled insurers and fund houses rather than a single company’s shelf, and the comparison is walked through in plain terms before you decide.',
  },
  {
    icon: 'assignment_turned_in',
    title: 'We handle the paperwork',
    body: 'As your licensed intermediary, our certified team completes the purchase and servicing — proposal forms, underwriting follow-up, policy issuance — so the blueprint does not become another folder of homework.',
  },
  {
    icon: 'event_repeat',
    title: 'Annual review, and a redesign as retirement nears',
    body: 'Revisited every year, and rebuilt entirely in the two to three years before retirement, when the priority shifts from growing the corpus to protecting it and converting it into income.',
  },
];

/**
 * Why trust us.
 *
 * WHAT THIS MUST NEVER CLAIM: that Akshayvriddhi is commission-free, fee-only,
 * or a SEBI-registered Investment Adviser. None of it is true of an Insurance
 * Marketing Firm, and claiming it is a compliance exposure rather than merely
 * an inaccuracy. The honest differentiator is breadth of empanelment and
 * transparency about what is earned — which is a better story anyway.
 */
export const assurances = [
  {
    icon: 'balance',
    title: 'Real choice, not one company’s shelf',
    body: 'An Insurance Marketing Firm may empanel with up to six insurers in each line — life, health and general — where a corporate agent is capped at three. The product is chosen by fit, not by who we happen to represent.',
  },
  {
    icon: 'currency_rupee',
    title: 'We will tell you what we earn',
    body: 'Like any licensed intermediary, we are paid by the insurers and fund houses we are empanelled with. Ask the commission on any recommendation and you get the number. Transparency, not a false claim to be free.',
  },
  {
    icon: 'workspace_premium',
    title: 'Built by people who have done this at scale',
    body: 'Two decades each building agency and distribution businesses at one of India’s largest life insurers, before building this for individual households.',
  },
  {
    icon: 'lock',
    title: 'Your money never passes through us',
    body: 'Premiums and investments go directly to the insurer or fund house. Our job is comparison, paperwork and ongoing service — never custody of your funds.',
  },
];

/** The engagement model. Prices are the founders’ to set; see PRICING_TBC. */
export const engagement = [
  {
    key: 'readiness',
    name: 'Readiness',
    price: 'Free',
    priceNote: 'No card, no commitment.',
    points: [
      'The retirement readiness calculator',
      'A 20-minute discovery call',
      'A directional gap estimate',
      'No product discussion required',
    ],
  },
  {
    key: 'blueprint',
    name: 'Blueprint',
    price: null,
    priceNote: 'One-time fee, quoted on the call.',
    recommended: true,
    points: [
      'A full written retirement and protection plan',
      'Corpus target, gap analysis, insurance gap check',
      'Comparison across empanelled insurers and funds',
      'Fee credited back if you implement through us',
    ],
  },
  {
    key: 'continuum',
    name: 'Family Continuum',
    price: null,
    priceNote: 'Annual, quoted on the call.',
    points: [
      'A blueprint for you and your spouse',
      'Annual review as products and rules change',
      'Estate and nomination-hygiene audit',
      'Re-checked against each year’s Budget changes',
    ],
  },
];

/**
 * Prices are deliberately not in this file.
 *
 * Nobody but the founders can set them, and a placeholder on a live page for a
 * regulated firm is worse than an honest "quoted on the call". Fill `price` in
 * `engagement` above when they are decided, and this constant goes away.
 */
export const PRICING_TBC = true;

export const faqs = [
  {
    question: 'Are you a mutual fund or an insurance company?',
    answer:
      'No. We do not manufacture any financial product. We are an Insurance Marketing Firm, registered with the insurance regulator (the IRDAI) — an intermediary empanelled with multiple insurers and fund houses, which means we compare across companies and help you choose and buy the right fit, rather than selling you the one product we happen to make.',
  },
  {
    question: 'How is this different from my bank’s relationship manager, or my LIC agent?',
    answer:
      'Mostly, breadth. A single-company agent — a bank relationship manager included — can usually only offer what their one employer sells. As an Insurance Marketing Firm we may empanel across up to six insurers per category, plus mutual funds, so the comparison is not limited to one company’s shelf. We do earn commission, like any licensed distributor. Ask the number on anything we recommend and we will tell you.',
  },
  {
    question: 'Is my money safe with you?',
    answer:
      'Your premiums and investments go directly to the insurer or fund house. Nothing is ever held with us as an intermediary balance. Our job is comparison, paperwork and ongoing service — not custody of your funds.',
  },
  {
    question: 'I already have EPF and NPS. Is that not enough?',
    answer:
      'For most urban households, the provident fund and the National Pension System together replace roughly a third to a half of pre-retirement income — not the 70 to 80% a comfortable retirement typically needs. They are a strong base, not the whole plan.',
  },
  {
    question: 'Provident fund, public provident fund or the pension scheme — which comes first?',
    answer:
      'Each does a different job. The Public Provident Fund (PPF) gives a guaranteed, fully tax-free return with no market risk. The Employees’ Provident Fund (EPF) is similar, but tied to salaried employment. The National Pension System (NPS) adds market-linked growth, plus an extra fifty-thousand-rupee deduction neither of the others offers. The right mix depends on your age, your risk appetite and how many working years are left — which is what the blueprint calculates rather than guesses.',
  },
  {
    question: 'Can I retire early in India?',
    answer:
      'It is possible, but the Indian version has to plan around two things the imported early-retirement playbook glosses over: no employer-subsidised health insurance once you leave a job, and a much longer uninsured gap before pension withdrawals become available. We can model an early retirement, but it needs an honest healthcare line, not an optimistic one.',
  },
  {
    question: 'What if I have not saved enough — is it too late?',
    answer:
      'It is almost never too late. It is later, which changes the tools available, not whether a plan is possible. The later you start, the more the plan leans on timeline, lifestyle or savings rate instead of hoping the market does the work. The one genuinely bad move is not looking: the version of "too late" people actually regret is finding out at 65 what they could have fixed at 55.',
  },
  {
    question: 'Do you help with my parents’ retirement too, or only mine?',
    answer:
      'Both. Family Continuum is built for exactly this — your own plan plus a second household, which is increasingly the real shape of retirement planning in Indian families.',
  },
  {
    question: 'What happens when the Budget changes the rules?',
    answer:
      'Every Union Budget can move the numbers underneath a retirement plan: a deduction limit, a regime default, a scheme’s interest rate. Family Continuum plans are re-checked against each year’s changes as part of the annual review.',
  },
  {
    question: 'Is this a robo-adviser?',
    answer:
      'No. The calculator gives an instant, honest first estimate. Your actual blueprint is built and reviewed by our certified team — decisions this consequential deserve a person who can ask you a follow-up question, not just an algorithm.',
  },
  {
    question: 'If I want to leave, can I take my plan and go?',
    answer:
      'Your written blueprint is yours to keep either way. Anything bought through us is held directly with that insurer or fund house in your name, exactly as it would be through any other licensed distributor. You are never locked to us to keep what you have already bought.',
  },
];

/**
 * Every abbreviation this site uses, said in words.
 *
 * Financial writing in India runs on initials, and a reader who has just been
 * told their retirement is underfunded should not also have to decode
 * 80CCD(1B). Where an abbreviation is genuinely the name of the thing — nobody
 * calls it the Employees' Provident Fund Organisation scheme — it stays, and
 * this is where it is explained.
 */
export const glossary = [
  { term: 'EPF', full: 'Employees’ Provident Fund', body: 'The retirement fund a salaried job pays into. You contribute, your employer contributes, and it earns a rate the government notifies each year.' },
  { term: 'PPF', full: 'Public Provident Fund', body: 'A government savings account anyone can open. Fifteen years, a rate revised quarterly, and completely tax-free at maturity.' },
  { term: 'NPS', full: 'National Pension System', body: 'A market-linked retirement account. Part of what it builds must buy a pension at the end; the rest can be withdrawn.' },
  { term: 'SIP', full: 'Systematic Investment Plan', body: 'A standing instruction that buys the same rupee amount of a fund every month, whatever the price that month happens to be.' },
  { term: 'SWP', full: 'Systematic Withdrawal Plan', body: 'The reverse of the above: a standing instruction that pays you a fixed amount out of a fund each month. How a corpus becomes a salary.' },
  { term: 'SCSS', full: 'Senior Citizen Savings Scheme', body: 'A government deposit for people over sixty, paying interest quarterly. There is a ceiling on how much one person may hold.' },
  { term: 'EMI', full: 'Equated Monthly Instalment', body: 'The fixed monthly payment on a loan. Early on, most of it is interest; only later does it start clearing the amount borrowed.' },
  { term: 'IRDAI', full: 'Insurance Regulatory and Development Authority of India', body: 'The regulator for insurance in India. It registers firms like ours, and its register is public.' },
  { term: 'IMF', full: 'Insurance Marketing Firm', body: 'Our registration category — an intermediary permitted to represent several insurers rather than one. It is not the International Monetary Fund.' },
  { term: 'SEBI', full: 'Securities and Exchange Board of India', body: 'The regulator for securities and investment advice. We are not registered with it, which is why our plans compare products rather than instruct you to buy specific securities.' },
  { term: 'AMFI', full: 'Association of Mutual Funds in India', body: 'The industry body that issues the registration number every mutual fund distributor must display.' },
  { term: 'Corpus', full: 'The pile itself', body: 'Not an abbreviation, but the word does a lot of work here: everything you have saved, taken together, on the day you stop earning.' },
];
