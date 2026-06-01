import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Globe, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

type ProviderForm = {
  name: string; slug: string; description: string; editorialSummary: string;
  websiteUrl: string; headquarters: string; foundedYear: string;
  overallRating: string; logoUrl: string; isActive: boolean;
};

const EMPTY: ProviderForm = {
  name: "", slug: "", description: "", editorialSummary: "", websiteUrl: "",
  headquarters: "", foundedYear: "", overallRating: "", logoUrl: "", isActive: true,
};

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function AdminProviders() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProviderForm>(EMPTY);

  const { data: providers, isLoading } = trpc.providers.listAll.useQuery();
  const createMutation = trpc.providers.create.useMutation();
  const updateMutation = trpc.providers.update.useMutation();
  const deleteMutation = trpc.providers.delete.useMutation();
  const utils = trpc.useUtils();

  const openNew = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (p: any) => {
    setForm({
      name: p.name ?? "", slug: p.slug ?? "", description: p.description ?? "",
      editorialSummary: p.editorialSummary ?? "", websiteUrl: p.websiteUrl ?? "",
      headquarters: p.headquarters ?? "", foundedYear: p.foundedYear ? String(p.foundedYear) : "",
      overallRating: p.overallRating ?? "", logoUrl: p.logoUrl ?? "", isActive: p.isActive ?? true,
    });
    setEditId(p.id); setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: form.name, slug: form.slug || slugify(form.name),
        description: form.description || undefined, editorialSummary: form.editorialSummary || undefined,
        websiteUrl: form.websiteUrl || undefined, headquarters: form.headquarters || undefined,
        foundedYear: form.foundedYear ? parseInt(form.foundedYear) : undefined,
        overallRating: form.overallRating || undefined,
        logoUrl: form.logoUrl || undefined,
      };
      if (editId) { await updateMutation.mutateAsync({ id: editId, data: { ...payload, isActive: form.isActive } }); toast.success("Provider updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Provider created"); }
      setOpen(false); utils.providers.listAll.invalidate();
    } catch (e: any) { toast.error(e.message ?? "Failed to save provider"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this provider?")) return;
    await deleteMutation.mutateAsync({ id }); toast.success("Provider deleted");
    utils.providers.listAll.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Providers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage financial institutions and lenders.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Provider</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(providers ?? []).length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No providers yet.</div>}
          {(providers ?? []).map((p) => (
            <div key={p.id} className="card-premium p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {p.logoUrl ? (
                    <img src={p.logoUrl} alt={p.name} className="w-9 h-9 rounded-lg object-contain bg-muted border border-border" />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-[var(--navy-100)] flex items-center justify-center text-xs font-bold text-[var(--navy-700)] uppercase">{p.name.slice(0, 2)}</div>
                  )}
                  <div>
                    <div className="font-semibold text-sm text-foreground">{p.name}</div>
                    {p.overallRating && <div className="text-xs text-muted-foreground">Rating: {parseFloat(p.overallRating).toFixed(1)}/5</div>}
                  </div>
                </div>
                <Badge className={`text-xs border-0 ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {p.headquarters && <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1"><MapPin className="w-3 h-3" />{p.headquarters}</div>}
              {p.websiteUrl && <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Globe className="w-3 h-3" /><a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline truncate">{p.websiteUrl}</a></div>}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => openEdit(p)}><Pencil className="w-3 h-3" /> Edit</Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit Provider" : "Add Provider"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Overall Rating (0–5)</Label><Input value={form.overallRating} onChange={(e) => setForm((f) => ({ ...f, overallRating: e.target.value }))} placeholder="4.5" /></div>
            <div><Label>Website URL</Label><Input value={form.websiteUrl} onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>Headquarters</Label><Input value={form.headquarters} onChange={(e) => setForm((f) => ({ ...f, headquarters: e.target.value }))} placeholder="New York, NY" /></div>
            <div className="col-span-2"><Label>Founded Year</Label><Input value={form.foundedYear} onChange={(e) => setForm((f) => ({ ...f, foundedYear: e.target.value }))} placeholder="1990" /></div>
            <div className="col-span-2">
              <ImageUpload
                label="Provider Logo"
                hint="Optional. Used as the fallback image for all offers from this provider. PNG, JPG, WebP up to 5 MB."
                value={form.logoUrl || null}
                onChange={(url) => setForm((f) => ({ ...f, logoUrl: url ?? "" }))}
              />
            </div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Editorial Summary</Label><Textarea value={form.editorialSummary} onChange={(e) => setForm((f) => ({ ...f, editorialSummary: e.target.value }))} rows={3} /></div>
            <div className="flex items-center gap-3"><Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId ? "Save Changes" : "Create Provider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
