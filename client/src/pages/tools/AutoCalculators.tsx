import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, monthlyPayment, totalInterest } from "@/components/CalcShared";

const TERM_OPTIONS = [
  { value: "24", label: "24 months (2 years)" },
  { value: "36", label: "36 months (3 years)" },
  { value: "48", label: "48 months (4 years)" },
  { value: "60", label: "60 months (5 years)" },
  { value: "72", label: "72 months (6 years)" },
  { value: "84", label: "84 months (7 years)" },
];

// ─── Auto Loan Calculator ─────────────────────────────────────────────────────

export function AutoLoanCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [rate, setRate] = useState("7.5");
  const [term, setTerm] = useState("60");
  const [salesTaxPct, setSalesTaxPct] = useState("8");

  const results = useMemo(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const trade = parseFloat(tradeIn) || 0;
    const tax = (parseFloat(salesTaxPct) || 0) / 100;
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 60;

    const taxAmount = price * tax;
    const loanAmount = Math.max(0, price + taxAmount - down - trade);
    const payment = monthlyPayment(loanAmount, r, months);
    const totalInt = totalInterest(loanAmount, r, months);
    const totalCost = loanAmount + totalInt + down + trade;

    return { loanAmount, payment, totalInt, totalCost, taxAmount };
  }, [vehiclePrice, downPayment, tradeIn, rate, term, salesTaxPct]);

  return (
    <CalcPage
      title="Auto Loan Calculator"
      description="Calculate your monthly car payment, total interest paid, and the true cost of your auto loan."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Vehicle & Loan Details">
          <div className="space-y-4">
            <InputField label="Vehicle Price" value={vehiclePrice} onChange={setVehiclePrice} prefix="$" step={500} />
            <InputField label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" step={500} />
            <InputField label="Trade-In Value" value={tradeIn} onChange={setTradeIn} prefix="$" step={100} />
            <InputField label="Sales Tax Rate" value={salesTaxPct} onChange={setSalesTaxPct} suffix="%" step={0.25} hint={`Sales tax: ${fmt$(results.taxAmount)}`} />
            <InputField label="Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" step={0.1} />
            <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <div className="bg-[var(--navy-950)] rounded-xl p-5 text-center text-white">
            <p className="text-sm text-white/60 mb-1">Monthly Payment</p>
            <p className="text-5xl font-bold tabular-nums">{fmt$(results.payment)}</p>
            <p className="text-sm text-white/60 mt-1">per month for {term} months</p>
          </div>
          <CalcCard title="Loan Summary">
            <ResultRow label="Vehicle Price" value={fmt$(parseFloat(vehiclePrice) || 0)} />
            <ResultRow label="Sales Tax" value={fmt$(results.taxAmount)} />
            <ResultRow label="Down Payment" value={`-${fmt$(parseFloat(downPayment) || 0)}`} />
            <ResultRow label="Trade-In" value={`-${fmt$(parseFloat(tradeIn) || 0)}`} />
            <ResultRow label="Loan Amount" value={fmt$(results.loanAmount)} />
            <ResultRow label="Total Interest" value={fmt$(results.totalInt)} />
            <ResultRow label="Total Cost of Vehicle" value={fmt$(results.totalCost)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Auto Refi Calculator ─────────────────────────────────────────────────────

export function AutoRefiCalculator() {
  const [currentBalance, setCurrentBalance] = useState("22000");
  const [currentRate, setCurrentRate] = useState("9.5");
  const [currentTerm, setCurrentTerm] = useState("48");
  const [newRate, setNewRate] = useState("6.5");
  const [newTerm, setNewTerm] = useState("48");

  const results = useMemo(() => {
    const balance = parseFloat(currentBalance) || 0;
    const curRate = parseFloat(currentRate) || 0;
    const curMonths = parseInt(currentTerm) || 48;
    const nRate = parseFloat(newRate) || 0;
    const nMonths = parseInt(newTerm) || 48;

    const currentPayment = monthlyPayment(balance, curRate, curMonths);
    const newPayment = monthlyPayment(balance, nRate, nMonths);
    const currentTotalInt = totalInterest(balance, curRate, curMonths);
    const newTotalInt = totalInterest(balance, nRate, nMonths);
    const monthlySavings = currentPayment - newPayment;
    const lifetimeSavings = currentTotalInt - newTotalInt;

    return { currentPayment, newPayment, currentTotalInt, newTotalInt, monthlySavings, lifetimeSavings };
  }, [currentBalance, currentRate, currentTerm, newRate, newTerm]);

  const saving = results.monthlySavings > 0;

  return (
    <CalcPage
      title="Auto Refinance Calculator"
      description="Compare your current auto loan to a new rate and term. See how much you could save each month and over the life of the loan."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <CalcCard title="Current Auto Loan">
            <div className="space-y-4">
              <InputField label="Remaining Balance" value={currentBalance} onChange={setCurrentBalance} prefix="$" step={500} />
              <InputField label="Current Interest Rate (APR)" value={currentRate} onChange={setCurrentRate} suffix="%" step={0.1} />
              <SelectField label="Remaining Term" value={currentTerm} onChange={setCurrentTerm} options={TERM_OPTIONS} />
            </div>
          </CalcCard>
          <CalcCard title="New Loan Offer">
            <div className="space-y-4">
              <InputField label="New Interest Rate (APR)" value={newRate} onChange={setNewRate} suffix="%" step={0.1} />
              <SelectField label="New Loan Term" value={newTerm} onChange={setNewTerm} options={TERM_OPTIONS} />
            </div>
          </CalcCard>
        </div>
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
          <CalcCard title="Total Interest Comparison">
            <ResultRow label="Current Total Interest" value={fmt$(results.currentTotalInt)} />
            <ResultRow label="New Total Interest" value={fmt$(results.newTotalInt)} />
            <ResultRow
              label={results.lifetimeSavings >= 0 ? "Lifetime Interest Savings" : "Lifetime Interest Increase"}
              value={fmt$(Math.abs(results.lifetimeSavings))}
              highlight
            />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
