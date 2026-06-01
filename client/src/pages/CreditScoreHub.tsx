import { Link, useParams } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { ChevronRight, TrendingUp, AlertCircle, CheckCircle, Info, CreditCard, Home, Car, Briefcase } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SCORE_RANGES = [
  { label: "Exceptional", range: "800–850", color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50", description: "You qualify for the best rates on virtually every product. Lenders compete for your business.", width: "100%" },
  { label: "Very Good", range: "740–799", color: "bg-teal-500", textColor: "text-teal-700", bg: "bg-teal-50", description: "You'll qualify for excellent rates and terms. Only the very best offers may be slightly out of reach.", width: "87%" },
  { label: "Good", range: "670–739", color: "bg-blue-500", textColor: "text-blue-700", bg: "bg-blue-50", description: "Near or above the average U.S. consumer score. Most lenders will approve you with competitive rates.", width: "74%" },
  { label: "Fair", range: "580–669", color: "bg-amber-500", textColor: "text-amber-700", bg: "bg-amber-50", description: "You may qualify for some products but will likely pay higher interest rates. Building your score is worth the effort.", width: "55%" },
  { label: "Poor", range: "300–579", color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50", description: "Approval is difficult and rates will be high. Focus on secured cards and credit-builder loans to improve.", width: "32%" },
];

const SCORE_FACTORS = [
  { label: "Payment History", weight: 35, icon: "✓", color: "bg-emerald-500", description: "Whether you pay your bills on time. A single missed payment can drop your score significantly. This is the single most important factor." },
  { label: "Credit Utilization", weight: 30, icon: "%", color: "bg-teal-500", description: "How much of your available credit you're using. Keep this below 30% — ideally under 10% — for the best scores." },
  { label: "Length of Credit History", weight: 15, icon: "⏱", color: "bg-blue-500", description: "How long your accounts have been open. Older accounts help your score. Avoid closing old cards unnecessarily." },
  { label: "Credit Mix", weight: 10, icon: "⊞", color: "bg-indigo-500", description: "Having a variety of account types (credit cards, installment loans, mortgage) shows lenders you can manage different kinds of debt." },
  { label: "New Credit Inquiries", weight: 10, icon: "?", color: "bg-purple-500", description: "Hard inquiries from new applications temporarily lower your score. Multiple inquiries for the same loan type within 45 days count as one." },
];

const IMPROVEMENT_TIPS = [
  { title: "Pay Every Bill On Time", impact: "High", timeframe: "1–2 months", description: "Set up autopay for at least the minimum payment on every account. Payment history is 35% of your score — one missed payment can drop it 50–100 points.", icon: CheckCircle, color: "text-emerald-600" },
  { title: "Lower Your Credit Utilization", impact: "High", timeframe: "1 month", description: "Pay down balances so you're using less than 30% of each card's limit. Paying to under 10% can add 20–50 points. Asking for a credit limit increase also helps.", icon: TrendingUp, color: "text-teal-600" },
  { title: "Don't Close Old Accounts", impact: "Medium", timeframe: "Ongoing", description: "Closing a credit card reduces your available credit and can shorten your average account age — both hurt your score. Keep old cards open even if you rarely use them.", icon: AlertCircle, color: "text-amber-600" },
  { title: "Dispute Errors on Your Report", impact: "High", timeframe: "30–60 days", description: "1 in 5 credit reports contain errors. Get your free reports at AnnualCreditReport.com and dispute anything inaccurate with the bureaus. Errors can be removed in 30 days.", icon: Info, color: "text-blue-600" },
  { title: "Become an Authorized User", impact: "Medium", timeframe: "1–2 months", description: "Ask a family member with excellent credit to add you as an authorized user on their card. Their positive history can boost your score without you needing to use the card.", icon: CheckCircle, color: "text-emerald-600" },
  { title: "Use a Secured Credit Card", impact: "Medium", timeframe: "6–12 months", description: "If you have poor or no credit, a secured card (backed by a cash deposit) is one of the fastest ways to build a positive payment history. Use it lightly and pay in full monthly.", icon: CreditCard, color: "text-indigo-600" },
  { title: "Limit Hard Inquiries", impact: "Low", timeframe: "2 years", description: "Each new credit application triggers a hard inquiry. Space out applications and only apply when you're likely to be approved. Inquiries fall off your report after 2 years.", icon: AlertCircle, color: "text-amber-600" },
  { title: "Mix Your Credit Types", impact: "Low", timeframe: "Long-term", description: "Having both revolving credit (cards) and installment loans (auto, personal) shows lenders you can manage different debt types. Don't take on debt just for this — it's a minor factor.", icon: Info, color: "text-blue-600" },
];

const PRODUCT_GUIDES = [
  { icon: CreditCard, title: "Credit Cards by Score", description: "Which cards you can realistically get approved for at every score tier — from secured cards at 580 to premium travel cards at 750+.", href: "/credit-score/cards-by-score", color: "text-teal-600", bg: "bg-teal-50" },
  { icon: Car, title: "Auto Loans by Score", description: "How your credit score affects your auto loan rate and what to expect at each tier. A 100-point difference can cost thousands over the life of a loan.", href: "/credit-score/auto-loans-by-score", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Home, title: "Mortgages by Score", description: "The minimum scores required for FHA, VA, conventional, and jumbo loans — and how improving your score before applying can save tens of thousands.", href: "/credit-score/mortgages-by-score", color: "text-indigo-600", bg: "bg-indigo-50" },
  { icon: Briefcase, title: "Personal Loans by Score", description: "How lenders use your score to set personal loan rates, and which lenders are most likely to approve you at each credit tier.", href: "/credit-score/personal-loans-by-score", color: "text-purple-600", bg: "bg-purple-50" },
];

// ─── Sub-page data ─────────────────────────────────────────────────────────────

const CARDS_BY_SCORE = [
  { tier: "Exceptional (800+)", cards: ["Chase Sapphire Reserve", "Amex Platinum", "Capital One Venture X"], apr: "16–22% APR", notes: "Best rewards, highest limits, premium perks. You'll be pre-approved for virtually everything." },
  { tier: "Very Good (740–799)", cards: ["Chase Sapphire Preferred", "Citi Double Cash", "Discover it Cash Back"], apr: "18–24% APR", notes: "Excellent rewards cards with competitive rates. Most premium cards are within reach." },
  { tier: "Good (670–739)", cards: ["Capital One Quicksilver", "Wells Fargo Active Cash", "Chase Freedom Unlimited"], apr: "20–26% APR", notes: "Good rewards cards available. Rates are competitive but not the absolute lowest." },
  { tier: "Fair (580–669)", cards: ["Capital One Platinum", "Discover it Secured", "Petal 2 Visa"], apr: "24–30% APR", notes: "Limited options. Focus on cards that report to all 3 bureaus and have no annual fee." },
  { tier: "Poor (300–579)", cards: ["Discover it Secured", "OpenSky Secured Visa", "Credit One Bank Platinum"], apr: "25–29% APR", notes: "Secured cards are your best path. Deposit $200–$500 and use the card lightly. Upgrade in 12 months." },
];

const AUTO_BY_SCORE = [
  { tier: "Exceptional (750+)", rate: "~5.5%", monthly: "$377", total: "$22,620", savings: "Baseline" },
  { tier: "Very Good (700–749)", rate: "~6.5%", monthly: "$391", total: "$23,460", savings: "$840 more" },
  { tier: "Good (650–699)", rate: "~9.0%", monthly: "$415", total: "$24,900", savings: "$2,280 more" },
  { tier: "Fair (600–649)", rate: "~13.5%", monthly: "$456", total: "$27,360", savings: "$4,740 more" },
  { tier: "Poor (Below 600)", rate: "~18%+", monthly: "$507", total: "$30,420", savings: "$7,800 more" },
];

const MORTGAGE_BY_SCORE = [
  { type: "Conventional", minScore: 620, downPayment: "3–20%", notes: "Best rates at 740+. PMI required below 20% down." },
  { type: "FHA Loan", minScore: 500, downPayment: "3.5% (580+) or 10% (500–579)", notes: "Government-backed. More flexible for lower scores. Requires mortgage insurance." },
  { type: "VA Loan", minScore: 620, downPayment: "0%", notes: "For veterans and active military. No PMI. Excellent rates regardless of score." },
  { type: "USDA Loan", minScore: 640, downPayment: "0%", notes: "For rural and suburban properties. Income limits apply." },
  { type: "Jumbo Loan", minScore: 700, downPayment: "10–20%", notes: "For loans above conforming limits ($766,550 in most areas). Stricter requirements." },
];

// ─── Hub Overview Page ─────────────────────────────────────────────────────────

export function CreditScoreHubPage() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Credit Score Guide: Ranges, Factors & How to Improve"
        description="Learn everything about credit scores — what the ranges mean, what affects your score, and proven strategies to improve it. Free guides from First Capital Alliance."
        keywords="credit score, how to improve credit score, credit score ranges, FICO score, credit score factors"
        canonical="/credit-score"
      />
      {/* Hero */}
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Credit Score Guide" }]} />
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4 font-serif">Understanding Your Credit Score</h1>
          <p className="text-lg text-white/75 max-w-2xl">
            Your credit score affects the rates you pay on every loan and credit card. Learn what it means, what drives it, and exactly how to improve it.
          </p>
        </div>
      </div>

      <div className="container py-12 space-y-16">

        {/* Score Ranges Visual */}
        <section>
          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">Credit Score Ranges</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">FICO scores range from 300 to 850. Here's what each tier means for your borrowing power.</p>
          <div className="space-y-4">
            {SCORE_RANGES.map((r) => (
              <div key={r.label} className={`rounded-xl p-5 ${r.bg} border border-border`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full text-white ${r.color}`}>{r.label}</span>
                    <span className="font-mono font-semibold text-foreground">{r.range}</span>
                  </div>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2.5 mb-3">
                  <div className={`h-2.5 rounded-full ${r.color} transition-all duration-700`} style={{ width: r.width }} />
                </div>
                <p className={`text-sm ${r.textColor}`}>{r.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Score Factors */}
        <section>
          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">What Makes Up Your Score</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">FICO scores are calculated from five factors. Understanding each one helps you know exactly where to focus.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCORE_FACTORS.map((f) => (
              <div key={f.label} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{f.label}</span>
                  <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${f.color}`}>{f.weight}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mb-3">
                  <div className={`h-1.5 rounded-full ${f.color}`} style={{ width: `${f.weight * 2.86}%` }} />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Improvement Tips */}
        <section>
          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">How to Improve Your Score</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">Proven, actionable steps ranked by impact. Focus on the high-impact items first.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {IMPROVEMENT_TIPS.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.title} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${tip.color}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-foreground">{tip.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tip.impact === "High" ? "bg-emerald-100 text-emerald-700" : tip.impact === "Medium" ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground"}`}>{tip.impact} Impact</span>
                      <span className="text-xs text-muted-foreground">{tip.timeframe}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Product Guides */}
        <section>
          <h2 className="text-2xl font-bold font-serif text-foreground mb-2">Credit Score by Product</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">See exactly what rates and products you can access at your current score.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRODUCT_GUIDES.map((g) => {
              const Icon = g.icon;
              return (
                <Link key={g.href} href={g.href} className="group bg-card border border-border rounded-xl p-5 hover:border-accent hover:shadow-md transition-all">
                  <div className={`w-10 h-10 rounded-lg ${g.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${g.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">{g.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                  <span className="text-xs text-accent font-medium mt-3 inline-flex items-center gap-1">Read guide <ChevronRight className="w-3 h-3" /></span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[var(--navy-900)] text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold font-serif mb-3">Ready to Put Your Score to Work?</h2>
          <p className="text-white/75 mb-6 max-w-xl mx-auto">Compare credit cards, loans, and mortgages matched to your credit profile — no impact to your score.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/credit-cards" className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-sm">Compare Credit Cards</Link>
            <Link href="/personal-loans" className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-colors text-sm">Compare Loans</Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}

// ─── Cards by Score Sub-page ──────────────────────────────────────────────────

export function CardsByScorePage() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Best Credit Cards by Credit Score (2026)"
        description="Find the best credit cards for your credit score. See which cards you can get approved for at every tier from poor to exceptional."
        canonical="/credit-score/cards-by-score"
      />
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Credit Score Guide", href: "/credit-score" }, { label: "Cards by Score" }]} />
          <h1 className="text-4xl font-bold mt-4 mb-4 font-serif">Best Credit Cards by Credit Score</h1>
          <p className="text-lg text-white/75 max-w-2xl">Find the right card for your current score — and see what you're working toward.</p>
        </div>
      </div>
      <div className="container py-12">
        <div className="space-y-6">
          {CARDS_BY_SCORE.map((tier) => (
            <div key={tier.tier} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border">
                <h2 className="font-bold text-foreground text-lg">{tier.tier}</h2>
                <p className="text-sm text-muted-foreground">{tier.apr}</p>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {tier.cards.map((c) => (
                    <span key={c} className="bg-accent/10 text-accent text-sm px-3 py-1 rounded-full font-medium">{c}</span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{tier.notes}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/credit-cards" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-block">Compare All Credit Cards →</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── Auto Loans by Score Sub-page ─────────────────────────────────────────────

export function AutoLoansByScorePage() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Auto Loan Rates by Credit Score (2026)"
        description="See how your credit score affects your auto loan interest rate and total cost. A better score can save you thousands on your next car."
        canonical="/credit-score/auto-loans-by-score"
      />
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Credit Score Guide", href: "/credit-score" }, { label: "Auto Loans by Score" }]} />
          <h1 className="text-4xl font-bold mt-4 mb-4 font-serif">Auto Loan Rates by Credit Score</h1>
          <p className="text-lg text-white/75 max-w-2xl">Based on a $20,000 loan over 48 months. See how much your score affects your total cost.</p>
        </div>
      </div>
      <div className="container py-12">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Credit Tier", "Typical APR", "Monthly Payment", "Total Cost", "vs. Best Rate"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUTO_BY_SCORE.map((row, i) => (
                <tr key={row.tier} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                  <td className="px-5 py-4 font-medium text-foreground">{row.tier}</td>
                  <td className="px-5 py-4 text-accent font-semibold">{row.rate}</td>
                  <td className="px-5 py-4">{row.monthly}/mo</td>
                  <td className="px-5 py-4 font-semibold">{row.total}</td>
                  <td className={`px-5 py-4 font-medium ${row.savings === "Baseline" ? "text-emerald-600" : "text-red-500"}`}>{row.savings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-3">*Estimates based on industry averages. Actual rates vary by lender, vehicle, and individual profile.</p>
        <div className="mt-10 text-center">
          <Link href="/auto-loans" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-block">Compare Auto Loans →</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── Mortgages by Score Sub-page ──────────────────────────────────────────────

export function MortgagesByScorePage() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Minimum Credit Score for a Mortgage (2026)"
        description="Learn the minimum credit score required for FHA, conventional, VA, and USDA mortgages — and how improving your score before applying can save tens of thousands."
        canonical="/credit-score/mortgages-by-score"
      />
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Credit Score Guide", href: "/credit-score" }, { label: "Mortgages by Score" }]} />
          <h1 className="text-4xl font-bold mt-4 mb-4 font-serif">Minimum Credit Score for a Mortgage</h1>
          <p className="text-lg text-white/75 max-w-2xl">Different loan types have different requirements. Here's what you need to know before you apply.</p>
        </div>
      </div>
      <div className="container py-12">
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Loan Type", "Min. Score", "Min. Down Payment", "Notes"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MORTGAGE_BY_SCORE.map((row, i) => (
                <tr key={row.type} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                  <td className="px-5 py-4 font-semibold text-foreground">{row.type}</td>
                  <td className="px-5 py-4 text-accent font-bold">{row.minScore}+</td>
                  <td className="px-5 py-4">{row.downPayment}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 text-center">
          <Link href="/mortgages" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-block">Compare Mortgage Rates →</Link>
        </div>
      </div>
    </PublicLayout>
  );
}

// ─── Personal Loans by Score Sub-page ─────────────────────────────────────────

export function PersonalLoansByScorePage() {
  return (
    <PublicLayout>
      <SEOMeta
        title="Personal Loan Rates by Credit Score (2026)"
        description="See how your credit score affects personal loan interest rates and approval odds. Find the best personal loan for your credit profile."
        canonical="/credit-score/personal-loans-by-score"
      />
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Credit Score Guide", href: "/credit-score" }, { label: "Personal Loans by Score" }]} />
          <h1 className="text-4xl font-bold mt-4 mb-4 font-serif">Personal Loan Rates by Credit Score</h1>
          <p className="text-lg text-white/75 max-w-2xl">Your credit score is the primary factor lenders use to set your personal loan rate. Here's what to expect.</p>
        </div>
      </div>
      <div className="container py-12">
        <div className="overflow-x-auto rounded-xl border border-border mb-8">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Credit Tier", "Typical APR Range", "Approval Odds", "Best Lender Types"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-foreground text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { tier: "Exceptional (750+)", apr: "6–12%", odds: "Excellent", lenders: "All banks, credit unions, online lenders" },
                { tier: "Very Good (700–749)", apr: "10–16%", odds: "Very Good", lenders: "Most banks and online lenders" },
                { tier: "Good (650–699)", apr: "14–22%", odds: "Good", lenders: "Online lenders, credit unions" },
                { tier: "Fair (600–649)", apr: "20–30%", odds: "Fair", lenders: "Specialized online lenders (Upstart, Avant)" },
                { tier: "Poor (Below 600)", apr: "30–36%+", odds: "Difficult", lenders: "Secured loans, credit-builder loans" },
              ].map((row, i) => (
                <tr key={row.tier} className={i % 2 === 0 ? "bg-card" : "bg-muted/20"}>
                  <td className="px-5 py-4 font-medium text-foreground">{row.tier}</td>
                  <td className="px-5 py-4 text-accent font-semibold">{row.apr}</td>
                  <td className="px-5 py-4">{row.odds}</td>
                  <td className="px-5 py-4 text-muted-foreground">{row.lenders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-10 text-center">
          <Link href="/personal-loans" className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-block">Compare Personal Loans →</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
