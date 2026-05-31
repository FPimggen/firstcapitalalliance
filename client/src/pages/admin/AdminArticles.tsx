import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Sparkles, Calendar, Clock } from "lucide-react";

type ArticleForm = {
  title: string; slug: string; metaTitle: string; metaDescription: string;
  excerpt: string; content: string; categoryId: string; author: string;
  status: "draft" | "published" | "archived"; isPillar: boolean; hasDisclosure: boolean;
};

const EMPTY: ArticleForm = {
  title: "", slug: "", metaTitle: "", metaDescription: "", excerpt: "", content: "",
  categoryId: "", author: "", status: "draft", isPillar: false, hasDisclosure: true,
};

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

export default function AdminArticles() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ArticleForm>(EMPTY);
  const [search, setSearch] = useState("");

  const { data: articles, isLoading } = trpc.articles.listAll.useQuery();
  const { data: categories } = trpc.categories.listAll.useQuery();
  const createMutation = trpc.articles.create.useMutation();
  const updateMutation = trpc.articles.update.useMutation();
  const deleteMutation = trpc.articles.delete.useMutation();
  const generateDraftMutation = trpc.agent.generateArticleDraft.useMutation();
  const utils = trpc.useUtils();

  const openNew = () => { setForm(EMPTY); setEditId(null); setOpen(true); };
  const openEdit = (a: any) => {
    setForm({
      title: a.article.title ?? "", slug: a.article.slug ?? "",
      metaTitle: a.article.metaTitle ?? "", metaDescription: a.article.metaDescription ?? "",
      excerpt: a.article.excerpt ?? "", content: a.article.content ?? "",
      categoryId: a.article.categoryId ? String(a.article.categoryId) : "",
      author: a.article.author ?? "", status: a.article.status ?? "draft",
      isPillar: a.article.isPillar ?? false, hasDisclosure: a.article.hasDisclosure ?? true,
    });
    setEditId(a.article.id); setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title, slug: form.slug || slugify(form.title),
        metaTitle: form.metaTitle || undefined, metaDescription: form.metaDescription || undefined,
        excerpt: form.excerpt || undefined, content: form.content || undefined,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        author: form.author || undefined, status: form.status,
        isPillar: form.isPillar, hasDisclosure: form.hasDisclosure,
      };
      if (editId) { await updateMutation.mutateAsync({ id: editId, data: payload }); toast.success("Article updated"); }
      else { await createMutation.mutateAsync(payload); toast.success("Article created"); }
      setOpen(false); utils.articles.listAll.invalidate();
    } catch (e: any) { toast.error(e.message ?? "Failed to save article"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this article?")) return;
    await deleteMutation.mutateAsync({ id }); toast.success("Article deleted");
    utils.articles.listAll.invalidate();
  };

  const handleGenerateDraft = async () => {
    if (!form.title) { toast.error("Enter a title first"); return; }
    const cat = categories?.find((c) => String(c.id) === form.categoryId);
    try {
      const result = await generateDraftMutation.mutateAsync({
        title: form.title, category: cat?.name ?? "Personal Finance", keywords: [],
      });
      setForm((f) => ({ ...f, content: result.content }));
      toast.success(`Draft generated (${result.wordCount} words)`);
    } catch { toast.error("Failed to generate draft"); }
  };

  const filtered = (articles ?? []).filter((a) => !search || a.article.title.toLowerCase().includes(search.toLowerCase()));

  const statusColors: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Articles</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage editorial content and guides.</p>
        </div>
        <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> New Article</Button>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-muted-foreground">{filtered.length} article{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Words</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Published</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No articles found.</td></tr>}
              {filtered.map(({ article, category }) => (
                <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground line-clamp-1">{article.title}</div>
                    <div className="text-xs text-muted-foreground">{article.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <Badge className={`text-xs border-0 ${statusColors[article.status] ?? ""}`}>{article.status}</Badge>
                      {article.isPillar && <Badge className="text-xs border-0 bg-[var(--navy-100)] text-[var(--navy-700)]">Pillar</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{article.wordCount ? `${article.wordCount.toLocaleString()} words` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {article.publishedAt ? (
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(article.publishedAt).toLocaleDateString()}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit({ article, category })}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(article.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editId ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} placeholder="Editorial Team" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: any) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Meta Title</Label>
              <Input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} placeholder="SEO title (60 chars)" />
            </div>
            <div className="col-span-2">
              <Label>Meta Description</Label>
              <Textarea value={form.metaDescription} onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))} rows={2} placeholder="SEO description (160 chars)" />
            </div>
            <div className="col-span-2">
              <Label>Excerpt</Label>
              <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label>Content (Markdown)</Label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleGenerateDraft} disabled={generateDraftMutation.isPending}>
                  <Sparkles className="w-3 h-3" />
                  {generateDraftMutation.isPending ? "Generating..." : "AI Draft"}
                </Button>
              </div>
              <Textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={12} className="font-mono text-xs" placeholder="Write in Markdown..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isPillar} onCheckedChange={(v) => setForm((f) => ({ ...f, isPillar: v }))} />
              <Label>Pillar Article</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.hasDisclosure} onCheckedChange={(v) => setForm((f) => ({ ...f, hasDisclosure: v }))} />
              <Label>Show Affiliate Disclosure</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId ? "Save Changes" : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
