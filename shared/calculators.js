/**
 * The calculator engine.
 *
 * Pure functions, no dependencies, no DOM — imported by the client for the
 * calculators on the site and by the server's tests, which is where the
 * arithmetic is actually held to account.
 *
 * Two rules run through all of it:
 *
 * - **Money is rounded once, at the end.** Intermediate values stay in floating
 *   point; every returned rupee figure is rounded, so a schedule's rows always
 *   sum to its total.
 * - **Nothing here is advice.** These are the standard published formulas.
 *   Scheme rates change by notification and tax law changes every year, so the
 *   rates below carry the year they belong to and must be reviewed annually.
 */

const round = (n) => Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
const rupees = (n) => Math.round(Number.isFinite(n) ? n : 0);

/* ── Investing ───────────────────────────────────────────────────────────── */

/**
 * A monthly SIP compounded monthly. The standard future-value-of-an-annuity
 * formula, with contributions at the start of each month.
 */
export function sip({ monthly, years, ratePct }) {
  const n = Math.round(years * 12);
  const i = ratePct / 100 / 12;
  const invested = monthly * n;
  const value = i === 0 ? invested : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  return { invested: rupees(invested), value: rupees(value), gain: rupees(value - invested) };
}

/** A SIP whose contribution rises by a fixed percentage every year. */
export function stepUpSip({ monthly, years, ratePct, stepUpPct }) {
  const i = ratePct / 100 / 12;
  let value = 0;
  let invested = 0;
  let instalment = monthly;

  for (let year = 0; year < Math.round(years); year++) {
    for (let month = 0; month < 12; month++) {
      value = (value + instalment) * (1 + i);
      invested += instalment;
    }
    instalment *= 1 + stepUpPct / 100;
  }
  return {
    invested: rupees(invested),
    value: rupees(value),
    gain: rupees(value - invested),
    finalInstalment: rupees(instalment / (1 + stepUpPct / 100)),
  };
}

/** One amount, compounded annually. */
export function lumpsum({ amount, years, ratePct }) {
  const value = amount * Math.pow(1 + ratePct / 100, years);
  return { invested: rupees(amount), value: rupees(value), gain: rupees(value - amount) };
}

/* ── Borrowing ───────────────────────────────────────────────────────────── */

/** A reducing-balance EMI, with a yearly summary of where the money went. */
export function emi({ principal, ratePct, years }) {
  const n = Math.round(years * 12);
  const i = ratePct / 100 / 12;
  const instalment = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);

  let balance = principal;
  let interestPaid = 0;
  const schedule = [];

  for (let month = 1; month <= n; month++) {
    const interest = balance * i;
    const principalPart = instalment - interest;
    balance = Math.max(0, balance - principalPart);
    interestPaid += interest;
    if (month % 12 === 0 || month === n) {
      schedule.push({
        year: Math.ceil(month / 12),
        balance: rupees(balance),
        interestToDate: rupees(interestPaid),
        principalToDate: rupees(principal - balance),
      });
    }
  }

  return {
    emi: rupees(instalment),
    months: n,
    totalInterest: rupees(interestPaid),
    totalPaid: rupees(principal + interestPaid),
    schedule,
  };
}

/**
 * What a prepayment actually buys.
 *
 * `extraMonthly` is added to every instalment and `lumpSum` is paid once at
 * `lumpSumAfterMonths`. The EMI is held constant, so the saving shows up as a
 * shorter tenure — which is the point most people are never shown.
 */
export function emiPrepayment({ principal, ratePct, years, extraMonthly = 0, lumpSum = 0, lumpSumAfterMonths = 12 }) {
  const base = emi({ principal, ratePct, years });
  const i = ratePct / 100 / 12;
  const instalment = base.emi;

  let balance = principal;
  let interestPaid = 0;
  let month = 0;
  const cap = Math.round(years * 12) + 1;

  while (balance > 0.5 && month < cap) {
    month += 1;
    const interest = balance * i;
    let payment = instalment + extraMonthly;
    if (month === lumpSumAfterMonths) payment += lumpSum;
    const principalPart = Math.min(payment - interest, balance);
    balance -= principalPart;
    interestPaid += interest;
  }

  const monthsSaved = base.months - month;
  return {
    emi: instalment,
    months: month,
    monthsSaved,
    yearsSaved: round(monthsSaved / 12),
    totalInterest: rupees(interestPaid),
    interestSaved: rupees(base.totalInterest - interestPaid),
    baseline: { months: base.months, totalInterest: base.totalInterest },
  };
}

/* ── Tax ─────────────────────────────────────────────────────────────────── */

/**
 * Income tax under both regimes, for the assessment year named below.
 *
 * TAX LAW CHANGES EVERY YEAR. These slabs are for FY 2025-26 (AY 2026-27) and
 * must be checked against the current Finance Act before each filing season.
 * Surcharge, marginal relief on the rebate, and anything to do with capital
 * gains are deliberately out of scope — this compares salary regimes and says
 * so.
 */
export const TAX_YEAR = 'FY 2025-26 (AY 2026-27)';

const NEW_SLABS = [
  [400000, 0],
  [800000, 0.05],
  [1200000, 0.1],
  [1600000, 0.15],
  [2000000, 0.2],
  [2400000, 0.25],
  [Infinity, 0.3],
];

const OLD_SLABS = [
  [250000, 0],
  [500000, 0.05],
  [1000000, 0.2],
  [Infinity, 0.3],
];

function slabTax(taxable, slabs) {
  let tax = 0;
  let last = 0;
  for (const [ceiling, rate] of slabs) {
    if (taxable <= last) break;
    tax += (Math.min(taxable, ceiling) - last) * rate;
    last = ceiling;
  }
  return tax;
}

export function incomeTax({ grossSalary, deductions = 0, regime = 'both' }) {
  // New regime: standard deduction only, and a rebate that wipes out the tax
  // for taxable income up to 12 lakh.
  const newTaxable = Math.max(0, grossSalary - 75000);
  let newTax = slabTax(newTaxable, NEW_SLABS);
  if (newTaxable <= 1200000) newTax = 0;

  // Old regime: standard deduction plus whatever the person actually claims.
  const oldTaxable = Math.max(0, grossSalary - 50000 - deductions);
  let oldTax = slabTax(oldTaxable, OLD_SLABS);
  if (oldTaxable <= 500000) oldTax = Math.max(0, oldTax - 12500);

  const withCess = (t) => rupees(t * 1.04);
  const result = {
    year: TAX_YEAR,
    new: { taxable: rupees(newTaxable), tax: withCess(newTax) },
    old: { taxable: rupees(oldTaxable), tax: withCess(oldTax) },
  };
  result.saving = rupees(Math.abs(result.new.tax - result.old.tax));
  result.better = result.new.tax === result.old.tax ? 'either' : result.new.tax < result.old.tax ? 'new' : 'old';
  return regime === 'both' ? result : result[regime];
}

/* ── Retirement and schemes ──────────────────────────────────────────────── */

/** NPS: monthly contributions to 60, then the annuity the corpus can buy. */
export function nps({ monthly, currentAge, retireAge = 60, ratePct = 10, annuityPct = 40, annuityRatePct = 6 }) {
  const years = Math.max(0, retireAge - currentAge);
  const { value, invested } = sip({ monthly, years, ratePct });
  const annuitised = value * (annuityPct / 100);
  const lumpSum = value - annuitised;
  return {
    years,
    invested,
    corpus: rupees(value),
    lumpSum: rupees(lumpSum),
    annuityCorpus: rupees(annuitised),
    monthlyPension: rupees((annuitised * (annuityRatePct / 100)) / 12),
  };
}

/**
 * Human Life Value: what the household would need to replace the income the
 * earner brings in, less what is already in place.
 */
export function humanLifeValue({
  annualIncome,
  currentAge,
  retireAge = 60,
  existingCover = 0,
  liabilities = 0,
  savings = 0,
  discountPct = 6,
  growthPct = 5,
}) {
  const years = Math.max(0, retireAge - currentAge);
  const r = discountPct / 100;
  const g = growthPct / 100;

  // Present value of a growing annuity, guarding the r === g case.
  const pv =
    Math.abs(r - g) < 1e-9
      ? annualIncome * years
      : (annualIncome / (r - g)) * (1 - Math.pow((1 + g) / (1 + r), years));

  const need = pv + liabilities - savings;
  const gap = need - existingCover;
  return {
    years,
    incomeReplacement: rupees(pv),
    totalNeed: rupees(need),
    existingCover: rupees(existingCover),
    gap: rupees(Math.max(0, gap)),
    surplus: rupees(Math.max(0, -gap)),
  };
}

/**
 * EPF to retirement. The employer's share credited to EPF is 3.67% of wages
 * (the other 8.33% goes to the pension scheme), so only that part compounds
 * here.
 */
export function epf({ basicMonthly, currentAge, retireAge = 58, employeePct = 12, ratePct = 8.25, growthPct = 5, balance = 0 }) {
  const years = Math.max(0, retireAge - currentAge);
  const i = ratePct / 100;
  let corpus = balance;
  let contributed = 0;
  let basic = basicMonthly;

  for (let year = 0; year < years; year++) {
    const yearly = basic * 12 * (employeePct / 100 + 0.0367);
    corpus = (corpus + yearly) * (1 + i);
    contributed += yearly;
    basic *= 1 + growthPct / 100;
  }
  return { years, contributed: rupees(contributed), corpus: rupees(corpus), interest: rupees(corpus - contributed - balance) };
}

/**
 * Sukanya Samriddhi. Deposits run for 15 years from opening; the account
 * matures 21 years after opening, compounding untouched in between.
 */
export function ssy({ yearly, girlAge = 5, ratePct = 8.2 }) {
  const i = ratePct / 100;
  let corpus = 0;
  for (let year = 0; year < 15; year++) corpus = (corpus + yearly) * (1 + i);
  for (let year = 0; year < 6; year++) corpus *= 1 + i;
  return {
    deposited: rupees(yearly * 15),
    maturity: rupees(corpus),
    interest: rupees(corpus - yearly * 15),
    maturesAtGirlAge: girlAge + 21,
  };
}

/** PPF: a 15-year term, extendable in blocks of five. */
export function ppf({ yearly, years = 15, ratePct = 7.1 }) {
  const i = ratePct / 100;
  let corpus = 0;
  for (let year = 0; year < years; year++) corpus = (corpus + yearly) * (1 + i);
  return { deposited: rupees(yearly * years), maturity: rupees(corpus), interest: rupees(corpus - yearly * years) };
}

/* ── Drawing down ────────────────────────────────────────────────────────── */

/**
 * The question a retiree actually has: how long does the corpus last?
 *
 * Withdrawals rise with inflation, the remaining corpus earns a return, and the
 * balance is walked year by year until it is gone or the horizon is reached.
 * The year it runs out is the answer; the yearly series is what makes it real.
 */
export function drawdown({ corpus, monthlySpend, returnPct = 7, inflationPct = 6, currentAge = 60, until = 95 }) {
  const years = Math.max(1, until - currentAge);
  const r = returnPct / 100;
  const i = inflationPct / 100;

  let balance = corpus;
  let withdrawal = monthlySpend * 12;
  let lastFunded = 0;
  let ranOutAt = null;
  const series = [];

  /* Every entry is the balance at the *end* of the year, so it is stamped with
     the age reached — one entry per age, never two, because the chart keys on
     it. The years after the money is gone are kept rather than dropped: an
     unfunded retirement is the answer, and a chart that stops at the last
     funded year hides exactly the part that matters. */
  for (let year = 0; year < years; year++) {
    const age = currentAge + year;

    if (ranOutAt === null) {
      if (balance < withdrawal) {
        ranOutAt = age;
        balance = 0;
      } else {
        balance = (balance - withdrawal) * (1 + r);
        lastFunded = withdrawal;
      }
    }

    series.push({ age: age + 1, balance: rupees(balance), withdrawal: rupees(withdrawal) });
    withdrawal *= 1 + i;
  }

  const lasts = ranOutAt === null ? years : ranOutAt - currentAge;
  return {
    lastsYears: lasts,
    ranOutAt,
    survivesTo: ranOutAt === null ? until : ranOutAt,
    endingBalance: rupees(balance),
    firstYearWithdrawal: rupees(monthlySpend * 12),
    lastWithdrawal: rupees(ranOutAt === null ? withdrawal / (1 + i) : lastFunded),
    series,
  };
}

/**
 * A dated, costed education goal: what a course will cost in the year it is
 * needed, and the monthly amount that funds it from today.
 */
export function educationGoal({ costToday, yearsAway, feeInflationPct = 8, returnPct = 10, saved = 0 }) {
  const futureCost = costToday * Math.pow(1 + feeInflationPct / 100, yearsAway);
  const savedGrowsTo = saved * Math.pow(1 + returnPct / 100, yearsAway);
  const shortfall = Math.max(0, futureCost - savedGrowsTo);

  const n = Math.round(yearsAway * 12);
  const m = returnPct / 100 / 12;
  const monthly = n <= 0 ? shortfall : m === 0 ? shortfall / n : shortfall / (((Math.pow(1 + m, n) - 1) / m) * (1 + m));

  return {
    futureCost: rupees(futureCost),
    costToday: rupees(costToday),
    savedGrowsTo: rupees(savedGrowsTo),
    shortfall: rupees(shortfall),
    monthly: rupees(monthly),
    multiple: Number((futureCost / costToday).toFixed(2)),
  };
}

/* ── Readiness ───────────────────────────────────────────────────────────── */

/** How much a chosen retirement lifestyle costs against today's spending. */
export const LIFESTYLE = { same: 1, lower: 0.8, enhanced: 1.25 };

/**
 * The one number a pre-retiree is actually trying to work out: what the corpus
 * has to be, what it is heading for, and the distance between the two.
 *
 * Every assumption is a named argument with a stated default rather than a
 * constant buried in the arithmetic, because the whole point of showing this
 * to somebody is that they can see what it assumed.
 *
 * The corpus is priced as an annuity-due in real terms: withdrawals are taken
 * at the start of each year and rise with inflation, and the portfolio is
 * assumed to earn a little above inflation once preservation matters more than
 * growth. Working in real terms is what lets one rate stand in for two.
 */
export function readiness({
  currentAge,
  retireAge,
  monthlyExpense,
  lifestyle = 'same',
  saved = 0,
  monthlySaving = 0,
  inflationPct = 6,
  growthPct = 10,
  realReturnPct = 1.5,
  lifeExpectancy = 90,
}) {
  const years = Math.max(0, retireAge - currentAge);
  const retiredYears = Math.max(1, lifeExpectancy - retireAge);
  const i = inflationPct / 100;
  const g = growthPct / 100;
  const real = realReturnPct / 100;
  const factor = LIFESTYLE[lifestyle] ?? 1;

  // What a month of that life costs on the day the salary stops.
  const monthlyAtRetirement = monthlyExpense * factor * Math.pow(1 + i, years);
  const firstYearNeed = monthlyAtRetirement * 12;

  const corpus =
    real === 0
      ? firstYearNeed * retiredYears
      : firstYearNeed * ((1 - Math.pow(1 + real, -retiredYears)) / real) * (1 + real);

  // What today's savings and today's habit are heading for.
  const savedGrowsTo = saved * Math.pow(1 + g, years);
  const months = Math.round(years * 12);
  const m = g / 12;
  const contributionsGrowTo =
    months === 0
      ? 0
      : m === 0
        ? monthlySaving * months
        : monthlySaving * ((Math.pow(1 + m, months) - 1) / m) * (1 + m);
  const projected = savedGrowsTo + contributionsGrowTo;

  /* A shortfall of a few hundred rupees against a corpus of crores is noise
     from the rounding, not a gap anyone should be shown. Anything under a
     hundredth of a percent of the target counts as met. */
  const shortfall = corpus - projected;
  const immaterial = Math.max(1000, corpus * 0.0001);
  const gap = shortfall > immaterial ? shortfall : 0;
  const extraMonthly =
    gap === 0 || months === 0
      ? 0
      : m === 0
        ? gap / months
        : gap / (((Math.pow(1 + m, months) - 1) / m) * (1 + m));

  /* Three states, because three is what the copy answers. "Closeable" is not a
     feeling — it is a gap the household could close by at most doubling what it
     already puts away. Beyond that, no amount of encouraging language makes it
     a savings-rate problem, and saying so is the honest thing. */
  let state = 'meaningful';
  if (gap <= 0) state = 'on-track';
  else if (monthlySaving > 0 && extraMonthly <= monthlySaving) state = 'closeable';
  else if (monthlySaving === 0 && extraMonthly <= monthlyExpense * 0.2) state = 'closeable';

  return {
    state,
    corpus: rupees(corpus),
    projected: rupees(projected),
    gap: rupees(gap),
    coveredPct: corpus > 0 ? Math.min(100, Math.round((projected / corpus) * 100)) : 100,
    extraMonthly: rupees(extraMonthly),
    totalMonthly: rupees(monthlySaving + extraMonthly),
    monthlyAtRetirement: rupees(monthlyAtRetirement),
    // Derived from the rounded monthly, so the two figures agree on screen.
    firstYearNeed: rupees(monthlyAtRetirement) * 12,
    savedGrowsTo: rupees(savedGrowsTo),
    contributionsGrowTo: rupees(contributionsGrowTo),
    years,
    retiredYears,
    lifeExpectancy,
  };
}
