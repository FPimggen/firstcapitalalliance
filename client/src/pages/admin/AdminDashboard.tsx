import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  CreditCard, DollarSign, FileText, Building2, AlertTriangle,
  TrendingUp, Clock, CheckCircle2, Activity, ArrowRight, Sparkles
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color = "navy" }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color?: string;
}) {
  const colors: Record<string, string> = {
    navy: "bg-[var(--navy-100)] text-[var(--navy-700)]",
    teal: "bg-[var(--teal-100)] text-[var(--teal-600)]",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="card-premium p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color] ?? colors.navy}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery();
  const flagMutation = trpc.agent.flagStaleOffers.useMutation();
  const utils = trpc.useUtils();

  const handleFlagStale = async () => {
    await flagMutation.mutateAsync();
    utils.admin.dashboard.invalidate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const { stats, recentJobs, recentAudit } = data ?? { stats: {}, recentJobs: [], recentAudit: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your finance comparison platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={CreditCard} label="Active Offers" value={(stats as any).totalOffers ?? 0} color="navy" />
        <StatCard icon={Building2} label="Active Providers" value={(stats as any).totalProviders ?? 0} color="teal" />
        <StatCard icon={FileText} label="Published Articles" value={(stats as any).totalArticles ?? 0} color="navy" />
        <StatCard icon={TrendingUp} label="Categories" value={(stats as any).totalCategories ?? 0} color="teal" />
        <StatCard icon={AlertTriangle} label="Stale Offers" value={(stats as any).staleOffers ?? 0} sub="Not verified in 30+ days" color={(stats as any).staleOffers > 0 ? "amber" : "navy"} />
        <StatCard icon={FileText} label="Draft Articles" value={(stats as any).draftArticles ?? 0} sub="Awaiting publication" color="navy" />
      </div>

      {/* Stale offers alert */}
      {(stats as any).staleOffers > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-800 text-sm">{(stats as any).staleOffers} offer{(stats as any).staleOffers !== 1 ? "s" : ""} need verification</div>
              <div className="text-xs text-amber-700 mt-0.5">These offers haven't been verified in over 30 days. Review and update them to ensure accuracy.</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100" onClick={handleFlagStale} disabled={flagMutation.isPending}>
              {flagMutation.isPending ? "Scanning..." : "Run Audit"}
            </Button>
            <Link href="/admin/offers">
              <Button size="sm" className="text-xs bg-amber-600 hover:bg-amber-700 text-white">Review Offers</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="card-premium p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { label: "Add New Offer", href: "/admin/offers/new", icon: CreditCard },
              { label: "Add New Provider", href: "/admin/providers/new", icon: Building2 },
              { label: "Write Article Draft", href: "/admin/articles/new", icon: FileText },
              { label: "Generate AI Content", href: "/admin/ai-tools", icon: Sparkles },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="card-premium p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" /> Recent Activity
          </h2>
          {recentAudit.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <div className="space-y-2">
              {(recentAudit as any[]).slice(0, 8).map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-foreground">
                      <span className="font-medium">{log.triggeredBy ?? "System"}</span>{" "}
                      <span className="text-muted-foreground">{log.action}</span>{" "}
                      <span className="font-medium">{log.entityType}</span>
                      {log.entitySlug && <span className="text-muted-foreground"> "{log.entitySlug}"</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link href="/admin/audit-log" className="text-xs text-accent hover:underline mt-3 block">
            View full audit log →
          </Link>
        </div>
      </div>

      {/* Recent content jobs */}
      {recentJobs.length > 0 && (
        <div className="card-premium p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" /> Recent AI Jobs
          </h2>
          <div className="space-y-2">
            {(recentJobs as any[]).slice(0, 5).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-xs font-medium text-foreground">{job.jobType.replace(/_/g, " ")}</div>
                  {job.targetSlug && <div className="text-xs text-muted-foreground">{job.targetSlug}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`text-xs ${job.status === "completed" ? "bg-emerald-100 text-emerald-700" : job.status === "failed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"} border-0`}
                  >
                    {job.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
