import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, CreditCard, Building2, FolderOpen, FileText,
  Activity, Sparkles, ChevronRight, LogOut, Shield, ExternalLink, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Offers", href: "/admin/offers", icon: CreditCard },
  { label: "Providers", href: "/admin/providers", icon: Building2 },
  { label: "Categories", href: "/admin/categories", icon: FolderOpen },
  { label: "Articles", href: "/admin/articles", icon: FileText },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI Tools", href: "/admin/ai-tools", icon: Sparkles },
  { label: "Audit Log", href: "/admin/audit-log", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-48 h-8" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy-50)]">
        <div className="card-premium p-8 text-center max-w-sm w-full">
          <Shield className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="text-xl font-serif font-semibold text-foreground mb-2">Admin Access Required</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in with your admin account to access the dashboard.</p>
          <a href={getLoginUrl()} className="btn-cta w-full justify-center">Sign In</a>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--navy-50)]">
        <div className="card-premium p-8 text-center max-w-sm w-full">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-serif font-semibold text-foreground mb-2">Access Denied</h1>
          <p className="text-sm text-muted-foreground mb-6">Your account does not have admin privileges.</p>
          <Link href="/" className="btn-primary">Return to Site</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[var(--navy-50)]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-[var(--navy-900)] text-white flex flex-col min-h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[var(--navy-700)]">
          <Link href="/">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[var(--teal-500)] flex items-center justify-center">
                <span className="text-white font-bold text-xs">FC</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white leading-none">First Capital</div>
                <div className="text-xs text-[var(--teal-400)] mt-0.5">Admin Panel</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${isActive ? "bg-[var(--teal-600)] text-white" : "text-[oklch(70%_0.02_250)] hover:bg-[var(--navy-800)] hover:text-white"}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[var(--navy-700)] space-y-2">
          <Link href="/">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[oklch(60%_0.02_250)] hover:text-white hover:bg-[var(--navy-800)] transition-colors cursor-pointer">
              <ExternalLink className="w-3.5 h-3.5" /> View Public Site
            </div>
          </Link>
          <div className="px-3 py-2">
            <div className="text-xs text-[oklch(60%_0.02_250)] mb-1">{user.name ?? user.email}</div>
            <Button
              size="sm"
              variant="ghost"
              className="w-full justify-start text-xs text-[oklch(60%_0.02_250)] hover:text-white hover:bg-[var(--navy-800)] gap-2 h-7 px-0"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="container max-w-6xl py-8">{children}</div>
      </main>
    </div>
  );
}
