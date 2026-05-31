import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import SEOMeta, { buildBreadcrumbSchema } from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen } from "lucide-react";

export default function ArticleHub() {
  const { data: articles, isLoading } = trpc.articles.list.useQuery({ limit: 30 });

  const jsonLd = buildBreadcrumbSchema([
    { name: "Home", url: "https://firstcapitalalliance.com" },
    { name: "Learn", url: "https://firstcapitalalliance.com/learn" },
  ]);

  return (
    <PublicLayout>
      <SEOMeta
        title="Personal Finance Guides & Articles"
        description="Expert guides on credit cards, loans, mortgages, and building credit. Learn how to make smarter financial decisions."
        canonical="https://firstcapitalalliance.com/learn"
        jsonLd={jsonLd}
      />

      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[{ label: "Learn" }]} />
          <h1 className="text-3xl lg:text-4xl font-serif font-semibold text-foreground mt-4 mb-2">Personal Finance Guides</h1>
          <p className="text-muted-foreground">Expert-written articles to help you make smarter financial decisions.</p>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(({ article, category }) => (
              <Link key={article.id} href={`/learn/${article.slug}`}>
                <div className="card-premium p-6 h-full cursor-pointer hover:border-accent/40 transition-all group">
                  {article.isPillar && <Badge className="bg-[var(--navy-100)] text-[var(--navy-700)] border-0 text-xs mb-3">Pillar Guide</Badge>}
                  {category && !article.isPillar && <Badge variant="outline" className="text-xs mb-3">{category.name}</Badge>}
                  <h2 className="font-semibold text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">{article.title}</h2>
                  {article.excerpt && <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">{article.excerpt}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-auto">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                    {article.wordCount && article.wordCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.ceil(article.wordCount / 200)} min read
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-semibold text-foreground mb-2">Articles Coming Soon</h2>
            <p className="text-muted-foreground text-sm">Our editorial team is working on comprehensive guides for you.</p>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
