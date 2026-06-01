import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, fmtPct } from "@/components/CalcShared";

// ─── APR vs APY Converter ─────────────────────────────────────────────────────

const COMPOUND_OPTIONS = [
  { value: "365", label: "Daily" },
  { value: "12", label: "Monthly" },
  { value: "4", label: "Quarterly" },
  { value: "2", label: "Semi-annually" },
  { value: "1", label: "Annually" },
];

export function AprApyConverter() {
  const [mode, setMode] = useState<"aprToApy" | "apyToApr">("aprToApy");
  const [inputRate, setInputRate] = useState("5.0");
  const [compoundsPerYear, setCompoundsPerYear] = useState("12");

  const results = useMemo(() => {
    const rate = parseFloat(inputRate) || 0;
    const n = parseInt(compoundsPerYear) || 12;

    let apr = 0;
    let apy = 0;

    if (mode === "aprToApy") {
      apr = rate;
      apy = (Math.pow(1 + rate / 100 / n, n) - 1) * 100;
    } else {
      apy = rate;
      apr = n * (Math.pow(1 + rate / 100, 1 / n) - 1) * 100;
    }

    const diff = apy - apr;
    return { apr, apy, diff };
  }, [inputRate, compoundsPerYear, mode]);

  return (
    <CalcPage
      title="APR vs. APY Converter"
      description="Convert between Annual Percentage Rate (APR) and Annual Percentage Yield (APY) to make true apples-to-apples comparisons between financial products."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Conversion Settings">
          <div className="space-y-4">
            <SelectField
              label="Convert"
              value={mode}
              onChange={(v) => setMode(v as "aprToApy" | "apyToApr")}
              options={[
                { value: "aprToApy", label: "APR → APY" },
                { value: "apyToApr", label: "APY → APR" },
              ]}
            />
            <InputField
              label={mode === "aprToApy" ? "Annual Percentage Rate (APR)" : "Annual Percentage Yield (APY)"}
              value={inputRate}
              onChange={setInputRate}
              suffix="%"
              step={0.05}
            />
            <SelectField
              label="Compounding Frequency"
              value={compoundsPerYear}
              onChange={setCompoundsPerYear}
              options={COMPOUND_OPTIONS}
            />
          </div>
          <div className="mt-5 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
            <p><strong>APR</strong> is the simple annual rate without compounding — used for loans and credit cards.</p>
            <p><strong>APY</strong> accounts for compounding — used for savings accounts and CDs. APY is always ≥ APR.</p>
          </div>
        </CalcCard>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <CalcCard title="APR" className={mode === "aprToApy" ? "ring-2 ring-accent" : ""}>
              <p className="text-3xl font-bold tabular-nums text-foreground">{fmtPct(results.apr)}</p>
              <p className="text-xs text-muted-foreground mt-1">Annual Percentage Rate</p>
            </CalcCard>
            <CalcCard title="APY" className={mode === "apyToApr" ? "ring-2 ring-accent" : ""}>
              <p className="text-3xl font-bold tabular-nums text-accent">{fmtPct(results.apy)}</p>
              <p className="text-xs text-muted-foreground mt-1">Annual Percentage Yield</p>
            </CalcCard>
          </div>
          <CalcCard title="Difference">
            <ResultRow label="APR" value={fmtPct(results.apr)} />
            <ResultRow label="APY" value={fmtPct(results.apy)} />
            <ResultRow
              label="APY exceeds APR by"
              value={fmtPct(results.diff, 4)}
              sublabel="The compounding effect"
              highlight
            />
          </CalcCard>
          <CalcCard title="What This Means">
            <p className="text-sm text-muted-foreground leading-relaxed">
              With {COMPOUND_OPTIONS.find(o => o.value === compoundsPerYear)?.label.toLowerCase()} compounding, a stated APR of{" "}
              <strong>{fmtPct(results.apr)}</strong> is equivalent to an effective yield of{" "}
              <strong>{fmtPct(results.apy)}</strong>. When comparing savings accounts, always use APY. When comparing loans, always use APR.
            </p>
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── DTI Calculator ───────────────────────────────────────────────────────────

export function DTICalculator() {
  const [grossMonthlyIncome, setGrossMonthlyIncome] = useState("7500");
  const [debts, setDebts] = useState([
    { label: "Mortgage / Rent", amount: "1800" },
    { label: "Car Loan", amount: "350" },
    { label: "Student Loan", amount: "200" },
    { label: "Credit Card Min.", amount: "75" },
  ]);

  const updateDebt = (i: number, field: "label" | "amount", val: string) => {
    setDebts((prev) => prev.map((d, idx) => idx === i ? { ...d, [field]: val } : d));
  };
  const addDebt = () => setDebts((prev) => [...prev, { label: "Other Debt", amount: "0" }]);
  const removeDebt = (i: number) => setDebts((prev) => prev.filter((_, idx) => idx !== i));

  const results = useMemo(() => {
    const income = parseFloat(grossMonthlyIncome) || 0;
    const totalDebt = debts.reduce((s, d) => s + (parseFloat(d.amount) || 0), 0);
    const dti = income > 0 ? (totalDebt / income) * 100 : 0;

    // Housing-only (front-end DTI)
    const housingDebt = parseFloat(debts[0]?.amount || "0") || 0;
    const frontEndDTI = income > 0 ? (housingDebt / income) * 100 : 0;

    let rating = "";
    let ratingColor = "";
    if (dti <= 20) { rating = "Excellent"; ratingColor = "text-green-600"; }
    else if (dti <= 36) { rating = "Good"; ratingColor = "text-teal-600"; }
    else if (dti <= 43) { rating = "Acceptable"; ratingColor = "text-amber-600"; }
    else { rating = "High — May Limit Borrowing"; ratingColor = "text-red-600"; }

    return { totalDebt, dti, frontEndDTI, rating, ratingColor };
  }, [grossMonthlyIncome, debts]);

  return (
    <CalcPage
      title="Debt-to-Income (DTI) Calculator"
      description="Calculate your debt-to-income ratio and see how lenders evaluate your ability to take on new credit."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Your Monthly Finances">
          <div className="space-y-4">
            <InputField
              label="Gross Monthly Income"
              value={grossMonthlyIncome}
              onChange={setGrossMonthlyIncome}
              prefix="$"
              step={100}
              hint="Before taxes and deductions"
            />
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Monthly Debt Payments</p>
              <div className="space-y-2">
                {debts.map((d, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      value={d.label}
                      onChange={(e) => updateDebt(i, "label", e.target.value)}
                      className="flex-1 border border-border rounded-lg bg-background text-foreground text-xs py-2 px-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <input
                        type="number"
                        value={d.amount}
                        onChange={(e) => updateDebt(i, "amount", e.target.value)}
                        className="w-full border border-border rounded-lg bg-background text-foreground text-xs py-2 pl-5 pr-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                    {debts.length > 1 && (
                      <button onClick={() => removeDebt(i)} className="text-muted-foreground hover:text-red-500 transition-colors text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
                <button onClick={addDebt} className="text-sm text-accent hover:underline mt-1">+ Add debt</button>
              </div>
            </div>
          </div>
        </CalcCard>

        <div className="space-y-4">
          <CalcCard title="Your DTI Ratio">
            <div className="text-center py-4">
              <p className="text-6xl font-bold tabular-nums text-foreground">{results.dti.toFixed(1)}<span className="text-3xl">%</span></p>
              <p className={`text-lg font-semibold mt-2 ${results.ratingColor}`}>{results.rating}</p>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mt-2 mb-4">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, results.dti)}%`,
                  background: results.dti <= 20 ? "#16a34a" : results.dti <= 36 ? "#0d9488" : results.dti <= 43 ? "#d97706" : "#dc2626"
                }}
              />
            </div>
            <ResultRow label="Total Monthly Debt" value={fmt$(results.totalDebt)} />
            <ResultRow label="Gross Monthly Income" value={fmt$(parseFloat(grossMonthlyIncome) || 0)} />
            <ResultRow label="Back-End DTI" value={fmtPct(results.dti)} highlight />
            <ResultRow label="Front-End DTI (housing only)" value={fmtPct(results.frontEndDTI)} />
          </CalcCard>

          <CalcCard title="DTI Benchmarks">
            <div className="space-y-2 text-sm">
              {[
                { range: "≤ 20%", label: "Excellent", color: "bg-green-100 text-green-800" },
                { range: "21–36%", label: "Good — Most lenders approve", color: "bg-teal-100 text-teal-800" },
                { range: "37–43%", label: "Acceptable — May qualify for most loans", color: "bg-amber-100 text-amber-800" },
                { range: "44–50%", label: "High — Fewer options available", color: "bg-orange-100 text-orange-800" },
                { range: "> 50%", label: "Very High — Approval unlikely", color: "bg-red-100 text-red-800" },
              ].map(({ range, label, color }) => (
                <div key={range} className="flex items-center gap-3">
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${color}`}>{range}</span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
