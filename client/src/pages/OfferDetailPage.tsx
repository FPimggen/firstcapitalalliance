import { useParams, Link } from "wouter";
import { useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema, buildFinancialProductSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ExternalLink, Star, Clock, AlertTriangle, ArrowLeft } from "lucide-react";
import ContextualTools from "@/components/ContextualTools";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-sm font-semibold ml-1">{rating.toFixed(1)} / 5.0</span>
    </div>
  );
}

// Generate a stable session ID for this browser session
function getSessionId() {
  let sid = sessionStorage.getItem("fca_sid");
  if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("fca_sid", sid); }
  return sid;
}

export default function OfferDetailPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.offers.bySlug.useQuery({ slug: params.slug ?? "" });
  const trackEvent = trpc.tracking.trackEvent.useMutation();

  // Track view once offer data is loaded
  useEffect(() => {
    if (data?.offer?.id) {
      trackEvent.mutate({ offerId: data.offer.id, eventType: "view", sessionId: getSessionId(), referrer: document.referrer.slice(0, 512) });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.offer?.id]);

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-10 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">This product may have been removed or the link may be incorrect.</p>
          <Link href="/credit-cards" className="btn-primary">Browse Products</Link>
        </div>
      </PublicLayout>
    );
  }

  const { offer, provider, category } = data;
  const rating = offer.overallRating ? parseFloat(offer.overallRating) : null;
  const lastVerified = offer.lastVerifiedAt ? new Date(offer.lastVerifiedAt) : null;

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", url: "https://firstcapitalalliance.com" },
      { name: category?.name ?? "Products", url: `https://firstcapitalalliance.com/${category?.slug ?? "products"}` },
      { name: offer.productName, url: `https://firstcapitalalliance.com/offers/${offer.slug}` },
    ]),
    buildFinancialProductSchema({
      name: offer.productName,
      description: offer.editorialSummary ?? offer.tagline ?? undefined,
      url: `https://firstcapitalalliance.com/offers/${offer.slug}`,
      provider: provider?.name ?? "Unknown",
    }),
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title={`${offer.productName} Review — ${provider?.name ?? ""}`}
        description={offer.editorialSummary ?? offer.tagline ?? `Review and details for ${offer.productName} by ${provider?.name}.`}
        canonical={`https://firstcapitalalliance.com/offers/${offer.slug}`}
        jsonLd={jsonLd}
      />

      {/* Header */}
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[
            { label: category?.name ?? "Products", href: `/${category?.slug ?? "products"}` },
            { label: offer.productName },
          ]} />
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 mt-5">
            {(offer as any).imageUrl ? (
              <img
                src={(offer as any).imageUrl}
                alt={offer.productName}
                className="w-24 h-16 object-contain shrink-0"
              />
            ) : provider?.logoUrl ? (
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="w-16 h-16 rounded-xl object-contain bg-muted border border-border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[var(--navy-100)] flex items-center justify-center text-xl font-bold text-[var(--navy-700)] uppercase shrink-0">
                {provider?.name.slice(0, 2) ?? "??"}
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl lg:text-3xl font-serif font-semibold text-foreground">{offer.productName}</h1>
                {offer.isFeatured && <Badge className="bg-[var(--teal-100)] text-[var(--teal-600)] border-0">Top Pick</Badge>}
              </div>
              <div className="text-muted-foreground text-sm mb-2">by {provider?.name}</div>
              {rating && <StarRating rating={rating} />}
              {lastVerified && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  Last verified {lastVerified.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </div>
              )}
            </div>
            {offer.trackingUrl && (
              <a
                href={offer.trackingUrl}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="btn-cta px-6 py-3 shrink-0 inline-flex items-center gap-2"
                onClick={() => trackEvent.mutate({ offerId: offer.id, eventType: "click", sessionId: getSessionId() })}
              >
                Apply Now <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div className="container pt-6">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <strong>Advertiser Disclosure:</strong> This product may be from an advertising partner. Our editorial rating is independent of any commercial relationship.{" "}
          <a href="/disclosure" className="underline">Learn more</a>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Key stats */}
            <div className="card-premium p-6">
              <h2 className="text-lg font-semibold text-foreground mb-5">Key Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {offer.aprMin && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">APR Range</div>
                    <div className="font-semibold text-foreground">{offer.aprMin}%{offer.aprMax && offer.aprMax !== offer.aprMin ? `–${offer.aprMax}%` : ""}</div>
                  </div>
                )}
                {offer.annualFee !== null && offer.annualFee !== undefined && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual Fee</div>
                    <div className={`font-semibold ${parseFloat(offer.annualFee) === 0 ? "text-emerald-600" : "text-foreground"}`}>
                      {parseFloat(offer.annualFee) === 0 ? "$0" : `$${parseFloat(offer.annualFee).toFixed(0)}/year`}
                    </div>
                  </div>
                )}
                {offer.rewardsRate && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rewards Rate</div>
                    <div className="font-semibold text-foreground">{offer.rewardsRate}</div>
                  </div>
                )}
                {offer.minCreditScore && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Min. Credit Score</div>
                    <div className="font-semibold text-foreground">{offer.minCreditScore}+</div>
                  </div>
                )}
                {offer.termMin && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Loan Term</div>
                    <div className="font-semibold text-foreground">{offer.termMin}–{offer.termMax ?? offer.termMin} months</div>
                  </div>
                )}
                {offer.minLoanAmount && (
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Loan Amount</div>
                    <div className="font-semibold text-foreground">${Number(offer.minLoanAmount).toLocaleString()}–${Number(offer.maxLoanAmount ?? offer.minLoanAmount).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Bonus details */}
            {offer.bonusDetails && (
              <div className="card-premium p-6 border-[var(--teal-400)] bg-[var(--teal-50)]">
                <h2 className="text-lg font-semibold text-foreground mb-2">Welcome Offer</h2>
                <p className="text-sm text-foreground leading-relaxed">{offer.bonusDetails}</p>
              </div>
            )}

            {/* Editorial summary */}
            {offer.editorialSummary && (
              <div className="card-premium p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Editorial Summary</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{offer.editorialSummary}</p>
              </div>
            )}

            {/* Pros & Cons */}
            {((offer.pros && offer.pros.length > 0) || (offer.cons && offer.cons.length > 0)) && (
              <div className="card-premium p-6">
                <h2 className="text-lg font-semibold text-foreground mb-5">Pros & Cons</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {offer.pros && offer.pros.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Pros
                      </h3>
                      <ul className="space-y-2">
                        {offer.pros.map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {offer.cons && offer.cons.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Cons
                      </h3>
                      <ul className="space-y-2">
                        {offer.cons.map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                            <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fee structure */}
            {offer.feeStructure && (
              <div className="card-premium p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Fee Structure</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{offer.feeStructure}</p>
              </div>
            )}

            {/* Contextual calculator tools */}
            {category?.slug && (
              <ContextualTools
                categorySlug={category.slug}
                cardType={(offer as any).cardType ?? null}
                offer={{
                  aprMin: offer.aprMin,
                  aprMax: offer.aprMax,
                  annualFee: offer.annualFee,
                  rewardsRate: offer.rewardsRate,
                }}
              />
            )}

            <Link href={`/${category?.slug ?? "products"}`} className="inline-flex items-center gap-2 text-sm text-accent hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to {category?.name ?? "Products"}
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* CTA card */}
            <div className="card-premium p-6 text-center">
              {(offer as any).imageUrl ? (
                <img
                  src={(offer as any).imageUrl}
                  alt={offer.productName}
                  className="w-32 h-20 object-contain mx-auto mb-3"
                />
              ) : provider?.logoUrl ? (
                <img
                  src={provider.logoUrl}
                  alt={provider.name}
                  className="w-14 h-14 rounded-xl object-contain bg-muted border border-border mx-auto mb-3"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[var(--navy-100)] flex items-center justify-center text-xl font-bold text-[var(--navy-700)] uppercase mx-auto mb-3">
                  {provider?.name.slice(0, 2) ?? "??"}
                </div>
              )}
              <div className="font-semibold text-foreground mb-1">{offer.productName}</div>
              <div className="text-xs text-muted-foreground mb-4">by {provider?.name}</div>
              {rating && <StarRating rating={rating} />}
              {offer.trackingUrl && (
                <a
                  href={offer.trackingUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener noreferrer"
                  className="btn-cta w-full justify-center mt-4 inline-flex items-center gap-2"
                  onClick={() => trackEvent.mutate({ offerId: offer.id, eventType: "click", sessionId: getSessionId() })}
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {lastVerified && (
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Verified {lastVerified.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Rates shown are subject to change. Verify current terms with the provider before applying.
              </p>
            </div>

            {/* Provider info */}
            {provider && (
              <div className="card-premium p-5">
                <h3 className="font-semibold text-sm text-foreground mb-3">About {provider.name}</h3>
                {provider.description && <p className="text-xs text-muted-foreground leading-relaxed mb-3">{provider.description}</p>}
                <a href={`/providers/${provider.slug}`} className="text-xs text-accent hover:underline">
                  View all {provider.name} products →
                </a>
              </div>
            )}

            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-2">Affiliate Disclaimer</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We may earn a commission if you apply through our links. This does not affect our editorial rating.{" "}
                <a href="/disclosure" className="underline hover:text-foreground">Learn more</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
