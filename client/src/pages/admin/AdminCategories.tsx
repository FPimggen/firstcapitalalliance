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
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

type CatForm = { name: string; slug: string; description: string; icon: string; sortOrder: string; isActive: boolean; };
const EMPTY: CatForm = { name: "", slug: "", description: "", icon: "", sortOrder: "0", isActive: true };
function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function AdminCategories() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CatForm>(EMPTY);

  const { data: categories, isLoading } = trpc.categories.listAll.useQuery();
  const createMutation = trpc.categories.create.useMutation();
  const updateMutation = trpc.categories.update.useMutation();
  const deleteMutation = trpc.categories.delete.useMutation();
  const utils = trpc.useUtils();

  const openNew = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (c: any) => {
    setForm({ name: c.name ?? "", slug: c.slug ?? "", description: c.description ?? "", icon: c.icon ?? "", sortOrder: String(c.sortOrder ?? 0), isActive: c.isActive ?? true });
    setEditId(c.id); setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = { name: form.name, slug: form.slug || slugify(form.name), description: form.description || undefined, icon: form.icon || undefined, sortOrder: parseInt(form.sortOrder) || 0 };
      if (editId) { await updateMutation.mutateAsync({ id: editId, data: { ...payload, isActive: form.isActive } }); toast.success("Category updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Category created"); }
      setOpen(false); utils.categories.listAll.invalidate();
    } catch (e: any) { toast.error(e.message ?? "Failed to save category"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category? All associated offers will lose their category.")) return;
    await deleteMutation.mutateAsync({ id }); toast.success("Category deleted");
    utils.categories.listAll.invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage product categories shown on the public site.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-8"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(categories ?? []).length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No categories yet.</td></tr>}
              {(categories ?? []).map((c) => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground"><GripVertical className="w-4 h-4" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {c.icon && <span className="text-base">{c.icon}</span>}
                      <span className="font-medium text-foreground">{c.name}</span>
                    </div>
                    {c.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{c.slug}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    <Badge className={`text-xs border-0 ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(c.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-serif">{editId ? "Edit Category" : "Add Category"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></div>
            <div><Label>Icon (emoji)</Label><Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="💳" /></div>
            <div><Label>Sort Order</Label><Input value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} placeholder="0" /></div>
            <div className="flex items-center gap-3 pt-6"><Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} /><Label>Active</Label></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
