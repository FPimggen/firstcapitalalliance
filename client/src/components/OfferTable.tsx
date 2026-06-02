import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink, Star, CheckCircle2, Clock, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface OfferRow {
  offer: {
    id: number;
    slug: string;
    productName: string;
    tagline?: string | null;
    aprMin?: string | null;
    aprMax?: string | null;
    annualFee?: string | null;
    rewardsRate?: string | null;
    bonusDetails?: string | null;
    minCreditScore?: number | null;
    overallRating?: string | null;
    isFeatured: boolean;
    trackingUrl?: string | null;
    lastVerifiedAt?: Date | null;
    pros?: string[] | null;
    cons?: string[] | null;
    editorialSummary?: string | null;
  };
  provider: {
    name: string;
    logoUrl?: string | null;
    slug: string;
  } | null;
  category: {
    name: string;
    slug: string;
  } | null;
}

type SortKey = "rating" | "aprMin" | "annualFee" | "minCreditScore";
type SortDir = "asc" | "desc";

interface OfferTableProps {
  offers: OfferRow[];
  showCategory?: boolean;
}

/** Maps a numeric credit score to the standard label used on the site */
function creditScoreLabel(score: number): string {
  if (score >= 800) return "Excellent";
  if (score >= 740) return "Very Good";
  if (score >= 670) return "Good";
  if (score >= 580) return "Fair";
  return "Any";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="text-xs font-semibold text-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function LastVerified({ date }: { date: Date | null | undefined }) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const label = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
  const isStale = diffDays > 30;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${isStale ? "text-amber-600" : "text-muted-foreground"}`}>
      <Clock className="w-3 h-3" />
      Verified {label}
    </span>
  );
}

function getSessionId() {
  let sid = sessionStorage.getItem("fca_sid");
  if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("fca_sid", sid); }
  return sid;
}

export default function OfferTable({ offers, showCategory = false }: OfferTableProps) {
  const trackEvent = trpc.tracking.trackEvent.useMutation();
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [creditFilter, setCreditFilter] = useState<string>("all");
  const [feeFilter, setFeeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir(key === "aprMin" || key === "annualFee" || key === "minCreditScore" ? "asc" : "desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-accent" /> : <ArrowDown className="w-3.5 h-3.5 text-accent" />;
  };

  const filtered = useMemo(() => {
    let rows = [...offers];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.offer.productName.toLowerCase().includes(q) || r.provider?.name.toLowerCase().includes(q));
    }
    if (creditFilter !== "all") {
      const max = parseInt(creditFilter);
      rows = rows.filter((r) => !r.offer.minCreditScore || r.offer.minCreditScore <= max);
    }
    if (feeFilter === "no-fee") rows = rows.filter((r) => !r.offer.annualFee || parseFloat(r.offer.annualFee) === 0);
    if (feeFilter === "under-100") rows = rows.filter((r) => !r.offer.annualFee || parseFloat(r.offer.annualFee) < 100);

    rows.sort((a, b) => {
      let av = 0, bv = 0;
      if (sortKey === "rating") { av = parseFloat(a.offer.overallRating ?? "0"); bv = parseFloat(b.offer.overallRating ?? "0"); }
      if (sortKey === "aprMin") { av = parseFloat(a.offer.aprMin ?? "999"); bv = parseFloat(b.offer.aprMin ?? "999"); }
      if (sortKey === "annualFee") { av = parseFloat(a.offer.annualFee ?? "0"); bv = parseFloat(b.offer.annualFee ?? "0"); }
      if (sortKey === "minCreditScore") { av = a.offer.minCreditScore ?? 0; bv = b.offer.minCreditScore ?? 0; }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    // Featured always first
    const featured = rows.filter((r) => r.offer.isFeatured);
    const rest = rows.filter((r) => !r.offer.isFeatured);
    return [...featured, ...rest];
  }, [offers, sortKey, sortDir, creditFilter, feeFilter, search]);

  const hasFilters = creditFilter !== "all" || feeFilter !== "all" || search;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search products or providers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 text-sm"
        />
        <Select value={creditFilter} onValueChange={setCreditFilter}>
          <SelectTrigger className="h-8 w-44 text-sm">
            <SelectValue placeholder="Credit score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any credit score</SelectItem>
            <SelectItem value="580">Fair (580+)</SelectItem>
            <SelectItem value="670">Good (670+)</SelectItem>
            <SelectItem value="740">Very Good (740+)</SelectItem>
            <SelectItem value="800">Excellent (800+)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={feeFilter} onValueChange={setFeeFilter}>
          <SelectTrigger className="h-8 w-40 text-sm">
            <SelectValue placeholder="Annual fee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any fee</SelectItem>
            <SelectItem value="no-fee">No annual fee</SelectItem>
            <SelectItem value="under-100">Under $100/yr</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => { setCreditFilter("all"); setFeeFilter("all"); setSearch(""); }}>
            <X className="w-3.5 h-3.5 mr-1" /> Clear filters
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--navy-50)] border-b border-border">
              <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground w-64">Product</th>
              <th className="text-left px-4 py-3.5">
                <button className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("aprMin")}>
                  APR Range <SortIcon k="aprMin" />
                </button>
              </th>
              <th className="text-left px-4 py-3.5">
                <button className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("annualFee")}>
                  Annual Fee <SortIcon k="annualFee" />
                </button>
              </th>
              <th className="text-left px-4 py-3.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Rewards</th>
              <th className="text-left px-4 py-3.5">
                <button className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("minCreditScore")}>
                  Min. Credit <SortIcon k="minCreditScore" />
                </button>
              </th>
              <th className="text-left px-4 py-3.5">
                <button className="flex items-center gap-1.5 font-semibold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors" onClick={() => handleSort("rating")}>
                  Rating <SortIcon k="rating" />
                </button>
              </th>
              <th className="px-4 py-3.5 w-32"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">No products match your filters.</td>
              </tr>
            )}
            {filtered.map(({ offer, provider }) => (
              <tr key={offer.id} className={`hover:bg-muted/30 transition-colors ${offer.isFeatured ? "bg-[var(--teal-50)]" : "bg-card"}`}>
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    {(offer as any).imageUrl ? (
                      <img
                        src={(offer as any).imageUrl}
                        alt={offer.productName}
                        className="w-16 h-10 object-contain shrink-0"
                      />
                    ) : provider?.logoUrl ? (
                      <img
                        src={provider.logoUrl}
                        alt={provider.name}
                        className="w-16 h-10 object-contain shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground uppercase">
                        {provider?.name.slice(0, 2) ?? "??"}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{offer.productName}</span>
                        {offer.isFeatured && <Badge className="bg-[var(--teal-100)] text-[var(--teal-600)] border-0 text-xs px-1.5 py-0">Top Pick</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{provider?.name}</div>
                      <LastVerified date={offer.lastVerifiedAt} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {offer.aprMin || offer.aprMax ? (
                    <span className="font-semibold text-foreground">
                      {offer.aprMin}%{offer.aprMax && offer.aprMax !== offer.aprMin ? `–${offer.aprMax}%` : ""}
                    </span>
                  ) : <span className="text-muted-foreground text-xs">See terms</span>}
                </td>
                <td className="px-4 py-4">
                  {offer.annualFee !== null && offer.annualFee !== undefined ? (
                    <span className={`font-semibold ${parseFloat(offer.annualFee) === 0 ? "text-emerald-600" : "text-foreground"}`}>
                      {parseFloat(offer.annualFee) === 0 ? "$0" : `$${parseFloat(offer.annualFee).toFixed(0)}/yr`}
                    </span>
                  ) : <span className="text-muted-foreground text-xs">See terms</span>}
                </td>
                <td className="px-4 py-4 text-sm text-muted-foreground max-w-[160px]">
                  <span className="line-clamp-2">{offer.rewardsRate ?? "—"}</span>
                </td>
                <td className="px-4 py-4">
                  {offer.minCreditScore ? (
                    <span className="text-sm font-medium">{creditScoreLabel(offer.minCreditScore)}</span>
                  ) : <span className="text-muted-foreground text-xs">Not specified</span>}
                </td>
                <td className="px-4 py-4">
                  {offer.overallRating ? <StarRating rating={parseFloat(offer.overallRating)} /> : <span className="text-muted-foreground text-xs">—</span>}
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1.5">
                    {offer.trackingUrl ? (
                      <a
                        href={offer.trackingUrl}
                        target="_blank"
                        rel="nofollow sponsored noopener noreferrer"
                        className="btn-cta text-xs px-3 py-1.5 inline-flex items-center gap-1"
                        onClick={() => trackEvent.mutate({ offerId: offer.id, eventType: "click", sessionId: getSessionId() })}
                      >
                        Apply Now <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : null}
                    <a href={`/offers/${offer.slug}`} className="text-xs text-accent hover:underline text-center">
                      View Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No products match your filters.</div>
        )}
        {filtered.map(({ offer, provider }) => (
          <div key={offer.id} className={`card-premium p-4 ${offer.isFeatured ? "border-[var(--teal-400)] bg-[var(--teal-50)]" : ""}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                {(offer as any).imageUrl ? (
                  <img
                    src={(offer as any).imageUrl}
                    alt={offer.productName}
                    className="w-16 h-10 object-contain shrink-0"
                  />
                ) : provider?.logoUrl ? (
                  <img
                    src={provider.logoUrl}
                    alt={provider.name}
                    className="w-16 h-10 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground uppercase">
                    {provider?.name.slice(0, 2) ?? "??"}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-foreground text-sm">{offer.productName}</div>
                  <div className="text-xs text-muted-foreground">{provider?.name}</div>
                </div>
              </div>
              {offer.isFeatured && <Badge className="bg-[var(--teal-100)] text-[var(--teal-600)] border-0 text-xs shrink-0">Top Pick</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div><span className="text-muted-foreground">APR: </span><span className="font-semibold">{offer.aprMin ? `${offer.aprMin}%${offer.aprMax && offer.aprMax !== offer.aprMin ? `–${offer.aprMax}%` : ""}` : "See terms"}</span></div>
              <div><span className="text-muted-foreground">Fee: </span><span className={`font-semibold ${offer.annualFee && parseFloat(offer.annualFee) === 0 ? "text-emerald-600" : ""}`}>{offer.annualFee !== null && offer.annualFee !== undefined ? (parseFloat(offer.annualFee) === 0 ? "$0" : `$${parseFloat(offer.annualFee).toFixed(0)}/yr`) : "See terms"}</span></div>
              <div><span className="text-muted-foreground">Min. Credit: </span><span className="font-semibold">{offer.minCreditScore ? creditScoreLabel(offer.minCreditScore) : "N/A"}</span></div>
              <div>{offer.overallRating && <StarRating rating={parseFloat(offer.overallRating)} />}</div>
            </div>
            <LastVerified date={offer.lastVerifiedAt} />
            <div className="flex gap-2 mt-3">
              {offer.trackingUrl && (
                <a href={offer.trackingUrl} target="_blank" rel="nofollow sponsored noopener noreferrer" className="btn-cta text-xs px-3 py-2 flex-1 justify-center inline-flex items-center gap-1"
                  onClick={() => trackEvent.mutate({ offerId: offer.id, eventType: "click", sessionId: getSessionId() })}>
                  Apply Now <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <a href={`/offers/${offer.slug}`} className="flex-1 text-center text-xs border border-border rounded-lg py-2 hover:bg-muted transition-colors text-foreground">
                View Details
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Disclosure */}
      <p className="text-xs text-muted-foreground italic">
        * Rates and fees shown are subject to change. Always verify current terms directly with the provider before applying.{" "}
        <a href="/disclosure" className="underline hover:text-foreground">Advertiser disclosure</a>
      </p>
    </div>
  );
}
