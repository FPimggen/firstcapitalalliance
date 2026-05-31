import PublicLayout from "@/components/PublicLayout";
import SEOMeta from "@/components/SEOMeta";
import Breadcrumb from "@/components/Breadcrumb";
import { useRoute } from "wouter";

const PAGES: Record<string, { title: string; description: string; content: React.ReactNode }> = {
  "/disclosure": {
    title: "Advertiser Disclosure",
    description: "Learn how First Capital Alliance earns revenue and how that may affect the products we feature.",
    content: (
      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
        <p className="text-sm text-muted-foreground leading-relaxed p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <strong>Summary:</strong> First Capital Alliance earns compensation from financial institutions when you click on links or apply for products. This does not influence our editorial ratings or recommendations.
        </p>
        <h2>How We Earn Revenue</h2>
        <p>First Capital Alliance is an independent financial comparison platform. We earn compensation from financial institutions and advertisers when consumers click on links, apply for products, or complete transactions through our site. This compensation may influence which products appear on our site, how they are ordered, and how prominently they are featured.</p>
        <h2>What This Means for You</h2>
        <p>Our editorial team operates independently of our business team. Advertisers do not review, approve, or influence our editorial content, ratings, or recommendations. Our ratings are based solely on our editorial team's analysis of each product's features, rates, fees, and value.</p>
        <h2>Not All Products Are Featured</h2>
        <p>The financial products shown on this site do not represent all available products in the market. We may not feature products from companies that do not advertise with us, and the absence of a product does not imply a negative assessment.</p>
        <h2>Rate Accuracy</h2>
        <p>All rates, fees, and terms shown on this site are subject to change. We make every effort to keep information current and display a "last verified" timestamp on all offer data. Always verify current terms directly with the financial institution before applying.</p>
        <h2>Contact Us</h2>
        <p>If you have questions about our advertiser relationships or editorial process, please contact us at editorial@firstcapitalalliance.com.</p>
      </div>
    ),
  },
  "/editorial-policy": {
    title: "Editorial Policy",
    description: "Our commitment to independent, accurate, and unbiased financial content.",
    content: (
      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>Our Editorial Independence</h2>
        <p>First Capital Alliance maintains strict editorial independence. Our editorial team operates separately from our business and advertising teams. Advertisers have no influence over our editorial content, ratings, or recommendations.</p>
        <h2>Our Editorial Standards</h2>
        <p>All content published on First Capital Alliance is written, reviewed, and edited by our editorial team. We follow these standards:</p>
        <ul>
          <li>All factual claims are verified before publication</li>
          <li>Product ratings are based on a consistent, documented methodology</li>
          <li>Content is reviewed for accuracy and updated regularly</li>
          <li>All affiliate relationships are clearly disclosed</li>
          <li>We do not accept payment to write positive reviews</li>
        </ul>
        <h2>Corrections Policy</h2>
        <p>If you believe any information on our site is inaccurate, please contact us at editorial@firstcapitalalliance.com. We review all correction requests promptly and update content as needed.</p>
        <h2>Content Updates</h2>
        <p>Financial product information changes frequently. We display a "last verified" timestamp on all offer data and conduct regular audits to ensure accuracy. Our AI-assisted content system flags offers that have not been verified in over 30 days for editorial review.</p>
      </div>
    ),
  },
  "/methodology": {
    title: "Our Rating Methodology",
    description: "How First Capital Alliance evaluates and rates financial products.",
    content: (
      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>How We Rate Financial Products</h2>
        <p>Our editorial team evaluates financial products on a 5.0-point scale based on the following criteria:</p>
        <h3>Credit Cards (100 points total)</h3>
        <ul>
          <li><strong>Rewards value (30 pts):</strong> Cash back rate, points value, bonus categories, and sign-up bonus</li>
          <li><strong>Fees (25 pts):</strong> Annual fee relative to benefits, foreign transaction fees, penalty fees</li>
          <li><strong>APR (20 pts):</strong> Purchase APR range, balance transfer APR, and intro APR offers</li>
          <li><strong>Accessibility (15 pts):</strong> Credit score requirements and approval likelihood</li>
          <li><strong>Additional benefits (10 pts):</strong> Travel protections, purchase protections, and other perks</li>
        </ul>
        <h3>Personal Loans (100 points total)</h3>
        <ul>
          <li><strong>APR range (35 pts):</strong> Minimum and maximum APR relative to market averages</li>
          <li><strong>Fees (25 pts):</strong> Origination fees, prepayment penalties, and late fees</li>
          <li><strong>Loan terms (20 pts):</strong> Flexibility of loan amounts and repayment terms</li>
          <li><strong>Accessibility (20 pts):</strong> Minimum credit score, income requirements, and approval speed</li>
        </ul>
        <h2>Data Sources</h2>
        <p>Our ratings are based on publicly available product information, direct lender disclosures, and our editorial team's analysis. We do not rely on lender-provided ratings or sponsored assessments.</p>
        <h2>Limitations</h2>
        <p>Our ratings represent our editorial team's assessment at the time of review. Individual experiences may vary. Always review the full terms and conditions before applying for any financial product.</p>
      </div>
    ),
  },
  "/how-we-make-money": {
    title: "How We Make Money",
    description: "Transparency about First Capital Alliance's business model and revenue sources.",
    content: (
      <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed">
        <h2>Our Business Model</h2>
        <p>First Capital Alliance is a free service for consumers. We earn revenue through affiliate marketing and advertising partnerships with financial institutions.</p>
        <h2>Affiliate Commissions</h2>
        <p>When you click on a product link and apply for or purchase a financial product, we may receive a commission from the financial institution. The commission amount varies by product and institution. This compensation does not affect the price you pay for any product.</p>
        <h2>Display Advertising</h2>
        <p>We may display banner advertisements from financial institutions on our site. These advertisements are clearly labeled and do not influence our editorial content.</p>
        <h2>What We Don't Do</h2>
        <ul>
          <li>We do not sell your personal information to third parties</li>
          <li>We do not accept payment to write positive reviews</li>
          <li>We do not allow advertisers to influence our editorial ratings</li>
          <li>We do not hide affiliate relationships</li>
        </ul>
        <h2>Our Commitment</h2>
        <p>We believe that transparency builds trust. Our goal is to provide genuinely useful financial comparisons that help you make better decisions — regardless of which products generate the most revenue for us.</p>
      </div>
    ),
  },
};

export default function StaticPage({ path }: { path: string }) {
  const page = PAGES[path];
  if (!page) return null;

  return (
    <PublicLayout>
      <SEOMeta title={page.title} description={page.description} canonical={`https://firstcapitalalliance.com${path}`} />
      <div className="bg-[var(--navy-50)] border-b border-border">
        <div className="container py-8">
          <Breadcrumb items={[{ label: page.title }]} />
          <h1 className="text-3xl font-serif font-semibold text-foreground mt-4">{page.title}</h1>
        </div>
      </div>
      <div className="container py-10 max-w-3xl">{page.content}</div>
    </PublicLayout>
  );
}
