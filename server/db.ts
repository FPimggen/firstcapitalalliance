import { and, count as countFn, desc, eq, gte, isNull, like, lt, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Article,
  AuditLog,
  Category,
  ContentJob,
  InsertArticle,
  InsertAuditLog,
  InsertCategory,
  InsertContentJob,
  InsertOffer,
  InsertOfferEvent,
  InsertPage,
  InsertProvider,
  InsertSitemapMeta,
  InsertUser,
  Offer,
  Page,
  Provider,
  articles,
  auditLog,
  categories,
  contentJobs,
  offerEvents,
  offerPageMap,
  offers,
  pages,
  providers,
  sitemapMeta,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Categories ──────────────────────────────────────────────────────────────
export async function getCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result[0];
}

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

export async function createCategory(data: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(categories).values(data);
  return getCategoryBySlug(data.slug);
}

export async function updateCategory(id: number, data: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(categories).where(eq(categories.id, id));
}

// ─── Providers ───────────────────────────────────────────────────────────────
export async function getProviders(activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const q = db.select().from(providers);
  if (activeOnly) return q.where(eq(providers.isActive, true)).orderBy(providers.name);
  return q.orderBy(providers.name);
}

export async function getProviderBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(providers).where(eq(providers.slug, slug)).limit(1);
  return result[0];
}

export async function createProvider(data: InsertProvider) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(providers).values(data);
  return getProviderBySlug(data.slug);
}

export async function updateProvider(id: number, data: Partial<InsertProvider>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(providers).set(data).where(eq(providers.id, id));
}

export async function deleteProvider(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(providers).where(eq(providers.id, id));
}

// ─── Offers ──────────────────────────────────────────────────────────────────
export async function getOffersByCategory(categoryId: number, activeOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(offers.categoryId, categoryId)];
  if (activeOnly) conditions.push(eq(offers.isActive, true));
  return db
    .select({
      offer: offers,
      provider: providers,
      category: categories,
    })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(offers.isFeatured), desc(offers.overallRating));
}

export async function getOffersByCategorySlug(categorySlug: string, cardType?: string) {
  const db = await getDb();
  if (!db) return [];
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return [];
  const conditions: ReturnType<typeof eq>[] = [eq(offers.categoryId, cat.id), eq(offers.isActive, true)];
  if (cardType) conditions.push(eq(offers.cardType, cardType as any));
  return db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(desc(offers.isFeatured), desc(offers.overallRating));
}
export async function getOffersByCardType(cardType: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(and(eq(offers.cardType, cardType as any), eq(offers.isActive, true)))
    .orderBy(desc(offers.isFeatured), desc(offers.overallRating));
}

export async function getOfferBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(eq(offers.slug, slug))
    .limit(1);
  return result[0];
}

export async function getAllOffers(activeOnly = false) {
  const db = await getDb();
  if (!db) return [];
  const q = db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id));
  if (activeOnly) return q.where(eq(offers.isActive, true)).orderBy(desc(offers.updatedAt));
  return q.orderBy(desc(offers.updatedAt));
}

export async function getOffersByProvider(providerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(and(eq(offers.providerId, providerId), eq(offers.isActive, true)))
    .orderBy(desc(offers.overallRating));
}

export async function createOffer(data: InsertOffer) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(offers).values(data);
  return getOfferBySlug(data.slug);
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(offers).set(data).where(eq(offers.id, id));
}

export async function deleteOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(offers).where(eq(offers.id, id));
}

export async function getStaleOffers(olderThanDays = 30) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  return db
    .select()
    .from(offers)
    .where(and(eq(offers.isActive, true), lt(offers.lastVerifiedAt, cutoff)));
}

export async function getFeaturedOffers(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ offer: offers, provider: providers, category: categories })
    .from(offers)
    .leftJoin(providers, eq(offers.providerId, providers.id))
    .leftJoin(categories, eq(offers.categoryId, categories.id))
    .where(and(eq(offers.isFeatured, true), eq(offers.isActive, true)))
    .orderBy(desc(offers.overallRating))
    .limit(limit);
}

// ─── Articles ─────────────────────────────────────────────────────────────────
export async function getPublishedArticles(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ article: articles, category: categories })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ article: articles, category: categories })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(eq(articles.slug, slug))
    .limit(1);
  return result[0];
}

export async function getArticlesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ article: articles, category: categories })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .where(and(eq(articles.categoryId, categoryId), eq(articles.status, "published")))
    .orderBy(desc(articles.publishedAt));
}

export async function getAllArticles() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ article: articles, category: categories })
    .from(articles)
    .leftJoin(categories, eq(articles.categoryId, categories.id))
    .orderBy(desc(articles.updatedAt));
}

export async function createArticle(data: InsertArticle) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(articles).values(data);
  return getArticleBySlug(data.slug);
}

export async function updateArticle(id: number, data: Partial<InsertArticle>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(articles).where(eq(articles.id, id));
}

// ─── Pages ────────────────────────────────────────────────────────────────────
export async function getPageBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  return result[0];
}

export async function upsertPage(data: InsertPage) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(pages).values(data).onDuplicateKeyUpdate({ set: { title: data.title, content: data.content, metaTitle: data.metaTitle, metaDescription: data.metaDescription } });
}

// ─── Content Jobs ─────────────────────────────────────────────────────────────
export async function createContentJob(data: InsertContentJob) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(contentJobs).values(data);
  return result;
}

export async function updateContentJob(id: number, data: Partial<ContentJob>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(contentJobs).set(data).where(eq(contentJobs.id, id));
}

export async function getRecentJobs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentJobs).orderBy(desc(contentJobs.createdAt)).limit(limit);
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export async function addAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLog).values(data);
}

export async function getAuditLog(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOffers: 0, totalProviders: 0, totalArticles: 0, totalCategories: 0, staleOffers: 0, draftArticles: 0 };
  const [
    [{ count: totalOffers }],
    [{ count: totalProviders }],
    [{ count: totalArticles }],
    [{ count: totalCategories }],
    [{ count: staleOffers }],
    [{ count: draftArticles }],
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(offers).where(eq(offers.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(providers).where(eq(providers.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, "published")),
    db.select({ count: sql<number>`count(*)` }).from(categories).where(eq(categories.isActive, true)),
    db.select({ count: sql<number>`count(*)` }).from(offers).where(and(eq(offers.isActive, true), lt(offers.lastVerifiedAt, new Date(Date.now() - 30 * 86400000)))),
    db.select({ count: sql<number>`count(*)` }).from(articles).where(eq(articles.status, "draft")),
  ]);
  return { totalOffers: Number(totalOffers), totalProviders: Number(totalProviders), totalArticles: Number(totalArticles), totalCategories: Number(totalCategories), staleOffers: Number(staleOffers), draftArticles: Number(draftArticles) };
}

// ─── Offer Events (tracking) ─────────────────────────────────────────────────
export async function trackOfferEvent(data: InsertOfferEvent) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(offerEvents).values(data);
  } catch (e) {
    console.warn("[Tracking] Failed to record event:", e);
  }
}

export async function getOfferStats(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  // Aggregate views, clicks, and last event per offer
  const rows = await db
    .select({
      offerId: offerEvents.offerId,
      eventType: offerEvents.eventType,
      eventCount: sql<number>`count(*)`,
      lastAt: sql<Date>`max(${offerEvents.createdAt})`,
    })
    .from(offerEvents)
    .groupBy(offerEvents.offerId, offerEvents.eventType);

  // Pivot into per-offer objects
  const map = new Map<number, { offerId: number; views: number; clicks: number; lastEventAt: Date | null }>();
  for (const row of rows) {
    if (!map.has(row.offerId)) map.set(row.offerId, { offerId: row.offerId, views: 0, clicks: 0, lastEventAt: null });
    const entry = map.get(row.offerId)!;
    if (row.eventType === "view") { entry.views = Number(row.eventCount); entry.lastEventAt = row.lastAt; }
    else if (row.eventType === "click") { entry.clicks = Number(row.eventCount); if (!entry.lastEventAt || row.lastAt > entry.lastEventAt) entry.lastEventAt = row.lastAt; }
  }

  // Join with offer names, provider, and category
  const offerIds = Array.from(map.keys());
  if (offerIds.length === 0) return [];
  const offerRows = await db
    .select({ id: offers.id, productName: offers.productName, slug: offers.slug, categoryId: offers.categoryId, providerId: offers.providerId })
    .from(offers)
    .where(sql`${offers.id} IN (${sql.join(offerIds.map(id => sql`${id}`), sql`, `)})`);

  const providerMap = new Map<number, string>();
  const provRows = await db.select({ id: providers.id, name: providers.name }).from(providers);
  provRows.forEach(p => providerMap.set(p.id, p.name));

  const categoryMap = new Map<number, string>();
  const catRows = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
  catRows.forEach(c => categoryMap.set(c.id, c.slug));

  return offerRows.map(o => ({
    offerId: o.id,
    productName: o.productName,
    slug: o.slug,
    providerName: providerMap.get(o.providerId) ?? "Unknown",
    categorySlug: categoryMap.get(o.categoryId ?? 0) ?? null,
    views: map.get(o.id)?.views ?? 0,
    clicks: map.get(o.id)?.clicks ?? 0,
    lastEventAt: map.get(o.id)?.lastEventAt ?? null,
    ctr: map.get(o.id)?.views
      ? Math.round(((map.get(o.id)?.clicks ?? 0) / (map.get(o.id)?.views ?? 1)) * 1000) / 10
      : 0,
  })).sort((a, b) => (b.views + b.clicks) - (a.views + a.clicks)).slice(0, limit);
}

// ─── Sitemap Meta ─────────────────────────────────────────────────────────────
export async function recordSitemapGeneration(data: InsertSitemapMeta) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sitemapMeta).values(data);
}

export async function getLatestSitemapMeta() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(sitemapMeta).orderBy(desc(sitemapMeta.generatedAt)).limit(1);
  return result[0];
}

export async function getSitemapCronTaskUid() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ uid: sitemapMeta.scheduleCronTaskUid })
    .from(sitemapMeta)
    .where(sql`${sitemapMeta.scheduleCronTaskUid} IS NOT NULL`)
    .orderBy(desc(sitemapMeta.generatedAt))
    .limit(1);
  return result[0]?.uid ?? undefined;
}

// ─── Sitemap data ─────────────────────────────────────────────────────────────
export async function getSitemapData() {
  const db = await getDb();
  if (!db) return { cats: [], provs: [], offs: [], arts: [] };
  const [cats, provs, offs, arts] = await Promise.all([
    db.select({ slug: categories.slug, updatedAt: categories.updatedAt }).from(categories).where(eq(categories.isActive, true)),
    db.select({ slug: providers.slug, updatedAt: providers.updatedAt }).from(providers).where(eq(providers.isActive, true)),
    db.select({ slug: offers.slug, updatedAt: offers.updatedAt }).from(offers).where(eq(offers.isActive, true)),
    db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.status, "published")),
  ]);
  return { cats, provs, offs, arts };
}
