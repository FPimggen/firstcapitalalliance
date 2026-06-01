import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import { Home, Car, CreditCard, PiggyBank, Calculator, TrendingDown, BarChart2, ArrowRightLeft, DollarSign, Percent, Scale, Target, RefreshCw, Banknote, Wallet, TrendingUp } from "lucide-react";

const CALC_GROUPS = [
  {
    group: "Mortgage & Home",
    icon: Home,
    color: "bg-blue-50 text-blue-700",
    items: [
      { href: "/tools/mortgage-calculator", label: "Mortgage Payment Calculator", desc: "Estimate your monthly mortgage payment including principal and interest." },
      { href: "/tools/mortgage-refi-calculator", label: "Mortgage Refinance Calculator", desc: "Compare your current mortgage to a new one and find your break-even point." },
      { href: "/tools/home-affordability-calculator", label: "Home Affordability Calculator", desc: "Find out how much home you can afford based on income and debts." },
      { href: "/tools/rent-vs-buy-calculator", label: "Rent vs. Buy Calculator", desc: "See the true cost of renting vs. buying over any time horizon." },
    ],
  },
  {
    group: "Auto Loans",
    icon: Car,
    color: "bg-purple-50 text-purple-700",
    items: [
      { href: "/tools/auto-loan-calculator", label: "Auto Loan Calculator", desc: "Calculate your monthly car payment, total interest, and total cost." },
      { href: "/tools/auto-refi-calculator", label: "Auto Refinance Calculator", desc: "Compare your current auto loan to a new rate and see your savings." },
    ],
  },
  {
    group: "Credit Cards",
    icon: CreditCard,
    color: "bg-rose-50 text-rose-700",
    items: [
      { href: "/tools/credit-card-payoff-calculator", label: "Credit Card Payoff Calculator", desc: "See how long it takes to pay off your balance and how much interest you'll pay." },
      { href: "/tools/credit-card-interest-calculator", label: "Credit Card Interest Calculator", desc: "Calculate how much interest you'll pay making only minimum payments." },
      { href: "/tools/credit-card-refi-calculator", label: "Credit Card Refinance Calculator", desc: "See how much you could save by refinancing high-interest card debt to a personal loan." },
      { href: "/tools/balance-transfer-calculator", label: "Balance Transfer Calculator", desc: "Compare keeping your balance vs. transferring to a 0% APR card." },
    ],
  },
  {
    group: "Personal Loans & Debt",
    icon: Banknote,
    color: "bg-amber-50 text-amber-700",
    items: [
      { href: "/tools/personal-loan-calculator", label: "Personal Loan Calculator", desc: "Calculate monthly payments and total interest for any personal loan." },
      { href: "/tools/loan-comparison-calculator", label: "Loan Comparison Calculator", desc: "Compare two loan offers side by side to find the better deal." },
      { href: "/tools/debt-consolidation-calculator", label: "Debt Consolidation Calculator", desc: "See how much you could save by consolidating multiple debts into one loan." },
      { href: "/tools/debt-payoff-calculator", label: "Debt Payoff Calculator", desc: "Compare the avalanche vs. snowball payoff methods and find your debt-free date." },
    ],
  },
  {
    group: "Savings & Investing",
    icon: PiggyBank,
    color: "bg-teal-50 text-teal-700",
    items: [
      { href: "/tools/savings-goal-calculator", label: "Savings Goal Calculator", desc: "Find out how much to save each month to reach your goal on time." },
      { href: "/tools/savings-comparison-calculator", label: "High-Yield vs. Regular Savings", desc: "See how much more you earn with a high-yield savings account over time." },
      { href: "/tools/cd-calculator", label: "CD Calculator", desc: "Calculate your final balance and interest earned at CD maturity." },
    ],
  },
  {
    group: "General Tools",
    icon: Calculator,
    color: "bg-slate-50 text-slate-700",
    items: [
      { href: "/tools/apr-apy-converter", label: "APR vs. APY Converter", desc: "Convert between APR and APY for apples-to-apples rate comparisons." },
      { href: "/tools/dti-calculator", label: "Debt-to-Income (DTI) Calculator", desc: "Calculate your DTI ratio and see how lenders view your finances." },
    ],
  },
];

export default function ToolsHub() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Financial Calculators"
        description="Free financial calculators for mortgages, auto loans, credit cards, savings, and debt. Get real numbers to make smarter money decisions."
        keywords="financial calculators, mortgage calculator, auto loan calculator, credit card payoff, savings calculator, debt consolidation"
      />

      {/* Hero */}
      <div className="bg-[var(--navy-950)] text-white py-12">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">Calculators</span>
          </div>
          <h1 className="text-4xl font-serif font-bold mb-3">Financial Calculators</h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Free, easy-to-use calculators to help you understand your mortgage, auto loan, credit card debt, savings, and more — all in one place.
          </p>
        </div>
      </div>

      <div className="container py-12 space-y-12">
        {CALC_GROUPS.map(({ group, icon: Icon, color, items }) => (
          <section key={group}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-foreground">{group}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(({ href, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="group block bg-card border border-border rounded-xl p-5 hover:border-accent hover:shadow-md transition-all duration-200"
                >
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-2 leading-snug">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  <span className="inline-block mt-3 text-xs font-medium text-accent">Open calculator →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PublicLayout>
  );
}
