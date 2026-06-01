import { useState, useMemo } from "react";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { Check, X, Minus, ChevronDown, ExternalLink, RotateCcw, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Offer {
  id: number;
  name: string;
  providerName?: string | null;
  apr?: string | null;
  aprMin?: number | null;
  aprMax?: number | null;
  annualFee?: number | null;
  rewardsRate?: string | null;
  signupBonus?: string | null;
  creditScoreMin?: number | null;
  rating?: number | null;
  highlights?: string | null;
  prosText?: string | null;
  consText?: string | null;
  trackingUrl?: string | null;
  lastVerifiedAt?: Date | null;
}

// ─── Comparison Row Component ─────────────────────────────────────────────────

function CompareRow({ label, values, highlight }: { label: string; values: (string | null | undefined)[]; highlight?: boolean }) {
  return (
    <tr className={highlight ? "bg-accent/5" : ""}>
      <td className="px-4 py-3.5 text-sm font-medium text-muted-foreground w-40 shrink-0 border-r border-border">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3.5 text-sm text-foreground border-r border-border last:border-r-0 text-center">
          {v ?? <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
        </td>
      ))}
      {/* Fill empty slots */}
      {Array.from({ length: Math.max(0, 3 - values.length) }).map((_, i) => (
        <td key={`empty-${i}`} className="px-4 py-3.5 border-r border-border last:border-r-0" />
      ))}
    </tr>
  );
}

function BoolRow({ label, values }: { label: string; values: (boolean | null | undefined)[] }) {
  return (
    <tr>
      <td className="px-4 py-3.5 text-sm font-medium text-muted-foreground w-40 shrink-0 border-r border-border">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3.5 text-center border-r border-border last:border-r-0">
          {v === true ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : v === false ? <X className="w-4 h-4 text-red-400 mx-auto" /> : <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
        </td>
      ))}
      {Array.from({ length: Math.max(0, 3 - values.length) }).map((_, i) => (
        <td key={`empty-${i}`} className="px-4 py-3.5 border-r border-border last:border-r-0" />
      ))}
    </tr>
  );
}

// ─── Card Selector ────────────────────────────────────────────────────────────

function CardSelector({
  offers,
  selected,
  onSelect,
  onClear,
  slot,
}: {
  offers: Offer[];
  selected: Offer | null;
  onSelect: (o: Offer) => void;
  onClear: () => void;
  slot: number;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return offers;
    const q = search.toLowerCase();
    return offers.filter((o) => o.name.toLowerCase().includes(q) || (o.providerName ?? "").toLowerCase().includes(q));
  }, [offers, search]);

  if (selected) {
    return (
      <div className="bg-card border-2 border-accent/30 rounded-xl p-4 relative">
        <button onClick={onClear} className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors" title="Remove">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="pr-8">
          <p className="text-xs text-muted-foreground mb-1">{selected.providerName}</p>
          <h3 className="font-semibold text-foreground leading-snug text-sm">{selected.name}</h3>
          {selected.rating != null && (
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.round(selected.rating!) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{selected.rating?.toFixed(1)}</span>
            </div>
          )}
          {selected.annualFee != null && (
            <p className="text-xs text-muted-foreground mt-1">{selected.annualFee === 0 ? "No annual fee" : `$${selected.annualFee}/yr annual fee`}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-muted/50 border-2 border-dashed border-border rounded-xl p-4 text-left hover:border-accent/50 hover:bg-accent/5 transition-all group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Card {slot}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Click to select a card</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              placeholder="Search cards..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No cards found</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.id}
                  onClick={() => { onSelect(o); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                >
                  <p className="text-sm font-medium text-foreground">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.providerName} {o.apr ? `· ${o.apr}` : ""}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Compare Tool ────────────────────────────────────────────────────────

export default function CreditCardCompareTool() {
  const [selected, setSelected] = useState<(Offer | null)[]>([null, null, null]);

  const { data: offersData, isLoading } = trpc.offers.byCategory.useQuery({ categorySlug: "credit-cards" });
  const offers: Offer[] = ((offersData ?? []).map((item: any) => ({
    ...item.offer,
    providerName: item.provider?.name ?? null,
  }))) as Offer[];

  const selectedCards = selected.filter(Boolean) as Offer[];

  const handleSelect = (slot: number, offer: Offer) => {
    setSelected((prev) => {
      const next = [...prev];
      next[slot] = offer;
      return next;
    });
  };

  const handleClear = (slot: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[slot] = null;
      return next;
    });
  };

  const handleReset = () => setSelected([null, null, null]);

  // Parse pros/cons from stored text
  const parsePros = (o: Offer) => o.prosText?.split("\n").filter(Boolean) ?? [];
  const parseCons = (o: Offer) => o.consText?.split("\n").filter(Boolean) ?? [];

  const formatApr = (o: Offer) => {
    if (o.apr) return o.apr;
    if (o.aprMin != null && o.aprMax != null) return `${o.aprMin}% – ${o.aprMax}%`;
    if (o.aprMin != null) return `${o.aprMin}%+`;
    return null;
  };

  const formatFee = (o: Offer) => {
    if (o.annualFee == null) return null;
    return o.annualFee === 0 ? "$0 (No fee)" : `$${o.annualFee}/year`;
  };

  const formatScore = (o: Offer) => {
    if (o.creditScoreMin == null) return null;
    if (o.creditScoreMin >= 750) return `${o.creditScoreMin}+ (Excellent)`;
    if (o.creditScoreMin >= 700) return `${o.creditScoreMin}+ (Good)`;
    if (o.creditScoreMin >= 640) return `${o.creditScoreMin}+ (Fair)`;
    return `${o.creditScoreMin}+`;
  };

  return (
    <PublicLayout>
      <SEOMeta
        title="Compare Credit Cards Side by Side (2026)"
        description="Compare up to 3 credit cards side by side — APR, annual fee, rewards, sign-up bonus, and more. Find the best card for your needs."
        keywords="compare credit cards, credit card comparison, best credit cards 2026"
        canonical="/compare/credit-cards"
      />

      {/* Hero */}
      <div className="bg-[var(--navy-900)] text-white py-14">
        <div className="container">
          <Breadcrumb items={[{ label: "Compare Credit Cards" }]} />
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4 font-serif">Compare Credit Cards</h1>
          <p className="text-lg text-white/75 max-w-2xl">Select up to 3 cards to compare side by side — rates, fees, rewards, and more.</p>
        </div>
      </div>

      <div className="container py-10">

        {/* Card selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[0, 1, 2].map((slot) => (
            <CardSelector
              key={slot}
              offers={offers.filter((o) => !selected.some((s, i) => i !== slot && s?.id === o.id))}
              selected={selected[slot]}
              onSelect={(o) => handleSelect(slot, o)}
              onClear={() => handleClear(slot)}
              slot={slot + 1}
            />
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12 text-muted-foreground">Loading cards...</div>
        )}

        {!isLoading && offers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No credit card offers available yet. <Link href="/credit-cards" className="text-accent hover:underline">Browse all offers →</Link>
          </div>
        )}

        {selectedCards.length === 0 && !isLoading && offers.length > 0 && (
          <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground text-lg mb-2">Select at least one card above to start comparing</p>
            <p className="text-sm text-muted-foreground/70">You can compare up to 3 cards at once</p>
          </div>
        )}

        {selectedCards.length >= 1 && (
          <div className="space-y-8">
            {/* Actions */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Comparing <strong>{selectedCards.length}</strong> card{selectedCards.length > 1 ? "s" : ""}</p>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Comparison table */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="grid border-b border-border" style={{ gridTemplateColumns: `10rem repeat(${selectedCards.length}, 1fr)` }}>
                <div className="px-4 py-4 bg-muted/50 border-r border-border" />
                {selectedCards.map((card) => (
                  <div key={card.id} className="px-4 py-4 border-r border-border last:border-r-0 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">{card.providerName}</p>
                    <p className="font-semibold text-foreground text-sm leading-snug">{card.name}</p>
                    {card.rating != null && (
                      <div className="flex items-center justify-center gap-0.5 mt-1.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.round(card.rating!) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <table className="w-full">
                <tbody>
                  {/* Section: Key Numbers */}
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Key Numbers</td>
                  </tr>
                  <CompareRow label="APR" values={selectedCards.map(formatApr)} highlight />
                  <CompareRow label="Annual Fee" values={selectedCards.map(formatFee)} />
                  <CompareRow label="Rewards Rate" values={selectedCards.map((o) => o.rewardsRate)} highlight />
                  <CompareRow label="Sign-Up Bonus" values={selectedCards.map((o) => o.signupBonus)} />
                  <CompareRow label="Min. Credit Score" values={selectedCards.map(formatScore)} highlight />

                  {/* Section: Features */}
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Features</td>
                  </tr>
                  <BoolRow label="No Annual Fee" values={selectedCards.map((o) => o.annualFee === 0)} />
                  <BoolRow label="Has Sign-Up Bonus" values={selectedCards.map((o) => !!o.signupBonus)} />
                  <BoolRow label="Has Rewards" values={selectedCards.map((o) => !!o.rewardsRate)} />

                  {/* Section: Highlights */}
                  <tr className="bg-muted/30">
                    <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Highlights</td>
                  </tr>
                  <CompareRow label="Summary" values={selectedCards.map((o) => o.highlights)} />
                </tbody>
              </table>
            </div>

            {/* Pros / Cons */}
            {selectedCards.some((c) => parsePros(c).length > 0 || parseCons(c).length > 0) && (
              <div>
                <h2 className="text-xl font-bold font-serif mb-4">Pros &amp; Cons</h2>
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCards.length}, 1fr)` }}>
                  {selectedCards.map((card) => {
                    const pros = parsePros(card);
                    const cons = parseCons(card);
                    return (
                      <div key={card.id} className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-border bg-muted/30">
                          <p className="font-semibold text-sm text-foreground">{card.name}</p>
                        </div>
                        <div className="p-4 space-y-4">
                          {pros.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Pros</p>
                              <ul className="space-y-1.5">
                                {pros.map((p, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {cons.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Cons</p>
                              <ul className="space-y-1.5">
                                {cons.map((c, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                                    <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {pros.length === 0 && cons.length === 0 && (
                            <p className="text-sm text-muted-foreground">No detailed pros/cons available.</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CTA row */}
            <div>
              <h2 className="text-xl font-bold font-serif mb-4">Apply Now</h2>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCards.length}, 1fr)` }}>
                {selectedCards.map((card) => (
                  <div key={card.id} className="bg-card border border-border rounded-xl p-5 text-center space-y-3">
                    <p className="font-semibold text-foreground text-sm">{card.name}</p>
                    {card.trackingUrl ? (
                      <a
                        href={card.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors"
                      >
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link href={`/offers/${card.id}`} className="inline-flex items-center gap-1.5 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors">
                        View Details
                      </Link>
                    )}
                    {card.lastVerifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Verified {new Date(card.lastVerifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclosure */}
            <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border leading-relaxed">
              <strong>Advertiser Disclosure:</strong> First Capital Alliance LLC is an independent comparison service, not a bank, lender, or financial advisor. Some offers on this page may be from partners who compensate us. This compensation may affect how and where products appear on this page. Our editorial team maintains independence in all reviews and comparisons. Always verify current terms directly with the card issuer before applying.
            </div>
          </div>
        )}

        {/* Browse all link */}
        <div className="mt-10 text-center">
          <Link href="/credit-cards" className="text-accent hover:underline text-sm font-medium">Browse all credit card offers →</Link>
        </div>
      </div>
    </PublicLayout>
  );
}
