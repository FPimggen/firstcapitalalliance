import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, monthlyPayment, totalInterest } from "@/components/CalcShared";

const TERM_OPTIONS = [
  { value: "12", label: "12 months (1 year)" },
  { value: "24", label: "24 months (2 years)" },
  { value: "36", label: "36 months (3 years)" },
  { value: "48", label: "48 months (4 years)" },
  { value: "60", label: "60 months (5 years)" },
  { value: "84", label: "84 months (7 years)" },
];

// ─── Personal Loan Calculator ─────────────────────────────────────────────────

export function PersonalLoanCalculator() {
  const [loanAmount, setLoanAmount] = useState("15000");
  const [rate, setRate] = useState("12.5");
  const [term, setTerm] = useState("36");
  const [originationFee, setOriginationFee] = useState("0");

  const results = useMemo(() => {
    const principal = parseFloat(loanAmount) || 0;
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 36;
    const fee = (parseFloat(originationFee) || 0) / 100;

    const payment = monthlyPayment(principal, r, months);
    const totalInt = totalInterest(principal, r, months);
    const feeAmt = principal * fee;
    const totalCost = principal + totalInt + feeAmt;
    // APR including fee
    const aprWithFee = r; // simplified; true APR calculation would require iteration

    return { payment, totalInt, feeAmt, totalCost, aprWithFee };
  }, [loanAmount, rate, term, originationFee]);

  return (
    <CalcPage
      title="Personal Loan Calculator"
      description="Calculate your monthly payment, total interest, and true cost for any personal loan amount, rate, and term."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Loan Details">
          <div className="space-y-4">
            <InputField label="Loan Amount" value={loanAmount} onChange={setLoanAmount} prefix="$" step={500} />
            <InputField label="Annual Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" step={0.1} />
            <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
            <InputField label="Origination Fee" value={originationFee} onChange={setOriginationFee} suffix="%" step={0.5} hint="Many lenders charge 1–8% of the loan amount" />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <div className="bg-[var(--navy-950)] rounded-xl p-5 text-center text-white">
            <p className="text-sm text-white/60 mb-1">Monthly Payment</p>
            <p className="text-5xl font-bold tabular-nums">{fmt$(results.payment)}</p>
            <p className="text-sm text-white/60 mt-1">for {term} months</p>
          </div>
          <CalcCard title="Loan Summary">
            <ResultRow label="Loan Amount" value={fmt$(parseFloat(loanAmount) || 0)} />
            <ResultRow label="Total Interest" value={fmt$(results.totalInt)} />
            {results.feeAmt > 0 && <ResultRow label="Origination Fee" value={fmt$(results.feeAmt)} />}
            <ResultRow label="Total Cost" value={fmt$(results.totalCost)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Loan Comparison Calculator ───────────────────────────────────────────────

export function LoanComparisonCalculator() {
  const [amount, setAmount] = useState("20000");
  const [rateA, setRateA] = useState("10.99");
  const [termA, setTermA] = useState("36");
  const [rateB, setRateB] = useState("14.5");
  const [termB, setTermB] = useState("60");

  const results = useMemo(() => {
    const principal = parseFloat(amount) || 0;
    const rA = parseFloat(rateA) || 0;
    const mA = parseInt(termA) || 36;
    const rB = parseFloat(rateB) || 0;
    const mB = parseInt(termB) || 60;

    const paymentA = monthlyPayment(principal, rA, mA);
    const paymentB = monthlyPayment(principal, rB, mB);
    const intA = totalInterest(principal, rA, mA);
    const intB = totalInterest(principal, rB, mB);

    return { paymentA, paymentB, intA, intB, totalA: principal + intA, totalB: principal + intB };
  }, [amount, rateA, termA, rateB, termB]);

  const aBetter = results.totalA <= results.totalB;

  return (
    <CalcPage
      title="Loan Comparison Calculator"
      description="Compare two loan offers side by side to see which one costs less over the life of the loan."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CalcCard title="Loan Details">
          <div className="space-y-4">
            <InputField label="Loan Amount" value={amount} onChange={setAmount} prefix="$" step={500} />
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Loan A</p>
              <div className="space-y-3">
                <InputField label="Interest Rate" value={rateA} onChange={setRateA} suffix="%" step={0.1} />
                <SelectField label="Term" value={termA} onChange={setTermA} options={TERM_OPTIONS} />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Loan B</p>
              <div className="space-y-3">
                <InputField label="Interest Rate" value={rateB} onChange={setRateB} suffix="%" step={0.1} />
                <SelectField label="Term" value={termB} onChange={setTermB} options={TERM_OPTIONS} />
              </div>
            </div>
          </div>
        </CalcCard>

        <CalcCard title={`Loan A — ${rateA}% / ${termA} mo`} className={aBetter ? "ring-2 ring-accent" : ""}>
          {aBetter && <div className="inline-block bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-3">Better Deal</div>}
          <ResultRow label="Monthly Payment" value={fmt$(results.paymentA)} highlight />
          <ResultRow label="Total Interest" value={fmt$(results.intA)} />
          <ResultRow label="Total Cost" value={fmt$(results.totalA)} />
        </CalcCard>

        <CalcCard title={`Loan B — ${rateB}% / ${termB} mo`} className={!aBetter ? "ring-2 ring-accent" : ""}>
          {!aBetter && <div className="inline-block bg-accent text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-3">Better Deal</div>}
          <ResultRow label="Monthly Payment" value={fmt$(results.paymentB)} highlight />
          <ResultRow label="Total Interest" value={fmt$(results.intB)} />
          <ResultRow label="Total Cost" value={fmt$(results.totalB)} />
        </CalcCard>
      </div>

      <div className="mt-6">
        <SavingsBanner
          label={`Choosing ${aBetter ? "Loan A" : "Loan B"} saves you`}
          amount={fmt$(Math.abs(results.totalA - results.totalB))}
          positive
        />
      </div>
    </CalcPage>
  );
}

// ─── Debt Consolidation Calculator ───────────────────────────────────────────

export function DebtConsolidationCalculator() {
  const [debts, setDebts] = useState([
    { label: "Credit Card 1", balance: "8500", rate: "22.99" },
    { label: "Credit Card 2", balance: "4200", rate: "19.99" },
    { label: "Personal Loan", balance: "6000", rate: "15.5" },
  ]);
  const [newRate, setNewRate] = useState("11.5");
  const [newTerm, setNewTerm] = useState("48");

  const updateDebt = (i: number, field: "label" | "balance" | "rate", val: string) => {
    setDebts((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };

  const addDebt = () => setDebts((prev) => [...prev, { label: `Debt ${prev.length + 1}`, balance: "0", rate: "0" }]);
  const removeDebt = (i: number) => setDebts((prev) => prev.filter((_, idx) => idx !== i));

  const results = useMemo(() => {
    const totalBalance = debts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0);
    const currentMonthly = debts.reduce((s, d) => {
      const b = parseFloat(d.balance) || 0;
      const r = parseFloat(d.rate) || 0;
      return s + monthlyPayment(b, r, 60); // assume 5-year payoff for current debts
    }, 0);
    const currentTotalInt = debts.reduce((s, d) => {
      const b = parseFloat(d.balance) || 0;
      const r = parseFloat(d.rate) || 0;
      return s + totalInterest(b, r, 60);
    }, 0);

    const r = parseFloat(newRate) || 0;
    const months = parseInt(newTerm) || 48;
    const newPayment = monthlyPayment(totalBalance, r, months);
    const newTotalInt = totalInterest(totalBalance, r, months);
    const monthlySavings = currentMonthly - newPayment;
    const lifetimeSavings = currentTotalInt - newTotalInt;

    return { totalBalance, currentMonthly, currentTotalInt, newPayment, newTotalInt, monthlySavings, lifetimeSavings };
  }, [debts, newRate, newTerm]);

  return (
    <CalcPage
      title="Debt Consolidation Calculator"
      description="See how much you could save by combining multiple high-interest debts into a single lower-rate personal loan."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CalcCard title="Your Current Debts">
            <div className="space-y-3">
              {debts.map((d, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-end">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Label</label>
                    <input value={d.label} onChange={(e) => updateDebt(i, "label", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Balance ($)</label>
                    <input type="number" value={d.balance} onChange={(e) => updateDebt(i, "balance", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Rate (%)</label>
                      <input type="number" value={d.rate} onChange={(e) => updateDebt(i, "rate", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                    </div>
                    {debts.length > 1 && (
                      <button onClick={() => removeDebt(i)} className="mt-5 text-muted-foreground hover:text-red-500 transition-colors text-lg leading-none">×</button>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addDebt} className="text-sm text-accent hover:underline mt-1">+ Add another debt</button>
            </div>
          </CalcCard>
          <CalcCard title="Consolidation Loan">
            <div className="space-y-4">
              <InputField label="New Interest Rate (APR)" value={newRate} onChange={setNewRate} suffix="%" step={0.1} />
              <SelectField label="New Loan Term" value={newTerm} onChange={setNewTerm} options={TERM_OPTIONS} />
            </div>
          </CalcCard>
        </div>

        <div className="space-y-4">
          <SavingsBanner
            label="Monthly Savings After Consolidation"
            amount={fmt$(Math.abs(results.monthlySavings))}
            positive={results.monthlySavings > 0}
          />
          <CalcCard title="Before vs. After">
            <ResultRow label="Total Debt Balance" value={fmt$(results.totalBalance)} />
            <ResultRow label="Current Monthly Payments" value={fmt$(results.currentMonthly)} />
            <ResultRow label="New Monthly Payment" value={fmt$(results.newPayment)} />
            <ResultRow label="Monthly Savings" value={fmt$(results.monthlySavings)} highlight />
          </CalcCard>
          <CalcCard title="Lifetime Interest">
            <ResultRow label="Current Total Interest" value={fmt$(results.currentTotalInt)} />
            <ResultRow label="New Total Interest" value={fmt$(results.newTotalInt)} />
            <ResultRow label="Interest Savings" value={fmt$(results.lifetimeSavings)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Debt Payoff Calculator (Avalanche vs Snowball) ───────────────────────────

export function DebtPayoffCalculator() {
  const [debts, setDebts] = useState([
    { label: "Credit Card A", balance: "5000", rate: "24.99", minPayment: "100" },
    { label: "Credit Card B", balance: "3000", rate: "19.99", minPayment: "60" },
    { label: "Personal Loan", balance: "8000", rate: "12.5", minPayment: "200" },
  ]);
  const [extraPayment, setExtraPayment] = useState("200");

  const updateDebt = (i: number, field: keyof typeof debts[0], val: string) => {
    setDebts((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };
  const addDebt = () => setDebts((prev) => [...prev, { label: `Debt ${prev.length + 1}`, balance: "0", rate: "0", minPayment: "25" }]);
  const removeDebt = (i: number) => setDebts((prev) => prev.filter((_, idx) => idx !== i));

  const simulate = (method: "avalanche" | "snowball") => {
    const extra = parseFloat(extraPayment) || 0;
    let accounts = debts.map((d) => ({
      label: d.label,
      balance: parseFloat(d.balance) || 0,
      rate: (parseFloat(d.rate) || 0) / 100 / 12,
      minPayment: parseFloat(d.minPayment) || 25,
    })).filter((a) => a.balance > 0);

    let month = 0;
    let totalInterestPaid = 0;

    while (accounts.some((a) => a.balance > 0) && month < 600) {
      month++;
      // Accrue interest
      accounts = accounts.map((a) => ({ ...a, balance: a.balance + a.balance * a.rate }));
      // Pay minimums
      accounts = accounts.map((a) => ({ ...a, balance: Math.max(0, a.balance - a.minPayment) }));
      // Apply extra to target
      const active = accounts.filter((a) => a.balance > 0);
      if (active.length > 0) {
        const target = method === "avalanche"
          ? active.reduce((best, a) => a.rate > best.rate ? a : best)
          : active.reduce((best, a) => a.balance < best.balance ? a : best);
        const idx = accounts.findIndex((a) => a.label === target.label);
        accounts[idx].balance = Math.max(0, accounts[idx].balance - extra);
      }
      // Track interest (approximate)
      totalInterestPaid += accounts.reduce((s, a) => s + a.balance * a.rate, 0);
    }

    return { months: month, totalInterestPaid };
  };

  const results = useMemo(() => {
    const totalBalance = debts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0);
    const avalanche = simulate("avalanche");
    const snowball = simulate("snowball");
    return { totalBalance, avalanche, snowball };
  }, [debts, extraPayment]);

  return (
    <CalcPage
      title="Debt Payoff Calculator"
      description="Compare the avalanche method (highest rate first) vs. the snowball method (smallest balance first) to find your fastest path to debt freedom."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <CalcCard title="Your Debts">
            <div className="space-y-3">
              {debts.map((d, i) => (
                <div key={i} className="grid grid-cols-2 gap-2">
                  <div className="col-span-2 flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Label</label>
                      <input value={d.label} onChange={(e) => updateDebt(i, "label", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                    </div>
                    {debts.length > 1 && (
                      <button onClick={() => removeDebt(i)} className="mb-0.5 text-muted-foreground hover:text-red-500 transition-colors text-lg leading-none">×</button>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Balance ($)</label>
                    <input type="number" value={d.balance} onChange={(e) => updateDebt(i, "balance", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Rate (%)</label>
                    <input type="number" value={d.rate} onChange={(e) => updateDebt(i, "rate", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Min. Monthly Payment ($)</label>
                    <input type="number" value={d.minPayment} onChange={(e) => updateDebt(i, "minPayment", e.target.value)} className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40" />
                  </div>
                </div>
              ))}
              <button onClick={addDebt} className="text-sm text-accent hover:underline mt-1">+ Add another debt</button>
            </div>
          </CalcCard>
          <CalcCard title="Extra Monthly Payment">
            <InputField label="Extra Payment Above Minimums" value={extraPayment} onChange={setExtraPayment} prefix="$" step={25} hint="Any extra amount you can put toward debt each month" />
          </CalcCard>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CalcCard title="Avalanche Method" className="ring-2 ring-[var(--teal-400)]">
              <p className="text-xs text-muted-foreground mb-3">Pay highest rate first — saves the most interest</p>
              <ResultRow label="Payoff Time" value={`${results.avalanche.months} months`} highlight />
              <ResultRow label="Est. Interest Paid" value={fmt$(results.avalanche.totalInterestPaid)} />
            </CalcCard>
            <CalcCard title="Snowball Method">
              <p className="text-xs text-muted-foreground mb-3">Pay smallest balance first — builds momentum</p>
              <ResultRow label="Payoff Time" value={`${results.snowball.months} months`} highlight />
              <ResultRow label="Est. Interest Paid" value={fmt$(results.snowball.totalInterestPaid)} />
            </CalcCard>
          </div>
          <SavingsBanner
            label="Avalanche saves vs. Snowball"
            amount={fmt$(Math.abs(results.snowball.totalInterestPaid - results.avalanche.totalInterestPaid))}
            positive
          />
          <CalcCard title="Overview">
            <ResultRow label="Total Debt" value={fmt$(results.totalBalance)} />
            <ResultRow label="Faster Method" value={results.avalanche.months <= results.snowball.months ? "Avalanche" : "Snowball"} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
