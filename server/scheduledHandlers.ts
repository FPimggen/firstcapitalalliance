import type { Request, Response } from "express";
import { sdk } from "./_core/sdk";
import { getDb, recordSitemapGeneration } from "./db";
import { offers, categories, articles, providers, sitemapMeta } from "../drizzle/schema";
import { lt, and, isNull, or, eq, count } from "drizzle-orm";
import { runSheetsSync } from "./sheetsSync";

/**
 * POST /api/scheduled/offer-audit
 * Heartbeat cron: flags offers not verified in 30+ days.
 * Runs daily via manus-heartbeat project-level cron.
 */
export async function handleOfferAudit(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Find active offers not verified in 30+ days
    const staleOffers = await db
      .select({ id: offers.id, productName: offers.productName })
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          or(
            isNull(offers.lastVerifiedAt),
            lt(offers.lastVerifiedAt, thirtyDaysAgo)
          )
        )
      );

    // Log audit result
    console.log(`[Offer Audit] Found ${staleOffers.length} stale offers needing verification`);

    return res.json({
      ok: true,
      flaggedCount: staleOffers.length,
      staleOfferIds: staleOffers.map((o) => o.id),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Offer Audit] Error:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * POST /api/scheduled/sheets-sync
 * Heartbeat cron: syncs providers and offers from Google Sheets every 6 hours.
 */
export async function handleSheetsSync(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }

    const result = await runSheetsSync("scheduled");
    console.log(`[Sheets Sync] Completed: ${result.providersUpserted} providers, ${result.offersUpserted} offers`);

    return res.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Sheets Sync] Error:", err);
    return res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * GET /sitemap.xml
 * Dynamically generated sitemap for all public pages.
 */
export async function handleSitemap(req: Request, res: Response) {
  try {
    const db = await getDb();
    const BASE = "https://firstcapitalalliance.com";
    const now = new Date().toISOString().split("T")[0];

    const staticUrls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [
      { loc: BASE, priority: "1.0", changefreq: "daily" },
      { loc: `${BASE}/credit-cards`, priority: "0.9", changefreq: "daily" },
      { loc: `${BASE}/personal-loans`, priority: "0.9", changefreq: "daily" },
      { loc: `${BASE}/mortgages`, priority: "0.9", changefreq: "daily" },
      { loc: `${BASE}/auto-loans`, priority: "0.9", changefreq: "daily" },
      { loc: `${BASE}/savings-accounts`, priority: "0.9", changefreq: "daily" },
      { loc: `${BASE}/providers`, priority: "0.7", changefreq: "weekly" },
      { loc: `${BASE}/learn`, priority: "0.7", changefreq: "daily" },
      { loc: `${BASE}/disclosure`, priority: "0.3", changefreq: "monthly" },
      { loc: `${BASE}/editorial-policy`, priority: "0.3", changefreq: "monthly" },
      { loc: `${BASE}/methodology`, priority: "0.3", changefreq: "monthly" },
      { loc: `${BASE}/how-we-make-money`, priority: "0.3", changefreq: "monthly" },
    ];

    let dynamicUrls: { loc: string; priority: string; changefreq: string; lastmod?: string }[] = [];

    if (db) {
      const [allOffers, allProviders, allArticles, allCategories] = await Promise.all([
        db.select({ slug: offers.slug, updatedAt: offers.updatedAt }).from(offers).where(eq(offers.isActive, true)),
        db.select({ slug: providers.slug, updatedAt: providers.updatedAt }).from(providers).where(eq(providers.isActive, true)),
        db.select({ slug: articles.slug, updatedAt: articles.updatedAt }).from(articles).where(eq(articles.status, "published")),
        db.select({ slug: categories.slug }).from(categories).where(eq(categories.isActive, true)),
      ]);

      dynamicUrls = [
        ...allOffers.map((o) => ({ loc: `${BASE}/offers/${o.slug}`, priority: "0.8", changefreq: "weekly", lastmod: o.updatedAt.toISOString().split("T")[0] })),
        ...allProviders.map((p) => ({ loc: `${BASE}/providers/${p.slug}`, priority: "0.7", changefreq: "weekly", lastmod: p.updatedAt.toISOString().split("T")[0] })),
        ...allArticles.map((a) => ({ loc: `${BASE}/learn/${a.slug}`, priority: "0.8", changefreq: "weekly", lastmod: a.updatedAt.toISOString().split("T")[0] })),
      ];
    }

    const allUrls = [...staticUrls, ...dynamicUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod ?? now}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    return res.send(xml);
  } catch (err: any) {
    console.error("[Sitemap] Error:", err);
    return res.status(500).send("Sitemap generation failed");
  }
}

/**
 * POST /api/scheduled/sitemap-regen
 * Heartbeat cron: records a sitemap generation event every 7 days.
 * The sitemap itself is generated dynamically on every GET /sitemap.xml request.
 * This cron records the scheduled generation in sitemap_meta for admin visibility.
 */
export async function handleSitemapRegen(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only endpoint" });
    }

    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database unavailable" });
    }

    // Count current public URLs
    const [activeOffers, activeProviders, publishedArticles, activeCategories] = await Promise.all([
      db.select({ c: count() }).from(offers).where(eq(offers.isActive, true)),
      db.select({ c: count() }).from(providers).where(eq(providers.isActive, true)),
      db.select({ c: count() }).from(articles).where(eq(articles.status, "published")),
      db.select({ c: count() }).from(categories).where(eq(categories.isActive, true)),
    ]);

    const staticRouteCount = 25; // approximate static routes
    const urlCount =
      staticRouteCount +
      (activeOffers[0]?.c ?? 0) +
      (activeProviders[0]?.c ?? 0) +
      (publishedArticles[0]?.c ?? 0) +
      (activeCategories[0]?.c ?? 0);

    await recordSitemapGeneration({ urlCount, triggeredBy: "scheduled" });

    console.log(`[Sitemap Regen] Recorded scheduled generation: ${urlCount} URLs`);
    return res.json({
      ok: true,
      urlCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[Sitemap Regen] Error:", err);
    return res.status(500).json({
      error: err.message,
      stack: err.stack,
      context: { url: req.url, taskUid: (err as any).taskUid },
      timestamp: new Date().toISOString(),
    });
  }
}
