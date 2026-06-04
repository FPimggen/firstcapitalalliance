import { useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema, buildFAQSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import OfferTable from "@/components/OfferTable";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { SidebarAd, InlineAd } from "@/components/AffiliateAdComponents";

const CATEGORY_META: Record<string, { title: string; description: string; hero: string; faqs: { q: string; a: string }[] }> = {
  "credit-cards": {
    title: "Best Credit Cards",
    description: "Compare the best credit cards of 2025 — cash back, travel rewards, balance transfer, and cards for building credit. Expert-reviewed with transparent rates and fees.",
    hero: "Find the best credit card for your spending habits and financial goals. We've reviewed hundreds of offers so you can compare side by side.",
    faqs: [
      { q: "What credit score do I need for a rewards credit card?", a: "Most rewards credit cards require a good to excellent credit score (670+). Some premium travel cards require 740 or higher. Cards for building credit are available for scores as low as 580." },
      { q: "Is an annual fee worth it?", a: "An annual fee can be worth it if the rewards and benefits you earn exceed the fee. For example, a card with a $95 annual fee that earns $300 in cash back provides $205 in net value." },
      { q: "How do balance transfer cards work?", a: "Balance transfer cards let you move high-interest debt to a new card with a lower or 0% introductory APR. This can save significant interest, but watch for balance transfer fees (typically 3–5%)." },
    ],
  },
  "personal-loans": {
    title: "Best Personal Loans",
    description: "Compare personal loan rates from top lenders. Find the lowest APR for debt consolidation, home improvement, or major purchases.",
    hero: "Compare personal loan rates from leading lenders. Find competitive APRs, flexible terms, and fast funding for any purpose.",
    faqs: [
      { q: "What is a good APR for a personal loan?", a: "A good personal loan APR is below 12%. Borrowers with excellent credit (750+) may qualify for rates as low as 6–8%. Rates above 20% are generally considered high." },
      { q: "How long does it take to get a personal loan?", a: "Many online lenders fund personal loans within 1–3 business days after approval. Some offer same-day funding. Traditional banks may take 1–2 weeks." },
    ],
  },
  "auto-loans": {
    title: "Best Auto Loans",
    description: "Compare auto loan rates for new and used vehicles. Find competitive financing from banks, credit unions, and online lenders.",
    hero: "Find the best auto loan rates for your next vehicle purchase or refinance. Compare APRs, terms, and lender requirements.",
    faqs: [
      { q: "What credit score do I need for a good auto loan rate?", a: "Borrowers with scores above 720 typically qualify for the best auto loan rates. Rates increase significantly below 660. Most lenders will finance borrowers with scores as low as 580." },
    ],
  },
  "checking-accounts": {
    title: "Best Checking Accounts",
    description: "Compare the best checking accounts of 2026 — no monthly fees, high interest, cash back, and great perks. Find the right account for your banking needs.",
    hero: "Find a checking account that works for you — no hidden fees, competitive interest, and features that make everyday banking easier.",
    faqs: [
      { q: "What should I look for in a checking account?", a: "Look for no monthly maintenance fees (or easy fee waivers), a large ATM network or ATM fee reimbursements, FDIC insurance, mobile check deposit, and competitive interest if you keep a balance." },
      { q: "What is the difference between a checking and savings account?", a: "Checking accounts are designed for daily transactions — paying bills, debit card purchases, and ATM withdrawals. Savings accounts are designed to hold money you don't need immediately and typically earn higher interest." },
      { q: "Are online checking accounts safe?", a: "Yes. Online checking accounts at FDIC-insured banks are just as safe as traditional bank accounts. Your deposits are insured up to $250,000 per depositor, per institution." },
    ],
  },
  "cds": {
    title: "Best CD Rates",
    description: "Compare the best CD (Certificate of Deposit) rates from top banks and credit unions. Find competitive APYs for 3-month, 6-month, 1-year, and 5-year CDs.",
    hero: "Lock in a guaranteed return with a Certificate of Deposit. Compare CD rates from top banks and credit unions to find the best APY for your term.",
    faqs: [
      { q: "What is a CD and how does it work?", a: "A Certificate of Deposit (CD) is a savings account that holds a fixed amount of money for a fixed period of time (the term). In exchange, the bank pays a guaranteed interest rate. At the end of the term (maturity), you receive your original deposit plus the interest earned." },
      { q: "What happens if I withdraw from a CD early?", a: "Most CDs charge an early withdrawal penalty if you take money out before the maturity date. Penalties vary by bank and term length but typically range from 60 days to 12 months of interest. Some banks offer no-penalty CDs with lower rates." },
      { q: "Are CDs FDIC insured?", a: "Yes. CDs at FDIC-insured banks are insured up to $250,000 per depositor, per institution. CDs at NCUA-insured credit unions have equivalent protection." },
    ],
  },
  "mortgages": {
    title: "Best Mortgage Lenders",
    description: "Compare mortgage rates and lenders for home purchase and refinance. Find competitive rates for conventional, FHA, VA, and jumbo loans.",
    hero: "Compare mortgage rates from top lenders. Whether you're buying a home or refinancing, find the best rate for your situation.",
    faqs: [
      { q: "What is the difference between APR and interest rate on a mortgage?", a: "The interest rate is the cost of borrowing the principal. APR includes the interest rate plus fees (origination, mortgage insurance, etc.), giving a more complete picture of the total cost." },
    ],
  },
};

export default function ComparisonPage({ categorySlug: propSlug }: { categorySlug?: string } = {}) {
  const params = useParams<{ category: string }>();
  const categorySlug = propSlug ?? params.category ?? "credit-cards";

  const { data: offers, isLoading } = trpc.offers.byCategory.useQuery({ categorySlug });
  const { data: category } = trpc.categories.bySlug.useQuery({ slug: categorySlug });

  const meta = CATEGORY_META[categorySlug] ?? {
    title: `Best ${category?.name ?? "Financial Products"}`,
    description: `Compare the best ${category?.name ?? "financial products"} with expert reviews and transparent rates.`,
    hero: `Compare top ${category?.name ?? "financial products"} side by side.`,
    faqs: [],
  };

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", url: "https://firstcapitalalliance.com" },
      { name: meta.title, url: `https://firstcapitalalliance.com/${categorySlug}` },
    ]),
    ...(meta.faqs.length > 0 ? [buildFAQSchema(meta.faqs.map(f => ({ question: f.q, answer: f.a })))] : []),
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title={meta.title}
        description={meta.description}
        canonical={`https://firstcapitalalliance.com/${categorySlug}`}
        jsonLd={jsonLd}
      />

      {/* Page header */}
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[{ label: meta.title }]} />
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mt-4 mb-3">{meta.title}</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">{meta.hero}</p>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>By First Capital Alliance Editorial Team</span>
            <span>•</span>
            <span>Updated {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
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

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
              </div>
            ) : offers && offers.length > 0 ? (
              <>
                <OfferTable offers={offers} />
                <InlineAd tags={[categorySlug]} />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
                <h3 className="font-semibold text-foreground mb-1">No offers available yet</h3>
                <p className="text-sm text-muted-foreground">We're adding products to this category. Check back soon.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-5">
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Our Methodology</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We evaluate products on APR, fees, rewards value, eligibility, and customer experience. Ratings are assigned independently of advertiser relationships.
              </p>
              <a href="/methodology" className="text-xs text-accent hover:underline mt-3 block">Read our full methodology →</a>
            </div>
            <SidebarAd tags={[categorySlug]} />
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Related Guides</h3>
              <ul className="space-y-2">
                {[
                  ["How to Choose a Credit Card", "/learn/how-to-choose-credit-card"],
                  ["Understanding APR", "/learn/understanding-apr"],
                  ["Building Credit from Scratch", "/learn/building-credit"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="text-xs text-accent hover:underline">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        {meta.faqs.length > 0 && (
          <div className="mt-14 max-w-3xl">
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {meta.faqs.map(({ q, a }) => (
                <div key={q} className="card-premium p-5">
                  <h3 className="font-semibold text-sm text-foreground mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
