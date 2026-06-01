import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, InputField, SelectField, fmt$, fmtPct, monthlyPayment, totalInterest } from "@/components/CalcShared";

const TERM_OPTIONS = [
  { value: "360", label: "30 years" },
  { value: "240", label: "20 years" },
  { value: "180", label: "15 years" },
  { value: "120", label: "10 years" },
];

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPct, setDownPct] = useState("10");
  const [rate, setRate] = useState("7.25");
  const [term, setTerm] = useState("360");
  const [propertyTax, setPropertyTax] = useState("300");
  const [insurance, setInsurance] = useState("100");
  const [pmiRate, setPmiRate] = useState("0.85");

  const results = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const down = (parseFloat(downPct) || 0) / 100;
    const principal = price * (1 - down);
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 360;
    const downPctNum = parseFloat(downPct) || 0;

    const pi = monthlyPayment(principal, r, months);
    const totalInt = totalInterest(principal, r, months);
    const taxes = parseFloat(propertyTax) || 0;
    const ins = parseFloat(insurance) || 0;

    // PMI is only applicable when down payment < 20%
    const requiresPmi = downPctNum < 20;
    const pmiAmt = requiresPmi ? (principal * (parseFloat(pmiRate) || 0) / 100) / 12 : 0;
    const total = pi + taxes + ins + pmiAmt;

    return { principal, pi, totalInt, taxes, ins, pmiAmt, total, downAmt: price * down, requiresPmi, downPctNum };
  }, [homePrice, downPct, rate, term, propertyTax, insurance, pmiRate]);

  return (
    <CalcPage
      title="Mortgage Payment Calculator"
      description="Estimate your monthly mortgage payment including principal, interest, taxes, insurance, and PMI."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <CalcCard title="Loan Details">
          <div className="space-y-4">
            <InputField label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" min={0} step={1000} />
            <InputField
              label="Down Payment"
              value={downPct}
              onChange={setDownPct}
              suffix="%"
              min={0}
              max={100}
              step={0.5}
              hint={`${fmt$(results.downAmt)} down${results.downPctNum >= 20 ? " — No PMI required" : " — PMI applies (< 20%)"}`}
            />
            <InputField label="Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" min={0} max={30} step={0.05} />
            <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Monthly Extras (optional)</p>
              <div className="space-y-3">
                <InputField label="Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" min={0} hint="Monthly amount" />
                <InputField label="Home Insurance" value={insurance} onChange={setInsurance} prefix="$" min={0} hint="Monthly amount" />
                {results.requiresPmi ? (
                  <InputField
                    label="PMI Rate"
                    value={pmiRate}
                    onChange={setPmiRate}
                    suffix="% / yr"
                    min={0}
                    max={3}
                    step={0.05}
                    hint={`${fmt$(results.pmiAmt)}/mo — Typically 0.5%–1.5% of loan amount annually`}
                  />
                ) : (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                    <p className="text-sm font-medium text-emerald-700">✓ No PMI required</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Down payment ≥ 20% — PMI is not applicable</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CalcCard>

        {/* Results */}
        <div className="space-y-4">
          <CalcCard title="Your Estimated Payment">
            <div className="text-center py-4 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Total Monthly Payment</p>
              <p className="text-5xl font-bold text-accent tabular-nums">{fmt$(results.total)}</p>
              <p className="text-sm text-muted-foreground mt-1">per month</p>
            </div>
            <ResultRow label="Principal & Interest" value={fmt$(results.pi)} />
            {results.taxes > 0 && <ResultRow label="Property Tax" value={fmt$(results.taxes)} />}
            {results.ins > 0 && <ResultRow label="Home Insurance" value={fmt$(results.ins)} />}
            {results.pmiAmt > 0 && <ResultRow label="PMI" value={fmt$(results.pmiAmt)} sublabel="Until 20% equity reached" />}
          </CalcCard>

          <CalcCard title="Loan Summary">
            <ResultRow label="Loan Amount" value={fmt$(results.principal)} />
            <ResultRow label="Down Payment" value={`${fmt$(results.downAmt)} (${downPct}%)`} />
            <ResultRow label="Total Interest Paid" value={fmt$(results.totalInt)} />
            <ResultRow label="Total Loan Cost" value={fmt$(results.principal + results.totalInt)} highlight />
          </CalcCard>

          {results.requiresPmi && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-sm font-semibold text-amber-800 mb-1">About PMI</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Private Mortgage Insurance (PMI) is required when your down payment is less than 20%. Once you reach 20% equity in your home, you can request PMI removal. PMI protects the lender — not you — in case of default.
              </p>
            </div>
          )}
        </div>
      </div>
    </CalcPage>
  );
}
