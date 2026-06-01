import { useState } from "react";
import { Link } from "wouter";
import { Calculator, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { CalcCard, InputField, SelectField, ResultRow, fmt$, fmtPct, monthlyPayment, totalInterest, futureValue } from "@/components/CalcShared";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContextualToolsProps {
  categorySlug: string;
  cardType?: string | null;
  offer?: {
    aprMin?: string | null;
    aprMax?: string | null;
    annualFee?: string | null;
    rewardsRate?: string | null;
  };
}

// ─── Inline Balance Transfer Calculator ──────────────────────────────────────

function InlineBalanceTransferCalc({ defaultApr }: { defaultApr?: string }) {
  const [balance, setBalance] = useState("5000");
  const [currentApr, setCurrentApr] = useState(defaultApr ?? "22.99");
  const [transferFee, setTransferFee] = useState("3");
  const [promoPeriod, setPromoPeriod] = useState("15");
  const [monthlyPayment_, setMonthlyPayment] = useState("300");

  const results = (() => {
    const b = parseFloat(balance) || 0;
    const apr = parseFloat(currentApr) || 0;
    const fee = parseFloat(transferFee) || 0;
    const promo = parseInt(promoPeriod) || 12;
    const pmt = parseFloat(monthlyPayment_) || 0;

    const feeAmt = b * fee / 100;
    const totalTransferCost = feeAmt;

    // Interest on current card over promo period
    const rMo = apr / 100 / 12;
    let currentBalance = b;
    let currentInterest = 0;
    for (let i = 0; i < promo; i++) {
      currentInterest += currentBalance * rMo;
      currentBalance = Math.max(0, currentBalance + currentBalance * rMo - pmt);
    }

    const savings = currentInterest - feeAmt;

    return { feeAmt, currentInterest, savings, totalTransferCost };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Balance to Transfer" value={balance} onChange={setBalance} prefix="$" step={500} />
          <InputField label="Current Card APR" value={currentApr} onChange={setCurrentApr} suffix="%" step={0.25} />
          <InputField label="Transfer Fee" value={transferFee} onChange={setTransferFee} suffix="%" step={0.5} hint="Typically 3–5%" />
          <InputField label="0% Promo Period" value={promoPeriod} onChange={setPromoPeriod} suffix="months" step={3} />
          <InputField label="Monthly Payment" value={monthlyPayment_} onChange={setMonthlyPayment} prefix="$" step={50} />
        </div>
        <div className="space-y-3">
          <div className={`rounded-xl p-4 text-center ${results.savings > 0 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Estimated Savings</p>
            <p className={`text-3xl font-bold tabular-nums ${results.savings > 0 ? "text-emerald-600" : "text-amber-600"}`}>{fmt$(Math.abs(results.savings))}</p>
            <p className="text-xs mt-1 text-muted-foreground">{results.savings > 0 ? "saved vs. keeping current card" : "transfer fee exceeds interest saved"}</p>
          </div>
          <CalcCard title="Breakdown">
            <ResultRow label="Interest on current card" value={fmt$(results.currentInterest)} sublabel={`Over ${promoPeriod} months`} />
            <ResultRow label="Transfer fee" value={`-${fmt$(results.feeAmt)}`} />
            <ResultRow label="Net savings" value={fmt$(results.savings)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/balance-transfer-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline Rewards Calculator ────────────────────────────────────────────────

function InlineRewardsCalc({ defaultRate }: { defaultRate?: string }) {
  const [groceries, setGroceries] = useState("600");
  const [dining, setDining] = useState("300");
  const [gas, setGas] = useState("150");
  const [other, setOther] = useState("500");
  const [rate, setRate] = useState(defaultRate ?? "1.5");
  const [annualFee, setAnnualFee] = useState("0");

  const results = (() => {
    const total = (parseFloat(groceries) + parseFloat(dining) + parseFloat(gas) + parseFloat(other)) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const fee = parseFloat(annualFee) || 0;
    const monthly = total * r;
    const annual = monthly * 12;
    const net = annual - fee;
    return { monthly, annual, net, total };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Monthly Groceries" value={groceries} onChange={setGroceries} prefix="$" step={50} />
          <InputField label="Monthly Dining" value={dining} onChange={setDining} prefix="$" step={25} />
          <InputField label="Monthly Gas" value={gas} onChange={setGas} prefix="$" step={25} />
          <InputField label="All Other Monthly Spend" value={other} onChange={setOther} prefix="$" step={50} />
          <InputField label="Cash Back Rate" value={rate} onChange={setRate} suffix="%" step={0.25} hint="Check card terms for category rates" />
          <InputField label="Annual Fee" value={annualFee} onChange={setAnnualFee} prefix="$" step={5} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Net Annual Cash Back</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-600">{fmt$(results.net)}</p>
            <p className="text-xs mt-1 text-muted-foreground">after annual fee</p>
          </div>
          <CalcCard title="Breakdown">
            <ResultRow label="Monthly cash back" value={fmt$(results.monthly)} />
            <ResultRow label="Annual cash back" value={fmt$(results.annual)} />
            <ResultRow label="Annual fee" value={`-${fmt$(parseFloat(annualFee) || 0)}`} />
            <ResultRow label="Net annual value" value={fmt$(results.net)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/rewards-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full rewards calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline Mortgage Calculator ───────────────────────────────────────────────

function InlineMortgageCalc({ defaultRate }: { defaultRate?: string }) {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPct, setDownPct] = useState("10");
  const [rate, setRate] = useState(defaultRate ?? "7.25");
  const TERM_OPTIONS = [{ value: "360", label: "30 years" }, { value: "180", label: "15 years" }];
  const [term, setTerm] = useState("360");

  const results = (() => {
    const price = parseFloat(homePrice) || 0;
    const down = (parseFloat(downPct) || 0) / 100;
    const principal = price * (1 - down);
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 360;
    const pi = monthlyPayment(principal, r, months);
    const totalInt = totalInterest(principal, r, months);
    const downPctNum = parseFloat(downPct) || 0;
    const pmiAmt = downPctNum < 20 ? (principal * 0.0085) / 12 : 0;
    return { pi, totalInt, principal, pmiAmt, total: pi + pmiAmt, downAmt: price * down };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" step={10000} />
          <InputField label="Down Payment" value={downPct} onChange={setDownPct} suffix="%" step={1} hint={fmt$(results.downAmt)} />
          <InputField label="Interest Rate" value={rate} onChange={setRate} suffix="%" step={0.05} />
          <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-[var(--navy-50)] border border-[var(--navy-200)]">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Est. Monthly Payment</p>
            <p className="text-3xl font-bold tabular-nums text-[var(--navy-700)]">{fmt$(results.total)}</p>
            <p className="text-xs mt-1 text-muted-foreground">P&amp;I{results.pmiAmt > 0 ? " + PMI" : ""}</p>
          </div>
          <CalcCard title="Breakdown">
            <ResultRow label="Loan amount" value={fmt$(results.principal)} />
            <ResultRow label="Monthly P&I" value={fmt$(results.pi)} />
            {results.pmiAmt > 0 && <ResultRow label="PMI (est.)" value={fmt$(results.pmiAmt)} />}
            <ResultRow label="Total interest" value={fmt$(results.totalInt)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/mortgage-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full mortgage calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline Personal Loan Calculator ─────────────────────────────────────────

function InlinePersonalLoanCalc({ defaultApr }: { defaultApr?: string }) {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState(defaultApr ?? "12.5");
  const TERM_OPTIONS = [
    { value: "24", label: "2 years" }, { value: "36", label: "3 years" },
    { value: "48", label: "4 years" }, { value: "60", label: "5 years" },
    { value: "84", label: "7 years" },
  ];
  const [term, setTerm] = useState("36");

  const results = (() => {
    const p = parseFloat(amount) || 0;
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 36;
    const pi = monthlyPayment(p, r, months);
    const totalInt = totalInterest(p, r, months);
    return { pi, totalInt };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Loan Amount" value={amount} onChange={setAmount} prefix="$" step={500} />
          <InputField label="Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" step={0.25} />
          <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-[var(--navy-50)] border border-[var(--navy-200)]">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Monthly Payment</p>
            <p className="text-3xl font-bold tabular-nums text-[var(--navy-700)]">{fmt$(results.pi)}</p>
          </div>
          <CalcCard title="Loan Summary">
            <ResultRow label="Loan amount" value={fmt$(parseFloat(amount) || 0)} />
            <ResultRow label="Total interest" value={fmt$(results.totalInt)} />
            <ResultRow label="Total cost" value={fmt$((parseFloat(amount) || 0) + results.totalInt)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/personal-loan-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full loan calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline Auto Loan Calculator ──────────────────────────────────────────────

function InlineAutoLoanCalc({ defaultApr }: { defaultApr?: string }) {
  const [price, setPrice] = useState("35000");
  const [down, setDown] = useState("5000");
  const [rate, setRate] = useState(defaultApr ?? "7.5");
  const TERM_OPTIONS = [
    { value: "36", label: "36 months" }, { value: "48", label: "48 months" },
    { value: "60", label: "60 months" }, { value: "72", label: "72 months" },
  ];
  const [term, setTerm] = useState("60");

  const results = (() => {
    const p = (parseFloat(price) || 0) - (parseFloat(down) || 0);
    const r = parseFloat(rate) || 0;
    const months = parseInt(term) || 60;
    const pi = monthlyPayment(Math.max(0, p), r, months);
    const totalInt = totalInterest(Math.max(0, p), r, months);
    return { pi, totalInt, principal: Math.max(0, p) };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Vehicle Price" value={price} onChange={setPrice} prefix="$" step={1000} />
          <InputField label="Down Payment" value={down} onChange={setDown} prefix="$" step={500} />
          <InputField label="Interest Rate (APR)" value={rate} onChange={setRate} suffix="%" step={0.25} />
          <SelectField label="Loan Term" value={term} onChange={setTerm} options={TERM_OPTIONS} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-[var(--navy-50)] border border-[var(--navy-200)]">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Monthly Payment</p>
            <p className="text-3xl font-bold tabular-nums text-[var(--navy-700)]">{fmt$(results.pi)}</p>
          </div>
          <CalcCard title="Loan Summary">
            <ResultRow label="Amount financed" value={fmt$(results.principal)} />
            <ResultRow label="Total interest" value={fmt$(results.totalInt)} />
            <ResultRow label="Total cost" value={fmt$(results.principal + results.totalInt)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/auto-loan-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full auto loan calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline Savings Calculator ────────────────────────────────────────────────

function InlineSavingsCalc({ defaultApy }: { defaultApy?: string }) {
  const [deposit, setDeposit] = useState("5000");
  const [monthly, setMonthly] = useState("200");
  const [apy, setApy] = useState(defaultApy ?? "4.75");
  const [years, setYears] = useState("3");

  const results = (() => {
    const p = parseFloat(deposit) || 0;
    const m = parseFloat(monthly) || 0;
    const r = parseFloat(apy) || 0;
    const y = parseFloat(years) || 1;
    const rMo = r / 100 / 12;
    const months = y * 12;
    const fvPrincipal = p * Math.pow(1 + rMo, months);
    const fvContribs = m > 0 && rMo > 0 ? m * (Math.pow(1 + rMo, months) - 1) / rMo : m * months;
    const finalBalance = fvPrincipal + fvContribs;
    const totalDeposited = p + m * months;
    const interest = finalBalance - totalDeposited;
    return { finalBalance, totalDeposited, interest };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Initial Deposit" value={deposit} onChange={setDeposit} prefix="$" step={500} />
          <InputField label="Monthly Contribution" value={monthly} onChange={setMonthly} prefix="$" step={50} />
          <InputField label="APY" value={apy} onChange={setApy} suffix="%" step={0.05} />
          <InputField label="Time Horizon" value={years} onChange={setYears} suffix="years" step={1} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Balance After {years} Years</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-600">{fmt$(results.finalBalance)}</p>
          </div>
          <CalcCard title="Summary">
            <ResultRow label="Total deposited" value={fmt$(results.totalDeposited)} />
            <ResultRow label="Interest earned" value={fmt$(results.interest)} />
            <ResultRow label="Final balance" value={fmt$(results.finalBalance)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/savings-goal-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full savings calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Inline CD Calculator ─────────────────────────────────────────────────────

function InlineCDCalc({ defaultApy }: { defaultApy?: string }) {
  const [deposit, setDeposit] = useState("10000");
  const [apy, setApy] = useState(defaultApy ?? "5.0");
  const CD_TERM_OPTIONS = [
    { value: "0.25", label: "3 months" }, { value: "0.5", label: "6 months" },
    { value: "1", label: "1 year" }, { value: "2", label: "2 years" },
    { value: "3", label: "3 years" }, { value: "5", label: "5 years" },
  ];
  const [term, setTerm] = useState("1");

  const results = (() => {
    const p = parseFloat(deposit) || 0;
    const r = parseFloat(apy) || 0;
    const y = parseFloat(term) || 1;
    const finalBalance = futureValue(p, r, y, 12);
    const interest = finalBalance - p;
    return { finalBalance, interest };
  })();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-3">
          <InputField label="Deposit Amount" value={deposit} onChange={setDeposit} prefix="$" step={500} />
          <InputField label="APY" value={apy} onChange={setApy} suffix="%" step={0.05} hint="Enter the APY from this CD offer" />
          <SelectField label="CD Term" value={term} onChange={setTerm} options={CD_TERM_OPTIONS} />
        </div>
        <div className="space-y-3">
          <div className="rounded-xl p-4 text-center bg-emerald-50 border border-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-muted-foreground">Interest at Maturity</p>
            <p className="text-3xl font-bold tabular-nums text-emerald-600">{fmt$(results.interest)}</p>
          </div>
          <CalcCard title="Summary">
            <ResultRow label="Initial deposit" value={fmt$(parseFloat(deposit) || 0)} />
            <ResultRow label="Interest earned" value={fmt$(results.interest)} />
            <ResultRow label="Final balance" value={fmt$(results.finalBalance)} highlight />
          </CalcCard>
        </div>
      </div>
      <div className="text-right">
        <Link href="/tools/cd-calculator" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
          Full CD calculator <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── Tool Config Map ──────────────────────────────────────────────────────────

function getToolsForOffer(categorySlug: string, cardType?: string | null, offer?: ContextualToolsProps["offer"]) {
  const defaultApr = offer?.aprMin ?? undefined;
  const defaultApy = offer?.aprMin ?? undefined;

  if (categorySlug === "credit-cards") {
    if (cardType === "balance-transfer") {
      return [
        {
          id: "balance-transfer",
          title: "Balance Transfer Savings Calculator",
          description: "See how much you could save by transferring your balance to this card.",
          component: <InlineBalanceTransferCalc defaultApr={defaultApr} />,
        },
        {
          id: "payoff",
          title: "Credit Card Payoff Calculator",
          description: "Find out how long it will take to pay off your balance.",
          href: "/tools/credit-card-payoff-calculator",
        },
      ];
    }
    if (cardType === "cash-back") {
      return [
        {
          id: "rewards",
          title: "Cash Back Rewards Calculator",
          description: "Estimate your annual cash back based on your monthly spending.",
          component: <InlineRewardsCalc defaultRate={offer?.rewardsRate?.match(/[\d.]+/)?.[0]} />,
        },
      ];
    }
    if (cardType === "travel") {
      return [
        {
          id: "rewards",
          title: "Travel Rewards Calculator",
          description: "Estimate the value of your travel rewards based on your spending.",
          component: <InlineRewardsCalc defaultRate={offer?.rewardsRate?.match(/[\d.]+/)?.[0]} />,
        },
      ];
    }
    // General credit cards
    return [
      {
        id: "payoff",
        title: "Credit Card Payoff Calculator",
        description: "Find out how long it will take to pay off your balance.",
        href: "/tools/credit-card-payoff-calculator",
      },
      {
        id: "interest",
        title: "Credit Card Interest Calculator",
        description: "Calculate how much interest you'll pay over time.",
        href: "/tools/credit-card-interest-calculator",
      },
    ];
  }

  if (categorySlug === "mortgages") {
    return [
      {
        id: "mortgage",
        title: "Mortgage Payment Calculator",
        description: "Estimate your monthly payment with this lender's rates.",
        component: <InlineMortgageCalc defaultRate={defaultApr} />,
      },
      {
        id: "affordability",
        title: "Home Affordability Calculator",
        description: "Find out how much home you can afford.",
        href: "/tools/home-affordability-calculator",
      },
    ];
  }

  if (categorySlug === "personal-loans") {
    return [
      {
        id: "personal-loan",
        title: "Personal Loan Calculator",
        description: "Calculate your monthly payment and total interest for this loan.",
        component: <InlinePersonalLoanCalc defaultApr={defaultApr} />,
      },
      {
        id: "debt-consolidation",
        title: "Debt Consolidation Calculator",
        description: "See if consolidating your debts with this loan makes sense.",
        href: "/tools/debt-consolidation-calculator",
      },
    ];
  }

  if (categorySlug === "auto-loans") {
    return [
      {
        id: "auto-loan",
        title: "Auto Loan Calculator",
        description: "Calculate your monthly car payment with this lender's rates.",
        component: <InlineAutoLoanCalc defaultApr={defaultApr} />,
      },
    ];
  }

  if (categorySlug === "savings-accounts") {
    return [
      {
        id: "savings",
        title: "Savings Growth Calculator",
        description: "See how your savings grow with this account's APY.",
        component: <InlineSavingsCalc defaultApy={defaultApy} />,
      },
      {
        id: "hysa-comparison",
        title: "High-Yield vs. Regular Savings",
        description: "Compare how much more you earn vs. a traditional savings account.",
        href: "/tools/savings-comparison-calculator",
      },
    ];
  }

  if (categorySlug === "checking-accounts") {
    return [
      {
        id: "savings",
        title: "Savings Goal Calculator",
        description: "Plan how long it will take to reach your savings goal.",
        href: "/tools/savings-goal-calculator",
      },
    ];
  }

  if (categorySlug === "cds") {
    return [
      {
        id: "cd",
        title: "CD Calculator",
        description: "Calculate exactly how much interest you'll earn at maturity.",
        component: <InlineCDCalc defaultApy={defaultApy} />,
      },
    ];
  }

  return [];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContextualTools({ categorySlug, cardType, offer }: ContextualToolsProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const tools = getToolsForOffer(categorySlug, cardType, offer);

  if (tools.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-accent" />
        <h2 className="text-lg font-serif font-semibold text-foreground">Helpful Calculators</h2>
      </div>
      {tools.map((tool) => (
        <div key={tool.id} className="card-premium overflow-hidden">
          {tool.href ? (
            // Link-only tool
            <Link href={tool.href} className="flex items-start justify-between p-5 hover:bg-muted/30 transition-colors group">
              <div>
                <p className="font-semibold text-foreground group-hover:text-accent transition-colors">{tool.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0 mt-0.5" />
            </Link>
          ) : (
            // Expandable inline calculator
            <>
              <button
                className="w-full flex items-start justify-between p-5 hover:bg-muted/30 transition-colors text-left"
                onClick={() => setExpanded(expanded === tool.id ? null : tool.id)}
              >
                <div>
                  <p className="font-semibold text-foreground">{tool.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                </div>
                {expanded === tool.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                )}
              </button>
              {expanded === tool.id && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  {tool.component}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
