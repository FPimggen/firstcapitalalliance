import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, fmt$, monthlyPayment } from "@/components/CalcShared";

export default function HomeAffordabilityCalculator() {
  const [grossIncome, setGrossIncome] = useState("8000");
  const [monthlyDebts, setMonthlyDebts] = useState("500");
  const [downPayment, setDownPayment] = useState("60000");
  const [rate, setRate] = useState("7.25");
  const [propertyTax, setPropertyTax] = useState("300");
  const [insurance, setInsurance] = useState("100");

  const results = useMemo(() => {
    const income = parseFloat(grossIncome) || 0;
    const debts = parseFloat(monthlyDebts) || 0;
    const down = parseFloat(downPayment) || 0;
    const r = parseFloat(rate) || 0;
    const taxes = parseFloat(propertyTax) || 0;
    const ins = parseFloat(insurance) || 0;

    // 28% front-end DTI rule and 36% back-end DTI rule
    const maxHousingPayment28 = income * 0.28;
    const maxHousingPayment36 = income * 0.36 - debts;
    const maxPITI = Math.min(maxHousingPayment28, maxHousingPayment36);
    const maxPI = Math.max(0, maxPITI - taxes - ins);

    // Solve for max loan: PI = P * r(1+r)^n / ((1+r)^n - 1)
    const rMonthly = r / 100 / 12;
    const n = 360;
    let maxLoan = 0;
    if (rMonthly > 0 && maxPI > 0) {
      maxLoan = maxPI * (Math.pow(1 + rMonthly, n) - 1) / (rMonthly * Math.pow(1 + rMonthly, n));
    } else if (maxPI > 0) {
      maxLoan = maxPI * n;
    }

    const maxHomePrice = maxLoan + down;
    const actualPayment = monthlyPayment(maxLoan, r, 360) + taxes + ins;
    const frontEndDTI = income > 0 ? (actualPayment / income) * 100 : 0;
    const backEndDTI = income > 0 ? ((actualPayment + debts) / income) * 100 : 0;

    return { maxHomePrice, maxLoan, maxPI, actualPayment, frontEndDTI, backEndDTI, maxHousingPayment28, maxHousingPayment36 };
  }, [grossIncome, monthlyDebts, downPayment, rate, propertyTax, insurance]);

  return (
    <CalcPage
      title="Home Affordability Calculator"
      description="Find out how much home you can afford based on your income, debts, down payment, and current mortgage rates."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Your Financial Picture">
          <div className="space-y-4">
            <InputField label="Gross Monthly Income" value={grossIncome} onChange={setGrossIncome} prefix="$" min={0} step={100} hint="Before taxes" />
            <InputField label="Monthly Debt Payments" value={monthlyDebts} onChange={setMonthlyDebts} prefix="$" min={0} step={50} hint="Car loans, student loans, minimum credit card payments, etc." />
            <InputField label="Down Payment Available" value={downPayment} onChange={setDownPayment} prefix="$" min={0} step={1000} />
            <InputField label="Estimated Interest Rate" value={rate} onChange={setRate} suffix="%" min={0} max={30} step={0.05} />
            <InputField label="Est. Monthly Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" min={0} />
            <InputField label="Est. Monthly Insurance" value={insurance} onChange={setInsurance} prefix="$" min={0} />
          </div>
        </CalcCard>

        <div className="space-y-4">
          <SavingsBanner label="Maximum Home Price" amount={fmt$(results.maxHomePrice)} positive />

          <CalcCard title="Affordability Breakdown">
            <ResultRow label="Maximum Loan Amount" value={fmt$(results.maxLoan)} />
            <ResultRow label="Down Payment" value={fmt$(parseFloat(downPayment) || 0)} />
            <ResultRow label="Max Monthly P&I" value={fmt$(results.maxPI)} />
            <ResultRow label="Estimated Total Payment" value={fmt$(results.actualPayment)} highlight />
          </CalcCard>

          <CalcCard title="Debt-to-Income Ratios">
            <ResultRow
              label="Front-End DTI"
              value={`${results.frontEndDTI.toFixed(1)}%`}
              sublabel="Housing costs ÷ income (lenders prefer ≤28%)"
            />
            <ResultRow
              label="Back-End DTI"
              value={`${results.backEndDTI.toFixed(1)}%`}
              sublabel="All debts ÷ income (lenders prefer ≤36–43%)"
            />
            <ResultRow label="28% Rule Max Payment" value={fmt$(results.maxHousingPayment28)} />
            <ResultRow label="36% Rule Max Payment" value={fmt$(results.maxHousingPayment36)} />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
