/**
 * The public preparedness check.
 *
 * Six questions, answered by a visitor who has not signed up, scored
 * deterministically on the server. Nothing is stored and nothing is personal:
 * the answers are bands, not amounts.
 *
 * Deliberate boundary: this measures whether a household is *prepared* — cover
 * in place, reserves held, documents findable, intentions recorded. It does not
 * recommend a product, quote a premium, or tell anyone what to buy. That line
 * matters both editorially and because advising on insurance is regulated.
 */

export const QUESTIONS = [
  {
    key: 'dependants',
    question: 'Who depends on your income today?',
    help: 'Anyone who would feel it financially if your income stopped.',
    options: [
      { value: 'none', label: 'Nobody — just me', score: 1 },
      { value: 'partner', label: 'A partner', score: 0.55 },
      { value: 'children', label: 'Children', score: 0.35 },
      { value: 'parents', label: 'Parents or elders', score: 0.4 },
      { value: 'multiple', label: 'Several people across generations', score: 0.2 },
    ],
    weight: 15,
    // More dependants is not a failing — it raises what "prepared" has to mean.
    inverted: true,
  },
  {
    key: 'life_cover',
    question: 'What life cover is in place?',
    options: [
      { value: 'none', label: 'None', score: 0 },
      { value: 'employer', label: 'Employer cover only', score: 0.35 },
      { value: 'personal', label: 'A personal policy', score: 0.8 },
      { value: 'both', label: 'Both personal and employer', score: 1 },
      { value: 'unsure', label: 'I am not sure', score: 0.15 },
    ],
    weight: 20,
  },
  {
    key: 'health_cover',
    question: 'What health cover does the household have?',
    options: [
      { value: 'none', label: 'None', score: 0 },
      { value: 'employer', label: 'Employer cover only', score: 0.4 },
      { value: 'family_floater', label: 'A family policy of our own', score: 0.85 },
      { value: 'both', label: 'Our own policy plus employer cover', score: 1 },
      { value: 'unsure', label: 'I am not sure', score: 0.15 },
    ],
    weight: 18,
  },
  {
    key: 'reserve',
    question: 'How many months of household costs could you cover from savings?',
    help: 'Money you could reach this week without selling anything.',
    options: [
      { value: 'none', label: 'Less than one month', score: 0 },
      { value: 'under_three', label: 'One to three months', score: 0.35 },
      { value: 'three_six', label: 'Three to six months', score: 0.75 },
      { value: 'six_plus', label: 'More than six months', score: 1 },
    ],
    weight: 17,
  },
  {
    key: 'findable',
    question: 'If your family needed your policy documents tomorrow, could they find them?',
    options: [
      { value: 'no', label: 'No — they would not know where to start', score: 0 },
      { value: 'some', label: 'Some of them, with effort', score: 0.35 },
      { value: 'most', label: 'Most of them', score: 0.7 },
      { value: 'yes', label: 'Yes — they know exactly where everything is', score: 1 },
    ],
    weight: 18,
  },
  {
    key: 'intentions',
    question: 'Have your intentions been written down?',
    help: 'Nominations on policies and accounts, and a will if you have one.',
    options: [
      { value: 'none', label: 'Nothing written down', score: 0 },
      { value: 'nominations', label: 'Nominations only', score: 0.45 },
      { value: 'will_drafted', label: 'A will exists but is not registered', score: 0.8 },
      { value: 'will_registered', label: 'A registered will', score: 1 },
    ],
    weight: 12,
  },
];

/** Findings are ordered by what the answer actually costs the household. */
const FINDINGS = {
  life_cover: {
    none: {
      severity: 95,
      title: 'No life cover is in place',
      body: 'If your income stopped, nothing would replace it. This is the single largest gap on the list.',
    },
    employer: {
      severity: 70,
      title: 'Your life cover ends when the job does',
      body: 'Employer cover is real cover, but it is not yours. It stops the day the employment does — often at the moment a family can least absorb it.',
    },
    unsure: {
      severity: 60,
      title: 'You are not sure what life cover you hold',
      body: 'Cover you cannot describe is cover your family cannot claim. Finding the policy is the first step.',
    },
  },
  health_cover: {
    none: {
      severity: 90,
      title: 'No health cover for the household',
      body: 'A single hospital admission is the most common way a prepared household becomes an unprepared one.',
    },
    employer: {
      severity: 65,
      title: 'Health cover depends on the employer',
      body: 'It usually ends with the job, and it rarely follows you into the years when you need it most.',
    },
    unsure: {
      severity: 55,
      title: 'The household health cover is unclear',
      body: 'Worth confirming who is actually named on the policy, and for how much.',
    },
  },
  reserve: {
    none: {
      severity: 85,
      title: 'Less than a month of reserves',
      body: 'Any interruption — illness, a job gap, a repair — becomes debt immediately.',
    },
    under_three: {
      severity: 60,
      title: 'Under three months of reserves',
      body: 'Enough for a surprise, not enough for a setback.',
    },
  },
  findable: {
    no: {
      severity: 80,
      title: 'Your family could not find the documents',
      body: 'Protection that cannot be located is protection that cannot be claimed. This is the cheapest gap on the list to close.',
    },
    some: {
      severity: 55,
      title: 'The documents are scattered',
      body: 'Finding them under pressure, in the weeks after something happens, is the worst time to be looking.',
    },
  },
  intentions: {
    none: {
      severity: 70,
      title: 'Nothing is written down',
      body: 'Without nominations or a will, the law decides the order — and it may not be the one you would have chosen.',
    },
    nominations: {
      severity: 40,
      title: 'Nominations exist, but no will',
      body: 'A nominee receives an asset; a will decides who it belongs to. They are not the same thing.',
    },
  },
};

const STRENGTHS = {
  life_cover: { both: 'You hold life cover of your own, independent of your employer.', personal: 'You hold a personal life policy.' },
  health_cover: { both: 'The household has its own health cover.', family_floater: 'The household has its own health policy.' },
  reserve: { six_plus: 'You hold more than six months of reserves.', three_six: 'You hold three to six months of reserves.' },
  findable: { yes: 'Your family knows exactly where the documents are.', most: 'Most of your documents are findable.' },
  intentions: { will_registered: 'You have a registered will.', will_drafted: 'You have drafted a will.' },
};

export function scorePreparedness(answers) {
  let weighted = 0;
  let total = 0;
  const breakdown = [];

  for (const question of QUESTIONS) {
    const answer = answers[question.key];
    const option = question.options.find((o) => o.value === answer);
    if (!option) continue;

    // The dependants question shapes the reading rather than scoring the person,
    // so it is described but never added to the total.
    if (question.inverted) {
      breakdown.push({
        key: question.key,
        label: question.question,
        answer: option.label,
        contextual: true,
      });
      continue;
    }

    weighted += option.score * question.weight;
    total += question.weight;
    breakdown.push({
      key: question.key,
      label: question.question,
      answer: option.label,
      score: Math.round(option.score * 100),
      weight: question.weight,
    });
  }

  const score = total > 0 ? Math.round((weighted / total) * 100) : 0;

  const findings = [];
  for (const [key, byAnswer] of Object.entries(FINDINGS)) {
    const finding = byAnswer[answers[key]];
    if (finding) findings.push({ key, ...finding });
  }
  findings.sort((a, b) => b.severity - a.severity);

  const strengths = [];
  for (const [key, byAnswer] of Object.entries(STRENGTHS)) {
    const strength = byAnswer[answers[key]];
    if (strength) strengths.push(strength);
  }

  const dependants = answers.dependants;
  const hasDependants = dependants && dependants !== 'none';

  return {
    score,
    band: band(score),
    headline: headline(score, hasDependants),
    breakdown,
    findings: findings.slice(0, 4),
    strengths,
    // Said on the results screen, not buried in a footer.
    disclaimer:
      'This is an indicative self-assessment based on six answers, not financial or insurance advice, and not a recommendation of any product. It is a starting point for a conversation.',
    nextStep: findings.length
      ? findings[0].title
      : 'Nothing here needs urgent attention. Keeping it that way is the work.',
  };
}

function band(score) {
  if (score >= 85) return 'prepared';
  if (score >= 65) return 'mostly_prepared';
  if (score >= 40) return 'partly_prepared';
  return 'exposed';
}

function headline(score, hasDependants) {
  if (score >= 85) {
    return hasDependants
      ? 'Your household is well prepared. Worth keeping it current.'
      : 'You are well prepared for where you are today.';
  }
  if (score >= 65) return 'Mostly prepared, with a few real gaps.';
  if (score >= 40) {
    return hasDependants
      ? 'Partly prepared — and people are depending on the parts that are missing.'
      : 'Partly prepared. A few things would change that quickly.';
  }
  return hasDependants
    ? 'There are significant gaps, and people depend on them being closed.'
    : 'There are significant gaps worth closing.';
}
