import { useEffect } from "react";

interface SEOMetaProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  jsonLd?: object | object[];
  noindex?: boolean;
}

export default function SEOMeta({
  title,
  description,
  canonical,
  ogImage = "https://firstcapitalalliance.com/og-default.jpg",
  ogType = "website",
  publishedAt,
  updatedAt,
  author,
  jsonLd,
  noindex = false,
}: SEOMetaProps) {
  const siteName = "First Capital Alliance";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical ?? (typeof window !== "undefined" ? window.location.href : "");

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create meta
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="robots"]', "content", noindex ? "noindex,nofollow" : "index,follow");

    // Open Graph
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[property="og:image"]', "content", ogImage);
    setMeta('meta[property="og:site_name"]', "content", siteName);

    // Twitter
    setMeta('meta[name="twitter:card"]', "content", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", ogImage);

    // Article meta
    if (publishedAt) setMeta('meta[property="article:published_time"]', "content", publishedAt);
    if (updatedAt) setMeta('meta[property="article:modified_time"]', "content", updatedAt);
    if (author) setMeta('meta[property="article:author"]', "content", author);

    // Canonical
    let canonicalEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement("link");
      canonicalEl.rel = "canonical";
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.href = canonicalUrl;

    // JSON-LD
    const existingScripts = document.querySelectorAll('script[data-seo-jsonld]');
    existingScripts.forEach((s) => s.remove());
    if (jsonLd) {
      const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      schemas.forEach((schema) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-jsonld", "true");
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }
  }, [fullTitle, description, canonicalUrl, ogImage, ogType, publishedAt, updatedAt, author, noindex, jsonLd]);

  return null;
}

// ─── JSON-LD builders ─────────────────────────────────────────────────────────
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildArticleSchema(opts: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    image: opts.imageUrl,
    datePublished: opts.publishedAt,
    dateModified: opts.updatedAt,
    author: { "@type": "Organization", name: opts.author ?? "First Capital Alliance Editorial Team" },
    publisher: { "@type": "Organization", name: "First Capital Alliance", logo: { "@type": "ImageObject", url: "https://firstcapitalalliance.com/logo.png" } },
  };
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function buildFinancialProductSchema(opts: {
  name: string;
  description?: string;
  url: string;
  provider: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    provider: { "@type": "Organization", name: opts.provider },
  };
}
