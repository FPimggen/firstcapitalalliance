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
    const totalInterestEarned = Math.max(0, g - totalContributions);

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
            <InputField label="Savings Goal" value={goal} onChange={setGoal} prefix="$" step={500} hint="How much do you want to save?" />
            <InputField label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix="$" step={100} hint="What you already have saved" />
            <InputField label="Expected Annual Interest Rate (APY)" value={rate} onChange={setRate} suffix="%" step={0.1} hint="High-yield savings accounts currently offer 4–5%" />
            <InputField label="Time to Reach Goal" value={years} onChange={setYears} suffix="years" min={0.5} max={40} step={0.5} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label="Monthly Savings Needed" amount={fmt$(results.monthly)} positive />
          <CalcCard title="Breakdown">
            <ResultRow label="Current Savings (grown with interest)" value={fmt$(results.fvCurrent)} />
            <ResultRow label="Total New Contributions" value={fmt$(results.totalContributions - (parseFloat(currentSavings) || 0))} />
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
    const hyInterest = hyBalance - totalDeposited;
    const regInterest = regBalance - totalDeposited;

    return { hyBalance, regBalance, extraEarned, totalDeposited, hyInterest, regInterest };
  }, [initialDeposit, monthlyContrib, hyRate, regularRate, years]);

  return (
    <CalcPage
      title="High-Yield vs. Regular Savings Calculator"
      description="See exactly how much more you earn with a high-yield savings account compared to a traditional savings account over time."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Account Details">
          <div className="space-y-4">
            <InputField label="Initial Deposit" value={initialDeposit} onChange={setInitialDeposit} prefix="$" step={100} hint="Amount you're depositing today" />
            <InputField label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} prefix="$" step={25} hint="How much you'll add each month" />
            <InputField label="High-Yield Savings APY" value={hyRate} onChange={setHyRate} suffix="%" step={0.05} hint="Current top HYSA rates: 4.5–5.0%" />
            <InputField label="Regular Savings APY" value={regularRate} onChange={setRegularRate} suffix="%" step={0.01} hint="National average: ~0.46%" />
            <InputField label="Time Horizon" value={years} onChange={setYears} suffix="years" min={1} max={30} step={1} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label={`Extra earned with HYSA over ${years} year${years === "1" ? "" : "s"}`} amount={fmt$(results.extraEarned)} positive />
          <CalcCard title="Balance Comparison">
            <ResultRow label="Total Deposited" value={fmt$(results.totalDeposited)} sublabel="Initial + contributions" />
            <ResultRow label="High-Yield Interest Earned" value={fmt$(results.hyInterest)} />
            <ResultRow label="Regular Savings Interest Earned" value={fmt$(results.regInterest)} />
            <div className="border-t border-border my-2" />
            <ResultRow label={`High-Yield Balance (${years} yr)`} value={fmt$(results.hyBalance)} highlight />
            <ResultRow label={`Regular Savings Balance (${years} yr)`} value={fmt$(results.regBalance)} />
            <ResultRow label="You'd earn extra" value={fmt$(results.extraEarned)} highlight />
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
            <InputField label="Initial Deposit" value={deposit} onChange={setDeposit} prefix="$" step={500} hint="Minimum deposit varies by bank (typically $500–$1,000)" />
            <InputField label="Annual Percentage Yield (APY)" value={apy} onChange={setApy} suffix="%" step={0.05} hint="Top 1-year CD rates are currently 4.5–5.5%" />
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
          <div className="rounded-xl bg-[var(--navy-50)] border border-[var(--navy-200)] px-4 py-3">
            <p className="text-xs text-[var(--navy-700)] leading-relaxed">
              <strong>Early withdrawal penalty:</strong> Most CDs charge a penalty for withdrawing before maturity — typically 60–365 days of interest. Consider a no-penalty CD if you may need access to your funds.
            </p>
          </div>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Cash Back Rewards Calculator ────────────────────────────────────────────

export function RewardsCalculator() {
  const [groceries, setGroceries] = useState("600");
  const [dining, setDining] = useState("300");
  const [gas, setGas] = useState("150");
  const [travel, setTravel] = useState("200");
  const [other, setOther] = useState("500");
  const [groceriesRate, setGroceriesRate] = useState("3");
  const [diningRate, setDiningRate] = useState("3");
  const [gasRate, setGasRate] = useState("2");
  const [travelRate, setTravelRate] = useState("5");
  const [otherRate, setOtherRate] = useState("1.5");
  const [annualFee, setAnnualFee] = useState("0");

  const results = useMemo(() => {
    const g = parseFloat(groceries) || 0;
    const d = parseFloat(dining) || 0;
    const gs = parseFloat(gas) || 0;
    const t = parseFloat(travel) || 0;
    const o = parseFloat(other) || 0;

    const gr = (parseFloat(groceriesRate) || 0) / 100;
    const dr = (parseFloat(diningRate) || 0) / 100;
    const gsr = (parseFloat(gasRate) || 0) / 100;
    const tr = (parseFloat(travelRate) || 0) / 100;
    const or = (parseFloat(otherRate) || 0) / 100;

    const fee = parseFloat(annualFee) || 0;

    const monthlyGroceries = g * gr;
    const monthlyDining = d * dr;
    const monthlyGas = gs * gsr;
    const monthlyTravel = t * tr;
    const monthlyOther = o * or;
    const monthlyTotal = monthlyGroceries + monthlyDining + monthlyGas + monthlyTravel + monthlyOther;
    const annualRewards = monthlyTotal * 12;
    const netAnnualValue = annualRewards - fee;
    const totalSpend = (g + d + gs + t + o) * 12;
    const effectiveRate = totalSpend > 0 ? (annualRewards / totalSpend) * 100 : 0;

    return { monthlyTotal, annualRewards, netAnnualValue, effectiveRate, monthlyGroceries, monthlyDining, monthlyGas, monthlyTravel, monthlyOther };
  }, [groceries, dining, gas, travel, other, groceriesRate, diningRate, gasRate, travelRate, otherRate, annualFee]);

  return (
    <CalcPage
      title="Cash Back Rewards Calculator"
      description="Estimate your annual cash back earnings based on your monthly spending habits and card reward rates."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Monthly Spending & Reward Rates">
          <div className="space-y-1 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              <span>Category (Monthly $)</span>
              <span>Reward Rate</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 items-end">
              <InputField label="Groceries" value={groceries} onChange={setGroceries} prefix="$" step={50} />
              <InputField label="Rate" value={groceriesRate} onChange={setGroceriesRate} suffix="%" step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <InputField label="Dining & Restaurants" value={dining} onChange={setDining} prefix="$" step={50} />
              <InputField label="Rate" value={diningRate} onChange={setDiningRate} suffix="%" step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <InputField label="Gas & Transit" value={gas} onChange={setGas} prefix="$" step={25} />
              <InputField label="Rate" value={gasRate} onChange={setGasRate} suffix="%" step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <InputField label="Travel" value={travel} onChange={setTravel} prefix="$" step={50} />
              <InputField label="Rate" value={travelRate} onChange={setTravelRate} suffix="%" step={0.5} />
            </div>
            <div className="grid grid-cols-2 gap-2 items-end">
              <InputField label="All Other Purchases" value={other} onChange={setOther} prefix="$" step={50} />
              <InputField label="Rate" value={otherRate} onChange={setOtherRate} suffix="%" step={0.25} />
            </div>
            <div className="border-t border-border pt-3">
              <InputField label="Annual Fee" value={annualFee} onChange={setAnnualFee} prefix="$" step={5} hint="Enter $0 for no-fee cards" />
            </div>
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner label="Net Annual Cash Back (after fee)" amount={fmt$(results.netAnnualValue)} positive={results.netAnnualValue > 0} />
          <CalcCard title="Rewards Breakdown">
            <ResultRow label="Groceries" value={`${fmt$(results.monthlyGroceries)}/mo`} />
            <ResultRow label="Dining" value={`${fmt$(results.monthlyDining)}/mo`} />
            <ResultRow label="Gas & Transit" value={`${fmt$(results.monthlyGas)}/mo`} />
            <ResultRow label="Travel" value={`${fmt$(results.monthlyTravel)}/mo`} />
            <ResultRow label="Other" value={`${fmt$(results.monthlyOther)}/mo`} />
            <div className="border-t border-border my-2" />
            <ResultRow label="Monthly Cash Back" value={fmt$(results.monthlyTotal)} />
            <ResultRow label="Annual Cash Back" value={fmt$(results.annualRewards)} />
            <ResultRow label="Annual Fee" value={`-${fmt$(parseFloat(annualFee) || 0)}`} />
            <ResultRow label="Effective Rewards Rate" value={fmtPct(results.effectiveRate)} sublabel="On total spend" />
            <ResultRow label="Net Annual Value" value={fmt$(results.netAnnualValue)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
