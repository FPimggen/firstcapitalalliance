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
import { Plus, Pencil, Trash2, CheckCircle2, AlertTriangle, Clock, Star, Sparkles } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

type OfferForm = {
  productName: string;
  tagline: string;
  providerId: string;
  categoryId: string;
  slug: string;
  aprMin: string;
  aprMax: string;
  annualFee: string;
  rewardsRate: string;
  bonusDetails: string;
  minCreditScore: string;
  overallRating: string;
  cardType: string;
  imageUrl: string;
  trackingUrl: string;
  editorialSummary: string;
  pros: string;
  cons: string;
  isFeatured: boolean;
  isActive: boolean;
};

const EMPTY_FORM: OfferForm = {
  productName: "", tagline: "", providerId: "", categoryId: "", slug: "",
  aprMin: "", aprMax: "", annualFee: "", rewardsRate: "", bonusDetails: "",
  minCreditScore: "", overallRating: "", cardType: "general", imageUrl: "", trackingUrl: "", editorialSummary: "",
  pros: "", cons: "", isFeatured: false, isActive: true,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminOffers() {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<OfferForm>(EMPTY_FORM);
  const [search, setSearch] = useState("");

  const { data: offers, isLoading, refetch } = trpc.offers.listAll.useQuery();
  const { data: providers } = trpc.providers.listAll.useQuery();
  const { data: categories } = trpc.categories.listAll.useQuery();
  const createMutation = trpc.offers.create.useMutation();
  const updateMutation = trpc.offers.update.useMutation();
  const deleteMutation = trpc.offers.delete.useMutation();
  const markVerifiedMutation = trpc.offers.markVerified.useMutation();
  const generateSummaryMutation = trpc.agent.generateSummary.useMutation();

  const utils = trpc.useUtils();

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setOpen(true); };
  const openEdit = (offer: any) => {
    setForm({
      productName: offer.offer.productName ?? "",
      tagline: offer.offer.tagline ?? "",
      providerId: String(offer.offer.providerId ?? ""),
      categoryId: String(offer.offer.categoryId ?? ""),
      slug: offer.offer.slug ?? "",
      aprMin: offer.offer.aprMin ?? "",
      aprMax: offer.offer.aprMax ?? "",
      annualFee: offer.offer.annualFee ?? "",
      rewardsRate: offer.offer.rewardsRate ?? "",
      bonusDetails: offer.offer.bonusDetails ?? "",
      minCreditScore: offer.offer.minCreditScore ? String(offer.offer.minCreditScore) : "",
      overallRating: offer.offer.overallRating ?? "",
      cardType: offer.offer.cardType ?? "general",
      imageUrl: offer.offer.imageUrl ?? "",
      trackingUrl: offer.offer.trackingUrl ?? "",
      editorialSummary: offer.offer.editorialSummary ?? "",
      pros: (offer.offer.pros ?? []).join("\n"),
      cons: (offer.offer.cons ?? []).join("\n"),
      isFeatured: offer.offer.isFeatured ?? false,
      isActive: offer.offer.isActive ?? true,
    });
    setEditId(offer.offer.id);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        productName: form.productName,
        tagline: form.tagline || undefined,
        providerId: parseInt(form.providerId),
        categoryId: parseInt(form.categoryId),
        slug: form.slug || slugify(form.productName),
        aprMin: form.aprMin || undefined,
        aprMax: form.aprMax || undefined,
        annualFee: form.annualFee || undefined,
        rewardsRate: form.rewardsRate || undefined,
        bonusDetails: form.bonusDetails || undefined,
        minCreditScore: form.minCreditScore ? parseInt(form.minCreditScore) : undefined,
        overallRating: form.overallRating || undefined,
        cardType: (form.cardType && form.cardType !== "general" ? form.cardType : undefined) as any,
        imageUrl: form.imageUrl || undefined,
        trackingUrl: form.trackingUrl || undefined,
        editorialSummary: form.editorialSummary || undefined,
        pros: form.pros ? form.pros.split("\n").filter(Boolean) : undefined,
        cons: form.cons ? form.cons.split("\n").filter(Boolean) : undefined,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: payload });
        toast.success("Offer updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Offer created");
      }
      setOpen(false);
      utils.offers.listAll.invalidate();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save offer");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this offer? This cannot be undone.")) return;
    await deleteMutation.mutateAsync({ id });
    toast.success("Offer deleted");
    utils.offers.listAll.invalidate();
  };

  const handleMarkVerified = async (id: number) => {
    await markVerifiedMutation.mutateAsync({ id });
    toast.success("Offer marked as verified");
    utils.offers.listAll.invalidate();
  };

  const handleGenerateSummary = async () => {
    if (!form.productName) { toast.error("Enter a product name first"); return; }
    const provider = providers?.find((p) => String(p.id) === form.providerId);
    try {
      const result = await generateSummaryMutation.mutateAsync({
        productName: form.productName,
        providerName: provider?.name ?? "Unknown",
        aprMin: form.aprMin || undefined,
        aprMax: form.aprMax || undefined,
        annualFee: form.annualFee || undefined,
        rewardsRate: form.rewardsRate || undefined,
        bonusDetails: form.bonusDetails || undefined,
        pros: form.pros ? form.pros.split("\n").filter(Boolean) : undefined,
        cons: form.cons ? form.cons.split("\n").filter(Boolean) : undefined,
      });
      setForm((f) => ({ ...f, editorialSummary: result.summary }));
      toast.success("Summary generated");
    } catch {
      toast.error("Failed to generate summary");
    }
  };

  const filtered = (offers ?? []).filter((o) =>
    !search || o.offer.productName.toLowerCase().includes(search.toLowerCase()) || o.provider?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Offers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all financial product offers.</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Add Offer
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Search offers..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <span className="text-sm text-muted-foreground">{filtered.length} offer{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">APR</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No offers found.</td></tr>
              )}
              {filtered.map(({ offer, provider, category }) => {
                const lastVerified = offer.lastVerifiedAt ? new Date(offer.lastVerifiedAt) : null;
                const diffDays = lastVerified ? Math.floor((Date.now() - lastVerified.getTime()) / 86400000) : 999;
                const isStale = diffDays > 30;
                return (
                  <tr key={offer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{offer.productName}</div>
                      <div className="text-xs text-muted-foreground">{provider?.name}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{category?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-xs">{offer.aprMin ? `${offer.aprMin}%${offer.aprMax && offer.aprMax !== offer.aprMin ? `–${offer.aprMax}%` : ""}` : "—"}</td>
                    <td className="px-4 py-3">
                      {offer.overallRating ? (
                        <span className="flex items-center gap-1 text-xs">
                          <Star className="w-3 h-3 fill-[var(--gold-500)] text-[var(--gold-500)]" />
                          {parseFloat(offer.overallRating).toFixed(1)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={`text-xs border-0 ${offer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                          {offer.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {offer.isFeatured && <Badge className="text-xs border-0 bg-[var(--teal-100)] text-[var(--teal-600)]">Featured</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs ${isStale ? "text-amber-600" : "text-muted-foreground"}`}>
                        {isStale ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {lastVerified ? `${diffDays}d ago` : "Never"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit({ offer, provider, category })}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700" onClick={() => handleMarkVerified(offer.id)} title="Mark verified">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(offer.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editId ? "Edit Offer" : "Add New Offer"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={form.productName} onChange={(e) => setForm((f) => ({ ...f, productName: e.target.value, slug: f.slug || slugify(e.target.value) }))} placeholder="e.g. Chase Sapphire Preferred" />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="chase-sapphire-preferred" />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Short marketing tagline" />
            </div>
            <div>
              <Label>Provider *</Label>
              <Select value={form.providerId} onValueChange={(v) => setForm((f) => ({ ...f, providerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {(providers ?? []).map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category *</Label>
              <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(categories ?? []).find((c) => String(c.id) === form.categoryId)?.slug === "credit-cards" && (
              <div>
                <Label>Card Type</Label>
                <Select value={form.cardType} onValueChange={(v) => setForm((f) => ({ ...f, cardType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select card type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash-back">Cash Back</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="balance-transfer">Balance Transfer</SelectItem>
                    <SelectItem value="credit-builder">Credit Builder</SelectItem>
                    <SelectItem value="general">General / Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>APR Min (%)</Label>
              <Input value={form.aprMin} onChange={(e) => setForm((f) => ({ ...f, aprMin: e.target.value }))} placeholder="e.g. 19.99" />
            </div>
            <div>
              <Label>APR Max (%)</Label>
              <Input value={form.aprMax} onChange={(e) => setForm((f) => ({ ...f, aprMax: e.target.value }))} placeholder="e.g. 29.99" />
            </div>
            <div>
              <Label>Annual Fee ($)</Label>
              <Input value={form.annualFee} onChange={(e) => setForm((f) => ({ ...f, annualFee: e.target.value }))} placeholder="e.g. 95" />
            </div>
            <div>
              <Label>Overall Rating (0–5)</Label>
              <Input value={form.overallRating} onChange={(e) => setForm((f) => ({ ...f, overallRating: e.target.value }))} placeholder="e.g. 4.5" />
            </div>
            <div>
              <Label>Min. Credit Score</Label>
              <Input value={form.minCreditScore} onChange={(e) => setForm((f) => ({ ...f, minCreditScore: e.target.value }))} placeholder="e.g. 670" />
            </div>
            <div>
              <Label>Tracking / Apply URL</Label>
              <Input value={form.trackingUrl} onChange={(e) => setForm((f) => ({ ...f, trackingUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <ImageUpload
                label="Offer Image"
                hint="Optional. If not set, the provider logo will be used. Accepts PNG, JPG, WebP up to 5 MB."
                value={form.imageUrl || null}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url ?? "" }))}
              />
            </div>
            <div className="col-span-2">
              <Label>Rewards Rate</Label>
              <Input value={form.rewardsRate} onChange={(e) => setForm((f) => ({ ...f, rewardsRate: e.target.value }))} placeholder="e.g. 2x on travel, 1x on everything else" />
            </div>
            <div className="col-span-2">
              <Label>Welcome Bonus / Bonus Details</Label>
              <Textarea value={form.bonusDetails} onChange={(e) => setForm((f) => ({ ...f, bonusDetails: e.target.value }))} rows={2} placeholder="e.g. Earn 60,000 points after spending $4,000 in first 3 months" />
            </div>
            <div>
              <Label>Pros (one per line)</Label>
              <Textarea value={form.pros} onChange={(e) => setForm((f) => ({ ...f, pros: e.target.value }))} rows={4} placeholder="No foreign transaction fees&#10;Strong travel rewards&#10;Excellent sign-up bonus" />
            </div>
            <div>
              <Label>Cons (one per line)</Label>
              <Textarea value={form.cons} onChange={(e) => setForm((f) => ({ ...f, cons: e.target.value }))} rows={4} placeholder="$95 annual fee&#10;High APR for revolvers" />
            </div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label>Editorial Summary</Label>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleGenerateSummary} disabled={generateSummaryMutation.isPending}>
                  <Sparkles className="w-3 h-3" />
                  {generateSummaryMutation.isPending ? "Generating..." : "AI Generate"}
                </Button>
              </div>
              <Textarea value={form.editorialSummary} onChange={(e) => setForm((f) => ({ ...f, editorialSummary: e.target.value }))} rows={3} placeholder="2-3 sentence editorial summary..." />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm((f) => ({ ...f, isFeatured: v }))} />
              <Label>Featured / Top Pick</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              <Label>Active (visible on site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editId ? "Save Changes" : "Create Offer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
