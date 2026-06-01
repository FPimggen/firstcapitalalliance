import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, fmtPct, futureValue, futureValueContributions } from "@/components/CalcShared";

// ─── Savings Goal Calculator ─────────────────────────────────────────────────

export function SavingsGoalCalculator() {
  const [goal, setGoal] = useState("20000");
  const [currentSavings, setCurrentSavings] = useState("2000");
  const [rate, setRate] = useState("4.5");
  const [years, setYears] = useState("3");

  const results = useMemo(() => {
    const g = parseFloat(goal) || 0;
    const current = parseFloat(currentSavings) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseFloat(years) || 1;
    const months = y * 12;
    const rMo = r / 100 / 12;

    // Future value of current savings
    const fvCurrent = futureValue(current, r, y);
    const remaining = Math.max(0, g - fvCurrent);

    // Monthly contribution needed
    let monthly = 0;
    if (rMo > 0 && remaining > 0) {
      monthly = remaining * rMo / ((Math.pow(1 + rMo, months) - 1) * (1 + rMo));
    } else if (remaining > 0) {
      monthly = remaining / months;
    }

    const totalContributions = monthly * months + current;
    const totalInterestEarned = g - totalContributions;

    return { monthly, fvCurrent, totalContributions, totalInterestEarned };
  }, [goal, currentSavings, rate, years]);

  return (
    <CalcPage
      title="Savings Goal Calculator"
      description="Find out exactly how much you need to save each month to reach your financial goal on time."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Your Goal">
          <div className="space-y-4">
            <InputField label="Savings Goal" value={goal} onChange={setGoal} prefix="$" step={500} />
            <InputField label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" step={100} />
            <InputField label="Expected Annual Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.1} />
            <InputField label="Time to Reach Goal" value={years} onChange={setYears} suffix="years" min={0.5} max={40} step={0.5} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label="Monthly Savings Needed" amount={fmt$(results.monthly)} positive />
          <CalcCard title="Breakdown">
            <ResultRow label="Current Savings (grown)" value={fmt$(results.fvCurrent)} />
            <ResultRow label="Total Contributions" value={fmt$(results.totalContributions)} />
            <ResultRow label="Interest Earned" value={fmt$(results.totalInterestEarned)} />
            <ResultRow label="Final Balance" value={fmt$(parseFloat(goal) || 0)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── High-Yield vs Regular Savings ──────────────────────────────────────────

export function SavingsComparisonCalculator() {
  const [initialDeposit, setInitialDeposit] = useState("5000");
  const [monthlyContrib, setMonthlyContrib] = useState("200");
  const [hyRate, setHyRate] = useState("4.75");
  const [regularRate, setRegularRate] = useState("0.46");
  const [years, setYears] = useState("5");

  const results = useMemo(() => {
    const principal = parseFloat(initialDeposit) || 0;
    const monthly = parseFloat(monthlyContrib) || 0;
    const hy = parseFloat(hyRate) || 0;
    const reg = parseFloat(regularRate) || 0;
    const y = parseFloat(years) || 1;

    const hyBalance = futureValue(principal, hy, y) + futureValueContributions(monthly, hy, y);
    const regBalance = futureValue(principal, reg, y) + futureValueContributions(monthly, reg, y);
    const extraEarned = hyBalance - regBalance;
    const totalDeposited = principal + monthly * y * 12;

    return { hyBalance, regBalance, extraEarned, totalDeposited };
  }, [initialDeposit, monthlyContrib, hyRate, regularRate, years]);

  return (
    <CalcPage
      title="High-Yield vs. Regular Savings Calculator"
      description="See exactly how much more you earn with a high-yield savings account compared to a traditional savings account over time."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Account Details">
          <div className="space-y-4">
            <InputField label="Initial Deposit" value={initialDeposit} onChange={setInitialDeposit} prefix="$" step={100} />
            <InputField label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} prefix="$" step={25} />
            <InputField label="High-Yield Savings APY" value={hyRate} onChange={setHyRate} suffix="%" step={0.05} hint="Current top HYSA rates are around 4.5–5.0%" />
            <InputField label="Regular Savings APY" value={regularRate} onChange={setRegularRate} suffix="%" step={0.01} hint="National average is ~0.46%" />
            <InputField label="Time Horizon" value={years} onChange={setYears} suffix="years" min={1} max={30} step={1} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label={`Extra earned with HYSA over ${years} years`} amount={fmt$(results.extraEarned)} positive />
          <CalcCard title="Balance Comparison">
            <ResultRow label="Total Deposited" value={fmt$(results.totalDeposited)} />
            <ResultRow label="High-Yield Balance" value={fmt$(results.hyBalance)} highlight />
            <ResultRow label="Regular Savings Balance" value={fmt$(results.regBalance)} />
            <ResultRow label="Difference" value={fmt$(results.extraEarned)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── CD Calculator ────────────────────────────────────────────────────────────

const CD_TERM_OPTIONS = [
  { value: "0.25", label: "3 months" },
  { value: "0.5", label: "6 months" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
];

const COMPOUND_OPTIONS = [
  { value: "365", label: "Daily" },
  { value: "12", label: "Monthly" },
  { value: "4", label: "Quarterly" },
  { value: "2", label: "Semi-annually" },
  { value: "1", label: "Annually" },
];

export function CDCalculator() {
  const [deposit, setDeposit] = useState("10000");
  const [apy, setApy] = useState("5.0");
  const [term, setTerm] = useState("1");
  const [compoundsPerYear, setCompoundsPerYear] = useState("12");

  const results = useMemo(() => {
    const p = parseFloat(deposit) || 0;
    const rate = parseFloat(apy) || 0;
    const y = parseFloat(term) || 1;
    const n = parseInt(compoundsPerYear) || 12;

    const finalBalance = futureValue(p, rate, y, n);
    const interestEarned = finalBalance - p;
    const effectiveApy = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;

    return { finalBalance, interestEarned, effectiveApy };
  }, [deposit, apy, term, compoundsPerYear]);

  return (
    <CalcPage
      title="CD Calculator"
      description="Calculate your final balance and interest earned when your Certificate of Deposit matures."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="CD Details">
          <div className="space-y-4">
            <InputField label="Initial Deposit" value={deposit} onChange={setDeposit} prefix="$" step={500} />
            <InputField label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" step={0.05} />
            <SelectField label="CD Term" value={term} onChange={setTerm} options={CD_TERM_OPTIONS} />
            <SelectField label="Compounding Frequency" value={compoundsPerYear} onChange={setCompoundsPerYear} options={COMPOUND_OPTIONS} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label="Interest Earned at Maturity" amount={fmt$(results.interestEarned)} positive />
          <CalcCard title="CD Summary">
            <ResultRow label="Initial Deposit" value={fmt$(parseFloat(deposit) || 0)} />
            <ResultRow label="APY" value={fmtPct(parseFloat(apy) || 0)} />
            <ResultRow label="Effective APY" value={fmtPct(results.effectiveApy)} sublabel="After compounding" />
            <ResultRow label="Interest Earned" value={fmt$(results.interestEarned)} />
            <ResultRow label="Final Balance at Maturity" value={fmt$(results.finalBalance)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
