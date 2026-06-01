import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, monthlyPayment } from "@/components/CalcShared";

const HORIZON_OPTIONS = [5, 7, 10, 15, 20, 30].map((y) => ({ value: String(y), label: `${y} years` }));

export default function RentVsBuyCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPct, setDownPct] = useState("20");
  const [mortgageRate, setMortgageRate] = useState("7.25");
  const [propertyTax, setPropertyTax] = useState("300");
  const [insurance, setInsurance] = useState("100");
  const [maintenance, setMaintenance] = useState("250");
  const [homeAppreciation, setHomeAppreciation] = useState("3");
  const [monthlyRent, setMonthlyRent] = useState("2200");
  const [rentIncrease, setRentIncrease] = useState("3");
  const [investmentReturn, setInvestmentReturn] = useState("7");
  const [horizon, setHorizon] = useState("10");

  const results = useMemo(() => {
    const price = parseFloat(homePrice) || 0;
    const down = (parseFloat(downPct) || 0) / 100;
    const downAmt = price * down;
    const loan = price - downAmt;
    const r = parseFloat(mortgageRate) || 0;
    const years = parseInt(horizon) || 10;
    const months = years * 12;

    // --- BUY COSTS ---
    const pi = monthlyPayment(loan, r, 360);
    const taxMo = parseFloat(propertyTax) || 0;
    const insMo = parseFloat(insurance) || 0;
    const maintMo = parseFloat(maintenance) || 0;
    const totalMonthlyBuy = pi + taxMo + insMo + maintMo;

    // Equity built via principal paydown
    const rMo = r / 100 / 12;
    let balance = loan;
    let principalPaid = 0;
    for (let i = 0; i < months; i++) {
      const intPmt = balance * rMo;
      const prinPmt = pi - intPmt;
      principalPaid += prinPmt;
      balance -= prinPmt;
    }

    const appRate = parseFloat(homeAppreciation) || 0;
    const futureHomeValue = price * Math.pow(1 + appRate / 100, years);
    const equity = futureHomeValue - balance;
    const totalBuyCost = totalMonthlyBuy * months;
    const netBuyCost = totalBuyCost - equity + downAmt; // opportunity cost of down payment

    // --- RENT COSTS ---
    const rentMo = parseFloat(monthlyRent) || 0;
    const rentGrowth = parseFloat(rentIncrease) || 0;
    let totalRentCost = 0;
    let currentRent = rentMo;
    for (let y = 0; y < years; y++) {
      totalRentCost += currentRent * 12;
      currentRent *= 1 + rentGrowth / 100;
    }

    // Opportunity cost: invest down payment instead
    const invReturn = parseFloat(investmentReturn) || 0;
    const investedDown = downAmt * Math.pow(1 + invReturn / 100, years);
    const investedMonthlySavings = (totalMonthlyBuy - rentMo) > 0
      ? (totalMonthlyBuy - rentMo) * ((Math.pow(1 + invReturn / 100 / 12, months) - 1) / (invReturn / 100 / 12))
      : 0;
    const totalRentWealth = investedDown + investedMonthlySavings;

    const buyWinsBy = equity - totalRentWealth + (totalRentCost - totalBuyCost);

    return {
      totalMonthlyBuy, totalBuyCost, equity, futureHomeValue, balance,
      totalRentCost, totalRentWealth, investedDown, buyWinsBy,
      downAmt, principalPaid
    };
  }, [homePrice, downPct, mortgageRate, propertyTax, insurance, maintenance, homeAppreciation, monthlyRent, rentIncrease, investmentReturn, horizon]);

  const buyIsBetter = results.buyWinsBy > 0;

  return (
    <CalcPage
      title="Rent vs. Buy Calculator"
      description="Compare the true total cost of renting vs. buying over any time horizon, including home appreciation and investment returns."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buy inputs */}
        <CalcCard title="Buying Costs">
          <div className="space-y-3">
            <InputField label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={5000} />
            <InputField label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" min={0} max={100} hint={fmt$(results.downAmt)} />
            <InputField label="Mortgage Rate" value={mortgageRate} onChange={setMortgageRate} suffix="%" step={0.05} />
            <InputField label="Monthly Property Tax" value={propertyTax} onChange={setPropertyTax} prefix="$" />
            <InputField label="Monthly Insurance" value={insurance} onChange={setInsurance} prefix="$" />
            <InputField label="Monthly Maintenance" value={maintenance} onChange={setMaintenance} prefix="$" />
            <InputField label="Annual Home Appreciation" value={homeAppreciation} onChange={setHomeAppreciation} suffix="%" step={0.5} />
          </div>
        </CalcCard>

        {/* Rent inputs */}
        <CalcCard title="Renting Costs">
          <div className="space-y-3">
            <InputField label="Current Monthly Rent" value={monthlyRent} onChange={setMonthlyRent} prefix="$" />
            <InputField label="Annual Rent Increase" value={rentIncrease} onChange={setRentIncrease} suffix="%" step={0.5} />
            <InputField label="Investment Return (if renting)" value={investmentReturn} onChange={setInvestmentReturn} suffix="%" step={0.5} hint="Expected annual return if you invest the down payment instead" />
            <SelectField label="Time Horizon" value={horizon} onChange={setHorizon} options={HORIZON_OPTIONS} />
          </div>
        </CalcCard>

        {/* Results */}
        <div className="space-y-4">
          <SavingsBanner
            label={buyIsBetter ? `Buying saves you over ${horizon} years` : `Renting saves you over ${horizon} years`}
            amount={fmt$(Math.abs(results.buyWinsBy))}
            positive={buyIsBetter}
          />
          <CalcCard title="Buying Summary">
            <ResultRow label="Monthly Payment" value={fmt$(results.totalMonthlyBuy)} />
            <ResultRow label="Total Paid" value={fmt$(results.totalBuyCost)} />
            <ResultRow label="Future Home Value" value={fmt$(results.futureHomeValue)} />
            <ResultRow label="Equity Built" value={fmt$(results.equity)} highlight />
          </CalcCard>
          <CalcCard title="Renting Summary">
            <ResultRow label="Total Rent Paid" value={fmt$(results.totalRentCost)} />
            <ResultRow label="Down Payment Invested" value={fmt$(results.investedDown)} />
            <ResultRow label="Total Wealth (rent)" value={fmt$(results.totalRentWealth)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
