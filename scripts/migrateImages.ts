/**
 * Image Migration Script
 * Downloads external imageUrl/logoUrl values from the DB,
 * uploads them to S3 via storagePut(), and updates DB records.
 *
 * Run: npx tsx scripts/migrateImages.ts
 */

import { getDb } from "../server/db";
import { storagePut } from "../server/storage";
import { offers, providers } from "../drizzle/schema";
import { eq, isNotNull, ne, and, notLike } from "drizzle-orm";
import https from "https";
import http from "http";
import { URL } from "url";

// Fetch a URL and return a Buffer + content-type
async function fetchImage(url: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(url);
      const lib = parsed.protocol === "https:" ? https : http;
      const req = lib.get(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FirstCapitalAlliance/1.0)",
          Accept: "image/*,*/*",
        },
        timeout: 15000,
      }, (res) => {
        // Follow redirects (up to 5)
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          fetchImage(redirectUrl).then(resolve);
          return;
        }
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          console.warn(`  HTTP ${res.statusCode} for ${url}`);
          resolve(null);
          return;
        }
        const contentType = res.headers["content-type"] || "image/jpeg";
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType }));
        res.on("error", () => resolve(null));
      });
      req.on("error", (e) => {
        console.warn(`  Fetch error for ${url}: ${e.message}`);
        resolve(null);
      });
      req.on("timeout", () => {
        req.destroy();
        console.warn(`  Timeout for ${url}`);
        resolve(null);
      });
    } catch (e) {
      console.warn(`  Invalid URL: ${url}`);
      resolve(null);
    }
  });
}

function getExtension(contentType: string, url: string): string {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (url.toLowerCase().includes(".svg")) return "svg";
  if (url.toLowerCase().includes(".png")) return "png";
  if (url.toLowerCase().includes(".webp")) return "webp";
  if (url.toLowerCase().includes(".gif")) return "gif";
  return "jpg";
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function migrateProviderLogos() {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Get all providers with external logoUrls
  const allProviders = await db
    .select({ id: providers.id, name: providers.name, logoUrl: providers.logoUrl })
    .from(providers)
    .where(and(isNotNull(providers.logoUrl), ne(providers.logoUrl, "")));

  const external = allProviders.filter(
    (p) => p.logoUrl && !p.logoUrl.startsWith("/manus-storage")
  );

  console.log(`\n=== Provider Logos: ${external.length} external URLs to migrate ===`);

  let success = 0;
  let failed = 0;

  for (const provider of external) {
    const url = provider.logoUrl!;
    console.log(`\n[${provider.id}] ${provider.name}`);
    console.log(`  FROM: ${url.substring(0, 80)}`);

    const result = await fetchImage(url);
    if (!result) {
      console.log(`  SKIP: fetch failed`);
      failed++;
      continue;
    }

    const ext = getExtension(result.contentType, url);
    const key = `provider-logos/${slugify(provider.name)}-${provider.id}.${ext}`;
    const { url: storageUrl } = await storagePut(key, result.buffer, result.contentType);

    await db
      .update(providers)
      .set({ logoUrl: storageUrl })
      .where(eq(providers.id, provider.id));

    console.log(`  TO:   ${storageUrl}`);
    success++;
  }

  console.log(`\nProvider logos: ${success} migrated, ${failed} failed`);
}

async function migrateOfferImages() {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  const allOffers = await db
    .select({ id: offers.id, productName: offers.productName, imageUrl: offers.imageUrl })
    .from(offers)
    .where(and(isNotNull(offers.imageUrl), ne(offers.imageUrl, "")));

  const external = allOffers.filter(
    (o) => o.imageUrl && !o.imageUrl.startsWith("/manus-storage")
  );

  console.log(`\n=== Offer Images: ${external.length} external URLs to migrate ===`);

  let success = 0;
  let failed = 0;

  for (const offer of external) {
    const url = offer.imageUrl!;
    console.log(`\n[${offer.id}] ${offer.productName}`);
    console.log(`  FROM: ${url.substring(0, 80)}`);

    const result = await fetchImage(url);
    if (!result) {
      console.log(`  SKIP: fetch failed`);
      failed++;
      continue;
    }

    const ext = getExtension(result.contentType, url);
    const key = `offer-images/${slugify(offer.productName || "offer")}-${offer.id}.${ext}`;
    const { url: storageUrl } = await storagePut(key, result.buffer, result.contentType);

    await db
      .update(offers)
      .set({ imageUrl: storageUrl })
      .where(eq(offers.id, offer.id));

    console.log(`  TO:   ${storageUrl}`);
    success++;
  }

  console.log(`\nOffer images: ${success} migrated, ${failed} failed`);
}

async function main() {
  console.log("Starting image migration...");
  await migrateProviderLogos();
  await migrateOfferImages();
  console.log("\nMigration complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
