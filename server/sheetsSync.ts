/**
 * Google Sheets Sync Engine
 * Reads all 7 product sheets and upserts providers + offers into the database.
 * Idempotent — safe to run repeatedly; uses slug as the unique key.
 */
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  categories,
  offers,
  providers,
  syncLog,
  type InsertOffer,
  type InsertProvider,
} from "../drizzle/schema";
import * as fs from "fs";
import * as https from "https";
import { ENV } from "./_core/env";

// ─── Google Sheets API via direct HTTPS ──────────────────────────────────────
// We read the freshest OAuth token from ~/.user_env on every call so the server
// never uses a stale token that was baked into process.env at startup.

const USER_ENV_PATH = "/home/ubuntu/.user_env";

function getFreshGoogleToken(): string {
  try {
    const content = fs.readFileSync(USER_ENV_PATH, "utf8");
    const match = content.match(/GOOGLE_WORKSPACE_CLI_TOKEN="([^"]+)"/);
    if (match?.[1]) return match[1];
  } catch {
    // file not available — fall through to process.env
  }
  const envToken = process.env.GOOGLE_WORKSPACE_CLI_TOKEN || process.env.GOOGLE_DRIVE_TOKEN;
  if (envToken) return envToken;
  throw new Error("No Google OAuth token available — ensure the Google Drive connector is enabled");
}

function fetchSheetValues(
  spreadsheetId: string,
  ranges: string[]
): Promise<Record<string, string[][]>> {
  return new Promise((resolve, reject) => {
    const freshToken = getFreshGoogleToken();
    const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
    const path = `/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchGet?${query}&majorDimension=ROWS`;
    const options: https.RequestOptions = {
      hostname: "sheets.googleapis.com",
      path,
      method: "GET",
      headers: { Authorization: `Bearer ${freshToken}` },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Sheets API error: ${raw.slice(0, 500)}`));
          return;
        }
        try {
          const json = JSON.parse(raw) as {
            valueRanges?: { range: string; values?: string[][] }[];
          };
          const result: Record<string, string[][]> = {};
          for (const vr of json.valueRanges ?? []) {
            result[vr.range] = vr.values ?? [];
          }
          resolve(result);
        } catch (e) {
          reject(new Error(`Sheets API JSON parse error: ${String(e)}`));
        }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

// ─── Sheet → Category slug mapping ───────────────────────────────────────────

const SHEET_TO_CATEGORY: Record<string, string> = {
  "Credit Cards": "credit-cards",
  "Personal Loans": "personal-loans",
  Mortgages: "mortgages",
  "Auto Loans": "auto-loans",
  "Savings Accounts": "savings-accounts",
  "Checking Accounts": "checking-accounts",
  CD: "cds",
};

// ─── Row parsers ──────────────────────────────────────────────────────────────

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseProvider(row: string[]): InsertProvider | null {
  const name = row[0]?.trim();
  const logoUrl = row[1]?.trim();
  const slugRaw = row[2]?.trim();
  const rating = row[3]?.trim();
  const websiteUrl = row[4]?.trim();
  const headquarters = row[5]?.trim();
  const foundedYear = row[6]?.trim();
  const description = row[7]?.trim();
  const editorialSummary = row[8]?.trim();
  const active = row[9]?.trim()?.toLowerCase();

  if (!name) return null;
  // Auto-generate slug from name if the slug column is blank
  const slug = slugRaw || toSlug(name);

  return {
    name,
    slug,
    logoUrl: logoUrl || null,
    websiteUrl: websiteUrl || null,
    headquarters: headquarters || null,
    foundedYear: foundedYear ? parseInt(foundedYear, 10) || null : null,
    description: description || null,
    editorialSummary: editorialSummary || null,
    overallRating: rating ? (parseFloat(rating) as unknown as string) : null,
    isActive: active !== "no" && active !== "false" && active !== "0",
  };
}

function parseOffer(
  row: string[],
  categorySlug: string,
  hasCardType: boolean
): {
  providerSlug: string;
  offer: Partial<InsertOffer>;
} | null {
  let col = 0;
  const providerSlug = row[col++]?.trim();
  const productName = row[col++]?.trim();
  const slug = row[col++]?.trim();
  const tagline = row[col++]?.trim();

  let cardType: string | undefined;
  if (hasCardType) {
    cardType = row[col++]?.trim()?.toLowerCase().replace(/\s+/g, "-");
  }

  const aprMin = row[col++]?.trim();
  const aprMax = row[col++]?.trim();
  const annualFee = row[col++]?.trim();
  const rating = row[col++]?.trim();
  const imageUrl = row[col++]?.trim();
  const rewardsRate = row[col++]?.trim();
  const bonusDetails = row[col++]?.trim();
  const pro1 = row[col++]?.trim();
  const pro2 = row[col++]?.trim();
  const pro3 = row[col++]?.trim();
  const pro4 = row[col++]?.trim();
  const con1 = row[col++]?.trim();
  const con2 = row[col++]?.trim();
  const con3 = row[col++]?.trim();
  const con4 = row[col++]?.trim();
  const editorialSummary = row[col++]?.trim();
  const featured = row[col++]?.trim()?.toLowerCase();
  const active = row[col++]?.trim()?.toLowerCase();
  const trackingUrl = row[col++]?.trim();

  if (!providerSlug || !productName || !slug) return null;

  const pros = [pro1, pro2, pro3, pro4].filter(Boolean) as string[];
  const cons = [con1, con2, con3, con4].filter(Boolean) as string[];

  // Normalize cardType enum
  const validCardTypes = ["cash-back", "travel", "balance-transfer", "credit-builder", "general"];
  const normalizedCardType = cardType && validCardTypes.includes(cardType) ? cardType : "general";

  return {
    providerSlug,
    offer: {
      slug,
      productName,
      tagline: tagline || null,
      aprMin: aprMin ? (parseFloat(aprMin) as unknown as string) : null,
      aprMax: aprMax ? (parseFloat(aprMax) as unknown as string) : null,
      annualFee: annualFee ? (parseFloat(annualFee) as unknown as string) : null,
      overallRating: rating ? (parseFloat(rating) as unknown as string) : null,
      imageUrl: imageUrl || null,
      rewardsRate: rewardsRate || null,
      bonusDetails: bonusDetails || null,
      pros: pros.length ? pros : null,
      cons: cons.length ? cons : null,
      editorialSummary: editorialSummary || null,
      cardType: hasCardType
        ? (normalizedCardType as "cash-back" | "travel" | "balance-transfer" | "credit-builder" | "general")
        : "general",
      trackingUrl: trackingUrl || null,
      isFeatured: featured === "yes" || featured === "true" || featured === "1",
      isActive: active !== "no" && active !== "false" && active !== "0",
      source: "sheets",
      lastVerifiedAt: new Date(),
    },
  };
}

// ─── Main sync function ───────────────────────────────────────────────────────

export async function runSheetsSync(triggeredBy: "manual" | "scheduled" = "manual"): Promise<{
  providersUpserted: number;
  offersUpserted: number;
  errors: string[];
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const spreadsheetId = ENV.sheetsSpreadsheetId;
  if (!spreadsheetId) throw new Error("SHEETS_SPREADSHEET_ID not configured");

  // Create a sync log entry
  const [logEntry] = await db
    .insert(syncLog)
    .values({ triggeredBy, status: "running" })
    .$returningId();
  const logId = logEntry?.id;

  let providersUpserted = 0;
  let offersUpserted = 0;
  const errors: string[] = [];

  try {
    // ── Fetch all sheets in one batch request ──────────────────────────────
    const sheetNames = [
      "Providers",
      "Credit Cards",
      "Personal Loans",
      "Mortgages",
      "Auto Loans",
      "Savings Accounts",
      "Checking Accounts",
      "CD",
    ];
    const ranges = sheetNames.map((s) => `${s}!A1:Z500`);

    const sheetData = await fetchSheetValues(spreadsheetId, ranges);

    // ── Sync Providers ─────────────────────────────────────────────────────
    const providerRangeKey = Object.keys(sheetData).find((k) => k.includes("Providers"));
    const providerRows = providerRangeKey ? sheetData[providerRangeKey] : [];
    const providerDataRows = providerRows.slice(1); // skip header

    for (const row of providerDataRows) {
      if (!row[0]?.trim()) continue; // skip empty rows
      const parsed = parseProvider(row);
      if (!parsed) continue;

      try {
        await db
          .insert(providers)
          .values(parsed)
          .onDuplicateKeyUpdate({
            set: {
              name: parsed.name,
              logoUrl: parsed.logoUrl,
              websiteUrl: parsed.websiteUrl,
              headquarters: parsed.headquarters,
              foundedYear: parsed.foundedYear,
              description: parsed.description,
              editorialSummary: parsed.editorialSummary,
              overallRating: parsed.overallRating,
              isActive: parsed.isActive,
            },
          });
        providersUpserted++;
      } catch (e) {
        errors.push(`Provider "${parsed.slug}": ${String(e)}`);
      }
    }

    // Build provider slug → id map (keyed by both slug AND name-as-slug for flexible matching)
    const allProviders = await db.select({ id: providers.id, slug: providers.slug, name: providers.name }).from(providers);
    const providerMap = new Map<string, number>();
    for (const p of allProviders) {
      providerMap.set(p.slug, p.id);           // match by slug
      providerMap.set(toSlug(p.name), p.id);   // match by name-as-slug (handles sheet using names)
    }

    // Build category slug → id map
    const allCategories = await db.select({ id: categories.id, slug: categories.slug }).from(categories);
    const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

    // ── Sync Offers per sheet ──────────────────────────────────────────────
    for (const [sheetName, categorySlug] of Object.entries(SHEET_TO_CATEGORY)) {
      const rangeKey = Object.keys(sheetData).find((k) => k.includes(sheetName));
      const rows = rangeKey ? sheetData[rangeKey] : [];
      const dataRows = rows.slice(1); // skip header
      const hasCardType = sheetName === "Credit Cards";

      const categoryId = categoryMap.get(categorySlug);
      if (!categoryId) {
        errors.push(`Category not found: ${categorySlug}`);
        continue;
      }

      for (const row of dataRows) {
        if (!row[0]?.trim()) continue; // skip empty rows
        const parsed = parseOffer(row, categorySlug, hasCardType);
        if (!parsed) continue;

        // The sheet may use provider name or slug — normalize to slug for lookup
        const providerLookupKey = toSlug(parsed.providerSlug);
        const providerId = providerMap.get(providerLookupKey) ?? providerMap.get(parsed.providerSlug);
        if (!providerId) {
          errors.push(`Provider not found for offer "${parsed.offer.slug}": ${parsed.providerSlug} (tried slug: ${providerLookupKey})`);
          continue;
        }

        const offerData: InsertOffer = {
          ...(parsed.offer as InsertOffer),
          providerId,
          categoryId,
        };

        try {
          await db
            .insert(offers)
            .values(offerData)
            .onDuplicateKeyUpdate({
              set: {
                productName: offerData.productName,
                tagline: offerData.tagline,
                aprMin: offerData.aprMin,
                aprMax: offerData.aprMax,
                annualFee: offerData.annualFee,
                overallRating: offerData.overallRating,
                imageUrl: offerData.imageUrl,
                rewardsRate: offerData.rewardsRate,
                bonusDetails: offerData.bonusDetails,
                pros: offerData.pros,
                cons: offerData.cons,
                editorialSummary: offerData.editorialSummary,
                cardType: offerData.cardType,
                trackingUrl: offerData.trackingUrl,
                isFeatured: offerData.isFeatured,
                isActive: offerData.isActive,
                source: "sheets",
                lastVerifiedAt: new Date(),
              },
            });
          offersUpserted++;
        } catch (e) {
          errors.push(`Offer "${offerData.slug}": ${String(e)}`);
        }
      }
    }

    // Update sync log with success
    if (logId) {
      await db
        .update(syncLog)
        .set({
          status: "success",
          providersUpserted,
          offersUpserted,
          completedAt: new Date(),
        })
        .where(eq(syncLog.id, logId));
    }
  } catch (e) {
    const errMsg = String(e);
    errors.push(errMsg);
    if (logId) {
      await db
        .update(syncLog)
        .set({
          status: "error",
          errorMessage: errMsg,
          completedAt: new Date(),
        })
        .where(eq(syncLog.id, logId));
    }
    throw e;
  }

  return { providersUpserted, offersUpserted, errors };
}

// ─── Get recent sync logs ─────────────────────────────────────────────────────

export async function getRecentSyncLogs(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(syncLog)
    .orderBy(syncLog.startedAt)
    .limit(limit);
}
