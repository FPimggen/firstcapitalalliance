import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, User } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-100 text-emerald-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  generate_summary: "bg-purple-100 text-purple-700",
  generate_article: "bg-purple-100 text-purple-700",
  mark_verified: "bg-cyan-100 text-cyan-700",
  flag_stale_offers: "bg-amber-100 text-amber-700",
};

export default function AdminAuditLog() {
  const { data: logs, isLoading } = trpc.admin.auditLog.useQuery({ limit: 100 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent" /> Audit Log
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Complete history of all admin actions on the platform.</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Entity</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(logs ?? []).length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No audit log entries yet.</td></tr>
              )}
              {(logs ?? []).map((log) => (
                <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <Badge className={`text-xs border-0 ${ACTION_COLORS[log.action] ?? "bg-muted text-muted-foreground"}`}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground capitalize">{log.entityType}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.entitySlug ?? (log.entityId ? `#${log.entityId}` : "—")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="w-3 h-3" />{log.triggeredBy ?? "System"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
