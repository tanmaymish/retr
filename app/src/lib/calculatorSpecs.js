import {
  emi,
  emiPrepayment,
  epf,
  humanLifeValue,
  incomeTax,
  lumpsum,
  nps,
  ppf,
  sip,
  ssy,
  stepUpSip,
} from '../../../shared/calculators.js';
import { formatMoney } from './format';

/**
 * What each calculator asks for, and what it shows back.
 *
 * The arithmetic is in shared/calculators.js — imported by the server's tests
 * as well, so these are display specs and nothing more. Every `run` returns the
 * same shape: one headline, a set of labelled rows, and an optional note.
 *
 * Defaults are chosen to be recognisable rather than flattering: a household
 * that could plausibly be reading the page, not one that makes the number look
 * good.
 */

const money = (v) => formatMoney(v, { compact: true });
const pct = (v) => `${v}%`;
const yrs = (v) => `${v} yr`;

export const GROUPS = [
  { key: 'wealth', label: 'Wealth and investments' },
  { key: 'loans', label: 'Loans and liability' },
  { key: 'tax', label: 'Tax and retirement' },
  { key: 'schemes', label: 'Provident and government schemes' },
];

export const CALCULATORS = [
  {
    slug: 'sip',
    group: 'wealth',
    icon: 'trending_up',
    title: 'SIP calculator',
    blurb: 'What a monthly investment becomes.',
    intro:
      'A fixed amount invested every month, compounded monthly at an assumed rate. The rate is an assumption you are choosing, not a return anyone can promise.',
    cta: 'Ask what this should be invested in',
    inputs: [
      { key: 'monthly', label: 'Monthly investment', min: 500, max: 200000, step: 500, value: 10000, format: money },
      { key: 'years', label: 'For how long', min: 1, max: 40, step: 1, value: 15, format: yrs },
      { key: 'ratePct', label: 'Assumed return', min: 4, max: 18, step: 0.5, value: 12, format: pct },
    ],
    run: (v) => {
      const r = sip(v);
      return {
        headline: { label: 'Value at the end', value: money(r.value) },
        rows: [
          { label: 'Total invested', value: formatMoney(r.invested) },
          { label: 'Growth on it', value: formatMoney(r.gain) },
          { label: 'Final value', value: formatMoney(r.value) },
          { label: 'Instalments paid', value: `${Math.round(v.years * 12)}` },
        ],
      };
    },
  },
  {
    slug: 'step-up-sip',
    group: 'wealth',
    icon: 'stacked_line_chart',
    title: 'Step-up SIP',
    blurb: 'What raising the amount every year does.',
    intro:
      'The same SIP, increased by a fixed percentage every year — usually in step with a salary. The difference against a flat SIP is almost always larger than people expect.',
    cta: 'Set a step-up that matches my income',
    inputs: [
      { key: 'monthly', label: 'Starting monthly amount', min: 500, max: 200000, step: 500, value: 10000, format: money },
      { key: 'years', label: 'For how long', min: 1, max: 40, step: 1, value: 15, format: yrs },
      { key: 'ratePct', label: 'Assumed return', min: 4, max: 18, step: 0.5, value: 12, format: pct },
      { key: 'stepUpPct', label: 'Increase each year by', min: 0, max: 25, step: 1, value: 10, format: pct },
    ],
    run: (v) => {
      const r = stepUpSip(v);
      const flat = sip({ monthly: v.monthly, years: v.years, ratePct: v.ratePct });
      return {
        headline: { label: 'Value at the end', value: money(r.value) },
        rows: [
          { label: 'Total invested', value: formatMoney(r.invested) },
          { label: 'Growth on it', value: formatMoney(r.gain) },
          { label: 'Last monthly instalment', value: formatMoney(r.finalInstalment) },
          { label: 'A flat SIP would reach', value: formatMoney(flat.value) },
          { label: 'Difference', value: formatMoney(r.value - flat.value) },
        ],
      };
    },
  },
  {
    slug: 'lumpsum',
    group: 'wealth',
    icon: 'payments',
    title: 'Lumpsum return',
    blurb: 'One amount, left to compound.',
    intro: 'A single investment compounded annually. Useful for a bonus, a maturity or a sale.',
    cta: 'Ask where a lump sum should go',
    inputs: [
      { key: 'amount', label: 'Amount invested', min: 10000, max: 20000000, step: 10000, value: 500000, format: money },
      { key: 'years', label: 'For how long', min: 1, max: 40, step: 1, value: 10, format: yrs },
      { key: 'ratePct', label: 'Assumed return', min: 4, max: 18, step: 0.5, value: 12, format: pct },
    ],
    run: (v) => {
      const r = lumpsum(v);
      return {
        headline: { label: 'Value at the end', value: money(r.value) },
        rows: [
          { label: 'Invested', value: formatMoney(r.invested) },
          { label: 'Growth on it', value: formatMoney(r.gain) },
          { label: 'Multiple of the original', value: `${(r.value / r.invested).toFixed(2)}×` },
        ],
      };
    },
  },
  {
    slug: 'home-loan-emi',
    group: 'loans',
    icon: 'account_balance',
    title: 'Home loan EMI',
    blurb: 'The instalment, and what the loan really costs.',
    intro:
      'A reducing-balance EMI. The figure worth looking at is not the instalment but the total interest — on a long tenure it can approach the amount borrowed.',
    cta: 'Ask how this fits the rest of the plan',
    inputs: [
      { key: 'principal', label: 'Loan amount', min: 100000, max: 50000000, step: 100000, value: 5000000, format: money },
      { key: 'ratePct', label: 'Interest rate', min: 5, max: 18, step: 0.05, value: 8.5, format: pct },
      { key: 'years', label: 'Tenure', min: 1, max: 30, step: 1, value: 20, format: yrs },
    ],
    run: (v) => {
      const r = emi(v);
      return {
        headline: { label: 'Monthly instalment', value: formatMoney(r.emi) },
        rows: [
          { label: 'Total interest', value: formatMoney(r.totalInterest) },
          { label: 'Total repaid', value: formatMoney(r.totalPaid) },
          { label: 'Interest as a share of the loan', value: `${Math.round((r.totalInterest / v.principal) * 100)}%` },
          { label: 'Instalments', value: `${r.months}` },
        ],
        note:
          r.totalInterest > v.principal
            ? 'Over this tenure the interest exceeds the amount borrowed. Shortening the tenure changes that faster than any rate negotiation will.'
            : null,
      };
    },
  },
  {
    slug: 'emi-prepayment',
    group: 'loans',
    icon: 'fast_forward',
    title: 'EMI prepayment',
    blurb: 'What paying extra actually buys.',
    intro:
      'The instalment is held where it is, so paying extra shortens the loan rather than shrinking the payment. That is the version most people are never shown.',
    cta: 'Ask whether to prepay or invest instead',
    inputs: [
      { key: 'principal', label: 'Loan amount', min: 100000, max: 50000000, step: 100000, value: 5000000, format: money },
      { key: 'ratePct', label: 'Interest rate', min: 5, max: 18, step: 0.05, value: 8.5, format: pct },
      { key: 'years', label: 'Original tenure', min: 1, max: 30, step: 1, value: 20, format: yrs },
      { key: 'extraMonthly', label: 'Extra paid every month', min: 0, max: 100000, step: 1000, value: 5000, format: money },
      { key: 'lumpSum', label: 'One-off prepayment', min: 0, max: 5000000, step: 50000, value: 0, format: money },
    ],
    run: (v) => {
      const r = emiPrepayment({ ...v, lumpSumAfterMonths: 12 });
      return {
        headline: { label: 'Interest saved', value: money(r.interestSaved) },
        rows: [
          { label: 'Instalment (unchanged)', value: formatMoney(r.emi) },
          { label: 'Loan ends after', value: `${r.months} months` },
          { label: 'Instead of', value: `${r.baseline.months} months` },
          { label: 'Time saved', value: `${r.yearsSaved} years` },
          { label: 'Interest paid', value: formatMoney(r.totalInterest) },
        ],
        note: v.lumpSum > 0 ? 'The one-off prepayment is applied after the first twelve instalments.' : null,
      };
    },
  },
  {
    slug: 'income-tax',
    group: 'tax',
    icon: 'receipt_long',
    title: 'Income tax: old vs new',
    blurb: 'Which regime costs you less.',
    intro:
      'A salaried comparison for the current year. Deductions are what you would actually claim under the old regime — 80C, 80D, HRA, home-loan interest — since the new regime allows almost none of them.',
    cta: 'Ask what else is deductible',
    inputs: [
      { key: 'grossSalary', label: 'Gross annual salary', min: 300000, max: 10000000, step: 25000, value: 1500000, format: money },
      { key: 'deductions', label: 'Deductions you would claim', min: 0, max: 1000000, step: 10000, value: 250000, format: money },
    ],
    run: (v) => {
      const r = incomeTax(v);
      return {
        headline: {
          label: r.better === 'either' ? 'Both regimes cost the same' : `The ${r.better} regime is cheaper`,
          value: r.better === 'either' ? formatMoney(r.new.tax) : `${money(r.saving)} less`,
        },
        rows: [
          { label: 'New regime — taxable income', value: formatMoney(r.new.taxable) },
          { label: 'New regime — tax payable', value: formatMoney(r.new.tax) },
          { label: 'Old regime — taxable income', value: formatMoney(r.old.taxable) },
          { label: 'Old regime — tax payable', value: formatMoney(r.old.tax) },
          { label: 'Computed for', value: r.year },
        ],
        note:
          'Includes the standard deduction and 4% cess. Surcharge on incomes above ₹50 lakh, capital gains and marginal relief are not modelled. Slabs change every year — check the current Finance Act before filing.',
      };
    },
  },
  {
    slug: 'nps',
    group: 'tax',
    icon: 'elderly',
    title: 'NPS calculator',
    blurb: 'The corpus, and the pension it buys.',
    intro:
      'At retirement at least 40% of an NPS corpus must be used to buy an annuity; the rest can be withdrawn. Both parts are shown, because the pension is the part that has to last.',
    cta: 'Ask how NPS fits my retirement',
    inputs: [
      { key: 'monthly', label: 'Monthly contribution', min: 500, max: 150000, step: 500, value: 10000, format: money },
      { key: 'currentAge', label: 'Your age now', min: 18, max: 59, step: 1, value: 32, format: yrs },
      { key: 'retireAge', label: 'Retiring at', min: 55, max: 70, step: 1, value: 60, format: yrs },
      { key: 'ratePct', label: 'Assumed return', min: 5, max: 14, step: 0.5, value: 10, format: pct },
      { key: 'annuityPct', label: 'Share annuitised', min: 40, max: 100, step: 5, value: 40, format: pct },
    ],
    run: (v) => {
      const r = nps(v);
      return {
        headline: { label: 'Corpus at retirement', value: money(r.corpus) },
        rows: [
          { label: 'Contributed over the years', value: formatMoney(r.invested) },
          { label: 'Withdrawable lump sum', value: formatMoney(r.lumpSum) },
          { label: 'Used to buy the annuity', value: formatMoney(r.annuityCorpus) },
          { label: 'Monthly pension (at 6%)', value: formatMoney(r.monthlyPension) },
          { label: 'Years of contribution', value: `${r.years}` },
        ],
        note: 'The annuity rate is assumed at 6%. The rate you are actually offered at retirement will differ.',
      };
    },
  },
  {
    slug: 'human-life-value',
    group: 'tax',
    icon: 'shield_with_heart',
    title: 'Human life value',
    blurb: 'The cover gap, in a number.',
    intro:
      'What it would cost to replace the income you bring in until you would have retired, plus what is owed, less what is already set aside and already covered. This is the single most important number on this page.',
    cta: 'Ask how to close this gap',
    inputs: [
      { key: 'annualIncome', label: 'Your annual income', min: 200000, max: 20000000, step: 50000, value: 1500000, format: money },
      { key: 'currentAge', label: 'Your age now', min: 21, max: 59, step: 1, value: 35, format: yrs },
      { key: 'existingCover', label: 'Life cover you already hold', min: 0, max: 50000000, step: 100000, value: 5000000, format: money },
      { key: 'liabilities', label: 'Outstanding loans', min: 0, max: 50000000, step: 100000, value: 3000000, format: money },
      { key: 'savings', label: 'Savings the family could use', min: 0, max: 50000000, step: 100000, value: 1000000, format: money },
    ],
    run: (v) => {
      const r = humanLifeValue(v);
      const short = r.gap > 0;
      return {
        headline: {
          label: short ? 'Cover you are short of' : 'You are covered',
          value: short ? money(r.gap) : `${money(r.surplus)} more than needed`,
          tone: short ? 'danger' : undefined,
          note: short ? 'On these assumptions, this is what the household would be short by.' : null,
        },
        rows: [
          { label: 'Income to replace, in today’s money', value: formatMoney(r.incomeReplacement) },
          { label: 'Plus outstanding loans', value: formatMoney(v.liabilities) },
          { label: 'Less savings available', value: `− ${formatMoney(v.savings)}` },
          { label: 'Total need', value: formatMoney(r.totalNeed) },
          { label: 'Less existing cover', value: `− ${formatMoney(r.existingCover)}` },
          { label: 'Years of income counted', value: `${r.years}` },
        ],
        note:
          'Income is discounted at 6% and assumed to grow at 5%. A term plan is the usual instrument for a gap of this shape — but the number is the starting point of a conversation, not a recommendation.',
      };
    },
  },
  {
    slug: 'epf',
    group: 'schemes',
    icon: 'savings',
    title: 'EPF projection',
    blurb: 'What the provident fund reaches.',
    intro:
      'Your 12% and the 3.67% of the employer’s share that goes to EPF rather than to the pension scheme, compounded at the declared rate, with the basic rising each year.',
    cta: 'Ask what this covers, and what it does not',
    inputs: [
      { key: 'basicMonthly', label: 'Monthly basic pay', min: 10000, max: 500000, step: 1000, value: 50000, format: money },
      { key: 'currentAge', label: 'Your age now', min: 18, max: 57, step: 1, value: 30, format: yrs },
      { key: 'retireAge', label: 'Retiring at', min: 50, max: 60, step: 1, value: 58, format: yrs },
      { key: 'balance', label: 'Balance already accumulated', min: 0, max: 20000000, step: 50000, value: 500000, format: money },
      { key: 'growthPct', label: 'Yearly increase in basic', min: 0, max: 15, step: 1, value: 5, format: pct },
    ],
    run: (v) => {
      const r = epf({ ...v, ratePct: 8.25 });
      return {
        headline: { label: 'Balance at retirement', value: money(r.corpus) },
        rows: [
          { label: 'Contributed over the years', value: formatMoney(r.contributed) },
          { label: 'Interest earned', value: formatMoney(r.interest) },
          { label: 'Starting balance', value: formatMoney(v.balance) },
          { label: 'Years to run', value: `${r.years}` },
        ],
        note: 'At the 8.25% rate declared for recent years. The rate is notified annually and is not guaranteed.',
      };
    },
  },
  {
    slug: 'sukanya-samriddhi',
    group: 'schemes',
    icon: 'child_care',
    title: 'Sukanya Samriddhi',
    blurb: 'The scheme for a daughter, to maturity.',
    intro:
      'Deposits run for fifteen years from opening; the account matures twenty-one years after opening, compounding untouched in between. Opened before the girl turns ten.',
    cta: 'Ask how this fits an education goal',
    inputs: [
      { key: 'yearly', label: 'Deposited each year', min: 250, max: 150000, step: 250, value: 50000, format: money },
      { key: 'girlAge', label: 'Her age at opening', min: 0, max: 10, step: 1, value: 5, format: yrs },
    ],
    run: (v) => {
      const r = ssy({ ...v, ratePct: 8.2 });
      return {
        headline: { label: 'Maturity amount', value: money(r.maturity) },
        rows: [
          { label: 'Deposited over 15 years', value: formatMoney(r.deposited) },
          { label: 'Interest earned', value: formatMoney(r.interest) },
          { label: 'She will be', value: `${r.maturesAtGirlAge} years old` },
        ],
        note: 'At 8.2%, the rate notified for recent quarters. The rate is revised quarterly. The maximum deposit is ₹1.5 lakh a year.',
      };
    },
  },
  {
    slug: 'ppf',
    group: 'schemes',
    icon: 'account_balance_wallet',
    title: 'PPF calculator',
    blurb: 'Fifteen years, tax-free at maturity.',
    intro:
      'A deposit each year for fifteen years, extendable in blocks of five. Interest is compounded annually and is exempt at maturity.',
    cta: 'Ask where PPF fits against other options',
    inputs: [
      { key: 'yearly', label: 'Deposited each year', min: 500, max: 150000, step: 500, value: 150000, format: money },
      { key: 'years', label: 'Term', min: 15, max: 35, step: 5, value: 15, format: yrs },
    ],
    run: (v) => {
      const r = ppf({ ...v, ratePct: 7.1 });
      return {
        headline: { label: 'Maturity amount', value: money(r.maturity) },
        rows: [
          { label: 'Deposited', value: formatMoney(r.deposited) },
          { label: 'Interest earned', value: formatMoney(r.interest) },
          { label: 'Term', value: `${v.years} years` },
        ],
        note: 'At 7.1%, the rate notified for recent quarters. The rate is revised quarterly. The maximum deposit is ₹1.5 lakh a year.',
      };
    },
  },
];

export function bySlug(slug) {
  return CALCULATORS.find((calculator) => calculator.slug === slug) ?? null;
}
