import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Globe, ArrowRight } from "lucide-react";

export default function ProvidersIndex() {
  const { data: providers, isLoading } = trpc.providers.list.useQuery();

  const jsonLd = buildBreadcrumbSchema([
    { name: "Home", url: "https://firstcapitalalliance.com" },
    { name: "Providers", url: "https://firstcapitalalliance.com/providers" },
  ]);

  return (
    <PublicLayout>
      <SEOMeta
        title="Financial Product Providers & Lenders"
        description="Browse all financial institutions, banks, and lenders reviewed by First Capital Alliance. Compare products from each provider."
        canonical="https://firstcapitalalliance.com/providers"
        jsonLd={jsonLd}
      />

      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[{ label: "Providers" }]} />
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mt-4 mb-2">Financial Providers</h1>
          <p className="text-muted-foreground">Browse all banks, lenders, and financial institutions we've reviewed.</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
        ) : providers && providers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {providers.map((provider) => (
              <Link key={provider.id} href={`/providers/${provider.slug}`}>
                <div className="card-premium p-5 cursor-pointer hover:border-accent/40 transition-all group h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--navy-100)] flex items-center justify-center text-sm font-bold text-[var(--navy-700)] uppercase shrink-0">
                      {provider.name.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground group-hover:text-accent transition-colors truncate">{provider.name}</div>
                      {provider.headquarters && <div className="text-xs text-muted-foreground">{provider.headquarters}</div>}
                    </div>
                  </div>
                  {provider.overallRating && (
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= Math.round(parseFloat(provider.overallRating!)) ? "fill-[var(--gold-500)] text-[var(--gold-500)]" : "text-muted-foreground/30"}`} />)}
                      <span className="text-xs font-semibold ml-1">{parseFloat(provider.overallRating).toFixed(1)}</span>
                    </div>
                  )}
                  {provider.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{provider.description}</p>}
                  <span className="text-xs text-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                    View products <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p>Provider profiles are being added. Check back soon.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
