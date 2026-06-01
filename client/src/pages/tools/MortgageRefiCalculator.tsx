import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, monthlyPayment, totalInterest } from "@/components/CalcShared";

const TERM_OPTIONS = [
  { value: "360", label: "30 years" },
  { value: "240", label: "20 years" },
  { value: "180", label: "15 years" },
  { value: "120", label: "10 years" },
];

export default function MortgageRefiCalculator() {
  // Current loan
  const [currentBalance, setCurrentBalance] = useState("280000");
  const [currentRate, setCurrentRate] = useState("7.5");
  const [currentTerm, setCurrentTerm] = useState("360");
  const [monthsRemaining, setMonthsRemaining] = useState("300");
  // New loan
  const [newRate, setNewRate] = useState("6.75");
  const [newTerm, setNewTerm] = useState("360");
  const [closingCosts, setClosingCosts] = useState("4000");

  const results = useMemo(() => {
    const balance = parseFloat(currentBalance) || 0;
    const curRate = parseFloat(currentRate) || 0;
    const curMonths = parseInt(monthsRemaining) || 0;
    const nRate = parseFloat(newRate) || 0;
    const nMonths = parseInt(newTerm) || 360;
    const costs = parseFloat(closingCosts) || 0;

    const currentPayment = monthlyPayment(balance, curRate, curMonths);
    const newPayment = monthlyPayment(balance, nRate, nMonths);
    const monthlySavings = currentPayment - newPayment;
    const breakEvenMonths = monthlySavings > 0 ? Math.ceil(costs / monthlySavings) : Infinity;

    const currentTotalInterest = totalInterest(balance, curRate, curMonths);
    const newTotalInterest = totalInterest(balance, nRate, nMonths);
    const lifetimeSavings = currentTotalInterest - newTotalInterest - costs;

    return { currentPayment, newPayment, monthlySavings, breakEvenMonths, currentTotalInterest, newTotalInterest, lifetimeSavings, costs };
  }, [currentBalance, currentRate, monthsRemaining, newRate, newTerm, closingCosts]);

  const saving = results.monthlySavings > 0;

  return (
    <CalcPage
      title="Mortgage Refinance Calculator"
      description="Compare your current mortgage to a new rate and term. See your monthly savings and how long until refinancing pays for itself."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <CalcCard title="Current Mortgage">
            <div className="space-y-4">
              <InputField label="Remaining Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" min={0} step={1000} />
              <InputField label="Current Interest Rate" value={currentRate} onChange={setCurrentRate} suffix="%" min={0} max={30} step={0.05} />
              <InputField label="Months Remaining" value={monthsRemaining} onChange={setMonthsRemaining} min={1} max={360} hint="How many payments are left on your current loan" />
            </div>
          </CalcCard>
          <CalcCard title="New Loan">
            <div className="space-y-4">
              <InputField label="New Interest Rate" value={newRate} onChange={setNewRate} suffix="%" min={0} max={30} step={0.05} />
              <SelectField label="New Loan Term" value={newTerm} onChange={setNewTerm} options={TERM_OPTIONS} />
              <InputField label="Closing Costs" value={closingCosts} onChange={setClosingCosts} prefix="$" min={0} step={100} hint="Typical range: $2,000–$6,000" />
            </div>
          </CalcCard>
        </div>

        {/* Results */}
        <div className="space-y-4">
          <SavingsBanner
            label={saving ? "Monthly Savings" : "Monthly Cost Increase"}
            amount={fmt$(Math.abs(results.monthlySavings))}
            positive={saving}
          />

          <CalcCard title="Payment Comparison">
            <ResultRow label="Current Monthly Payment" value={fmt$(results.currentPayment)} />
            <ResultRow label="New Monthly Payment" value={fmt$(results.newPayment)} />
            <ResultRow label={saving ? "Monthly Savings" : "Monthly Increase"} value={fmt$(Math.abs(results.monthlySavings))} highlight />
          </CalcCard>

          <CalcCard title="Break-Even & Lifetime">
            <ResultRow
              label="Break-Even Point"
              value={results.breakEvenMonths === Infinity ? "Never" : `${results.breakEvenMonths} months`}
              sublabel={results.breakEvenMonths !== Infinity ? `You'll recoup closing costs in ${Math.ceil(results.breakEvenMonths / 12)} year(s)` : undefined}
            />
            <ResultRow label="Current Total Interest" value={fmt$(results.currentTotalInterest)} />
            <ResultRow label="New Total Interest" value={fmt$(results.newTotalInterest)} />
            <ResultRow label="Closing Costs" value={fmt$(results.costs)} />
            <ResultRow
              label="Lifetime Savings (after costs)"
              value={fmt$(results.lifetimeSavings)}
              highlight
            />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
