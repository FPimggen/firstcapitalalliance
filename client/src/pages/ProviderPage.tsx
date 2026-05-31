import { useParams, Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import OfferTable from "@/components/OfferTable";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Globe, Calendar, MapPin, Star } from "lucide-react";

export default function ProviderPage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.providers.bySlug.useQuery({ slug: params.slug ?? "" });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-10 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-semibold">Provider Not Found</h1>
          <Link href="/providers" className="btn-primary mt-6 inline-block">Browse Providers</Link>
        </div>
      </PublicLayout>
    );
  }

  const { provider, offers } = data;
  const rating = provider.overallRating ? parseFloat(provider.overallRating) : null;

  const jsonLd = buildBreadcrumbSchema([
    { name: "Home", url: "https://firstcapitalalliance.com" },
    { name: "Providers", url: "https://firstcapitalalliance.com/providers" },
    { name: provider.name, url: `https://firstcapitalalliance.com/providers/${provider.slug}` },
  ]);

  return (
    <PublicLayout>
      <SEOMeta
        title={`${provider.name} Review — Products & Rates`}
        description={provider.editorialSummary ?? provider.description ?? `Review all financial products from ${provider.name}. Compare rates, fees, and eligibility.`}
        canonical={`https://firstcapitalalliance.com/providers/${provider.slug}`}
        jsonLd={jsonLd}
      />

      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[{ label: "Providers", href: "/providers" }, { label: provider.name }]} />
          <div className="flex items-start gap-5 mt-5">
            <div className="w-16 h-16 rounded-xl bg-[var(--navy-100)] flex items-center justify-center text-xl font-bold text-[var(--navy-700)] uppercase shrink-0">
              {provider.name.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-semibold text-foreground mb-2">{provider.name}</h1>
              {rating && (
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-muted-foreground/30"}`} />)}
                  <span className="text-sm font-semibold ml-1">{rating.toFixed(1)} / 5.0</span>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                {provider.headquarters && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{provider.headquarters}</span>}
                {provider.foundedYear && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Est. {provider.foundedYear}</span>}
                {provider.websiteUrl && <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent hover:underline"><Globe className="w-3.5 h-3.5" />Website</a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        {provider.editorialSummary && (
          <div className="card-premium p-6 mb-8 max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground mb-3">Editorial Summary</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{provider.editorialSummary}</p>
          </div>
        )}

        <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
          All {provider.name} Products ({offers.length})
        </h2>

        {offers.length > 0 ? (
          <OfferTable offers={offers} showCategory />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No active products found for this provider.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
