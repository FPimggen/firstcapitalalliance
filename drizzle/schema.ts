import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
  index,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  icon: varchar("icon", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

// ─── Providers ───────────────────────────────────────────────────────────────
export const providers = mysqlTable("providers", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  logoUrl: text("logoUrl"),
  websiteUrl: text("websiteUrl"),
  description: text("description"),
  editorialSummary: text("editorialSummary"),
  foundedYear: int("foundedYear"),
  headquarters: varchar("headquarters", { length: 128 }),
  overallRating: decimal("overallRating", { precision: 3, scale: 1 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Provider = typeof providers.$inferSelect;
export type InsertProvider = typeof providers.$inferInsert;

// ─── Offers ──────────────────────────────────────────────────────────────────
export const offers = mysqlTable(
  "offers",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull(),
    categoryId: int("categoryId").notNull(),
    slug: varchar("slug", { length: 128 }).notNull().unique(),
    productName: varchar("productName", { length: 255 }).notNull(),
    tagline: varchar("tagline", { length: 255 }),
    aprMin: decimal("aprMin", { precision: 5, scale: 2 }),
    aprMax: decimal("aprMax", { precision: 5, scale: 2 }),
    annualFee: decimal("annualFee", { precision: 8, scale: 2 }),
    feeStructure: text("feeStructure"),
    rewardsRate: varchar("rewardsRate", { length: 128 }),
    bonusDetails: text("bonusDetails"),
    minCreditScore: int("minCreditScore"),
    maxLoanAmount: decimal("maxLoanAmount", { precision: 12, scale: 2 }),
    minLoanAmount: decimal("minLoanAmount", { precision: 12, scale: 2 }),
    termMin: int("termMin"),
    termMax: int("termMax"),
    pros: json("pros").$type<string[]>(),
    cons: json("cons").$type<string[]>(),
    editorialSummary: text("editorialSummary"),
    overallRating: decimal("overallRating", { precision: 3, scale: 1 }),
    cardType: mysqlEnum("cardType", ["cash-back", "travel", "balance-transfer", "credit-builder", "general"]).default("general"),
    imageUrl: text("imageUrl"),
    trackingUrl: text("trackingUrl"),
    source: varchar("source", { length: 64 }).default("manual"),
    sourceId: varchar("sourceId", { length: 128 }),
    isFeatured: boolean("isFeatured").default(false).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    lastVerifiedAt: timestamp("lastVerifiedAt").defaultNow(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("idx_offers_category").on(t.categoryId),
    index("idx_offers_provider").on(t.providerId),
    index("idx_offers_active").on(t.isActive),
  ]
);

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

// ─── Articles ─────────────────────────────────────────────────────────────────
export const articles = mysqlTable(
  "articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    metaTitle: varchar("metaTitle", { length: 255 }),
    metaDescription: text("metaDescription"),
    excerpt: text("excerpt"),
    content: text("content"),
    categoryId: int("categoryId"),
    tags: json("tags").$type<string[]>(),
    isPillar: boolean("isPillar").default(false).notNull(),
    status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
    author: varchar("author", { length: 128 }).default("Editorial Team"),
    wordCount: int("wordCount").default(0),
    hasDisclosure: boolean("hasDisclosure").default(true).notNull(),
    featuredImageUrl: text("featuredImageUrl"),
    publishedAt: timestamp("publishedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    index("idx_articles_status").on(t.status),
    index("idx_articles_category").on(t.categoryId),
  ]
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ─── Static Pages ─────────────────────────────────────────────────────────────
export const pages = mysqlTable("pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  content: text("content"),
  status: mysqlEnum("status", ["draft", "published"]).default("published").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

// ─── Offer → Page mapping ─────────────────────────────────────────────────────
export const offerPageMap = mysqlTable("offer_page_map", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  pageSlug: varchar("pageSlug", { length: 255 }).notNull(),
  position: int("position").default(0),
  isFeatured: boolean("isFeatured").default(false).notNull(),
});

// ─── Content Jobs ─────────────────────────────────────────────────────────────
export const contentJobs = mysqlTable("content_jobs", {
  id: int("id").autoincrement().primaryKey(),
  jobType: mysqlEnum("jobType", [
    "generate_summary",
    "generate_article",
    "refresh_offers",
    "site_audit",
    "update_sitemap",
    "flag_stale",
  ]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  targetSlug: varchar("targetSlug", { length: 255 }),
  payload: json("payload"),
  result: text("result"),
  errorLog: text("errorLog"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ContentJob = typeof contentJobs.$inferSelect;
export type InsertContentJob = typeof contentJobs.$inferInsert;

// ─── Audit Log ────────────────────────────────────────────────────────────────
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    action: varchar("action", { length: 64 }).notNull(),
    entityType: varchar("entityType", { length: 64 }).notNull(),
    entityId: int("entityId"),
    entitySlug: varchar("entitySlug", { length: 255 }),
    beforeState: json("beforeState"),
    afterState: json("afterState"),
    triggeredBy: varchar("triggeredBy", { length: 128 }).default("system"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => [index("idx_audit_entity").on(t.entityType, t.entityId)]
);

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

// ─── Sync Log ────────────────────────────────────────────────────────────────
export const syncLog = mysqlTable("sync_log", {
  id: int("id").autoincrement().primaryKey(),
  triggeredBy: mysqlEnum("triggeredBy", ["manual", "scheduled"]).notNull().default("manual"),
  status: mysqlEnum("status", ["running", "success", "error"]).notNull().default("running"),
  providersUpserted: int("providersUpserted").default(0),
  offersUpserted: int("offersUpserted").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type SyncLog = typeof syncLog.$inferSelect;
export type InsertSyncLog = typeof syncLog.$inferInsert;
