# First Capital Alliance — Project TODO

## Phase 1: Design System & Layout
- [x] Global CSS design tokens (navy, white, teal accent, typography)
- [x] Public site layout: top nav, footer with disclosure links
- [x] Admin layout: sidebar with role-based nav
- [x] Reusable UI primitives: DisclosureBanner, TrustBar, LastVerified, Breadcrumb

## Phase 2: Database Schema
- [x] providers table
- [x] categories table
- [x] offers table (APR, fees, rewards, eligibility, tracking_url, last_verified_at)
- [x] articles table (pillar + supporting, category, tags, status)
- [x] pages table (static trust/legal pages)
- [x] offer_page_map table
- [x] content_jobs table
- [x] audit_log table
- [x] Apply all migrations via webdev_execute_sql

## Phase 3: Backend Routers
- [x] categories router (list, get, create, update, delete)
- [x] providers router (list, get, create, update, delete)
- [x] offers router (list by category, get, create, update, delete, flag stale)
- [x] articles router (list, get, create, update, delete, publish)
- [x] admin router (dashboard stats, audit log, content queue)
- [x] agent router (generate summary, generate article draft)
- [x] sitemap router (dynamic XML sitemap)

## Phase 4: Public Pages
- [x] Homepage: hero, value prop, featured categories, trust bar
- [x] Category/pillar pages: /credit-cards, /personal-loans, /auto-loans, /mortgages
- [x] Comparison pages: sortable/filterable offer tables with APR, fees, rewards, eligibility
- [x] Product detail pages: offer data, pros/cons, editorial summary, CTA
- [x] Provider profile pages: /providers/[slug] listing all products
- [x] Article hub: /learn with category filtering
- [x] Individual article pages: /learn/[slug] with TOC, related articles
- [x] Static trust pages: About, Editorial Policy, Affiliate Disclosure, How We Make Money, Privacy, Terms

## Phase 5: Admin Panel
- [x] Admin login gate (role: admin only)
- [x] Admin dashboard: stats, last agent run, recent audit log
- [x] Offer management: list, add, edit, delete offers
- [x] Category management: list, add, edit, delete categories
- [x] Provider management: list, add, edit, delete providers
- [x] Article management: list, add, edit, publish/unpublish articles
- [x] Content queue: drafts and scheduled publishes
- [x] Audit log viewer
- [x] AI Tools page (generate summaries and article drafts)

## Phase 6: SEO Infrastructure
- [x] SEO meta component (title, description, canonical, OG, Twitter card)
- [x] JSON-LD structured data per page type (Article, FAQPage, BreadcrumbList, Product)
- [x] Dynamic sitemap.xml endpoint
- [x] robots.txt
- [x] Breadcrumb navigation component with schema
- [x] Advertiser disclosure banner (persistent on all monetized pages)
- [x] Affiliate disclaimer footer component

## Phase 7: AI & Automation
- [x] AI product summary generation (LLM integration)
- [x] AI article draft generation
- [x] Scheduled cron handler: daily offer freshness check, flag stale records (/api/scheduled/offer-audit)
- [x] Seed data: 5 categories, 6 providers, 8 offers, 2 articles

## Phase 8: Tests & Polish
- [x] Vitest: offers router CRUD (byCategory, featured)
- [x] Vitest: admin role guard (unauthenticated, non-admin, admin)
- [x] Vitest: auth router (me query)
- [x] Vitest: categories router
- [x] Vitest: providers router
- [x] TypeScript: zero errors
- [x] Checkpoint and deliver

## Calculator Tools
- [x] Calculator hub page (/tools) with all 19 calculators categorized
- [x] Mortgage Payment Calculator
- [x] Mortgage Refinance Calculator (break-even analysis)
- [x] Home Affordability Calculator
- [x] Rent vs. Buy Calculator
- [x] Auto Loan Calculator
- [x] Auto Refinance Calculator (savings comparison)
- [x] Credit Card Payoff Calculator
- [x] Credit Card Interest Calculator (minimum payment)
- [x] Credit Card Refinance Calculator
- [x] Balance Transfer Calculator
- [x] Personal Loan Calculator
- [x] Loan Comparison Calculator (side-by-side)
- [x] Debt Consolidation Calculator
- [x] Debt Payoff Calculator (avalanche vs snowball)
- [x] Savings Goal Calculator
- [x] High-Yield vs Regular Savings Comparison
- [x] CD Calculator
- [x] APR vs APY Converter
- [x] Debt-to-Income (DTI) Calculator
- [x] Tools nav link with dropdown in PublicLayout
- [x] All 19 calculator routes registered in App.tsx

## Image & Media
- [x] Admin link removed from public nav (desktop + mobile)
- [x] ImageUpload component (drag-and-drop, preview, S3 upload, 5MB limit)
- [x] POST /api/upload/image endpoint (admin-auth protected)
- [x] Offer image upload in AdminOffers form
- [x] Provider logo upload in AdminProviders form
- [x] Image fallback chain: offer.imageUrl → provider.logoUrl → initials (OfferTable, Home, OfferDetailPage, ProviderPage, AdminProviders)

## Future / Pending
- [ ] Register heartbeat cron for offer-audit after first deploy (requires deployed URL)
- [ ] Flex Offers API integration
- [ ] Bankrate API integration
- [ ] Email notification for stale offers

## New Consumer Resources
- [x] Credit score education hub (/credit-score) with overview, ranges, factors, improvement tips, and score-by-product guides
- [x] Financial glossary (/glossary) with alphabetical index and individual term pages (/glossary/[term])
- [x] Credit card comparison tool (/compare/credit-cards) — side-by-side comparison of 2–3 selected cards
- [x] Nav links updated for all three new sections

## Credit Card Sub-Categories
- [x] Seed 4 credit card sub-categories: cash-back, travel, balance-transfer, credit-builder
- [x] Add cardType column to offers table (cash-back | travel | balance-transfer | credit-builder | general)
- [x] Update admin offers form with Card Type selector (shown only when category = credit cards)
- [x] Dedicated comparison pages for each sub-category (/credit-cards/cash-back, /travel, /balance-transfer, /credit-builder)
- [x] Credit Cards nav dropdown updated with sub-category links
- [x] getOffersByCardType db helper and byCardType tRPC procedure added
- [x] Existing offers tagged with appropriate cardType values

## Google Sheets Sync
- [x] Read all 7 sheets (Providers, Credit Cards, Personal Loans, Mortgages, Auto Loans, Savings Accounts, Checking Accounts)
- [x] Server-side sync handler: upsert providers and offers by slug (idempotent)
- [x] Store Google Sheets spreadsheet ID as env secret
- [x] tRPC admin.syncSheets procedure (protected, admin-only)
- [x] Scheduled heartbeat endpoint at /api/scheduled/sheets-sync (heartbeat cron, requires deploy)
- [x] sync_log table to track last sync time, rows upserted, errors
- [x] Admin dashboard: Sync Now button with loading state and last-synced timestamp
- [x] Admin dashboard: sync result toast (X providers, Y offers synced)
- [x] Initial sync run to populate database from spreadsheet (requires admin login — use Sync Now button after deploy)

## Launch Readiness Pass

- [x] Fix navigation: add Banking section (Checking, Savings, CDs), restructure Compare Now button
- [x] Fix footer: add /privacy, /terms routes; fix /compare link; add Checking/Savings/CDs to Products list
- [x] Build HELOC page (/mortgages/heloc)
- [x] Build Checking Accounts page (/checking-accounts)
- [x] Build CDs page (/cds)
- [x] Add /mortgages/refinance route
- [x] Build /compare hub page
- [x] Add /privacy and /terms static pages
- [x] Fix offer image display: remove rounded container box, show raw card image
- [x] Fix comparison tools: product name prominent, provider as subtitle
- [x] Fix MortgageCalculator: auto-hide/disable PMI when down payment >= 20%
- [x] Overhaul SavingsGoalCalculator to be intuitive and useful
- [x] Add dynamic contextual tool injection on offer detail pages
- [x] Add CDs category to sheetsSync and seed CD category in DB
- [x] Add checking-accounts, cds routes to App.tsx with ComparisonPage
- [x] Add category metadata for checking-accounts and cds in ComparisonPage

## Offer Tracking + Sitemap Generator

- [x] Add offer_events table (offer_id, event_type: view|click, created_at, session_id) to drizzle schema
- [x] Add offer_stats query helper in db.ts (views + clicks per offer)
- [x] Add tRPC procedures: trackOfferEvent (public), getOfferStats (admin)
- [x] Wire view tracking on OfferDetailPage mount
- [x] Wire click tracking on all apply/CTA buttons across the site
- [x] Build sitemap generator (server-side, generates XML from DB, stores in sitemap_meta table)
- [x] Add /api/scheduled/generate-sitemap heartbeat handler
- [x] Register 7-day heartbeat cron via manus-heartbeat CLI (after deploy) — button in admin dashboard
- [x] Add admin dashboard: Offer Analytics tab (views + clicks table, sortable)
- [x] Add admin dashboard: Sitemap panel (last generated, manual regenerate button)
