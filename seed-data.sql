-- Seed categories
INSERT INTO categories (name, slug, description, icon, sortOrder, isActive)
VALUES
  ('Credit Cards', 'credit-cards', 'Compare the best credit cards for rewards, cash back, travel, and building credit.', '💳', 1, 1),
  ('Personal Loans', 'personal-loans', 'Find the best personal loan rates for debt consolidation, home improvement, and more.', '💰', 2, 1),
  ('Mortgages', 'mortgages', 'Compare mortgage rates from top lenders for home purchase and refinancing.', '🏠', 3, 1),
  ('Auto Loans', 'auto-loans', 'Compare auto loan rates for new and used car purchases.', '🚗', 4, 1),
  ('Savings Accounts', 'savings-accounts', 'Find the highest-yield savings accounts and money market accounts.', '🏦', 5, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed providers
INSERT INTO providers (name, slug, description, editorialSummary, websiteUrl, headquarters, foundedYear, overallRating, isActive)
VALUES
  ('Chase', 'chase', 'JPMorgan Chase is one of the largest financial institutions in the United States, offering a full suite of banking, credit card, and lending products.', 'Chase offers some of the most competitive rewards credit cards on the market, particularly for travel and dining. Their Ultimate Rewards program is widely regarded as one of the best in the industry.', 'https://www.chase.com', 'New York, NY', 1799, '4.5', 1),
  ('American Express', 'american-express', 'American Express is a global financial services company known for premium credit cards, charge cards, and travel rewards.', 'American Express excels in premium travel benefits and customer service. Their Membership Rewards program offers exceptional flexibility, and their travel protections are among the best in the industry.', 'https://www.americanexpress.com', 'New York, NY', 1850, '4.4', 1),
  ('Capital One', 'capital-one', 'Capital One is a major U.S. bank offering credit cards, auto loans, banking, and savings products.', 'Capital One is known for accessible credit products and straightforward rewards. Their Venture cards are popular among travelers who prefer simple, flexible rewards over complex point systems.', 'https://www.capitalone.com', 'McLean, VA', 1994, '4.2', 1),
  ('Discover', 'discover', 'Discover Financial Services is a leading credit card issuer and banking institution known for no-fee products.', 'Discover stands out for its no-annual-fee credit cards and competitive cash back rates. Their customer service consistently ranks among the best in the industry.', 'https://www.discover.com', 'Riverwoods, IL', 1985, '4.3', 1),
  ('Marcus by Goldman Sachs', 'marcus', 'Marcus is the consumer banking arm of Goldman Sachs, offering high-yield savings accounts and personal loans.', 'Marcus offers some of the most competitive APY rates on savings accounts and consistently low personal loan rates. Their no-fee philosophy makes them a top choice for savers and borrowers alike.', 'https://www.marcus.com', 'New York, NY', 2016, '4.4', 1),
  ('SoFi', 'sofi', 'SoFi is a modern financial services company offering personal loans, student loan refinancing, mortgages, and banking.', 'SoFi has built a strong reputation for competitive rates on personal loans and student loan refinancing. Their member benefits, including career coaching and financial planning, add significant value.', 'https://www.sofi.com', 'San Francisco, CA', 2011, '4.3', 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed offers (credit cards)
INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Chase Sapphire Preferred® Card', 'chase-sapphire-preferred', 'Earn big on travel and dining',
  p.id, c.id,
  '20.99', '27.99', '95',
  '3x on dining, 2x on travel, 1x on everything else',
  'Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months from account opening.',
  670, '4.7',
  'The Chase Sapphire Preferred is one of the best travel credit cards for its price point. The 60,000-point sign-up bonus alone is worth $750 in travel through Chase Ultimate Rewards.',
  '["Excellent sign-up bonus","Strong travel and dining rewards","No foreign transaction fees","Trip cancellation insurance","Points transfer to 14 partners"]',
  '["$95 annual fee","High APR for revolvers","No airport lounge access"]',
  'https://creditcards.chase.com/travel-credit-cards/sapphire/preferred',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'chase' AND c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Chase Sapphire Reserve®', 'chase-sapphire-reserve', 'Premium travel card with $300 travel credit',
  p.id, c.id,
  '21.99', '28.99', '550',
  '10x on hotels and car rentals through Chase, 3x on other travel and dining',
  'Earn 60,000 bonus points after you spend $4,000 on purchases in the first 3 months.',
  720, '4.6',
  'The Chase Sapphire Reserve is a premium travel card that justifies its high annual fee through a $300 annual travel credit, Priority Pass airport lounge access, and superior rewards rates.',
  '["$300 annual travel credit","Priority Pass lounge access","10x on hotels/car rentals via Chase","Global Entry/TSA PreCheck credit","Comprehensive travel protections"]',
  '["$550 annual fee","Requires excellent credit","Benefits require active use to justify cost"]',
  'https://creditcards.chase.com/travel-credit-cards/sapphire/reserve',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'chase' AND c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'American Express® Gold Card', 'amex-gold-card', '4x points at restaurants and U.S. supermarkets',
  p.id, c.id,
  '21.99', '29.99', '250',
  '4x at restaurants, 4x at U.S. supermarkets (up to $25,000/year), 3x on flights',
  'Earn 60,000 Membership Rewards points after you spend $6,000 on eligible purchases within the first 6 months.',
  670, '4.5',
  'The Amex Gold Card is an excellent choice for foodies and home cooks who spend heavily on dining and groceries. The 4x earning rate in these categories is unmatched.',
  '["4x on dining and U.S. supermarkets","$120 annual dining credit","$120 annual Uber Cash","No foreign transaction fees","Strong Membership Rewards program"]',
  '["$250 annual fee","No airport lounge access","Supermarket cap at $25,000/year"]',
  'https://www.americanexpress.com/us/credit-cards/card/gold-card/',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'american-express' AND c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Capital One Venture Rewards Credit Card', 'capital-one-venture', '2x miles on every purchase',
  p.id, c.id,
  '19.99', '29.99', '95',
  '2x miles on every purchase',
  'Earn 75,000 bonus miles once you spend $4,000 on purchases within 3 months from account opening.',
  670, '4.4',
  'The Capital One Venture card offers a simple, flat-rate rewards structure that appeals to travelers who do not want to track bonus categories.',
  '["Simple 2x miles on everything","Flexible redemption options","No foreign transaction fees","Global Entry/TSA PreCheck credit","Transfer to 15+ travel partners"]',
  '["$95 annual fee","Miles worth less than some competitors","No premium travel benefits"]',
  'https://www.capitalone.com/credit-cards/venture/',
  0, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'capital-one' AND c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Discover it® Cash Back', 'discover-it-cash-back', '5% cash back in rotating categories, Cashback Match™ first year',
  p.id, c.id,
  '17.24', '28.24', '0',
  '5% cash back on rotating quarterly categories (up to $1,500/quarter), 1% on everything else',
  'Discover will automatically match all the cash back you have earned at the end of your first year.',
  670, '4.3',
  'The Discover it Cash Back card is one of the best no-annual-fee cash back cards available. The Cashback Match program effectively doubles your first-year rewards.',
  '["No annual fee","Cashback Match first year","5% rotating categories","No foreign transaction fees","Free FICO score"]',
  '["5% requires quarterly activation","1% base rate is low","Discover less accepted internationally"]',
  'https://www.discover.com/credit-cards/cash-back/it-card.html',
  0, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'discover' AND c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

-- Personal loans
INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'SoFi Personal Loan', 'sofi-personal-loan', 'Low rates, no fees, flexible terms',
  p.id, c.id,
  '8.99', '29.49', '0',
  'No origination fees, no prepayment penalties, no late fees.',
  650, '4.5',
  'SoFi offers competitive personal loan rates with no fees of any kind — a rare combination in the personal loan market. Their unemployment protection program is a standout benefit.',
  '["No origination, prepayment, or late fees","Competitive rates for good credit","Unemployment protection benefit","Same-day funding available","Soft credit check for rate quote"]',
  '["Requires good to excellent credit for best rates","No co-signer option","Minimum loan amount $5,000"]',
  'https://www.sofi.com/personal-loans/',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'sofi' AND c.slug = 'personal-loans'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, bonusDetails, minCreditScore, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Marcus Personal Loan', 'marcus-personal-loan', 'No fees ever, on-time payment reward',
  p.id, c.id,
  '6.99', '24.99', '0',
  'Make 12 consecutive on-time payments and you can defer one payment with no interest accrual.',
  660, '4.4',
  'Marcus by Goldman Sachs offers some of the lowest personal loan rates available, with absolutely no fees. The on-time payment reward is a genuinely useful benefit.',
  '["No fees of any kind","Competitive low rates","On-time payment reward","Flexible loan amounts ($3,500-$40,000)","Soft credit check for rate quote"]',
  '["No joint applications","No mobile app for loan management","Funding takes 1-4 business days"]',
  'https://www.marcus.com/us/en/loans/personal-loans',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'marcus' AND c.slug = 'personal-loans'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

-- Savings accounts
INSERT INTO offers (productName, slug, tagline, providerId, categoryId, aprMin, aprMax, annualFee, rewardsRate, bonusDetails, overallRating, editorialSummary, pros, cons, trackingUrl, isFeatured, isActive, lastVerifiedAt)
SELECT
  'Marcus High-Yield Online Savings', 'marcus-high-yield-savings', 'Earn more with no fees and no minimums',
  p.id, c.id,
  '4.50', '4.50', '0',
  '4.50% APY',
  'No minimum deposit. No monthly fees. FDIC insured up to $250,000.',
  '4.6',
  'Marcus by Goldman Sachs consistently offers one of the highest APY rates on savings accounts with zero fees and no minimum balance requirements.',
  '["Competitive 4.50% APY","No monthly fees","No minimum balance","FDIC insured","Easy online account management"]',
  '["No checking account option","Transfers can take 1-3 business days","No ATM access"]',
  'https://www.marcus.com/us/en/savings/high-yield-savings',
  1, 1, NOW()
FROM providers p, categories c
WHERE p.slug = 'marcus' AND c.slug = 'savings-accounts'
ON DUPLICATE KEY UPDATE productName = VALUES(productName);

-- Articles
INSERT INTO articles (title, slug, metaTitle, metaDescription, excerpt, content, categoryId, author, status, isPillar, hasDisclosure, wordCount, publishedAt)
SELECT
  'Best Credit Cards of 2025: Expert Reviews and Comparisons',
  'best-credit-cards-2025',
  'Best Credit Cards of 2025 — Expert Reviews',
  'Our editors have reviewed hundreds of credit cards to find the best options for travel, cash back, balance transfers, and building credit in 2025.',
  'Finding the right credit card depends on your spending habits, credit score, and financial goals. Our editorial team has reviewed the top offers to help you decide.',
  '# Best Credit Cards of 2025\n\nOur editorial team has reviewed hundreds of credit cards to identify the best options for every type of spender.\n\n## Our Top Picks\n\n### Best for Travel: Chase Sapphire Preferred® Card\nThe Chase Sapphire Preferred remains our top pick for travelers who want strong rewards without a premium annual fee.\n\n### Best for Dining: American Express® Gold Card\nThe Amex Gold Card''s 4x earning rate on dining and groceries is unmatched at its price point.\n\n### Best No-Annual-Fee Card: Discover it® Cash Back\nFor those who prefer not to pay an annual fee, the Discover it Cash Back card offers 5% rotating categories and a Cashback Match program.',
  c.id,
  'First Capital Alliance Editorial Team',
  'published', 1, 1, 320, '2025-01-15'
FROM categories c WHERE c.slug = 'credit-cards'
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO articles (title, slug, metaTitle, metaDescription, excerpt, content, categoryId, author, status, isPillar, hasDisclosure, wordCount, publishedAt)
SELECT
  'How to Choose a Personal Loan: A Complete Guide',
  'how-to-choose-personal-loan',
  'How to Choose a Personal Loan — Complete Guide',
  'Learn how to compare personal loan rates, fees, and terms to find the best loan for your needs.',
  'Personal loans can be a smart financial tool when used correctly. This guide covers everything you need to know before applying.',
  '# How to Choose a Personal Loan\n\nPersonal loans are versatile financial products that can be used for debt consolidation, home improvement, medical expenses, and more.\n\n## Key Factors to Compare\n\n### Annual Percentage Rate (APR)\nThe APR is the most important number to compare. It includes both the interest rate and any fees.\n\n### Origination Fees\nSome lenders charge an origination fee of 1%-8% of the loan amount. Look for lenders like Marcus and SoFi that charge no origination fees.\n\n## Top Personal Loan Lenders\n\nBased on our research, SoFi and Marcus by Goldman Sachs consistently offer the most competitive rates with the fewest fees.',
  c.id,
  'First Capital Alliance Editorial Team',
  'published', 1, 1, 280, '2025-02-01'
FROM categories c WHERE c.slug = 'personal-loans'
ON DUPLICATE KEY UPDATE title = VALUES(title);
