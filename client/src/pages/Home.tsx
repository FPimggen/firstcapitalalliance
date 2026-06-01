import { Link } from "wouter";
import { CreditCard, DollarSign, Home as HomeIcon, Car, ArrowRight, Shield, CheckCircle, TrendingUp, Award, Users, Star } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema } from "@/components/SEOMeta";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { slug: "credit-cards", label: "Credit Cards", icon: CreditCard, description: "Compare cash back, travel, and low-interest cards from top issuers.", color: "from-blue-600 to-blue-800", href: "/credit-cards" },
  { slug: "personal-loans", label: "Personal Loans", icon: DollarSign, description: "Find the best rates on personal and debt consolidation loans.", color: "from-emerald-600 to-emerald-800", href: "/personal-loans" },
  { slug: "mortgages", label: "Mortgages", icon: HomeIcon, description: "Shop home loans, refinance options, and HELOC products.", color: "from-purple-600 to-purple-800", href: "/mortgages" },
  { slug: "auto-loans", label: "Auto Loans", icon: Car, description: "Compare new, used, and refinance auto loan rates.", color: "from-orange-600 to-orange-800", href: "/auto-loans" },
];

const TRUST_STATS = [
  { icon: Award, value: "200+", label: "Products Reviewed" },
  { icon: Users, value: "50+", label: "Lenders Evaluated" },
  { icon: Shield, value: "100%", label: "Editorial Independence" },
  { icon: TrendingUp, value: "Daily", label: "Data Refreshed" },
];

const FAQS = [
  { q: "How does First Capital Alliance make money?", a: "We earn compensation from financial institutions when you click on links or apply for products featured on our site. This does not influence our editorial ratings or recommendations." },
  { q: "Are the rates shown accurate?", a: "We verify all offer data regularly and display a 'last verified' timestamp on every offer. Rates change frequently — always confirm current terms directly with the provider." },
  { q: "How do you rate financial products?", a: "Our editorial team evaluates products based on APR range, fees, rewards value, eligibility requirements, customer service reputation, and overall value. See our Methodology page for full details." },
];

export default function HomePage() {
  const { data: featuredOffers } = trpc.offers.featured.useQuery();
  const { data: categories } = trpc.categories.list.useQuery();

  const jsonLd = [
    buildBreadcrumbSchema([{ name: "Home", url: "https://firstcapitalalliance.com" }]),
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "First Capital Alliance",
      url: "https://firstcapitalalliance.com",
      description: "Independent financial product comparison platform for credit cards, loans, and mortgages.",
      sameAs: [],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title="Compare Credit Cards, Loans & Mortgages"
        description="Compare credit cards, personal loans, mortgages, and savings accounts. Independent expert reviews, transparent rates — First Capital Alliance."
        canonical="https://firstcapitalalliance.com"
        jsonLd={jsonLd}
        keywords="compare credit cards, personal loans, mortgage rates, auto loans, savings accounts, best credit cards, loan comparison, financial products"
      />

      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="container py-20 lg:py-28">
          <div className="max-w-3xl">
            <Badge className="bg-[var(--teal-500)]/20 text-[var(--teal-300)] border-[var(--teal-500)]/30 mb-6 text-xs font-medium px-3 py-1">
              Independent. Expert-Reviewed. Trusted.
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold leading-tight text-balance mb-6">
              Find the Right Financial Product for You
            </h1>
            <p className="text-lg text-[oklch(80%_0.03_250)] leading-relaxed mb-8 max-w-xl">
              Compare hundreds of credit cards, loans, and mortgages side by side. Real rates, honest reviews, and no hidden agendas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/credit-cards" className="btn-cta px-6 py-3 text-base">
                Compare Credit Cards
              </Link>
              <Link href="/personal-loans" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors text-base font-semibold">
                View Loan Rates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-[var(--navy-900)] text-white">
        <div className="container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--navy-800)] flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-[var(--teal-400)]" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-none">{value}</div>
                  <div className="text-xs text-[oklch(60%_0.02_250)] mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product categories */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-3">
              What Are You Looking For?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse our expert-curated comparisons across the financial products that matter most.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CATEGORIES.map(({ slug, label, icon: Icon, description, color, href }) => (
              <Link key={slug} href={href}>
                <div className="group card-premium p-6 h-full cursor-pointer hover:border-accent/40 transition-all">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5.5 h-5.5 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
                  <span className="text-sm font-medium text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                    Compare now <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured offers */}
      {featuredOffers && featuredOffers.length > 0 && (
        <section className="py-16 bg-[var(--navy-50)]">
          <div className="container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="accent-line mb-4" />
                <h2 className="text-3xl font-serif font-semibold text-foreground">Editor's Top Picks</h2>
                <p className="text-muted-foreground mt-2">Standout products our team has reviewed and rated highly.</p>
              </div>
              <Link href="/credit-cards" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredOffers.slice(0, 6).map(({ offer, provider, category }) => (
                <div key={offer.id} className="card-premium p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {(offer as any).imageUrl || provider?.logoUrl ? (
                        <img
                          src={(offer as any).imageUrl || provider?.logoUrl}
                          alt={offer.productName}
                          className="w-16 h-10 object-contain shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[var(--navy-100)] flex items-center justify-center text-xs font-bold text-[var(--navy-700)] uppercase shrink-0">
                          {provider?.name.slice(0, 2) ?? "??"}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-foreground">{offer.productName}</div>
                        <div className="text-xs text-muted-foreground">{provider?.name}</div>
                      </div>
                    </div>
                    <Badge className="bg-[var(--teal-100)] text-[var(--teal-600)] border-0 text-xs shrink-0">Top Pick</Badge>
                  </div>
                  {offer.tagline && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{offer.tagline}</p>}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {offer.aprMin && <div><span className="text-muted-foreground">APR: </span><span className="font-semibold">{offer.aprMin}%{offer.aprMax && offer.aprMax !== offer.aprMin ? `–${offer.aprMax}%` : ""}</span></div>}
                    {offer.annualFee !== null && offer.annualFee !== undefined && <div><span className="text-muted-foreground">Fee: </span><span className={`font-semibold ${parseFloat(offer.annualFee) === 0 ? "text-emerald-600" : ""}`}>{parseFloat(offer.annualFee) === 0 ? "$0" : `$${parseFloat(offer.annualFee).toFixed(0)}/yr`}</span></div>}
                    {offer.rewardsRate && <div className="col-span-2"><span className="text-muted-foreground">Rewards: </span><span className="font-semibold">{offer.rewardsRate}</span></div>}
                  </div>
                  {offer.overallRating && (
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= Math.round(parseFloat(offer.overallRating!)) ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-muted-foreground/30"}`} />)}
                      <span className="text-xs font-semibold ml-1">{parseFloat(offer.overallRating).toFixed(1)}</span>
                    </div>
                  )}
                  <div className="mt-auto flex gap-2">
                    {offer.trackingUrl && (
                      <a href={offer.trackingUrl} target="_blank" rel="nofollow sponsored noopener noreferrer" className="btn-cta text-xs px-3 py-2 flex-1 justify-center">
                        Apply Now
                      </a>
                    )}
                    <a href={`/offers/${offer.slug}`} className="flex-1 text-center text-xs border border-border rounded-lg py-2 hover:bg-muted transition-colors text-foreground">
                      Details
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <div className="accent-line mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-semibold text-foreground mb-3">How We Work</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Our editorial process is independent, transparent, and built to help you make better financial decisions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "We Research", desc: "Our team evaluates hundreds of financial products, analyzing rates, fees, rewards, and fine print so you don't have to." },
              { step: "02", title: "We Compare", desc: "Products are scored on a consistent methodology covering value, accessibility, transparency, and customer experience." },
              { step: "03", title: "You Decide", desc: "We present clear, unbiased comparisons. You choose the product that fits your needs — no pressure, no hidden agenda." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--navy-900)] text-white font-serif font-semibold text-lg flex items-center justify-center mx-auto mb-4">{step}</div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial standards */}
      <section className="py-12 bg-[var(--navy-900)] text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-8 h-8 text-[var(--teal-400)] mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-semibold mb-3">Our Editorial Commitment</h2>
            <p className="text-[oklch(75%_0.02_250)] text-sm leading-relaxed mb-6">
              First Capital Alliance maintains strict editorial independence. Advertisers do not review, approve, or influence our content. Our ratings and recommendations are based solely on our editorial team's analysis.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                ["Editorial Policy", "/editorial-policy"],
                ["How We Make Money", "/how-we-make-money"],
                ["Our Methodology", "/methodology"],
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm text-[var(--teal-400)] hover:underline">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <div className="accent-line mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-semibold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="card-premium p-5">
                <h3 className="font-semibold text-foreground mb-2 text-sm">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
