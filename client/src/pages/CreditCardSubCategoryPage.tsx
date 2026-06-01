import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import OfferTable from "@/components/OfferTable";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Percent, Plane, ArrowRightLeft, ShieldCheck } from "lucide-react";

type CardType = "cash-back" | "travel" | "balance-transfer" | "credit-builder";

const CONFIG: Record<CardType, {
  title: string;
  headline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  icon: React.ReactNode;
  color: string;
  faqs: { q: string; a: string }[];
}> = {
  "cash-back": {
    title: "Cash Back Credit Cards",
    headline: "Best Cash Back Credit Cards",
    description: "Earn cash rewards on every purchase — groceries, gas, dining, and more. Compare the top cash back cards with flat-rate rewards, rotating categories, and no-annual-fee options.",
    metaTitle: "Best Cash Back Credit Cards 2026",
    metaDescription: "Compare the best cash back credit cards of 2026. Find cards with the highest rewards rates, no annual fee options, and generous sign-up bonuses.",
    keywords: "cash back credit cards, best cash back cards, no annual fee cash back, flat rate rewards card",
    icon: <Percent className="w-6 h-6" />,
    color: "emerald",
    faqs: [
      { q: "What is a cash back credit card?", a: "A cash back credit card rewards you with a percentage of your spending returned as cash. Rates typically range from 1% to 5% depending on the category and card." },
      { q: "What cash back rate should I look for?", a: "A flat rate of 1.5%–2% is solid for everyday spending. Cards with bonus categories (3%–5% on groceries, gas, or dining) can earn more if your spending aligns with those categories." },
      { q: "Do cash back cards have annual fees?", a: "Many excellent cash back cards have no annual fee. Premium cards with higher rewards rates may charge $95–$250/year, but the rewards often outweigh the cost for high spenders." },
      { q: "How is cash back redeemed?", a: "Most cards let you redeem as a statement credit, direct deposit, or check. Some also allow redemption for gift cards or travel at the same or better value." },
    ],
  },
  "travel": {
    title: "Travel Credit Cards",
    headline: "Best Travel Credit Cards",
    description: "Earn miles, points, and travel perks on every purchase. Compare the top travel cards for flights, hotels, lounge access, and everyday spending rewards.",
    metaTitle: "Best Travel Credit Cards 2026",
    metaDescription: "Compare the best travel credit cards of 2026. Find cards with the highest miles, airport lounge access, travel protections, and sign-up bonuses.",
    keywords: "travel credit cards, best travel cards, airline miles credit card, hotel rewards card, airport lounge access",
    icon: <Plane className="w-6 h-6" />,
    color: "blue",
    faqs: [
      { q: "What is a travel credit card?", a: "A travel credit card earns points or miles on purchases that can be redeemed for flights, hotels, car rentals, and other travel expenses — often at a higher value than cash back." },
      { q: "Are travel cards worth the annual fee?", a: "Premium travel cards often justify their $95–$695 annual fees through travel credits, lounge access, and bonus points. Calculate your expected rewards against the fee before applying." },
      { q: "What is a sign-up bonus?", a: "Most travel cards offer a large bonus (50,000–100,000+ points) after spending a minimum amount in the first few months. These bonuses can be worth $500–$1,500+ in travel." },
      { q: "Can I use travel rewards for any airline or hotel?", a: "It depends on the card. Some cards have flexible points transferable to many partners; others are co-branded with a specific airline or hotel chain." },
    ],
  },
  "balance-transfer": {
    title: "Balance Transfer Credit Cards",
    headline: "Best Balance Transfer Credit Cards",
    description: "Pay down existing debt faster with a 0% intro APR offer. Compare the top balance transfer cards with the longest 0% periods, lowest transfer fees, and best ongoing rates.",
    metaTitle: "Best Balance Transfer Credit Cards 2026",
    metaDescription: "Compare the best balance transfer credit cards with 0% intro APR. Find the longest 0% periods, lowest transfer fees, and best terms for paying off debt.",
    keywords: "balance transfer credit cards, 0% APR credit cards, best balance transfer cards, pay off credit card debt",
    icon: <ArrowRightLeft className="w-6 h-6" />,
    color: "violet",
    faqs: [
      { q: "What is a balance transfer?", a: "A balance transfer moves existing credit card debt to a new card — ideally one with a 0% intro APR — so you can pay down the principal without accruing interest during the promotional period." },
      { q: "What is a balance transfer fee?", a: "Most cards charge 3%–5% of the transferred amount as a one-time fee. Even with this fee, you can save significantly compared to paying high ongoing interest." },
      { q: "How long are 0% intro APR periods?", a: "Promotional periods typically range from 12 to 21 months. After the intro period ends, the regular APR applies to any remaining balance." },
      { q: "Will a balance transfer hurt my credit score?", a: "Applying for a new card causes a small, temporary dip from the hard inquiry. However, the lower utilization from transferring balances can improve your score over time." },
    ],
  },
  "credit-builder": {
    title: "Credit Builder Cards",
    headline: "Best Credit Builder Cards",
    description: "Build or rebuild your credit history with a secured or starter credit card. Compare the top credit builder cards that report to all three bureaus and help you establish credit fast.",
    metaTitle: "Best Credit Builder Cards 2026",
    metaDescription: "Compare the best credit builder and secured credit cards. Find cards that report to all three bureaus and help you build or rebuild credit quickly.",
    keywords: "credit builder cards, secured credit cards, best cards for bad credit, build credit fast, no credit history credit card",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "amber",
    faqs: [
      { q: "What is a secured credit card?", a: "A secured card requires a refundable security deposit (typically $200–$500) that becomes your credit limit. It works like a regular card and reports to credit bureaus to help build your history." },
      { q: "How fast can I build credit with a secured card?", a: "With on-time payments and low utilization, most people see meaningful score improvement within 6–12 months. Some issuers will upgrade you to an unsecured card after 12–18 months of good behavior." },
      { q: "Do secured cards have annual fees?", a: "Some do, some don't. Look for cards with no annual fee or a low fee (under $35/year) to keep costs down while you build credit." },
      { q: "What credit score do I need for a credit builder card?", a: "Most secured and credit builder cards are designed for people with no credit history or scores below 580. Some don't require a credit check at all." },
    ],
  },
};

interface Props {
  cardType: CardType;
}

export default function CreditCardSubCategoryPage({ cardType }: Props) {
  const config = CONFIG[cardType];
  const { data: offers, isLoading } = trpc.offers.byCardType.useQuery({ cardType });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": config.metaTitle,
    "description": config.metaDescription,
    "url": `https://firstcapitalalliance.com/credit-cards/${cardType}`,
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://firstcapitalalliance.com" },
        { "@type": "ListItem", "position": 2, "name": "Credit Cards", "item": "https://firstcapitalalliance.com/credit-cards" },
        { "@type": "ListItem", "position": 3, "name": config.title },
      ],
    },
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": config.faqs.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a },
      })),
    },
  };

  return (
    <PublicLayout>
      <SEOMeta
        title={config.metaTitle}
        description={config.metaDescription}
        keywords={config.keywords}
        canonical={`/credit-cards/${cardType}`}
        jsonLd={jsonLd}
      />

      {/* Hero */}
      <div className="bg-[var(--navy-900)] text-white py-12">
        <div className="container">
          <Breadcrumb
            items={[
              { label: "Credit Cards", href: "/credit-cards" },
              { label: config.title },
            ]}
          />
          <div className="flex items-center gap-4 mt-5">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white">
              {config.icon}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-semibold">{config.headline}</h1>
              <p className="text-white/70 text-sm mt-1">Updated {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            </div>
          </div>
          <p className="mt-4 text-white/80 max-w-2xl leading-relaxed">{config.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["cash-back", "travel", "balance-transfer", "credit-builder"] as CardType[]).map((t) => (
              <a
                key={t}
                href={`/credit-cards/${t}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${t === cardType ? "bg-[var(--teal-500)] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
              >
                {CONFIG[t].title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Offer table */}
      <div className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-serif font-semibold text-foreground">
            {isLoading ? "Loading..." : `${offers?.length ?? 0} ${config.title} Compared`}
          </h2>
          <Badge variant="outline" className="text-xs">
            Rates updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : offers && offers.length > 0 ? (
          <OfferTable offers={offers} />
        ) : (
          <div className="card-premium p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">No offers in this category yet</p>
            <p className="text-sm">Check back soon — we're adding new {config.title.toLowerCase()} regularly.</p>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="bg-[var(--navy-50)] border-t border-border py-12">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-serif font-semibold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {config.faqs.map((faq, i) => (
              <div key={i} className="card-premium p-5">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclosure */}
      <div className="container py-6">
        <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-4">
          <strong>Advertiser Disclosure:</strong> First Capital Alliance LLC is an independent, advertising-supported comparison service. We may receive compensation when you click on links or apply for products featured on this site. This compensation may influence which products appear and in what order. Our editorial team operates independently and our ratings are not influenced by compensation. <a href="/advertiser-disclosure" className="underline hover:text-foreground">Learn more</a>.
        </p>
      </div>
    </PublicLayout>
  );
}
