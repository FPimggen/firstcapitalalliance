import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { Shield, BookOpen, BarChart2, Users, CheckCircle, AlertCircle, Mail, FileText, Star } from "lucide-react";
import { Link } from "wouter";

const BREADCRUMBS = [{ label: "About Us" }];

const VALUES = [
  {
    icon: Shield,
    title: "Editorial Independence",
    body: "Our editorial team operates completely separately from our business and advertising teams. No advertiser has ever reviewed, approved, or influenced our ratings or recommendations — and none ever will.",
  },
  {
    icon: BookOpen,
    title: "Accuracy & Transparency",
    body: "Every offer on our platform carries a last-verified timestamp. We conduct regular audits to flag stale data, and we publish our full rating methodology so you can see exactly how we score products.",
  },
  {
    icon: BarChart2,
    title: "Rigorous Research",
    body: "Our team evaluates hundreds of financial products against a consistent, documented scoring framework covering APR, fees, rewards, eligibility, and customer experience — not advertiser relationships.",
  },
  {
    icon: Users,
    title: "Consumer-First Mission",
    body: "We exist to give everyday consumers the same quality of information that financial professionals take for granted. Clear comparisons, honest ratings, and no hidden agendas.",
  },
];

const WHAT_WE_ARE_NOT = [
  "We are not a bank, credit union, or financial institution of any kind.",
  "We do not originate, underwrite, or fund loans or credit products.",
  "We do not provide personalized financial, investment, legal, or tax advice.",
  "We are not affiliated with any of the financial institutions whose products we feature.",
  "We do not guarantee approval for any product listed on our platform.",
];

const WHAT_WE_DO = [
  "We research and compare financial products from across the market.",
  "We publish independent editorial ratings based on a documented methodology.",
  "We display advertiser disclosures and affiliate relationships prominently and honestly.",
  "We keep offer data current and flag anything that hasn't been verified recently.",
  "We write educational content to help consumers understand their options.",
];

const TEAM_PILLARS = [
  {
    role: "Editorial Research",
    description: "Our research team monitors rate changes, product updates, and new market entrants across all product categories on a continuous basis.",
  },
  {
    role: "Content & Writing",
    description: "Our writers hold themselves to a strict fact-checking standard. Every published piece cites primary sources and is reviewed for accuracy before going live.",
  },
  {
    role: "Data & Verification",
    description: "Our data team cross-references offer terms against issuer disclosures and flags discrepancies for editorial review before any update is published.",
  },
];

export default function AboutPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "First Capital Alliance LLC",
      url: "https://firstcapitalalliance.com",
      description:
        "First Capital Alliance LLC is an independent financial comparison platform helping consumers research and compare credit cards, personal loans, mortgages, and savings accounts.",
      foundingDate: "2024",
      contactPoint: {
        "@type": "ContactPoint",
        email: "editorial@firstcapitalalliance.com",
        contactType: "Editorial",
      },
      sameAs: [],
    },
    buildBreadcrumbSchema([
      { name: "Home", url: "https://firstcapitalalliance.com/" },
      { name: "About Us", url: "https://firstcapitalalliance.com/about" },
    ]),
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title="About First Capital Alliance LLC | Independent Financial Comparison"
        description="First Capital Alliance LLC is an independent financial comparison platform. We research and compare credit cards, loans, and mortgages to help consumers make informed decisions. We are not a bank, lender, or financial advisor."
        canonical="https://firstcapitalalliance.com/about"
        jsonLd={jsonLd}
      />

      {/* Page header */}
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-10">
          <Breadcrumb items={BREADCRUMBS} />
          <h1 className="text-4xl font-serif font-semibold text-foreground mt-4 mb-3">
            About First Capital Alliance
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            An independent financial comparison platform built on editorial integrity, transparent methodology, and a genuine commitment to consumer education.
          </p>
        </div>
      </div>

      {/* Who we are */}
      <section className="container py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Who We Are</p>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-5 leading-snug">
              First Capital Alliance LLC is an independent financial comparison service.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We were founded with a single purpose: to make the financial product research process more transparent, more accessible, and more trustworthy for everyday consumers.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We are not a bank, a lender, a credit union, or a financial advisor. We do not originate loans, issue credit cards, or manage deposits. We are a media and research company — we study the market, evaluate products against a documented methodology, and publish our findings so you can make better-informed decisions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              When you use First Capital Alliance, you are reading independent editorial analysis — not a pitch from a financial institution. The distinction matters, and we take it seriously.
            </p>
          </div>
          <div className="space-y-4">
            {/* What we are not */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">What We Are Not</h3>
              </div>
              <ul className="space-y-2">
                {WHAT_WE_ARE_NOT.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-destructive/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* What we do */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">What We Do</h3>
              </div>
              <ul className="space-y-2">
                {WHAT_WE_DO.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* Core values */}
      <section className="container py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">Our Principles</p>
          <h2 className="text-2xl font-serif font-semibold text-foreground">What We Stand For</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-premium p-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-2">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* Our editorial team */}
      <section className="container py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Our Team</p>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-5 leading-snug">
              Built by researchers, writers, and data professionals
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The First Capital Alliance editorial team brings together backgrounds in financial journalism, consumer advocacy, data analysis, and product research. Every person on the team shares a commitment to accuracy and a healthy skepticism toward marketing claims.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our team does not accept gifts, sponsored travel, or other compensation from the financial institutions we cover. Our only obligation is to the consumers who rely on our research.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              All editorial content is reviewed internally before publication and updated on a regular schedule. We display a "last verified" date on every offer so you always know how current the information is.
            </p>
          </div>
          <div className="space-y-4">
            {TEAM_PILLARS.map(({ role, description }) => (
              <div key={role} className="flex gap-4 p-5 rounded-xl border border-border bg-card">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Star className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">{role}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* How we make money — brief, transparent */}
      <section className="container py-14 max-w-4xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-semibold text-foreground mb-3">
                Advertiser Disclosure
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                First Capital Alliance LLC earns compensation from financial institutions when consumers click on links or apply for products featured on our site. This compensation may influence which products we feature and how they are ordered, but it does not affect our editorial ratings, scores, or recommendations.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Our editorial team operates independently of our advertising relationships. We do not accept payment to write positive reviews, and advertisers do not review or approve our content before publication.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/how-we-make-money" className="text-xs font-semibold text-accent hover:underline">
                  How We Make Money →
                </Link>
                <Link href="/editorial-policy" className="text-xs font-semibold text-accent hover:underline">
                  Editorial Policy →
                </Link>
                <Link href="/methodology" className="text-xs font-semibold text-accent hover:underline">
                  Our Methodology →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider" />

      {/* Contact */}
      <section className="container py-14 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-3">Contact</p>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-4">Get in Touch</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We welcome questions, corrections, and feedback. If you believe any information on our site is inaccurate, or if you have a question about our editorial process, please reach out to our editorial team directly.
            </p>
            <div className="space-y-3">
              <a
                href="mailto:editorial@firstcapitalalliance.com"
                className="flex items-center gap-3 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-accent" />
                </div>
                editorial@firstcapitalalliance.com
              </a>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Advertiser Disclosure", href: "/disclosure" },
                { label: "Editorial Policy", href: "/editorial-policy" },
                { label: "Rating Methodology", href: "/methodology" },
                { label: "How We Make Money", href: "/how-we-make-money" },
                { label: "Compare Credit Cards", href: "/credit-cards" },
                { label: "Compare Personal Loans", href: "/personal-loans" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-1 border-b border-border last:border-0"
                >
                  {label}
                  <span className="text-accent text-xs">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Legal footer note */}
      <div className="bg-[var(--navy-50)] border-t border-border">
        <div className="container py-6 max-w-4xl">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Legal Notice:</strong> First Capital Alliance LLC is not a licensed financial advisor, broker-dealer, investment advisor, bank, credit union, mortgage lender, or insurance company. Content published on this site is for informational and educational purposes only and does not constitute financial, investment, legal, or tax advice. Always consult a qualified financial professional before making financial decisions. Product availability, rates, and terms are subject to change; verify all information directly with the financial institution before applying.
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
