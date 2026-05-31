import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, FileText, AlertTriangle, Copy, CheckCircle2, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AdminAITools() {
  const [summaryForm, setSummaryForm] = useState({ productName: "", providerName: "", aprMin: "", aprMax: "", annualFee: "", rewardsRate: "" });
  const [summaryResult, setSummaryResult] = useState("");

  const [articleForm, setArticleForm] = useState({ title: "", category: "Credit Cards", keywords: "" });
  const [articleResult, setArticleResult] = useState("");
  const [articleWords, setArticleWords] = useState(0);

  const [copied, setCopied] = useState<"summary" | "article" | null>(null);

  const { data: jobs } = trpc.admin.contentQueue.useQuery();
  const generateSummaryMutation = trpc.agent.generateSummary.useMutation();
  const generateArticleMutation = trpc.agent.generateArticleDraft.useMutation();
  const flagStaleMutation = trpc.agent.flagStaleOffers.useMutation();
  const utils = trpc.useUtils();

  const handleGenerateSummary = async () => {
    if (!summaryForm.productName || !summaryForm.providerName) { toast.error("Product name and provider name are required"); return; }
    try {
      const result = await generateSummaryMutation.mutateAsync({ ...summaryForm, aprMin: summaryForm.aprMin || undefined, aprMax: summaryForm.aprMax || undefined, annualFee: summaryForm.annualFee || undefined, rewardsRate: summaryForm.rewardsRate || undefined });
      setSummaryResult(result.summary);
      toast.success("Summary generated");
    } catch { toast.error("Failed to generate summary"); }
  };

  const handleGenerateArticle = async () => {
    if (!articleForm.title) { toast.error("Article title is required"); return; }
    try {
      const result = await generateArticleMutation.mutateAsync({ title: articleForm.title, category: articleForm.category, keywords: articleForm.keywords ? articleForm.keywords.split(",").map((k) => k.trim()) : [] });
      setArticleResult(result.content);
      setArticleWords(result.wordCount);
      toast.success(`Article draft generated (${result.wordCount} words)`);
    } catch { toast.error("Failed to generate article"); }
  };

  const handleFlagStale = async () => {
    try {
      const result = await flagStaleMutation.mutateAsync();
      toast.success(`Audit complete: ${result.flaggedCount} stale offer${result.flaggedCount !== 1 ? "s" : ""} flagged`);
      utils.admin.contentQueue.invalidate();
    } catch { toast.error("Audit failed"); }
  };

  const copy = async (text: string, key: "summary" | "article") => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const jobStatusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    running: "bg-amber-100 text-amber-700",
    pending: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" /> AI Content Tools
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Generate editorial summaries and article drafts using AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Summary generator */}
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent" /> Product Summary Generator</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Product Name *</Label><Input value={summaryForm.productName} onChange={(e) => setSummaryForm((f) => ({ ...f, productName: e.target.value }))} placeholder="Chase Sapphire Preferred" /></div>
            <div className="col-span-2"><Label>Provider Name *</Label><Input value={summaryForm.providerName} onChange={(e) => setSummaryForm((f) => ({ ...f, providerName: e.target.value }))} placeholder="Chase" /></div>
            <div><Label>APR Min (%)</Label><Input value={summaryForm.aprMin} onChange={(e) => setSummaryForm((f) => ({ ...f, aprMin: e.target.value }))} placeholder="19.99" /></div>
            <div><Label>APR Max (%)</Label><Input value={summaryForm.aprMax} onChange={(e) => setSummaryForm((f) => ({ ...f, aprMax: e.target.value }))} placeholder="29.99" /></div>
            <div><Label>Annual Fee ($)</Label><Input value={summaryForm.annualFee} onChange={(e) => setSummaryForm((f) => ({ ...f, annualFee: e.target.value }))} placeholder="95" /></div>
            <div><Label>Rewards Rate</Label><Input value={summaryForm.rewardsRate} onChange={(e) => setSummaryForm((f) => ({ ...f, rewardsRate: e.target.value }))} placeholder="2x travel" /></div>
          </div>
          <Button onClick={handleGenerateSummary} disabled={generateSummaryMutation.isPending} className="w-full gap-2">
            {generateSummaryMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Summary</>}
          </Button>
          {summaryResult && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Summary</Label>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => copy(summaryResult, "summary")}>
                  {copied === "summary" ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm text-foreground leading-relaxed">{summaryResult}</div>
            </div>
          )}
        </div>

        {/* Article generator */}
        <div className="card-premium p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-accent" /> Article Draft Generator</h2>
          <div className="space-y-3">
            <div><Label>Article Title *</Label><Input value={articleForm.title} onChange={(e) => setArticleForm((f) => ({ ...f, title: e.target.value }))} placeholder="Best Credit Cards for Travel in 2025" /></div>
            <div>
              <Label>Category</Label>
              <Select value={articleForm.category} onValueChange={(v) => setArticleForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Credit Cards", "Personal Loans", "Mortgages", "Auto Loans", "Savings", "General Finance"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Target Keywords (comma-separated)</Label><Input value={articleForm.keywords} onChange={(e) => setArticleForm((f) => ({ ...f, keywords: e.target.value }))} placeholder="travel credit card, rewards, miles" /></div>
          </div>
          <Button onClick={handleGenerateArticle} disabled={generateArticleMutation.isPending} className="w-full gap-2">
            {generateArticleMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><FileText className="w-4 h-4" /> Generate Draft</>}
          </Button>
          {articleResult && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <Label>Generated Draft ({articleWords} words)</Label>
                <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => copy(articleResult, "article")}>
                  {copied === "article" ? <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-lg max-h-64 overflow-y-auto text-xs">
                <Streamdown>{articleResult}</Streamdown>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stale offer audit */}
      <div className="card-premium p-6">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-500" /> Stale Offer Audit</h2>
        <p className="text-sm text-muted-foreground mb-4">Run an automated scan to identify offers that haven't been verified in over 30 days.</p>
        <Button variant="outline" onClick={handleFlagStale} disabled={flagStaleMutation.isPending} className="gap-2">
          {flagStaleMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Scanning...</> : <><AlertTriangle className="w-4 h-4" /> Run Stale Offer Audit</>}
        </Button>
      </div>

      {/* Job queue */}
      {jobs && jobs.length > 0 && (
        <div className="card-premium p-6">
          <h2 className="font-semibold text-foreground mb-4">Recent AI Jobs</h2>
          <div className="space-y-2">
            {(jobs as any[]).map((job: any) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-xs font-medium text-foreground capitalize">{job.jobType.replace(/_/g, " ")}</div>
                  {job.targetSlug && <div className="text-xs text-muted-foreground">{job.targetSlug}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`text-xs border-0 ${jobStatusColors[job.status] ?? ""}`}>{job.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
