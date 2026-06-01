import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Shield } from "lucide-react";

const LOGO_HORIZONTAL_WHITE = "/manus-storage/logo-horizontal-white_7e0d1f33.png";
const LOGO_HORIZONTAL_BLACK = "/manus-storage/logo-horizontal-black_bf04384f.png";

const NAV_LINKS = [
  {
    label: "Credit Cards",
    href: "/credit-cards",
    children: [
      { label: "All Credit Cards", href: "/credit-cards" },
      { label: "Cash Back Cards", href: "/credit-cards/cash-back" },
      { label: "Travel Cards", href: "/credit-cards/travel" },
      { label: "Balance Transfer", href: "/credit-cards/balance-transfer" },
      { label: "Credit Builder", href: "/credit-cards/credit-builder" },
    ],
  },
  {
    label: "Loans",
    href: "/personal-loans",
    children: [
      { label: "Personal Loans", href: "/personal-loans" },
      { label: "Auto Loans", href: "/auto-loans" },
      { label: "Mortgages", href: "/mortgages" },
      { label: "HELOC", href: "/mortgages/heloc" },
      { label: "Refinance", href: "/mortgages/refinance" },
    ],
  },
  {
    label: "Banking",
    href: "/savings-accounts",
    children: [
      { label: "Savings Accounts", href: "/savings-accounts" },
      { label: "Checking Accounts", href: "/checking-accounts" },
      { label: "CDs", href: "/cds" },
    ],
  },
  {
    label: "Tools",
    href: "/tools",
    children: [
      { label: "All Calculators", href: "/tools" },
      { label: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
      { label: "Auto Loan Calculator", href: "/tools/auto-loan-calculator" },
      { label: "Balance Transfer Calc", href: "/tools/balance-transfer-calculator" },
      { label: "Savings Goal Calc", href: "/tools/savings-goal-calculator" },
      { label: "CD Calculator", href: "/tools/cd-calculator" },
      { label: "DTI Calculator", href: "/tools/dti-calculator" },
    ],
  },
  {
    label: "Credit Score",
    href: "/credit-score",
    children: [
      { label: "Credit Score Guide", href: "/credit-score" },
      { label: "Cards by Score", href: "/credit-score/cards-by-score" },
      { label: "Auto Loans by Score", href: "/credit-score/auto-loans-by-score" },
      { label: "Mortgages by Score", href: "/credit-score/mortgages-by-score" },
      { label: "Personal Loans by Score", href: "/credit-score/personal-loans-by-score" },
    ],
  },
  {
    label: "Resources",
    href: "/learn",
    children: [
      { label: "Articles & Guides", href: "/learn" },
      { label: "Financial Glossary", href: "/glossary" },
      { label: "Compare Credit Cards", href: "/compare/credit-cards" },
      { label: "All Providers", href: "/providers" },
      { label: "About Us", href: "/about" },
    ],
  },
];

function DropdownMenu({ items, onMouseEnter, onMouseLeave }: { items: { label: string; href: string }[]; onMouseEnter: () => void; onMouseLeave: () => void }) {
  return (
    <div className="absolute top-full left-0 pt-2 w-52 z-50" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="bg-card border border-border rounded-xl shadow-lg py-1.5">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-accent transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function DisclosureBanner() {
  return (
    <div className="w-full bg-[var(--navy-50)] border-b border-border">
      <div className="container py-2">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          <strong className="text-foreground">Advertiser Disclosure:</strong> First Capital Alliance is an independent, advertising-supported comparison service. We may receive compensation from financial institutions when you click on links or apply for products featured on this site.{" "}
          <Link href="/disclosure" className="underline underline-offset-2 hover:text-accent transition-colors">
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}

export function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [location] = useLocation();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = (href: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveDropdown(href);
  };

  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setActiveDropdown(null), 120);
  };

  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--navy-950)] backdrop-blur-sm border-b border-[var(--navy-800)]">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src={LOGO_HORIZONTAL_WHITE}
              alt="First Capital Alliance"
              className="h-9 w-auto object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => link.children && openDropdown(link.href)}
                onMouseLeave={() => link.children && scheduleClose()}
              >
                <Link
                  href={link.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.startsWith(link.href) && link.href !== "/"
                      ? "text-[var(--teal-300)] bg-white/10"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-white/90">{link.label}</span>
                  {link.children && <ChevronDown className="w-3.5 h-3.5 text-white/60" />}
                </Link>
                {link.children && activeDropdown === link.href && (
                  <DropdownMenu
                    items={link.children}
                    onMouseEnter={cancelClose}
                    onMouseLeave={scheduleClose}
                  />
                )}
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/compare/credit-cards"
              className="btn-cta text-sm px-4 py-2"
            >
              Compare Cards
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card">
          <div className="container py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted hover:text-accent transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
                {link.children && (
                  <div className="ml-4 mt-1 space-y-1">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-accent hover:bg-muted transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-border">
              <Link
                href="/compare/credit-cards"
                className="btn-cta w-full justify-center"
                onClick={() => setMobileOpen(false)}
              >
                Compare Cards
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[var(--navy-950)] text-[oklch(80%_0.02_250)]">
      {/* Main footer */}
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-5">
              <Link href="/">
                <img
                  src={LOGO_HORIZONTAL_WHITE}
                  alt="First Capital Alliance"
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>
            <p className="text-sm leading-relaxed text-[oklch(65%_0.02_250)] max-w-xs">
              An independent financial comparison platform helping consumers make informed decisions about credit cards, loans, mortgages, and banking products.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="trust-badge bg-[var(--navy-800)] text-[oklch(70%_0.02_250)]">
                <Shield className="w-3 h-3" /> Editorial Independence
              </span>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Products</h4>
            <ul className="space-y-2.5">
              {[
                ["Credit Cards", "/credit-cards"],
                ["Personal Loans", "/personal-loans"],
                ["Auto Loans", "/auto-loans"],
                ["Mortgages", "/mortgages"],
                ["HELOC", "/mortgages/heloc"],
                ["Savings Accounts", "/savings-accounts"],
                ["Checking Accounts", "/checking-accounts"],
                ["CDs", "/cds"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-[var(--teal-400)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Learn</h4>
            <ul className="space-y-2.5">
              {[
                ["Articles & Guides", "/learn"],
                ["Providers", "/providers"],
                ["Calculators", "/tools"],
                ["Compare Products", "/compare/credit-cards"],
                ["Credit Score Guide", "/credit-score"],
                ["Financial Glossary", "/glossary"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-[var(--teal-400)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {[
                ["About Us", "/about"],
                ["How We Make Money", "/how-we-make-money"],
                ["Editorial Policy", "/editorial-policy"],
                ["Advertiser Disclosure", "/disclosure"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Use", "/terms"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-[var(--teal-400)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Compliance bar */}
      <div className="border-t border-[var(--navy-800)]">
        <div className="container py-6">
          <p className="text-xs text-[oklch(50%_0.02_250)] leading-relaxed max-w-4xl">
            <strong className="text-[oklch(60%_0.02_250)]">Affiliate Disclaimer:</strong> Some links on this site are affiliate links. We may earn a commission if you apply for or purchase a product through these links, at no additional cost to you. This compensation may impact how and where products appear on this site. First Capital Alliance does not include all financial companies or all available financial offers.
          </p>
          <p className="text-xs text-[oklch(40%_0.02_250)] mt-3">
            © {new Date().getFullYear()} First Capital Alliance. All rights reserved. For informational purposes only — not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}

interface PublicLayoutProps {
  children: React.ReactNode;
  showDisclosure?: boolean;
}

export default function PublicLayout({ children, showDisclosure = true }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showDisclosure && <DisclosureBanner />}
      <PublicNav />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
