import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  drawdown,
  educationGoal,
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
} from '../../shared/calculators.js';

/**
 * The calculators are the only place on the site that produces a number a
 * visitor might act on, so each one is checked against a value worked out
 * independently rather than against its own output.
 */

describe('investing', () => {
  it('values a SIP the way the standard annuity formula does', () => {
    // 10,000 a month for 10 years at 12%: ~23.23 lakh on 12 lakh invested.
    const result = sip({ monthly: 10000, years: 10, ratePct: 12 });
    assert.equal(result.invested, 1200000);
    assert.ok(Math.abs(result.value - 2323391) < 2000, `got ${result.value}`);
    assert.equal(result.gain, result.value - result.invested);
  });

  it('treats a zero return as pure saving', () => {
    const result = sip({ monthly: 5000, years: 3, ratePct: 0 });
    assert.equal(result.value, 180000);
    assert.equal(result.gain, 0);
  });

  it('steps a SIP up every year, and a 0% step-up matches a flat SIP', () => {
    const flat = sip({ monthly: 10000, years: 10, ratePct: 12 });
    const stepped = stepUpSip({ monthly: 10000, years: 10, ratePct: 12, stepUpPct: 0 });
    assert.ok(Math.abs(stepped.value - flat.value) < 2, 'a 0% step-up is a flat SIP');

    const rising = stepUpSip({ monthly: 10000, years: 10, ratePct: 12, stepUpPct: 10 });
    assert.ok(rising.value > flat.value);
    assert.ok(rising.invested > flat.invested);
  });

  it('compounds a lump sum annually', () => {
    const result = lumpsum({ amount: 100000, years: 10, ratePct: 12 });
    assert.ok(Math.abs(result.value - 310585) < 5, `got ${result.value}`);
  });
});

describe('borrowing', () => {
  it('computes an EMI and closes the balance at the end of the tenure', () => {
    // 50 lakh at 8.5% over 20 years is ~43,391 a month.
    const result = emi({ principal: 5000000, ratePct: 8.5, years: 20 });
    assert.ok(Math.abs(result.emi - 43391) < 50, `got ${result.emi}`);
    assert.equal(result.months, 240);
    assert.equal(result.schedule.at(-1).balance, 0);
    assert.ok(Math.abs(result.totalPaid - (5000000 + result.totalInterest)) < 2);
  });

  it('shortens the tenure when extra is paid, rather than shrinking the EMI', () => {
    const base = emi({ principal: 5000000, ratePct: 8.5, years: 20 });
    const faster = emiPrepayment({ principal: 5000000, ratePct: 8.5, years: 20, extraMonthly: 5000 });

    assert.equal(faster.emi, base.emi, 'the instalment is unchanged');
    assert.ok(faster.months < base.months, 'the loan ends sooner');
    assert.ok(faster.interestSaved > 0);
    assert.equal(faster.monthsSaved, base.months - faster.months);
  });

  it('reports no saving when nothing extra is paid', () => {
    const same = emiPrepayment({ principal: 1000000, ratePct: 9, years: 10 });
    assert.ok(Math.abs(same.interestSaved) < 500);
    assert.ok(Math.abs(same.monthsSaved) <= 1);
  });
});

describe('income tax', () => {
  it('charges nothing under the new regime up to the rebate ceiling', () => {
    // 12.75 lakh gross, less the 75,000 standard deduction, is exactly 12 lakh.
    const result = incomeTax({ grossSalary: 1275000 });
    assert.equal(result.new.taxable, 1200000);
    assert.equal(result.new.tax, 0);
    assert.equal(result.better, 'new');
  });

  it('applies the slabs above the ceiling', () => {
    // 20 lakh gross → 19.25 lakh taxable: 20,000 + 40,000 + 60,000 + 65,000
    // = 1,85,000, plus 4% cess.
    const result = incomeTax({ grossSalary: 2000000 });
    assert.equal(result.new.taxable, 1925000);
    assert.equal(result.new.tax, Math.round(185000 * 1.04));
  });

  it('lets the old regime win, but only once the deductions are genuinely large', () => {
    // At 15 lakh the new regime charges 97,500. Beating that under the old
    // slabs needs taxable income under ~9.06 lakh, which is more than 5.4 lakh
    // of deductions — 80C, 80D, HRA and home-loan interest together.
    const modest = incomeTax({ grossSalary: 1500000, deductions: 500000 });
    assert.equal(modest.better, 'new', 'half a lakh short of the crossover');

    const heavy = incomeTax({ grossSalary: 1500000, deductions: 700000 });
    assert.equal(heavy.better, 'old');
    assert.ok(heavy.saving > 0);

    const none = incomeTax({ grossSalary: 1500000, deductions: 0 });
    assert.equal(none.better, 'new');
    assert.ok(none.saving > modest.saving, 'fewer deductions widen the gap');
  });

  it('names the year it is computing, because the slabs expire', () => {
    assert.match(incomeTax({ grossSalary: 1000000 }).year, /FY 20\d\d-\d\d/);
  });
});

describe('retirement and schemes', () => {
  it('splits an NPS corpus into a lump sum and a pension', () => {
    const result = nps({ monthly: 5000, currentAge: 30, retireAge: 60, ratePct: 10 });
    assert.equal(result.years, 30);
    assert.equal(result.lumpSum + result.annuityCorpus, result.corpus);
    // 40% annuitised at 6% is a twentieth of the corpus a year.
    assert.ok(Math.abs(result.monthlyPension - (result.annuityCorpus * 0.06) / 12) < 2);
  });

  it('measures a life cover gap, and reports a surplus rather than a negative gap', () => {
    const under = humanLifeValue({ annualIncome: 1200000, currentAge: 35, existingCover: 2000000 });
    assert.ok(under.gap > 0);
    assert.equal(under.surplus, 0);

    const over = humanLifeValue({ annualIncome: 1200000, currentAge: 35, existingCover: 100000000 });
    assert.equal(over.gap, 0);
    assert.ok(over.surplus > 0);
  });

  it('adds liabilities and subtracts savings from the need', () => {
    const plain = humanLifeValue({ annualIncome: 1000000, currentAge: 40 });
    const loaded = humanLifeValue({ annualIncome: 1000000, currentAge: 40, liabilities: 3000000, savings: 1000000 });
    assert.equal(loaded.totalNeed - plain.totalNeed, 2000000);
  });

  it('compounds EPF on the employee share plus the employer’s 3.67%', () => {
    const result = epf({ basicMonthly: 50000, currentAge: 30, retireAge: 58, ratePct: 8.25, growthPct: 0 });
    assert.equal(result.years, 28);
    // With no salary growth, the yearly contribution is fixed and checkable.
    assert.equal(result.contributed, Math.round(50000 * 12 * (0.12 + 0.0367) * 28));
    assert.ok(result.corpus > result.contributed);
  });

  it('runs Sukanya for fifteen deposits and twenty-one years', () => {
    const result = ssy({ yearly: 150000, girlAge: 4 });
    assert.equal(result.deposited, 2250000);
    assert.equal(result.maturesAtGirlAge, 25);
    assert.ok(result.maturity > result.deposited * 2);
  });

  it('compounds PPF over its term', () => {
    const result = ppf({ yearly: 150000, years: 15, ratePct: 7.1 });
    assert.equal(result.deposited, 2250000);
    assert.ok(Math.abs(result.maturity - 4067053) < 5000, `got ${result.maturity}`);
  });
});

describe('drawing down', () => {
  it('walks a corpus down and says the year it runs out', () => {
    // 1 crore, spending 80,000 a month, is gone well before 95.
    const thin = drawdown({ corpus: 10000000, monthlySpend: 80000, currentAge: 60 });
    assert.ok(thin.ranOutAt !== null, 'this corpus does not last');
    assert.ok(thin.ranOutAt < 95, `ran out at ${thin.ranOutAt}`);
    assert.equal(thin.series.at(-1).balance, 0);
    assert.equal(thin.lastsYears, thin.ranOutAt - 60);
  });

  it('survives the horizon when the corpus is large enough', () => {
    const fat = drawdown({ corpus: 60000000, monthlySpend: 80000, currentAge: 60 });
    assert.equal(fat.ranOutAt, null);
    assert.equal(fat.survivesTo, 95);
    assert.ok(fat.endingBalance > 0);
  });

  it('raises the withdrawal with inflation, so the last year costs more', () => {
    const r = drawdown({ corpus: 60000000, monthlySpend: 50000, currentAge: 60, inflationPct: 6 });
    assert.ok(r.lastWithdrawal > r.firstYearWithdrawal * 3, 'six per cent over 35 years compounds');
  });

  it('keeps one entry per age, all the way to the horizon', () => {
    // The chart keys on the age, and it draws the unfunded years too — so the
    // series must run to `until` with no age repeated, whether or not the money
    // lasted.
    for (const corpus of [10000000, 60000000]) {
      const r = drawdown({ corpus, monthlySpend: 80000, currentAge: 60, until: 95 });
      const ages = r.series.map((point) => point.age);
      assert.equal(ages.length, 35);
      assert.equal(new Set(ages).size, 35, 'no age appears twice');
      assert.equal(ages.at(0), 61);
      assert.equal(ages.at(-1), 95);
    }
  });

  it('holds the balance at zero once the money is gone', () => {
    const r = drawdown({ corpus: 10000000, monthlySpend: 80000, currentAge: 60 });
    const after = r.series.filter((point) => point.age > r.ranOutAt);
    assert.ok(after.length > 0, 'there are years after it runs out');
    assert.ok(after.every((point) => point.balance === 0), 'and none of them are funded');
  });

  it('spending nothing leaves the corpus growing', () => {
    const r = drawdown({ corpus: 1000000, monthlySpend: 0, currentAge: 60, until: 61 });
    assert.equal(r.ranOutAt, null);
    assert.ok(r.endingBalance > 1000000);
  });
});

describe('education goal', () => {
  it('inflates a fee to the year it is needed', () => {
    // 20 lakh today at 8% for 10 years is about 43.2 lakh.
    const r = educationGoal({ costToday: 2000000, yearsAway: 10, feeInflationPct: 8 });
    assert.ok(Math.abs(r.futureCost - 4317850) < 5000, `got ${r.futureCost}`);
    assert.ok(r.multiple > 2);
  });

  it('counts what is already saved, and the monthly figure closes the rest', () => {
    const none = educationGoal({ costToday: 2000000, yearsAway: 10, saved: 0 });
    const some = educationGoal({ costToday: 2000000, yearsAway: 10, saved: 500000 });
    assert.ok(some.monthly < none.monthly);
    assert.equal(some.shortfall, some.futureCost - some.savedGrowsTo);
  });

  it('asks for nothing when the goal is already funded', () => {
    const r = educationGoal({ costToday: 1000000, yearsAway: 5, saved: 50000000 });
    assert.equal(r.shortfall, 0);
    assert.equal(r.monthly, 0);
  });
});
