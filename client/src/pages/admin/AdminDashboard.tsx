import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  CreditCard, DollarSign, FileText, Building2, AlertTriangle,
  TrendingUp, Clock, CheckCircle2, Activity, ArrowRight, Sparkles,
  RefreshCw, Database, XCircle
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
  const syncMutation = trpc.admin.syncSheets.useMutation();
  const { data: syncLogs, refetch: refetchSyncLogs } = trpc.admin.syncLogs.useQuery({ limit: 5 });
  const utils = trpc.useUtils();

  const handleFlagStale = async () => {
    await flagMutation.mutateAsync();
    utils.admin.dashboard.invalidate();
  };

  const handleSyncNow = async () => {
    try {
      const result = await syncMutation.mutateAsync({ triggeredBy: "manual" });
      toast.success(`Sync complete — ${result.providersUpserted} providers, ${result.offersUpserted} offers updated.`);
      utils.admin.dashboard.invalidate();
      refetchSyncLogs();
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    }
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

      {/* Google Sheets Sync */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Database className="w-4 h-4 text-accent" /> Google Sheets Sync
          </h2>
          <Button
            size="sm"
            onClick={handleSyncNow}
            disabled={syncMutation.isPending}
            className="bg-[var(--navy-800)] hover:bg-[var(--navy-900)] text-white text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Sync Now"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Pulls the latest providers and offers from your Google Sheet and upserts them into the database. Safe to run at any time — existing records are updated, new ones are added.
        </p>
        {syncMutation.data && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
            Last sync: {syncMutation.data.providersUpserted} providers, {syncMutation.data.offersUpserted} offers updated.
            {syncMutation.data.errors.length > 0 && (
              <span className="text-amber-700 ml-2">({syncMutation.data.errors.length} warnings)</span>
            )}
          </div>
        )}
        {syncLogs && syncLogs.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-2">Recent Sync History</div>
            {(syncLogs as any[]).map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  {log.status === "success" ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : log.status === "error" ? (
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-spin" />
                  )}
                  <div>
                    <span className="text-xs text-foreground">
                      {log.status === "success"
                        ? `${log.providersUpserted} providers, ${log.offersUpserted} offers`
                        : log.status === "error"
                        ? (log.errorMessage ?? "Error").slice(0, 60)
                        : "Running..."}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">· {log.triggeredBy}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(log.startedAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No sync history yet. Run your first sync above.</p>
        )}
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
