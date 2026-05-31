import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Import tables dynamically
const { categories, providers, offers, articles } = await import("./drizzle/schema.ts");

console.log("🌱 Seeding First Capital Alliance database...");

// --- Categories ---
console.log("  → Inserting categories...");
await db.insert(categories).values([
  { name: "Credit Cards", slug: "credit-cards", description: "Compare the best credit cards for rewards, cash back, travel, and building credit.", icon: "💳", sortOrder: 1, isActive: true },
  { name: "Personal Loans", slug: "personal-loans", description: "Find the best personal loan rates for debt consolidation, home improvement, and more.", icon: "💰", sortOrder: 2, isActive: true },
  { name: "Mortgages", slug: "mortgages", description: "Compare mortgage rates from top lenders for home purchase and refinancing.", icon: "🏠", sortOrder: 3, isActive: true },
  { name: "Auto Loans", slug: "auto-loans", description: "Compare auto loan rates for new and used car purchases.", icon: "🚗", sortOrder: 4, isActive: true },
  { name: "Savings Accounts", slug: "savings-accounts", description: "Find the highest-yield savings accounts and money market accounts.", icon: "🏦", sortOrder: 5, isActive: true },
]).onDuplicateKeyUpdate({ set: { name: categories.name } });

// --- Providers ---
console.log("  → Inserting providers...");
await db.insert(providers).values([
  { name: "Chase", slug: "chase", description: "JPMorgan Chase is one of the largest financial institutions in the United States, offering a full suite of banking, credit card, and lending products.", editorialSummary: "Chase offers some of the most competitive rewards credit cards on the market, particularly for travel and dining. Their Ultimate Rewards program is widely regarded as one of the best in the industry.", websiteUrl: "https://www.chase.com", headquarters: "New York, NY", foundedYear: 1799, overallRating: "4.5", isActive: true },
  { name: "American Express", slug: "american-express", description: "American Express is a global financial services company known for premium credit cards, charge cards, and travel rewards.", editorialSummary: "American Express excels in premium travel benefits and customer service. Their Membership Rewards program offers exceptional flexibility, and their travel protections are among the best in the industry.", websiteUrl: "https://www.americanexpress.com", headquarters: "New York, NY", foundedYear: 1850, overallRating: "4.4", isActive: true },
  { name: "Capital One", slug: "capital-one", description: "Capital One is a major U.S. bank offering credit cards, auto loans, banking, and savings products.", editorialSummary: "Capital One is known for accessible credit products and straightforward rewards. Their Venture cards are popular among travelers who prefer simple, flexible rewards over complex point systems.", websiteUrl: "https://www.capitalone.com", headquarters: "McLean, VA", foundedYear: 1994, overallRating: "4.2", isActive: true },
  { name: "Discover", slug: "discover", description: "Discover Financial Services is a leading credit card issuer and banking institution known for no-fee products.", editorialSummary: "Discover stands out for its no-annual-fee credit cards and competitive cash back rates. Their customer service consistently ranks among the best in the industry.", websiteUrl: "https://www.discover.com", headquarters: "Riverwoods, IL", foundedYear: 1985, overallRating: "4.3", isActive: true },
  { name: "Marcus by Goldman Sachs", slug: "marcus", description: "Marcus is the consumer banking arm of Goldman Sachs, offering high-yield savings accounts and personal loans.", editorialSummary: "Marcus offers some of the most competitive APY rates on savings accounts and consistently low personal loan rates. Their no-fee philosophy makes them a top choice for savers and borrowers alike.", websiteUrl: "https://www.marcus.com", headquarters: "New York, NY", foundedYear: 2016, overallRating: "4.4", isActive: true },
  { name: "SoFi", slug: "sofi", description: "SoFi is a modern financial services company offering personal loans, student loan refinancing, mortgages, and banking.", editorialSummary: "SoFi has built a strong reputation for competitive rates on personal loans and student loan refinancing. Their member benefits, including career coaching and financial planning, add significant value.", websiteUrl: "https://www.sofi.com", headquarters: "San Francisco, CA", foundedYear: 2011, overallRating: "4.3", isActive: true },
]).onDuplicateKeyUpdate({ set: { name: providers.name } });

// Fetch inserted IDs
const [allCategories, allProviders] = await Promise.all([
  db.select().from(categories),
  db.select().from(providers),
]);

const catMap = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));
const provMap = Object.fromEntries(allProviders.map((p) => [p.slug, p.id]));

// --- Offers ---
console.log("  → Inserting offers...");
await db.insert(offers).values([
  // Credit Cards
  {
    productName: "Chase Sapphire Preferred® Card",
    slug: "chase-sapphire-preferred",
    tagline: "Earn big on travel and dining",
    providerId: provMap["chase"],
    categoryId: catMap["credit-cards"],
    aprMin: "20.99",
    aprMax: "27.99",
    annualFee: "95",
    rewardsRate: "3x on dining, 2x on travel, 1x on everything else",
    bonusDetails: "Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months from account opening.",
    minCreditScore: 670,
    overallRating: "4.7",
    editorialSummary: "The Chase Sapphire Preferred is one of the best travel credit cards for its price point. The 60,000-point sign-up bonus alone is worth $750 in travel through Chase Ultimate Rewards, and the card's earning rates on dining and travel make it a strong everyday companion.",
    pros: JSON.stringify(["Excellent sign-up bonus", "Strong travel and dining rewards", "No foreign transaction fees", "Trip cancellation/interruption insurance", "Points transfer to 14 airline and hotel partners"]),
    cons: JSON.stringify(["$95 annual fee", "High APR for those who carry a balance", "No airport lounge access"]),
    trackingUrl: "https://creditcards.chase.com/travel-credit-cards/sapphire/preferred",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  {
    productName: "Chase Sapphire Reserve®",
    slug: "chase-sapphire-reserve",
    tagline: "Premium travel card with $300 travel credit",
    providerId: provMap["chase"],
    categoryId: catMap["credit-cards"],
    aprMin: "21.99",
    aprMax: "28.99",
    annualFee: "550",
    rewardsRate: "10x on hotels and car rentals through Chase, 3x on other travel and dining",
    bonusDetails: "Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months.",
    minCreditScore: 720,
    overallRating: "4.6",
    editorialSummary: "The Chase Sapphire Reserve is a premium travel card that justifies its high annual fee through a $300 annual travel credit, Priority Pass airport lounge access, and superior rewards rates. Best for frequent travelers who can maximize the card's benefits.",
    pros: JSON.stringify(["$300 annual travel credit", "Priority Pass lounge access", "10x on hotels/car rentals via Chase", "Global Entry/TSA PreCheck credit", "Comprehensive travel protections"]),
    cons: JSON.stringify(["$550 annual fee", "Requires excellent credit", "Benefits require active use to justify cost"]),
    trackingUrl: "https://creditcards.chase.com/travel-credit-cards/sapphire/reserve",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  {
    productName: "American Express® Gold Card",
    slug: "amex-gold-card",
    tagline: "4x points at restaurants and U.S. supermarkets",
    providerId: provMap["american-express"],
    categoryId: catMap["credit-cards"],
    aprMin: "21.99",
    aprMax: "29.99",
    annualFee: "250",
    rewardsRate: "4x at restaurants, 4x at U.S. supermarkets (up to $25,000/year), 3x on flights",
    bonusDetails: "Earn 60,000 Membership Rewards points after you spend $6,000 on eligible purchases within the first 6 months.",
    minCreditScore: 670,
    overallRating: "4.5",
    editorialSummary: "The Amex Gold Card is an excellent choice for foodies and home cooks who spend heavily on dining and groceries. The 4x earning rate in these categories is unmatched, and the $120 dining credit and $120 Uber Cash help offset the annual fee.",
    pros: JSON.stringify(["4x on dining and U.S. supermarkets", "$120 annual dining credit", "$120 annual Uber Cash", "No foreign transaction fees", "Strong Membership Rewards program"]),
    cons: JSON.stringify(["$250 annual fee", "No airport lounge access", "Supermarket cap at $25,000/year"]),
    trackingUrl: "https://www.americanexpress.com/us/credit-cards/card/gold-card/",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  {
    productName: "Capital One Venture Rewards Credit Card",
    slug: "capital-one-venture",
    tagline: "2x miles on every purchase",
    providerId: provMap["capital-one"],
    categoryId: catMap["credit-cards"],
    aprMin: "19.99",
    aprMax: "29.99",
    annualFee: "95",
    rewardsRate: "2x miles on every purchase",
    bonusDetails: "Earn 75,000 bonus miles once you spend $4,000 on purchases within 3 months from account opening.",
    minCreditScore: 670,
    overallRating: "4.4",
    editorialSummary: "The Capital One Venture card offers a simple, flat-rate rewards structure that appeals to travelers who don't want to track bonus categories. The 2x miles on all purchases and flexible redemption options make it a strong everyday card.",
    pros: JSON.stringify(["Simple 2x miles on everything", "Flexible redemption options", "No foreign transaction fees", "Global Entry/TSA PreCheck credit", "Transfer to 15+ travel partners"]),
    cons: JSON.stringify(["$95 annual fee", "Miles worth less than some competitors", "No premium travel benefits"]),
    trackingUrl: "https://www.capitalone.com/credit-cards/venture/",
    isFeatured: false,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  {
    productName: "Discover it® Cash Back",
    slug: "discover-it-cash-back",
    tagline: "5% cash back in rotating categories, Cashback Match™ first year",
    providerId: provMap["discover"],
    categoryId: catMap["credit-cards"],
    aprMin: "17.24",
    aprMax: "28.24",
    annualFee: "0",
    rewardsRate: "5% cash back on rotating quarterly categories (up to $1,500/quarter), 1% on everything else",
    bonusDetails: "Discover will automatically match all the cash back you've earned at the end of your first year — with no minimum spending requirement.",
    minCreditScore: 670,
    overallRating: "4.3",
    editorialSummary: "The Discover it Cash Back card is one of the best no-annual-fee cash back cards available. The Cashback Match program effectively doubles your first-year rewards, making it especially valuable for new cardholders.",
    pros: JSON.stringify(["No annual fee", "Cashback Match first year", "5% rotating categories", "No foreign transaction fees", "Free FICO score"]),
    cons: JSON.stringify(["5% requires quarterly activation", "1% base rate is low", "Discover less accepted internationally"]),
    trackingUrl: "https://www.discover.com/credit-cards/cash-back/it-card.html",
    isFeatured: false,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  // Personal Loans
  {
    productName: "SoFi Personal Loan",
    slug: "sofi-personal-loan",
    tagline: "Low rates, no fees, flexible terms",
    providerId: provMap["sofi"],
    categoryId: catMap["personal-loans"],
    aprMin: "8.99",
    aprMax: "29.49",
    annualFee: "0",
    rewardsRate: null,
    bonusDetails: "No origination fees, no prepayment penalties, no late fees.",
    minCreditScore: 650,
    overallRating: "4.5",
    editorialSummary: "SoFi offers competitive personal loan rates with no fees of any kind — a rare combination in the personal loan market. Their unemployment protection program, which pauses payments if you lose your job, is a standout benefit.",
    pros: JSON.stringify(["No origination, prepayment, or late fees", "Competitive rates for good credit", "Unemployment protection benefit", "Same-day funding available", "Soft credit check for rate quote"]),
    cons: JSON.stringify(["Requires good to excellent credit for best rates", "No co-signer option", "Minimum loan amount $5,000"]),
    trackingUrl: "https://www.sofi.com/personal-loans/",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  {
    productName: "Marcus Personal Loan",
    slug: "marcus-personal-loan",
    tagline: "No fees ever, on-time payment reward",
    providerId: provMap["marcus"],
    categoryId: catMap["personal-loans"],
    aprMin: "6.99",
    aprMax: "24.99",
    annualFee: "0",
    rewardsRate: null,
    bonusDetails: "Make 12 consecutive on-time payments and you can defer one payment with no interest accrual.",
    minCreditScore: 660,
    overallRating: "4.4",
    editorialSummary: "Marcus by Goldman Sachs offers some of the lowest personal loan rates available, with absolutely no fees. The on-time payment reward — which lets you skip a payment after 12 consecutive on-time payments — is a genuinely useful benefit.",
    pros: JSON.stringify(["No fees of any kind", "Competitive low rates", "On-time payment reward", "Flexible loan amounts ($3,500–$40,000)", "Soft credit check for rate quote"]),
    cons: JSON.stringify(["No joint applications", "No mobile app for loan management", "Funding takes 1-4 business days"]),
    trackingUrl: "https://www.marcus.com/us/en/loans/personal-loans",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
  // Savings Accounts
  {
    productName: "Marcus High-Yield Online Savings",
    slug: "marcus-high-yield-savings",
    tagline: "Earn more with no fees and no minimums",
    providerId: provMap["marcus"],
    categoryId: catMap["savings-accounts"],
    aprMin: "4.50",
    aprMax: "4.50",
    annualFee: "0",
    rewardsRate: "4.50% APY",
    bonusDetails: "No minimum deposit. No monthly fees. FDIC insured up to $250,000.",
    minCreditScore: null,
    overallRating: "4.6",
    editorialSummary: "Marcus by Goldman Sachs consistently offers one of the highest APY rates on savings accounts with zero fees and no minimum balance requirements. It's an excellent home for your emergency fund or short-term savings.",
    pros: JSON.stringify(["Competitive 4.50% APY", "No monthly fees", "No minimum balance", "FDIC insured", "Easy online account management"]),
    cons: JSON.stringify(["No checking account option", "Transfers can take 1-3 business days", "No ATM access"]),
    trackingUrl: "https://www.marcus.com/us/en/savings/high-yield-savings",
    isFeatured: true,
    isActive: true,
    lastVerifiedAt: new Date(),
  },
]).onDuplicateKeyUpdate({ set: { productName: offers.productName } });

// --- Articles ---
console.log("  → Inserting articles...");
await db.insert(articles).values([
  {
    title: "Best Credit Cards of 2025: Expert Reviews and Comparisons",
    slug: "best-credit-cards-2025",
    metaTitle: "Best Credit Cards of 2025 — Expert Reviews",
    metaDescription: "Our editors have reviewed hundreds of credit cards to find the best options for travel, cash back, balance transfers, and building credit in 2025.",
    excerpt: "Finding the right credit card depends on your spending habits, credit score, and financial goals. Our editorial team has reviewed the top offers to help you decide.",
    content: `# Best Credit Cards of 2025

Our editorial team has reviewed hundreds of credit cards to identify the best options for every type of spender. Whether you're looking for travel rewards, cash back, or a card to build credit, we've got you covered.

## Our Top Picks

### Best for Travel: Chase Sapphire Preferred® Card
The Chase Sapphire Preferred remains our top pick for travelers who want strong rewards without a premium annual fee. The 60,000-point sign-up bonus is worth $750 in travel through Chase Ultimate Rewards, and the card earns 3x points on dining and 2x on travel.

### Best for Dining and Groceries: American Express® Gold Card
If you spend heavily on food — whether at restaurants or the grocery store — the Amex Gold Card's 4x earning rate in both categories is unmatched. The $120 annual dining credit and $120 Uber Cash help offset the $250 annual fee.

### Best No-Annual-Fee Card: Discover it® Cash Back
For those who prefer not to pay an annual fee, the Discover it Cash Back card offers 5% cash back in rotating quarterly categories and a Cashback Match program that doubles your first-year rewards.

## How We Evaluate Credit Cards

Our editorial team scores credit cards on a 100-point scale based on rewards value, fees, APR, accessibility, and additional benefits. We update our ratings quarterly to reflect current offers.

## Frequently Asked Questions

**What credit score do I need for a travel credit card?**
Most premium travel credit cards require a good to excellent credit score (670+). Cards like the Chase Sapphire Preferred and Amex Gold typically require scores of 670 or higher.

**Are credit card rewards worth it?**
For cardholders who pay their balance in full each month, rewards cards can provide significant value. The key is to never carry a balance, as interest charges will quickly outweigh any rewards earned.`,
    categoryId: catMap["credit-cards"],
    author: "First Capital Alliance Editorial Team",
    status: "published",
    isPillar: true,
    hasDisclosure: true,
    wordCount: 320,
    publishedAt: new Date("2025-01-15"),
  },
  {
    title: "How to Choose a Personal Loan: A Complete Guide",
    slug: "how-to-choose-personal-loan",
    metaTitle: "How to Choose a Personal Loan — Complete Guide",
    metaDescription: "Learn how to compare personal loan rates, fees, and terms to find the best loan for your needs. Expert guidance on APR, origination fees, and more.",
    excerpt: "Personal loans can be a smart financial tool when used correctly. This guide covers everything you need to know before applying.",
    content: `# How to Choose a Personal Loan

Personal loans are versatile financial products that can be used for debt consolidation, home improvement, medical expenses, and more. But with so many lenders competing for your business, how do you choose the right one?

## Key Factors to Compare

### Annual Percentage Rate (APR)
The APR is the most important number to compare when shopping for a personal loan. It includes both the interest rate and any fees, giving you a true cost of borrowing. Rates typically range from 6% to 36% depending on your credit score.

### Origination Fees
Some lenders charge an origination fee of 1%–8% of the loan amount. This fee is often deducted from your loan proceeds, meaning you receive less than you borrowed. Look for lenders like Marcus and SoFi that charge no origination fees.

### Loan Terms
Personal loan terms typically range from 2 to 7 years. Shorter terms mean higher monthly payments but less interest paid overall. Longer terms lower your monthly payment but increase the total cost of the loan.

## How to Get the Best Rate

1. **Check your credit score** before applying. Scores above 720 typically qualify for the best rates.
2. **Pre-qualify with multiple lenders** using soft credit checks that don't affect your score.
3. **Compare APRs**, not just interest rates — the APR includes all fees.
4. **Consider the total cost** of the loan, not just the monthly payment.

## Top Personal Loan Lenders

Based on our research, SoFi and Marcus by Goldman Sachs consistently offer the most competitive rates with the fewest fees for borrowers with good credit.`,
    categoryId: catMap["personal-loans"],
    author: "First Capital Alliance Editorial Team",
    status: "published",
    isPillar: true,
    hasDisclosure: true,
    wordCount: 280,
    publishedAt: new Date("2025-02-01"),
  },
]).onDuplicateKeyUpdate({ set: { title: articles.title } });

console.log("✅ Seed complete!");
await connection.end();
