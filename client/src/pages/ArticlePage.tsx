import { useParams, Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildArticleSchema, buildBreadcrumbSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, User, Shield } from "lucide-react";
import { Streamdown } from "streamdown";

export default function ArticlePage() {
  const params = useParams<{ slug: string }>();
  const { data, isLoading, error } = trpc.articles.bySlug.useQuery({ slug: params.slug ?? "" });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container py-10 max-w-3xl space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </PublicLayout>
    );
  }

  if (error || !data) {
    return (
      <PublicLayout>
        <div className="container py-20 text-center">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-semibold">Article Not Found</h1>
          <Link href="/learn" className="btn-primary mt-6 inline-block">Browse Articles</Link>
        </div>
      </PublicLayout>
    );
  }

  const { article, category } = data;
  const publishedStr = article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined;
  const updatedStr = new Date(article.updatedAt).toISOString();

  const jsonLd = [
    buildBreadcrumbSchema([
      { name: "Home", url: "https://firstcapitalalliance.com" },
      { name: "Learn", url: "https://firstcapitalalliance.com/learn" },
      { name: article.title, url: `https://firstcapitalalliance.com/learn/${article.slug}` },
    ]),
    buildArticleSchema({
      title: article.title,
      description: article.metaDescription ?? article.excerpt ?? "",
      url: `https://firstcapitalalliance.com/learn/${article.slug}`,
      publishedAt: publishedStr,
      updatedAt: updatedStr,
      author: article.author ?? "First Capital Alliance Editorial Team",
    }),
  ];

  return (
    <PublicLayout>
      <SEOMeta
        title={article.metaTitle ?? article.title}
        description={article.metaDescription ?? article.excerpt ?? `Read our guide: ${article.title}`}
        canonical={`https://firstcapitalalliance.com/learn/${article.slug}`}
        ogType="article"
        publishedAt={publishedStr}
        updatedAt={updatedStr}
        author={article.author ?? undefined}
        jsonLd={jsonLd}
      />

      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8 max-w-4xl">
          <Breadcrumb items={[{ label: "Learn", href: "/learn" }, { label: article.title }]} />
          <div className="mt-5">
            {article.isPillar && <Badge className="bg-[var(--navy-100)] text-[var(--navy-700)] border-0 text-xs mb-3">Pillar Guide</Badge>}
            {category && !article.isPillar && <Badge variant="outline" className="text-xs mb-3">{category.name}</Badge>}
            <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mb-4 text-balance">{article.title}</h1>
            {article.excerpt && <p className="text-muted-foreground leading-relaxed max-w-2xl">{article.excerpt}</p>}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{article.author ?? "Editorial Team"}</span>
              {article.publishedAt && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>}
              {article.wordCount && article.wordCount > 0 && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{Math.ceil(article.wordCount / 200)} min read</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 max-w-5xl">
          {/* Article body */}
          <div className="lg:col-span-3">
            {/* Disclosure */}
            {article.hasDisclosure && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 mb-8">
                <strong>Advertiser Disclosure:</strong> This article may reference products from our advertising partners. Our editorial content is independent of any commercial relationships.{" "}
                <a href="/disclosure" className="underline">Learn more</a>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-accent prose-strong:text-foreground">
              {article.content ? (
                <Streamdown>{article.content}</Streamdown>
              ) : (
                <p className="text-muted-foreground italic">Content coming soon.</p>
              )}
            </div>

            {/* Updated timestamp */}
            <div className="mt-10 pt-6 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Last updated {new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="card-premium p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm text-foreground">Editorial Standards</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This article was written by our editorial team and reviewed for accuracy. We follow strict editorial guidelines to ensure unbiased, helpful content.
              </p>
              <a href="/editorial-policy" className="text-xs text-accent hover:underline mt-2 block">Our editorial policy →</a>
            </div>
            <div className="card-premium p-5">
              <h3 className="font-semibold text-sm text-foreground mb-3">Related Products</h3>
              <ul className="space-y-2">
                {[
                  ["Compare Credit Cards", "/credit-cards"],
                  ["Compare Personal Loans", "/personal-loans"],
                  ["Compare Mortgages", "/mortgages"],
                ].map(([label, href]) => (
                  <li key={href}>
                    <a href={href} className="text-xs text-accent hover:underline">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
