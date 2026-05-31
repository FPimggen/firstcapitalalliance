import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module so tests don't need a real database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Credit Cards", slug: "credit-cards", description: "Compare credit cards", icon: "💳", sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 2, name: "Personal Loans", slug: "personal-loans", description: "Compare personal loans", icon: "💰", sortOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getCategoryBySlug: vi.fn().mockResolvedValue({ id: 1, name: "Credit Cards", slug: "credit-cards", description: "Compare credit cards", icon: "💳", sortOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() }),
  getOffersByCategory: vi.fn().mockResolvedValue([]),
  getOffersByCategorySlug: vi.fn().mockResolvedValue([
    { id: 1, productName: "Chase Sapphire Preferred", slug: "chase-sapphire-preferred", tagline: "Earn big on travel", providerId: 1, categoryId: 1, aprMin: "20.99", aprMax: "27.99", annualFee: "95", rewardsRate: "3x dining", bonusDetails: "60,000 points", minCreditScore: 670, overallRating: "4.7", editorialSummary: "Great card", pros: "[]", cons: "[]", trackingUrl: null, isFeatured: true, isActive: true, lastVerifiedAt: new Date(), createdAt: new Date(), updatedAt: new Date(), providerName: "Chase", providerSlug: "chase", categoryName: "Credit Cards", categorySlug: "credit-cards" },
  ]),
  getOfferBySlug: vi.fn().mockResolvedValue(null),
  getFeaturedOffers: vi.fn().mockResolvedValue([]),
  getAllOffers: vi.fn().mockResolvedValue([]),
  getOffersByProvider: vi.fn().mockResolvedValue([]),
  getStaleOffers: vi.fn().mockResolvedValue([]),
  getAllCategories: vi.fn().mockResolvedValue([]),
  getArticlesByCategory: vi.fn().mockResolvedValue([]),
  getAllArticles: vi.fn().mockResolvedValue([]),
  getPublishedArticles: vi.fn().mockResolvedValue([]),
  createOffer: vi.fn(),
  updateOffer: vi.fn(),
  deleteOffer: vi.fn(),
  createProvider: vi.fn(),
  updateProvider: vi.fn(),
  deleteProvider: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  deleteArticle: vi.fn(),
  logAuditEvent: vi.fn(),
  getProviders: vi.fn().mockResolvedValue([
    { id: 1, name: "Chase", slug: "chase", description: "Big bank", editorialSummary: "Great", websiteUrl: "https://chase.com", headquarters: "NY", foundedYear: 1799, overallRating: "4.5", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ]),
  getProviderBySlug: vi.fn().mockResolvedValue(null),
  getArticles: vi.fn().mockResolvedValue([]),
  getArticleBySlug: vi.fn().mockResolvedValue(null),
  getDashboardStats: vi.fn().mockResolvedValue({ totalOffers: 8, activeOffers: 8, totalProviders: 6, totalArticles: 2, totalCategories: 5, staleOffers: 0 }),
  getAuditLog: vi.fn().mockResolvedValue([]),
  getRecentJobs: vi.fn().mockResolvedValue([]),
  logAuditEvent: vi.fn(),
  deleteArticle: vi.fn(),
  createArticle: vi.fn(),
  updateArticle: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  createProvider: vi.fn(),
  updateProvider: vi.fn(),
  deleteProvider: vi.fn(),
  createOffer: vi.fn(),
  updateOffer: vi.fn(),
  deleteOffer: vi.fn(),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@firstcapitalalliance.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("categories router", () => {
  it("returns all active categories", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].slug).toBe("credit-cards");
  });

  it("returns a category by slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.bySlug({ slug: "credit-cards" });
    expect(result).not.toBeNull();
    expect(result?.name).toBe("Credit Cards");
  });
});

describe("offers router", () => {
  it("returns offers by category", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.offers.byCategory({ categorySlug: "credit-cards" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].productName).toBe("Chase Sapphire Preferred");
  });

  it("returns featured offers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.offers.featured({ limit: 3 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("providers router", () => {
  it("returns all active providers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.providers.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("Chase");
  });
});

describe("admin router", () => {
  it("rejects unauthenticated access to admin stats", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("rejects non-admin user access to admin stats", async () => {
    const ctx = createPublicContext();
    ctx.user = {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "Regular User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });

  it("allows admin access to dashboard", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.admin.dashboard();
    expect(result).toHaveProperty("stats");
    expect(result.stats.totalOffers).toBe(8);
  });
});

describe("auth router", () => {
  it("returns null user for unauthenticated requests", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated requests", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
  });
});
