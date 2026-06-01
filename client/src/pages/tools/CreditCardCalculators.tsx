import { useState, useMemo } from "react";
import { CalcPage, CalcCard, ResultRow, SavingsBanner, InputField, SelectField, fmt$, monthlyPayment, totalInterest, monthsToPayoff } from "@/components/CalcShared";

// ─── Credit Card Payoff Calculator ───────────────────────────────────────────

export function CreditCardPayoffCalculator() {
  const [balance, setBalance] = useState("6500");
  const [apr, setApr] = useState("22.99");
  const [monthlyPaymentAmt, setMonthlyPaymentAmt] = useState("250");

  const results = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const r = parseFloat(apr) || 0;
    const pmt = parseFloat(monthlyPaymentAmt) || 0;
    const rMo = r / 100 / 12;

    const months = monthsToPayoff(b, r, pmt);
    const totalPaid = months === Infinity ? Infinity : pmt * months;
    const totalInt = months === Infinity ? Infinity : totalPaid - b;

    // Minimum payment scenario (2% of balance or $25, whichever is greater)
    const minPmt = Math.max(25, b * 0.02);
    const minMonths = monthsToPayoff(b, r, minPmt);
    const minTotalPaid = minMonths === Infinity ? Infinity : minPmt * minMonths;
    const minTotalInt = minMonths === Infinity ? Infinity : minTotalPaid - b;

    const interestSaved = minTotalInt === Infinity ? 0 : minTotalInt - totalInt;
    const monthsSaved = minMonths === Infinity ? 0 : minMonths - months;

    return { months, totalPaid, totalInt, minMonths, minTotalInt, interestSaved, monthsSaved, minPmt };
  }, [balance, apr, monthlyPaymentAmt]);

  const tooLow = results.months === Infinity;

  return (
    <CalcPage
      title="Credit Card Payoff Calculator"
      description="See exactly how long it will take to pay off your credit card balance and how much interest you'll pay at your chosen monthly payment."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Card Details">
          <div className="space-y-4">
            <InputField label="Current Balance" value={balance} onChange={setBalance} prefix="$" step={100} />
            <InputField label="Annual Interest Rate (APR)" value={apr} onChange={setApr} suffix="%" step={0.1} />
            <InputField label="Monthly Payment" value={monthlyPaymentAmt} onChange={setMonthlyPaymentAmt} prefix="$" step={25} hint={tooLow ? "⚠️ Payment too low to pay off balance — increase your payment" : undefined} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          {!tooLow ? (
            <>
              <div className="bg-[var(--navy-950)] rounded-xl p-5 text-center text-white">
                <p className="text-sm text-white/60 mb-1">Debt-Free In</p>
                <p className="text-5xl font-bold tabular-nums">{results.months}</p>
                <p className="text-sm text-white/60 mt-1">months ({(results.months / 12).toFixed(1)} years)</p>
              </div>
              <CalcCard title="Your Payoff Plan">
                <ResultRow label="Monthly Payment" value={fmt$(parseFloat(monthlyPaymentAmt) || 0)} />
                <ResultRow label="Total Interest Paid" value={fmt$(results.totalInt)} />
                <ResultRow label="Total Amount Paid" value={fmt$(results.totalPaid)} highlight />
              </CalcCard>
              <CalcCard title="vs. Minimum Payments">
                <ResultRow label="Min. Payment" value={fmt$(results.minPmt)} sublabel="~2% of balance" />
                <ResultRow label="Min. Payment Payoff" value={`${results.minMonths} months`} />
                <ResultRow label="Interest Saved" value={fmt$(results.interestSaved)} highlight />
                <ResultRow label="Months Saved" value={`${results.monthsSaved} months`} />
              </CalcCard>
            </>
          ) : (
            <CalcCard title="Payment Too Low">
              <p className="text-muted-foreground text-sm">Your monthly payment of {fmt$(parseFloat(monthlyPaymentAmt) || 0)} doesn't cover the monthly interest charge. Increase your payment to start paying down the balance.</p>
              <ResultRow label="Monthly Interest Charge" value={fmt$((parseFloat(balance) || 0) * (parseFloat(apr) || 0) / 100 / 12)} />
            </CalcCard>
          )}
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Credit Card Interest Calculator ─────────────────────────────────────────

export function CreditCardInterestCalculator() {
  const [balance, setBalance] = useState("8000");
  const [apr, setApr] = useState("21.99");

  const results = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const r = parseFloat(apr) || 0;
    const rMo = r / 100 / 12;

    // Minimum payment = 2% of balance or $25
    const minPmt = Math.max(25, b * 0.02);
    const minMonths = monthsToPayoff(b, r, minPmt);
    const minTotalPaid = minMonths === Infinity ? 0 : minPmt * minMonths;
    const minTotalInt = minMonths === Infinity ? 0 : minTotalPaid - b;

    const dailyRate = r / 100 / 365;
    const dailyInterest = b * dailyRate;
    const monthlyInterest = b * rMo;
    const annualInterest = b * (r / 100);

    return { minPmt, minMonths, minTotalPaid, minTotalInt, dailyInterest, monthlyInterest, annualInterest };
  }, [balance, apr]);

  return (
    <CalcPage
      title="Credit Card Interest Calculator"
      description="See how much interest your credit card balance is costing you daily, monthly, and annually — and what happens if you only make minimum payments."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Card Details">
          <div className="space-y-4">
            <InputField label="Current Balance" value={balance} onChange={setBalance} prefix="$" step={100} />
            <InputField label="Annual Interest Rate (APR)" value={apr} onChange={setApr} suffix="%" step={0.1} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <CalcCard title="Interest Accruing Right Now">
            <ResultRow label="Daily Interest Charge" value={fmt$(results.dailyInterest, 2)} />
            <ResultRow label="Monthly Interest Charge" value={fmt$(results.monthlyInterest, 2)} />
            <ResultRow label="Annual Interest Charge" value={fmt$(results.annualInterest, 2)} highlight />
          </CalcCard>
          <CalcCard title="If You Only Pay the Minimum">
            <ResultRow label="Minimum Payment" value={fmt$(results.minPmt)} sublabel="~2% of balance" />
            <ResultRow label="Time to Pay Off" value={`${results.minMonths} months (${(results.minMonths / 12).toFixed(1)} yrs)`} />
            <ResultRow label="Total Interest Paid" value={fmt$(results.minTotalInt)} highlight />
            <ResultRow label="Total Amount Paid" value={fmt$(results.minTotalPaid)} />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Credit Card Refinance Calculator ────────────────────────────────────────

export function CreditCardRefiCalculator() {
  const [balance, setBalance] = useState("12000");
  const [cardApr, setCardApr] = useState("22.99");
  const [loanRate, setLoanRate] = useState("11.5");
  const [term, setTerm] = useState("36");

  const TERM_OPTIONS = [
    { value: "24", label: "24 months" },
    { value: "36", label: "36 months" },
    { value: "48", label: "48 months" },
    { value: "60", label: "60 months" },
  ];

  const results = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const cardR = parseFloat(cardApr) || 0;
    const loanR = parseFloat(loanRate) || 0;
    const months = parseInt(term) || 36;

    const cardPayment = monthlyPayment(b, cardR, months);
    const cardTotalInt = totalInterest(b, cardR, months);
    const loanPayment = monthlyPayment(b, loanR, months);
    const loanTotalInt = totalInterest(b, loanR, months);
    const monthlySavings = cardPayment - loanPayment;
    const lifetimeSavings = cardTotalInt - loanTotalInt;

    return { cardPayment, cardTotalInt, loanPayment, loanTotalInt, monthlySavings, lifetimeSavings };
  }, [balance, cardApr, loanRate, term]);

  return (
    <CalcPage
      title="Credit Card Refinance Calculator"
      description="See how much you could save by refinancing high-interest credit card debt into a lower-rate personal loan."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Your Situation">
          <div className="space-y-4">
            <InputField label="Total Credit Card Balance" value={balance} onChange={setBalance} prefix="$" step={500} />
            <InputField label="Credit Card APR" value={cardApr} onChange={setCardApr} suffix="%" step={0.1} />
            <InputField label="Personal Loan Rate" value={loanRate} onChange={setLoanRate} suffix="%" step={0.1} hint="Personal loan rates typically range from 6–36% depending on credit" />
            <SelectField label="Repayment Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner
            label="Monthly Savings with Personal Loan"
            amount={fmt$(Math.abs(results.monthlySavings))}
            positive={results.monthlySavings > 0}
          />
          <CalcCard title="Payment Comparison">
            <ResultRow label="Credit Card Payment" value={fmt$(results.cardPayment)} />
            <ResultRow label="Personal Loan Payment" value={fmt$(results.loanPayment)} />
            <ResultRow label="Monthly Savings" value={fmt$(results.monthlySavings)} highlight />
          </CalcCard>
          <CalcCard title="Total Interest Comparison">
            <ResultRow label="Credit Card Total Interest" value={fmt$(results.cardTotalInt)} />
            <ResultRow label="Personal Loan Total Interest" value={fmt$(results.loanTotalInt)} />
            <ResultRow label="Interest Savings" value={fmt$(results.lifetimeSavings)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}

// ─── Balance Transfer Calculator ─────────────────────────────────────────────

export function BalanceTransferCalculator() {
  const [balance, setBalance] = useState("7500");
  const [currentApr, setCurrentApr] = useState("21.99");
  const [transferFee, setTransferFee] = useState("3");
  const [promoPeriod, setPromoPeriod] = useState("15");
  const [monthlyPaymentAmt, setMonthlyPaymentAmt] = useState("500");

  const PROMO_OPTIONS = [6, 9, 12, 15, 18, 21].map((m) => ({ value: String(m), label: `${m} months` }));

  const results = useMemo(() => {
    const b = parseFloat(balance) || 0;
    const r = parseFloat(currentApr) || 0;
    const fee = (parseFloat(transferFee) || 0) / 100;
    const promoMonths = parseInt(promoPeriod) || 15;
    const pmt = parseFloat(monthlyPaymentAmt) || 0;

    const feeAmt = b * fee;
    const transferBalance = b + feeAmt;

    // Keep on current card
    const keepMonths = monthsToPayoff(b, r, pmt);
    const keepTotalInt = keepMonths === Infinity ? 0 : pmt * keepMonths - b;

    // Transfer: 0% for promo period, then standard rate kicks in
    const balanceAfterPromo = Math.max(0, transferBalance - pmt * promoMonths);
    const remainingMonths = balanceAfterPromo > 0 ? monthsToPayoff(balanceAfterPromo, r, pmt) : 0;
    const transferTotalPaid = pmt * promoMonths + (remainingMonths === Infinity ? 0 : pmt * remainingMonths);
    const transferTotalInt = Math.max(0, transferTotalPaid - b);
    const totalTransferCost = transferTotalInt + feeAmt;
    const savings = keepTotalInt - totalTransferCost;

    return { feeAmt, transferBalance, keepMonths, keepTotalInt, balanceAfterPromo, remainingMonths, transferTotalInt, totalTransferCost, savings };
  }, [balance, currentApr, transferFee, promoPeriod, monthlyPaymentAmt]);

  return (
    <CalcPage
      title="Balance Transfer Calculator"
      description="Compare keeping your balance on your current card vs. transferring to a 0% APR promotional offer to see your true savings."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalcCard title="Your Details">
          <div className="space-y-4">
            <InputField label="Current Balance" value={balance} onChange={setBalance} prefix="$" step={100} />
            <InputField label="Current Card APR" value={currentApr} onChange={setCurrentApr} suffix="%" step={0.1} />
            <InputField label="Balance Transfer Fee" value={transferFee} onChange={setTransferFee} suffix="%" step={0.5} hint={`Fee amount: ${fmt$(results.feeAmt)}`} />
            <SelectField label="0% Promo Period" value={promoPeriod} onChange={setPromoPeriod} options={PROMO_OPTIONS} />
            <InputField label="Monthly Payment" value={monthlyPaymentAmt} onChange={setMonthlyPaymentAmt} prefix="$" step={25} />
          </div>
        </CalcCard>
        <div className="space-y-4">
          <SavingsBanner
            label={results.savings > 0 ? "Savings with Balance Transfer" : "Extra Cost with Balance Transfer"}
            amount={fmt$(Math.abs(results.savings))}
            positive={results.savings > 0}
          />
          <CalcCard title="Keep Current Card">
            <ResultRow label="Payoff Time" value={results.keepMonths === Infinity ? "Never" : `${results.keepMonths} months`} />
            <ResultRow label="Total Interest" value={fmt$(results.keepTotalInt)} highlight />
          </CalcCard>
          <CalcCard title="Balance Transfer">
            <ResultRow label="Transfer Fee" value={fmt$(results.feeAmt)} />
            <ResultRow label="Balance After Promo" value={fmt$(results.balanceAfterPromo)} sublabel={`Remaining after ${promoPeriod} months of payments`} />
            <ResultRow label="Total Interest (post-promo)" value={fmt$(results.transferTotalInt)} />
            <ResultRow label="Total Cost (interest + fee)" value={fmt$(results.totalTransferCost)} highlight />
          </CalcCard>
        </div>
      </div>
    </CalcPage>
  );
}
