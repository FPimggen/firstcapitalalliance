import { ReactNode } from "react";
import { Link } from "wouter";
import PublicLayout from "./PublicLayout";
import SEOMeta from "./SEOMeta";

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmt$(n: number, decimals = 0) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number, decimals = 2) {
  return `${n.toFixed(decimals)}%`;
}

export function fmtNum(n: number, decimals = 0) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ─── Finance math helpers ─────────────────────────────────────────────────────

/** Monthly payment for an amortizing loan */
export function monthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (annualRate === 0) return principal / termMonths;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, termMonths)) / (Math.pow(1 + r, termMonths) - 1);
}

/** Total interest paid over life of loan */
export function totalInterest(principal: number, annualRate: number, termMonths: number): number {
  return monthlyPayment(principal, annualRate, termMonths) * termMonths - principal;
}

/** Future value of a lump sum */
export function futureValue(principal: number, annualRate: number, years: number, compoundsPerYear = 12): number {
  const r = annualRate / 100 / compoundsPerYear;
  const n = compoundsPerYear * years;
  return principal * Math.pow(1 + r, n);
}

/** Future value of recurring contributions */
export function futureValueContributions(monthly: number, annualRate: number, years: number): number {
  if (annualRate === 0) return monthly * years * 12;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
}

/** Months to pay off a balance with fixed payment */
export function monthsToPayoff(balance: number, annualRate: number, monthlyPaymentAmt: number): number {
  if (annualRate === 0) return balance / monthlyPaymentAmt;
  const r = annualRate / 100 / 12;
  if (monthlyPaymentAmt <= balance * r) return Infinity;
  return Math.ceil(-Math.log(1 - (balance * r) / monthlyPaymentAmt) / Math.log(1 + r));
}

/** Minimum payment to pay off in N months */
export function paymentForTerm(balance: number, annualRate: number, months: number): number {
  return monthlyPayment(balance, annualRate, months);
}

// ─── Layout wrappers ──────────────────────────────────────────────────────────

interface CalcPageProps {
  title: string;
  description: string;
  category?: string;
  children: ReactNode;
}

export function CalcPage({ title, description, category = "Tools", children }: CalcPageProps) {
  return (
    <PublicLayout>
      <SEOMeta
        title={title}
        description={description}
        keywords={`${title.toLowerCase()}, financial calculator, ${category.toLowerCase()}`}
      />
      <div className="bg-[var(--navy-950)] text-white py-10">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-white/50 mb-3">
            <Link href="/tools" className="hover:text-white/80 transition-colors">Calculators</Link>
            <span>/</span>
            <span className="text-white/80">{title}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold mb-2">{title}</h1>
          <p className="text-white/70 max-w-2xl">{description}</p>
        </div>
      </div>
      <div className="container py-10">
        {children}
      </div>
    </PublicLayout>
  );
}

interface CalcCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function CalcCard({ title, children, className = "" }: CalcCardProps) {
  return (
    <div className={`bg-card border border-border rounded-2xl p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-5 text-foreground">{title}</h2>}
      {children}
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: string;
  highlight?: boolean;
  sublabel?: string;
}

export function ResultRow({ label, value, highlight = false, sublabel }: ResultRowProps) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-border last:border-0 ${highlight ? "font-semibold" : ""}`}>
      <div>
        <span className={highlight ? "text-foreground text-base" : "text-muted-foreground text-sm"}>{label}</span>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <span className={highlight ? "text-accent text-xl tabular-nums" : "text-foreground tabular-nums"}>{value}</span>
    </div>
  );
}

interface SavingsBannerProps {
  label: string;
  amount: string;
  positive?: boolean;
}

export function SavingsBanner({ label, amount, positive = true }: SavingsBannerProps) {
  return (
    <div className={`rounded-xl p-5 text-center ${positive ? "bg-[var(--teal-50)] border border-[var(--teal-200)]" : "bg-red-50 border border-red-200"}`}>
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${positive ? "text-[var(--teal-700)]" : "text-red-600"}`}>{amount}</p>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}

export function InputField({ label, value, onChange, type = "number", prefix, suffix, min, max, step, hint }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-muted-foreground text-sm select-none">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-border rounded-lg bg-background text-foreground text-sm py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/40 transition ${prefix ? "pl-7" : "pl-3"} ${suffix ? "pr-10" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 text-muted-foreground text-sm select-none">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}

export function SelectField({ label, value, onChange, options, hint }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg bg-background text-foreground text-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/40 transition"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Divider() {
  return <hr className="border-border my-1" />;
}
