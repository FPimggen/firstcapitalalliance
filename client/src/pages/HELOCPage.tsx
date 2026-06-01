import { useState, useMemo } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema, buildFAQSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import OfferTable from "@/components/OfferTable";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Home, TrendingUp, DollarSign, Calculator } from "lucide-react";

const FAQS = [
  {
    q: "What is a HELOC and how does it work?",
    a: "A Home Equity Line of Credit (HELOC) is a revolving line of credit secured by your home's equity. Like a credit card, you can draw from it as needed during the draw period (typically 5–10 years), then repay the balance during the repayment period (typically 10–20 years). Interest is only charged on the amount you borrow.",
  },
  {
    q: "How much can I borrow with a HELOC?",
    a: "Most lenders allow you to borrow up to 80–90% of your home's appraised value, minus what you still owe on your mortgage. For example, if your home is worth $400,000 and you owe $250,000, you may qualify for a HELOC up to $110,000 (80% of $400K minus $250K).",
  },
  {
    q: "What credit score do I need for a HELOC?",
    a: "Most lenders require a minimum credit score of 620–680 for a HELOC, though the best rates typically go to borrowers with scores of 720 or higher. Lenders also look at your debt-to-income ratio (typically under 43%) and your loan-to-value ratio.",
  },
  {
    q: "Is HELOC interest tax deductible?",
    a: "HELOC interest may be tax deductible if the funds are used to 'buy, build, or substantially improve' the home that secures the loan. Interest used for other purposes (debt consolidation, vacations, etc.) is generally not deductible. Consult a tax professional for guidance specific to your situation.",
  },
  {
    q: "What is the difference between a HELOC and a home equity loan?",
    a: "A HELOC is a revolving line of credit with a variable interest rate — you draw funds as needed. A home equity loan provides a lump sum at a fixed interest rate. HELOCs offer more flexibility; home equity loans offer payment predictability.",
  },
];

function EquityCalculator() {
  const [homeValue, setHomeValue] = useState("400000");
  const [mortgage, setMortgage] = useState("250000");
  const [ltv, setLtv] = useState("80");

  const result = useMemo(() => {
    const hv = parseFloat(homeValue) || 0;
    const mo = parseFloat(mortgage) || 0;
    const l = parseFloat(ltv) / 100 || 0.8;
    const maxBorrow = Math.max(0, hv * l - mo);
    const equity = Math.max(0, hv - mo);
    const currentLtv = hv > 0 ? (mo / hv) * 100 : 0;
    return { maxBorrow, equity, currentLtv };
  }, [homeValue, mortgage, ltv]);

  const fmt$ = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="card-premium p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground">HELOC Estimator</h3>
      </div>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Home Value</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={homeValue}
              onChange={(e) => setHomeValue(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Remaining Mortgage Balance</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              value={mortgage}
              onChange={(e) => setMortgage(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Max LTV Allowed ({ltv}%)</label>
          <input
            type="range"
            min={60}
            max={95}
            step={5}
            value={ltv}
            onChange={(e) => setLtv(e.target.value)}
            className="w-full accent-[var(--teal-500)]"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>60%</span><span>80%</span><span>95%</span>
          </div>
        </div>
      </div>
      <div className="bg-[var(--teal-50)] border border-[var(--teal-200)] rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Home Equity</span>
          <span className="font-semibold text-foreground">{fmt$(result.equity)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Current LTV</span>
          <span className="font-semibold text-foreground">{result.currentLtv.toFixed(1)}%</span>
        </div>
        <div className="border-t border-[var(--teal-200)] pt-2 flex justify-between">
          <span className="text-sm font-semibold text-foreground">Estimated HELOC Limit</span>
          <span className="text-lg font-bold text-accent">{fmt$(result.maxBorrow)}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">Estimate only. Actual limits depend on lender, credit score, income, and appraisal.</p>
    </div>
  );
}

export default function HELOCPage() {
  const { data: offers, isLoading } = trpc.offers.byCategory.useQuery({ categorySlug: "mortgages" });

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", url: "https://firstcapitalalliance.com" },
      { name: "Mortgages", url: "https://firstcapitalalliance.com/mortgages" },
      { name: "HELOC", url: "https://firstcapitalalliance.com/mortgages/heloc" },
    ]),
    buildFAQSchema(FAQS.map((f) => ({ question: f.q, answer: f.a }))),
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title="Best HELOC Rates 2026 — Home Equity Line of Credit"
        description="Compare the best HELOC rates from top lenders. Find competitive home equity lines of credit with low variable rates, flexible draw periods, and no closing costs."
        canonical="https://firstcapitalalliance.com/mortgages/heloc"
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[
            { label: "Mortgages", href: "/mortgages" },
            { label: "HELOC" },
          ]} />
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mt-4 mb-3">
            Best HELOC Rates
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            A Home Equity Line of Credit lets you tap your home's equity for renovations, debt consolidation, or major expenses — at rates far lower than personal loans or credit cards. Compare top HELOC lenders below.
          </p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>By First Capital Alliance Editorial Team</span>
            <span>•</span>
            <span>Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      </div>

      {/* Key stats bar */}
      <div className="bg-card border-b border-border">
        <div className="container py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, label: "Typical HELOC Rate", value: "Prime + 0–2%" },
              { icon: DollarSign, label: "Typical Draw Period", value: "5–10 years" },
              { icon: Home, label: "Max LTV", value: "Up to 90%" },
              { icon: Calculator, label: "Min. Credit Score", value: "620–680" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--teal-50)] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[var(--teal-600)]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="font-semibold text-sm text-foreground">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Offer table */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>Advertiser Disclosure:</strong> Some products on this page are from our advertising partners. This may influence which products we feature, but it does not affect our editorial ratings or recommendations.{" "}
                <a href="/disclosure" className="underline">Learn more</a>
              </div>
            </div>

            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">Top HELOC Lenders</h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : offers && offers.length > 0 ? (
              <OfferTable offers={offers} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-foreground mb-1">HELOC offers coming soon</h3>
                <p className="text-sm text-muted-foreground mb-4">We're adding HELOC lenders to our comparison. Check back soon.</p>
                <Link href="/mortgages" className="btn-primary">Browse Mortgage Lenders</Link>
              </div>
            )}

            {/* What is a HELOC section */}
            <div className="mt-12 prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
              <h2>What Is a HELOC?</h2>
              <p>A Home Equity Line of Credit (HELOC) is a revolving credit line secured by the equity in your home. Unlike a traditional loan, you don't receive a lump sum — instead, you have a credit limit you can draw from as needed, similar to a credit card. This makes HELOCs ideal for ongoing projects like home renovations where costs are spread over time.</p>
              <h2>How to Qualify for a HELOC</h2>
              <p>Lenders evaluate several factors when you apply for a HELOC: your credit score (typically 620 minimum, 720+ for best rates), your combined loan-to-value ratio (most lenders cap at 80–90% of your home's value), your debt-to-income ratio (typically under 43%), and your home equity (usually at least 15–20%).</p>
              <h2>HELOC vs. Home Equity Loan vs. Cash-Out Refinance</h2>
              <p>A HELOC offers a flexible revolving credit line with a variable rate — best for ongoing expenses. A home equity loan provides a fixed lump sum at a fixed rate — best for one-time large expenses. A cash-out refinance replaces your existing mortgage with a larger one and gives you the difference in cash — best when you can also lower your mortgage rate.</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <EquityCalculator />
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Related Calculators</h3>
              <ul className="space-y-2">
                {[
                  ["Mortgage Calculator", "/tools/mortgage-calculator"],
                  ["Home Affordability", "/tools/home-affordability-calculator"],
                  ["Rent vs. Buy", "/tools/rent-vs-buy-calculator"],
                  ["DTI Calculator", "/tools/dti-calculator"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-xs text-accent hover:underline">{label} →</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-2">Our Methodology</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We evaluate HELOC lenders on rates, fees, draw period flexibility, repayment terms, and customer experience. Ratings are independent of advertiser relationships.
              </p>
              <Link href="/methodology" className="text-xs text-accent hover:underline mt-3 block">Read our methodology →</Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14 max-w-3xl">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="card-premium p-5">
                <h3 className="font-semibold text-sm text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
