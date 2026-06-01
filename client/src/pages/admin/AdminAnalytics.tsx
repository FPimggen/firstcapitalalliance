import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BarChart3, Eye, MousePointerClick, TrendingUp, ExternalLink } from "lucide-react";

export default function AdminAnalytics() {
  const { data: stats, isLoading } = trpc.tracking.getStats.useQuery();

  const totalViews = (stats as any[] | undefined)?.reduce((sum, r) => sum + (r.views ?? 0), 0) ?? 0;
  const totalClicks = (stats as any[] | undefined)?.reduce((sum, r) => sum + (r.clicks ?? 0), 0) ?? 0;
  const overallCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Offer Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Views and clicks tracked across all offer pages and listing tables.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-premium p-5">
          <div className="w-10 h-10 rounded-lg bg-[var(--navy-100)] text-[var(--navy-700)] flex items-center justify-center mb-3">
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalViews.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Offer Views</div>
        </div>
        <div className="card-premium p-5">
          <div className="w-10 h-10 rounded-lg bg-[var(--teal-100)] text-[var(--teal-600)] flex items-center justify-center mb-3">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Total Apply Clicks</div>
        </div>
        <div className="card-premium p-5">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-foreground">{overallCtr}{overallCtr !== "—" ? "%" : ""}</div>
          <div className="text-sm text-muted-foreground mt-0.5">Overall CTR</div>
        </div>
      </div>

      {/* Full table */}
      <div className="card-premium p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-accent" /> All Offers
        </h2>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)}
          </div>
        ) : !stats || (stats as any[]).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tracking data yet.</p>
            <p className="text-xs mt-1">Views and clicks will appear here as visitors browse offer pages.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-muted-foreground font-medium text-xs">Offer</th>
                  <th className="text-left py-3 text-muted-foreground font-medium text-xs">Category</th>
                  <th className="text-right py-3 text-muted-foreground font-medium text-xs">
                    <Eye className="w-3 h-3 inline mr-1" />Views
                  </th>
                  <th className="text-right py-3 text-muted-foreground font-medium text-xs">
                    <MousePointerClick className="w-3 h-3 inline mr-1" />Clicks
                  </th>
                  <th className="text-right py-3 text-muted-foreground font-medium text-xs">CTR</th>
                  <th className="text-right py-3 text-muted-foreground font-medium text-xs">Last Event</th>
                  <th className="py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(stats as any[]).map((row: any) => {
                  const ctr = row.views > 0 ? ((row.clicks / row.views) * 100).toFixed(1) : "—";
                  const ctrNum = parseFloat(ctr);
                  return (
                    <tr key={row.offerId} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3">
                        <div className="font-medium text-foreground text-sm">{row.productName}</div>
                        <div className="text-xs text-muted-foreground">{row.providerName}</div>
                      </td>
                      <td className="py-3">
                        <Badge className="text-xs border-0 bg-muted text-muted-foreground capitalize">
                          {row.categorySlug?.replace(/-/g, " ") ?? "—"}
                        </Badge>
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">{(row.views ?? 0).toLocaleString()}</td>
                      <td className="py-3 text-right font-medium text-foreground">{(row.clicks ?? 0).toLocaleString()}</td>
                      <td className="py-3 text-right">
                        <span className={`font-semibold text-sm ${ctrNum > 10 ? "text-emerald-600" : ctrNum > 5 ? "text-amber-600" : "text-muted-foreground"}`}>
                          {ctr}{ctr !== "—" ? "%" : ""}
                        </span>
                      </td>
                      <td className="py-3 text-right text-xs text-muted-foreground">
                        {row.lastEventAt ? new Date(row.lastEventAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/offers/${row.slug}`} className="text-accent hover:underline text-xs inline-flex items-center gap-1">
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
