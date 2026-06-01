import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { CreditCard, Car, Home, Wallet, PiggyBank, Building2, ArrowRight } from "lucide-react";

const COMPARE_CATEGORIES = [
  {
    icon: CreditCard,
    title: "Credit Cards",
    description: "Compare cash back, travel, balance transfer, and credit-builder cards side by side.",
    href: "/compare/credit-cards",
    color: "var(--teal-500)",
    bg: "var(--teal-50)",
    cta: "Compare Credit Cards",
  },
  {
    icon: Wallet,
    title: "Personal Loans",
    description: "Find the lowest APR personal loan for debt consolidation, home improvement, or any purpose.",
    href: "/personal-loans",
    color: "var(--navy-600)",
    bg: "var(--navy-50)",
    cta: "Compare Personal Loans",
  },
  {
    icon: Home,
    title: "Mortgages",
    description: "Compare mortgage lenders for home purchase, refinance, and HELOC products.",
    href: "/mortgages",
    color: "oklch(55% 0.15 160)",
    bg: "oklch(97% 0.02 160)",
    cta: "Compare Mortgages",
  },
  {
    icon: Car,
    title: "Auto Loans",
    description: "Compare auto loan rates from banks, credit unions, and online lenders for new and used vehicles.",
    href: "/auto-loans",
    color: "oklch(55% 0.18 30)",
    bg: "oklch(97% 0.02 30)",
    cta: "Compare Auto Loans",
  },
  {
    icon: PiggyBank,
    title: "Savings Accounts",
    description: "Find the highest APY savings accounts including high-yield and money market accounts.",
    href: "/savings-accounts",
    color: "oklch(55% 0.15 280)",
    bg: "oklch(97% 0.02 280)",
    cta: "Compare Savings Accounts",
  },
  {
    icon: Building2,
    title: "Checking Accounts",
    description: "Compare checking accounts with no monthly fees, high interest, and great perks.",
    href: "/checking-accounts",
    color: "oklch(50% 0.12 220)",
    bg: "oklch(97% 0.02 220)",
    cta: "Compare Checking Accounts",
  },
];

const QUICK_COMPARE_TOOLS = [
  { label: "Credit Card Side-by-Side Comparison", href: "/compare/credit-cards", badge: "Interactive" },
  { label: "Mortgage Calculator", href: "/tools/mortgage-calculator", badge: "Calculator" },
  { label: "Auto Loan Calculator", href: "/tools/auto-loan-calculator", badge: "Calculator" },
  { label: "Balance Transfer Calculator", href: "/tools/balance-transfer-calculator", badge: "Calculator" },
  { label: "Savings Goal Calculator", href: "/tools/savings-goal-calculator", badge: "Calculator" },
  { label: "CD Calculator", href: "/tools/cd-calculator", badge: "Calculator" },
  { label: "Debt Consolidation Calculator", href: "/tools/debt-consolidation-calculator", badge: "Calculator" },
  { label: "DTI Calculator", href: "/tools/dti-calculator", badge: "Calculator" },
];

export default function CompareHub() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Compare Financial Products — First Capital Alliance"
        description="Compare credit cards, personal loans, mortgages, auto loans, savings accounts, and checking accounts side by side. Expert-reviewed with transparent rates and fees."
        canonical="https://firstcapitalalliance.com/compare"
      />

      {/* Hero */}
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-10">
          <Breadcrumb items={[{ label: "Compare Products" }]} />
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mt-4 mb-3">
            Compare Financial Products
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Find the best financial products for your situation. We've reviewed hundreds of offers across every major category so you can compare rates, fees, and features side by side.
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Category grid */}
        <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Browse by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {COMPARE_CATEGORIES.map(({ icon: Icon, title, description, href, color, bg, cta }) => (
            <Link
              key={href}
              href={href}
              className="card-premium p-6 hover:shadow-md transition-shadow group block"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                {cta} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* Quick tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-5">Comparison Tools & Calculators</h2>
            <div className="space-y-2">
              {QUICK_COMPARE_TOOLS.map(({ label, href, badge }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-accent/40 hover:bg-[var(--teal-50)] transition-all group"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--navy-100)] text-[var(--navy-600)] font-medium">{badge}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="card-premium p-6">
              <h3 className="font-semibold text-foreground mb-3">How to Compare Financial Products</h3>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">1. Know your credit score.</strong> Your credit score determines which products you qualify for and what rates you'll receive. Check your score for free before applying.</p>
                <p><strong className="text-foreground">2. Compare APR, not just interest rate.</strong> APR includes fees and gives a more complete picture of the true cost of borrowing.</p>
                <p><strong className="text-foreground">3. Read the fine print.</strong> Look for annual fees, origination fees, prepayment penalties, and other charges that affect the total cost.</p>
                <p><strong className="text-foreground">4. Pre-qualify when possible.</strong> Many lenders offer soft-pull pre-qualification that won't affect your credit score.</p>
              </div>
            </div>
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-2">Our Editorial Independence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our editorial team evaluates products independently of our advertising relationships. Ratings are based on features, rates, fees, and consumer value — not compensation.
              </p>
              <Link href="/editorial-policy" className="text-xs text-accent hover:underline mt-2 block">Read our editorial policy →</Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
