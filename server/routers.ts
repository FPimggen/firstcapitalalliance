import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  addAuditLog,
  createArticle,
  createCategory,
  createContentJob,
  createOffer,
  createProvider,
  deleteArticle,
  deleteCategory,
  deleteOffer,
  deleteProvider,
  getAllArticles,
  getAllCategories,
  getAllOffers,
  getArticleBySlug,
  getArticlesByCategory,
  getAuditLog,
  getCategories,
  getCategoryBySlug,
  getDashboardStats,
  getFeaturedOffers,
  getOfferBySlug,
  getOffersByCategory,
  getOffersByCategorySlug,
  getOffersByProvider,
  getProviderBySlug,
  getProviders,
  getPublishedArticles,
  getRecentJobs,
  getSitemapData,
  getStaleOffers,
  updateArticle,
  updateCategory,
  updateContentJob,
  updateOffer,
  updateProvider,
  upsertPage,
} from "./db";

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Categories router ────────────────────────────────────────────────────────
const categoriesRouter = router({
  list: publicProcedure.query(() => getCategories()),
  listAll: adminProcedure.query(() => getAllCategories()),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => getCategoryBySlug(input.slug)),
  create: adminProcedure
    .input(
      z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        description: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cat = await createCategory(input);
      await addAuditLog({ action: "create", entityType: "category", entitySlug: input.slug, afterState: input, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return cat;
    }),
  update: adminProcedure
    .input(z.object({ id: z.number(), data: z.object({ name: z.string().optional(), description: z.string().optional(), metaTitle: z.string().optional(), metaDescription: z.string().optional(), icon: z.string().optional(), sortOrder: z.number().optional(), isActive: z.boolean().optional() }) }))
    .mutation(async ({ input, ctx }) => {
      await updateCategory(input.id, input.data);
      await addAuditLog({ action: "update", entityType: "category", entityId: input.id, afterState: input.data, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteCategory(input.id);
      await addAuditLog({ action: "delete", entityType: "category", entityId: input.id, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
});

// ─── Providers router ─────────────────────────────────────────────────────────
const providersRouter = router({
  list: publicProcedure.query(() => getProviders()),
  listAll: adminProcedure.query(() => getProviders(false)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const provider = await getProviderBySlug(input.slug);
      if (!provider) throw new TRPCError({ code: "NOT_FOUND" });
      const providerOffers = await getOffersByProvider(provider.id);
      return { provider, offers: providerOffers };
    }),
  create: adminProcedure
    .input(z.object({
      slug: z.string().min(1),
      name: z.string().min(1),
      logoUrl: z.string().optional(),
      websiteUrl: z.string().optional(),
      description: z.string().optional(),
      editorialSummary: z.string().optional(),
      foundedYear: z.number().optional(),
      headquarters: z.string().optional(),
      overallRating: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const prov = await createProvider(input);
      await addAuditLog({ action: "create", entityType: "provider", entitySlug: input.slug, afterState: input, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return prov;
    }),
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        logoUrl: z.string().optional(),
        websiteUrl: z.string().optional(),
        description: z.string().optional(),
        editorialSummary: z.string().optional(),
        foundedYear: z.number().optional(),
        headquarters: z.string().optional(),
        overallRating: z.string().optional(),
        isActive: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      await updateProvider(input.id, input.data);
      await addAuditLog({ action: "update", entityType: "provider", entityId: input.id, afterState: input.data, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteProvider(input.id);
      await addAuditLog({ action: "delete", entityType: "provider", entityId: input.id, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
});

// ─── Offers router ────────────────────────────────────────────────────────────
const offersRouter = router({
  byCategory: publicProcedure
    .input(z.object({ categorySlug: z.string() }))
    .query(({ input }) => getOffersByCategorySlug(input.categorySlug)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await getOfferBySlug(input.slug);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return result;
    }),
  featured: publicProcedure.query(() => getFeaturedOffers(6)),
  listAll: adminProcedure.query(() => getAllOffers()),
  stale: adminProcedure.query(() => getStaleOffers(30)),
  create: adminProcedure
    .input(z.object({
      providerId: z.number(),
      categoryId: z.number(),
      slug: z.string().min(1),
      productName: z.string().min(1),
      tagline: z.string().optional(),
      aprMin: z.string().optional(),
      aprMax: z.string().optional(),
      annualFee: z.string().optional(),
      feeStructure: z.string().optional(),
      rewardsRate: z.string().optional(),
      bonusDetails: z.string().optional(),
      minCreditScore: z.number().optional(),
      maxLoanAmount: z.string().optional(),
      minLoanAmount: z.string().optional(),
      termMin: z.number().optional(),
      termMax: z.number().optional(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
      editorialSummary: z.string().optional(),
      overallRating: z.string().optional(),
      imageUrl: z.string().optional(),
      trackingUrl: z.string().optional(),
      isFeatured: z.boolean().optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const offer = await createOffer({ ...input, lastVerifiedAt: new Date() });
      await addAuditLog({ action: "create", entityType: "offer", entitySlug: input.slug, afterState: input, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return offer;
    }),
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        productName: z.string().optional(),
        tagline: z.string().optional(),
        aprMin: z.string().optional(),
        aprMax: z.string().optional(),
        annualFee: z.string().optional(),
        feeStructure: z.string().optional(),
        rewardsRate: z.string().optional(),
        bonusDetails: z.string().optional(),
        minCreditScore: z.number().optional(),
        pros: z.array(z.string()).optional(),
        cons: z.array(z.string()).optional(),
        editorialSummary: z.string().optional(),
        overallRating: z.string().optional(),
        imageUrl: z.string().optional(),
        trackingUrl: z.string().optional(),
        isFeatured: z.boolean().optional(),
        isActive: z.boolean().optional(),
        lastVerifiedAt: z.date().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      await updateOffer(input.id, input.data);
      await addAuditLog({ action: "update", entityType: "offer", entityId: input.id, afterState: input.data, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteOffer(input.id);
      await addAuditLog({ action: "delete", entityType: "offer", entityId: input.id, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
  markVerified: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await updateOffer(input.id, { lastVerifiedAt: new Date() });
      await addAuditLog({ action: "mark_verified", entityType: "offer", entityId: input.id, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
});

// ─── Articles router ──────────────────────────────────────────────────────────
const articlesRouter = router({
  list: publicProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(({ input }) => getPublishedArticles(input?.limit ?? 20, input?.offset ?? 0)),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await getArticleBySlug(input.slug);
      if (!result) throw new TRPCError({ code: "NOT_FOUND" });
      return result;
    }),
  byCategory: publicProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(({ input }) => getArticlesByCategory(input.categoryId)),
  listAll: adminProcedure.query(() => getAllArticles()),
  create: adminProcedure
    .input(z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      excerpt: z.string().optional(),
      content: z.string().optional(),
      categoryId: z.number().optional(),
      tags: z.array(z.string()).optional(),
      isPillar: z.boolean().optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      author: z.string().optional(),
      hasDisclosure: z.boolean().optional(),
      featuredImageUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = {
        ...input,
        wordCount: input.content ? input.content.split(/\s+/).length : 0,
        publishedAt: input.status === "published" ? new Date() : undefined,
      };
      const article = await createArticle(data);
      await addAuditLog({ action: "create", entityType: "article", entitySlug: input.slug, afterState: input, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return article;
    }),
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        excerpt: z.string().optional(),
        content: z.string().optional(),
        categoryId: z.number().optional(),
        tags: z.array(z.string()).optional(),
        isPillar: z.boolean().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        author: z.string().optional(),
        hasDisclosure: z.boolean().optional(),
        featuredImageUrl: z.string().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const extra: Record<string, unknown> = {};
      if (input.data.content) extra.wordCount = input.data.content.split(/\s+/).length;
      if (input.data.status === "published") extra.publishedAt = new Date();
      await updateArticle(input.id, { ...input.data, ...extra });
      await addAuditLog({ action: "update", entityType: "article", entityId: input.id, afterState: input.data, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteArticle(input.id);
      await addAuditLog({ action: "delete", entityType: "article", entityId: input.id, triggeredBy: ctx.user.name ?? ctx.user.openId });
      return { success: true };
    }),
});

// ─── Admin router ─────────────────────────────────────────────────────────────
const adminRouter = router({
  dashboard: adminProcedure.query(async () => {
    const [stats, recentJobs, recentAudit] = await Promise.all([
      getDashboardStats(),
      getRecentJobs(10),
      getAuditLog(10),
    ]);
    return { stats, recentJobs, recentAudit };
  }),
  auditLog: adminProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(({ input }) => getAuditLog(input?.limit ?? 50)),
  contentQueue: adminProcedure.query(() => getRecentJobs(30)),
  staleOffers: adminProcedure.query(() => getStaleOffers(30)),
});

// ─── AI Agent router ──────────────────────────────────────────────────────────
const agentRouter = router({
  generateSummary: adminProcedure
    .input(z.object({
      productName: z.string(),
      providerName: z.string(),
      aprMin: z.string().optional(),
      aprMax: z.string().optional(),
      annualFee: z.string().optional(),
      rewardsRate: z.string().optional(),
      bonusDetails: z.string().optional(),
      pros: z.array(z.string()).optional(),
      cons: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const jobResult = await createContentJob({ jobType: "generate_summary", status: "running", targetSlug: input.productName });
      const jobId = (jobResult as any).insertId as number;
      try {
        const prompt = `Write a concise, factual editorial summary (2-3 sentences) for the financial product "${input.productName}" by ${input.providerName}.
Key details: APR ${input.aprMin ?? "N/A"}–${input.aprMax ?? "N/A"}%, Annual fee: $${input.annualFee ?? "0"}, Rewards: ${input.rewardsRate ?? "N/A"}, Bonus: ${input.bonusDetails ?? "N/A"}.
Pros: ${(input.pros ?? []).join(", ")}. Cons: ${(input.cons ?? []).join(", ")}.
Write in a neutral, informative tone appropriate for a financial comparison site. Do not make guarantees or promises. Keep it under 100 words.`;
        const response = await invokeLLM({ messages: [{ role: "system", content: "You are an expert financial content writer for a comparison website. Write accurate, compliant, consumer-friendly summaries." }, { role: "user", content: prompt }] });
        const rawSummary = response.choices[0]?.message?.content;
        const summary = typeof rawSummary === 'string' ? rawSummary : "";
        await updateContentJob(jobId, { status: "completed", result: summary, completedAt: new Date() });
        await addAuditLog({ action: "generate_summary", entityType: "offer", entitySlug: input.productName, triggeredBy: ctx.user.name ?? ctx.user.openId });
        return { summary };
      } catch (err) {
        await updateContentJob(jobId, { status: "failed", errorLog: String(err), completedAt: new Date() });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate summary" });
      }
    }),
  generateArticleDraft: adminProcedure
    .input(z.object({
      title: z.string(),
      category: z.string(),
      keywords: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const jobResult = await createContentJob({ jobType: "generate_article", status: "running", targetSlug: input.title });
      const jobId = (jobResult as any).insertId as number;
      try {
        const prompt = `Write a comprehensive, SEO-optimized article draft for a personal finance comparison website.
Title: "${input.title}"
Category: ${input.category}
Target keywords: ${(input.keywords ?? []).join(", ")}

Structure the article with:
1. An engaging introduction (2-3 paragraphs)
2. 3-4 main sections with H2 headings
3. A FAQ section with 3-5 questions and answers
4. A conclusion with a clear call to action

Requirements:
- Write in a clear, authoritative, consumer-friendly tone
- Include factual information only — no made-up statistics
- Add an affiliate disclosure note at the top
- Target 800-1200 words
- Format in Markdown`;
        const response = await invokeLLM({ messages: [{ role: "system", content: "You are a senior financial content strategist writing for a trusted comparison website. Your content is accurate, helpful, and compliant with financial advertising standards." }, { role: "user", content: prompt }] });
        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === 'string' ? rawContent : "";
        const wordCount = content.split(/\s+/).length;
        await updateContentJob(jobId, { status: "completed", result: content, completedAt: new Date() });
        await addAuditLog({ action: "generate_article", entityType: "article", entitySlug: input.title, triggeredBy: ctx.user.name ?? ctx.user.openId });
        return { content, wordCount };
      } catch (err) {
        await updateContentJob(jobId, { status: "failed", errorLog: String(err), completedAt: new Date() });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate article draft" });
      }
    }),
  flagStaleOffers: adminProcedure.mutation(async ({ ctx }) => {
    const stale = await getStaleOffers(30);
    await createContentJob({ jobType: "flag_stale", status: "completed", result: `Flagged ${stale.length} stale offers`, completedAt: new Date() });
    await addAuditLog({ action: "flag_stale_offers", entityType: "offer", triggeredBy: ctx.user.name ?? ctx.user.openId });
    return { flaggedCount: stale.length, offers: stale };
  }),
});

// ─── Sitemap router ───────────────────────────────────────────────────────────
const sitemapRouter = router({
  data: publicProcedure.query(() => getSitemapData()),
});

// ─── App router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  categories: categoriesRouter,
  providers: providersRouter,
  offers: offersRouter,
  articles: articlesRouter,
  admin: adminRouter,
  agent: agentRouter,
  sitemap: sitemapRouter,
});

export type AppRouter = typeof appRouter;
