import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink, Search, Image as ImageIcon } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

type Priority = "low" | "moderate" | "high";

interface AdForm {
  name: string;
  marketplace: string;
  affiliateLink: string;
  squareImageUrl: string;
  verticalImageUrl: string;
  horizontalImageUrl: string;
  priority: Priority;
  tags: string;
  isActive: boolean;
}

const EMPTY: AdForm = {
  name: "",
  marketplace: "",
  affiliateLink: "",
  squareImageUrl: "",
  verticalImageUrl: "",
  horizontalImageUrl: "",
  priority: "moderate",
  tags: "",
  isActive: true,
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  moderate: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function AdminAds() {
  const utils = trpc.useUtils();
  const { data: ads = [], isLoading } = trpc.ads.listAll.useQuery();

  const createMutation = trpc.ads.create.useMutation({
    onSuccess: () => { utils.ads.listAll.invalidate(); toast.success("Ad created"); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.ads.update.useMutation({
    onSuccess: () => { utils.ads.listAll.invalidate(); toast.success("Ad updated"); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.ads.delete.useMutation({
    onSuccess: () => { utils.ads.listAll.invalidate(); toast.success("Ad deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AdForm>(EMPTY);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function openCreate() {
    setEditId(null);
    setForm(EMPTY);
    setOpen(true);
  }

  function openEdit(ad: typeof ads[0]) {
    setEditId(ad.id);
    setForm({
      name: ad.name,
      marketplace: ad.marketplace ?? "",
      affiliateLink: ad.affiliateLink,
      squareImageUrl: ad.squareImageUrl ?? "",
      verticalImageUrl: ad.verticalImageUrl ?? "",
      horizontalImageUrl: ad.horizontalImageUrl ?? "",
      priority: ad.priority as Priority,
      tags: ad.tags ?? "",
      isActive: ad.isActive,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) { toast.error("Ad name is required"); return; }
    if (!form.affiliateLink.trim()) { toast.error("Affiliate link is required"); return; }
    const payload = {
      ...form,
      squareImageUrl: form.squareImageUrl || undefined,
      verticalImageUrl: form.verticalImageUrl || undefined,
      horizontalImageUrl: form.horizontalImageUrl || undefined,
      tags: form.tags || undefined,
    };
    if (editId !== null) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filtered = useMemo(() => {
    let rows = [...ads];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((a) => a.name.toLowerCase().includes(q) || a.marketplace.toLowerCase().includes(q));
    }
    if (priorityFilter !== "all") rows = rows.filter((a) => a.priority === priorityFilter);
    if (statusFilter === "active") rows = rows.filter((a) => a.isActive);
    if (statusFilter === "inactive") rows = rows.filter((a) => !a.isActive);
    return rows;
  }, [ads, search, priorityFilter, statusFilter]);

  const activeCount = ads.filter((a) => a.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliate Ads</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {ads.length} total · {activeCount} active
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Ad
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Search by name or marketplace..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-56 text-sm"
        />
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {(search || priorityFilter !== "all" || statusFilter !== "all") && (
          <Badge variant="secondary" className="text-xs">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Badge>
        )}
      </div>

      {/* Ad list */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading ads...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No ads found</p>
          <p className="text-sm mt-1">Create your first affiliate ad to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ad) => (
            <div key={ad.id} className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ${!ad.isActive ? "opacity-60" : ""}`}>
              {/* Preview images row */}
              <div className="flex gap-2 items-end">
                {ad.squareImageUrl ? (
                  <img src={ad.squareImageUrl} alt="Square" className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                {ad.horizontalImageUrl ? (
                  <img src={ad.horizontalImageUrl} alt="Horizontal" className="h-14 flex-1 object-cover rounded-lg border border-border min-w-0" />
                ) : (
                  <div className="h-14 flex-1 rounded-lg bg-muted border border-border flex items-center justify-center min-w-0">
                    <span className="text-xs text-muted-foreground">No horizontal</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-foreground leading-tight">{ad.name}</p>
                    {ad.marketplace && (
                      <p className="text-xs text-muted-foreground mt-0.5">{ad.marketplace}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className={`text-xs border ${PRIORITY_COLORS[ad.priority as Priority]}`}>
                      {ad.priority.charAt(0).toUpperCase() + ad.priority.slice(1)}
                    </Badge>
                    {ad.isActive ? (
                      <Badge className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                </div>
                {ad.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ad.tags.split(",").map((t) => (
                      <span key={t.trim()} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <a href={ad.affiliateLink} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1 flex-1 truncate">
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  <span className="truncate">{ad.affiliateLink}</span>
                </a>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(ad)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => { if (confirm(`Delete "${ad.name}"?`)) deleteMutation.mutate({ id: ad.id }); }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId !== null ? "Edit Ad" : "New Affiliate Ad"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ad Name <span className="text-destructive">*</span></Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Credit Karma — Credit Builder" />
                <p className="text-xs text-muted-foreground">For admin use only — not shown to users.</p>
              </div>
              <div className="space-y-1.5">
                <Label>Marketplace</Label>
                <Input value={form.marketplace} onChange={(e) => setForm((f) => ({ ...f, marketplace: e.target.value }))}
                  placeholder="e.g. AWIN, CJ, Impact, Direct" />
                <p className="text-xs text-muted-foreground">For admin tracking only.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Affiliate Link <span className="text-destructive">*</span></Label>
              <Input value={form.affiliateLink} onChange={(e) => setForm((f) => ({ ...f, affiliateLink: e.target.value }))}
                placeholder="https://www.awin1.com/cread.php?..." />
            </div>

            {/* Priority + Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High — shown most frequently</SelectItem>
                    <SelectItem value="moderate">Moderate — standard rotation</SelectItem>
                    <SelectItem value="low">Low — shown less often</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Context Tags</Label>
                <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="credit-cards, credit-builder, travel" />
                <p className="text-xs text-muted-foreground">Comma-separated. Controls which pages show this ad.</p>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <Switch id="isActive" checked={form.isActive}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <Label htmlFor="isActive">Active — show this ad on the site</Label>
            </div>

            {/* Image uploads */}
            <div className="space-y-4 pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">Ad Creatives</p>
              <div className="grid grid-cols-1 gap-4">
                <ImageUpload
                  label="Square Ad Image (1:1)"
                  hint="Recommended: 300×300px. Used in sidebar and in-search placements."
                  value={form.squareImageUrl}
                  onChange={(url: string | null) => setForm((f) => ({ ...f, squareImageUrl: url ?? "" }))}
                />
                <ImageUpload
                  label="Horizontal Ad Image (16:5)"
                  hint="Recommended: 728×90px or 970×250px. Used in notification bar and inline content placements."
                  value={form.horizontalImageUrl}
                  onChange={(url: string | null) => setForm((f) => ({ ...f, horizontalImageUrl: url ?? "" }))}
                />
                <ImageUpload
                  label="Vertical Ad Image (2:5)"
                  hint="Recommended: 160×600px or 300×600px. Used in sidebar placements."
                  value={form.verticalImageUrl}
                  onChange={(url: string | null) => setForm((f) => ({ ...f, verticalImageUrl: url ?? "" }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId !== null ? "Save Changes" : "Create Ad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
