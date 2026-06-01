/**
 * GitHub Card Sync Pipeline
 *
 * Three-phase daily pipeline:
 *   Phase 1 — Fetch JSON from GitHub, upsert non-protected columns into the
 *              Google Sheet "Credit Cards" tab.
 *              Protected (never overwritten): Card Type, Slug, Min Credit Score,
 *              Overall Rating, Pro #1-4, Con #1-4, Featured?, Active?
 *   Phase 2 — For rows that still have blank editorial fields (Tagline,
 *              Rewards Rate, Welcome Bonus, Editorial Summary), call the LLM
 *              to generate content and write it back to the sheet.
 *   Phase 3 — Trigger the existing Sheets→DB sync so the database reflects
 *              all changes.
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as https from "https";
import { invokeLLM } from "./_core/llm";
import { runSheetsSync } from "./sheetsSync";
import { ENV } from "./_core/env";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_ENV_PATH = "/home/ubuntu/.user_env";
const GWS_BIN = "/home/ubuntu/.local/share/pnpm/bin/gws";

function getFreshGoogleToken(): string {
  try {
    const content = fs.readFileSync(USER_ENV_PATH, "utf8");
    const match = content.match(/GOOGLE_WORKSPACE_CLI_TOKEN="([^"]+)"/);
    if (match?.[1]) return match[1];
  } catch {
    // fall through
  }
  const envToken = process.env.GOOGLE_WORKSPACE_CLI_TOKEN || process.env.GOOGLE_DRIVE_TOKEN;
  if (envToken) return envToken;
  throw new Error("No Google OAuth token available");
}

function gwsExec(params: object): unknown {
  const freshToken = getFreshGoogleToken();
  const cmd = `${GWS_BIN} sheets spreadsheets values batchGet --params ${JSON.stringify(JSON.stringify(params))}`;
  const stdout = execSync(cmd, {
    encoding: "utf8",
    timeout: 60000,
    env: { ...process.env, GOOGLE_WORKSPACE_CLI_TOKEN: freshToken },
  });
  return JSON.parse(stdout);
}

/**
 * Direct HTTPS call to the Sheets batchUpdate API.
 * Uses Node's built-in https module so there is no shell argument size limit.
 */
function gwsBatchUpdate(spreadsheetId: string, data: { range: string; values: string[][] }[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const freshToken = getFreshGoogleToken();
    const body = JSON.stringify({
      valueInputOption: "USER_ENTERED",
      data,
    });
    const bodyBuf = Buffer.from(body, "utf8");
    const options: https.RequestOptions = {
      hostname: "sheets.googleapis.com",
      path: `/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values:batchUpdate`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${freshToken}`,
        "Content-Type": "application/json",
        "Content-Length": bodyBuf.length,
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Sheets API error ${res.statusCode}: ${raw.slice(0, 300)}`));
        }
      });
    });
    req.on("error", reject);
    req.write(bodyBuf);
    req.end();
  });
}

/** Convert any string to kebab-case slug (no underscores, no special chars) */
function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[_\s]+/g, "-")       // underscores and spaces → hyphens
    .replace(/[^a-z0-9-]/g, "")    // strip everything else
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
}

/** Convert SCREAMING_SNAKE issuer code to a human-readable provider name */
function issuerToProviderName(issuer: string): string {
  const MAP: Record<string, string> = {
    AMERICAN_EXPRESS: "American Express",
    BANK_OF_AMERICA: "Bank of America",
    BARCLAYS: "Barclays",
    BREX: "Brex",
    CAPITAL_ONE: "Capital One",
    CHASE: "Chase",
    CITI: "Citi",
    COMENITY: "Comenity",
    DISCOVER: "Discover",
    FIRST: "First National Bank",
    FNBO: "First National Bank of Omaha",
    PENFED: "PenFed Credit Union",
    PNC: "PNC Financial Services",
    SYNCHRONY: "Synchrony",
    US_BANK: "US Bank",
    WEB_BANK: "WebBank",
    WELLS_FARGO: "Wells Fargo",
  };
  if (MAP[issuer]) return MAP[issuer];
  // Fallback: replace underscores with spaces and title-case
  return issuer
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Format the bonus offer into a human-readable string */
function formatBonus(card: GithubCard): string {
  const offer = card.offers?.[0];
  if (!offer) return "";
  const points = offer.amount?.[0]?.amount;
  if (!points) return "";
  const currency = card.currency ?? "";
  const spend = offer.spend;
  const days = offer.days;
  const credits = offer.credits
    ?.map((c) => `${c.description}: $${c.value}`)
    .join(", ");

  let bonus = "";
  if (currency && currency !== "USD") {
    bonus = `Earn ${points.toLocaleString()} ${currency} points`;
  } else {
    bonus = `Earn ${points.toLocaleString()} points`;
  }
  if (spend && days) {
    bonus += ` after spending $${spend.toLocaleString()} in the first ${days} days`;
  }
  if (credits) {
    bonus += `. Includes: ${credits}`;
  }
  return bonus;
}

// ─── GitHub JSON types ────────────────────────────────────────────────────────

interface GithubCardOffer {
  spend: number;
  amount: { amount: number }[];
  days: number;
  credits: { description: string; value: number; weight: number }[];
}

interface GithubCard {
  cardId: string;
  name: string;
  issuer: string;
  network: string;
  currency: string;
  isBusiness: boolean;
  annualFee: number;
  isAnnualFeeWaived: boolean;
  universalCashbackPercent: number;
  url: string;
  imageUrl: string;
  offers: GithubCardOffer[];
  discontinued: boolean;
}

// ─── Column indices (0-based) in the Credit Cards sheet ──────────────────────
// A=0  Provider
// B=1  Product Name
// C=2  Slug                    ← PROTECTED
// D=3  Tagline
// E=4  Card Type               ← PROTECTED
// F=5  Min Credit Score        ← PROTECTED
// G=6  APR Min
// H=7  APR Max
// I=8  Annual Fee
// J=9  Overall Rating          ← PROTECTED
// K=10 Image URL
// L=11 Rewards Rate
// M=12 Welcome Bonus
// N=13 Pro #1                  ← PROTECTED
// O=14 Pro #2                  ← PROTECTED
// P=15 Pro #3                  ← PROTECTED
// Q=16 Pro #4                  ← PROTECTED
// R=17 Con #1                  ← PROTECTED
// S=18 Con #2                  ← PROTECTED
// T=19 Con #3                  ← PROTECTED
// U=20 Con #4                  ← PROTECTED
// V=21 Editorial Summary
// W=22 Featured?               ← PROTECTED
// X=23 Active?                 ← PROTECTED
// Y=24 Tracking/Apply URL

const COL = {
  PROVIDER: 0,
  PRODUCT_NAME: 1,
  SLUG: 2,           // PROTECTED
  TAGLINE: 3,
  CARD_TYPE: 4,      // PROTECTED
  MIN_CREDIT: 5,     // PROTECTED
  APR_MIN: 6,
  APR_MAX: 7,
  ANNUAL_FEE: 8,
  RATING: 9,         // PROTECTED
  IMAGE_URL: 10,
  REWARDS_RATE: 11,
  BONUS: 12,
  PRO1: 13,          // PROTECTED
  PRO2: 14,          // PROTECTED
  PRO3: 15,          // PROTECTED
  PRO4: 16,          // PROTECTED
  CON1: 17,          // PROTECTED
  CON2: 18,          // PROTECTED
  CON3: 19,          // PROTECTED
  CON4: 20,          // PROTECTED
  EDITORIAL: 21,
  FEATURED: 22,      // PROTECTED
  ACTIVE: 23,        // PROTECTED
  TRACKING_URL: 24,
};

// ─── Phase 1: GitHub JSON → Google Sheet ─────────────────────────────────────

async function phase1_githubToSheet(spreadsheetId: string): Promise<{
  added: number;
  updated: number;
  skipped: number;
}> {
  console.log("[GithubSync] Phase 1: Fetching GitHub JSON...");

  // Fetch GitHub data
  const response = await fetch(
    "https://raw.githubusercontent.com/andenacitelli/credit-card-bonuses-api/main/exports/data.json"
  );
  if (!response.ok) throw new Error(`GitHub fetch failed: ${response.status}`);
  const githubCards: GithubCard[] = await response.json();

  console.log(`[GithubSync] Phase 1: Got ${githubCards.length} cards from GitHub`);

  // Fetch current sheet data (all rows including header)
  const sheetResult = gwsExec({
    spreadsheetId,
    ranges: ["Credit Cards!A1:Y500"],
  }) as { valueRanges: { range: string; values: string[][] }[] };

  const allRows: string[][] = sheetResult.valueRanges?.[0]?.values ?? [];
  const headerRow = allRows[0] ?? [];
  const dataRows = allRows.slice(1); // rows 2..N (0-indexed: index 0 = sheet row 2)

  // Build a map of existing rows: slug → { rowIndex (1-based in dataRows), row }
  const existingBySlug = new Map<string, { idx: number; row: string[] }>();
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const slug = row[COL.SLUG]?.trim();
    if (slug) existingBySlug.set(slug, { idx: i, row });
  }

  // Also build a name-based lookup for matching GitHub cards to existing rows
  const existingByName = new Map<string, { idx: number; row: string[] }>();
  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const name = row[COL.PRODUCT_NAME]?.trim();
    if (name) existingByName.set(toSlug(name), { idx: i, row });
  }

  // We'll collect batchUpdate data entries
  const updates: { range: string; values: string[][] }[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Next available row for new cards (1-based sheet row, header is row 1)
  let nextNewRow = dataRows.length + 2; // +1 for header, +1 for 1-based

  for (const card of githubCards) {
    if (card.discontinued) {
      skipped++;
      continue; // skip discontinued cards
    }

    const providerName = issuerToProviderName(card.issuer);
    const cardSlug = toSlug(card.name);
    const bonusText = formatBonus(card);
    const annualFee = card.annualFee?.toString() ?? "";
    // imageUrl from GitHub is a relative path like /images/amex/foo.jpg — skip it
    // since our sheet uses full URLs. Only use if it starts with http.
    const imageUrl = card.imageUrl?.startsWith("http") ? card.imageUrl : "";
    const trackingUrl = card.url ?? "";
    const rewardsRate =
      card.universalCashbackPercent && card.universalCashbackPercent > 0
        ? `${card.universalCashbackPercent}% cash back on all purchases`
        : "";

    // Try to find an existing row by slug, then by name-slug
    const existing =
      existingBySlug.get(cardSlug) ??
      existingByName.get(cardSlug);

    if (existing) {
      // UPDATE — only overwrite non-protected, non-empty-in-sheet columns
      const row = [...existing.row];
      const sheetRow = existing.idx + 2; // 1-based sheet row (header = row 1)

      // Ensure row is long enough
      while (row.length <= COL.TRACKING_URL) row.push("");

      // Provider name (always update — normalize away underscores)
      row[COL.PROVIDER] = providerName;

      // Product Name (update if blank)
      if (!row[COL.PRODUCT_NAME]?.trim()) row[COL.PRODUCT_NAME] = card.name;

      // Annual Fee (update if blank)
      if (!row[COL.ANNUAL_FEE]?.trim()) row[COL.ANNUAL_FEE] = annualFee;

      // Image URL (update if blank)
      if (!row[COL.IMAGE_URL]?.trim() && imageUrl) row[COL.IMAGE_URL] = imageUrl;

      // Welcome Bonus (update if blank)
      if (!row[COL.BONUS]?.trim() && bonusText) row[COL.BONUS] = bonusText;

      // Rewards Rate (update if blank)
      if (!row[COL.REWARDS_RATE]?.trim() && rewardsRate) row[COL.REWARDS_RATE] = rewardsRate;

      // Tracking URL (update if blank)
      if (!row[COL.TRACKING_URL]?.trim() && trackingUrl) row[COL.TRACKING_URL] = trackingUrl;

      // Pad to 25 columns
      while (row.length < 25) row.push("");

      updates.push({
        range: `Credit Cards!A${sheetRow}:Y${sheetRow}`,
        values: [row.slice(0, 25)],
      });
      updated++;
    } else {
      // ADD — new row at the bottom
      const newRow = new Array(25).fill("");
      newRow[COL.PROVIDER] = providerName;
      newRow[COL.PRODUCT_NAME] = card.name;
      newRow[COL.SLUG] = cardSlug;
      newRow[COL.ANNUAL_FEE] = annualFee;
      if (imageUrl) newRow[COL.IMAGE_URL] = imageUrl;
      if (bonusText) newRow[COL.BONUS] = bonusText;
      if (rewardsRate) newRow[COL.REWARDS_RATE] = rewardsRate;
      if (trackingUrl) newRow[COL.TRACKING_URL] = trackingUrl;
      // Default Active = Yes for non-discontinued cards
      newRow[COL.ACTIVE] = "Yes";

      updates.push({
        range: `Credit Cards!A${nextNewRow}:Y${nextNewRow}`,
        values: [newRow],
      });
      nextNewRow++;
      added++;
    }
  }

  // Write all updates in batches of 100 to stay within API limits
  const BATCH_SIZE = 100;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    await gwsBatchUpdate(spreadsheetId, batch);
    console.log(`[GithubSync] Phase 1: Wrote batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)}`);
  }

  console.log(`[GithubSync] Phase 1 done: ${added} added, ${updated} updated, ${skipped} skipped`);
  return { added, updated, skipped };
}

// ─── Phase 2: LLM fills blank editorial fields ───────────────────────────────
// Processes up to MAX_LLM_ROWS rows per run to stay within the 2-minute heartbeat
// timeout. Subsequent daily runs will pick up where the previous one left off.
const MAX_LLM_ROWS = 20;
const LLM_PHASE_BUDGET_MS = 60_000; // 60s budget for Phase 2 (leaves headroom for Phase 3)

async function phase2_llmFillBlanks(spreadsheetId: string): Promise<{ filled: number; skippedDueToTimeout: number }> {
  console.log("[GithubSync] Phase 2: LLM content generation for blank fields...");

  // Re-fetch the sheet after Phase 1 writes
  const sheetResult = gwsExec({
    spreadsheetId,
    ranges: ["Credit Cards!A1:Y500"],
  }) as { valueRanges: { range: string; values: string[][] }[] };

  const allRows: string[][] = sheetResult.valueRanges?.[0]?.values ?? [];
  const dataRows = allRows.slice(1);

  const updates: { range: string; values: string[][] }[] = [];
  let filled = 0;
  let skippedDueToTimeout = 0;
  let llmCallCount = 0;
  const phaseStart = Date.now();

  for (let i = 0; i < dataRows.length; i++) {
    // Stop if we've hit the per-run row cap or time budget
    if (llmCallCount >= MAX_LLM_ROWS || Date.now() - phaseStart > LLM_PHASE_BUDGET_MS) {
      skippedDueToTimeout += dataRows.length - i;
      break;
    }
    const row = [...dataRows[i]];
    const sheetRow = i + 2; // 1-based

    const productName = row[COL.PRODUCT_NAME]?.trim();
    const providerName = row[COL.PROVIDER]?.trim();
    if (!productName || !providerName) continue;

    const annualFee = row[COL.ANNUAL_FEE]?.trim() || "0";
    const bonusText = row[COL.BONUS]?.trim() || "";
    const cardType = row[COL.CARD_TYPE]?.trim() || "";

    // Check which fields need filling
    const needsTagline = !row[COL.TAGLINE]?.trim();
    const needsRewardsRate = !row[COL.REWARDS_RATE]?.trim();
    const needsBonus = !row[COL.BONUS]?.trim();
    const needsEditorial = !row[COL.EDITORIAL]?.trim();

    if (!needsTagline && !needsRewardsRate && !needsBonus && !needsEditorial) continue;

    // Build a prompt for the LLM
    const fieldsNeeded: string[] = [];
    if (needsTagline) fieldsNeeded.push("tagline");
    if (needsRewardsRate) fieldsNeeded.push("rewardsRate");
    if (needsBonus) fieldsNeeded.push("welcomeBonus");
    if (needsEditorial) fieldsNeeded.push("editorialSummary");

    const prompt = `You are a financial content writer for a credit card comparison website. Generate concise, accurate content for the following credit card.

Card: ${productName}
Issuer: ${providerName}
Annual Fee: $${annualFee}
Card Type: ${cardType || "General"}
${bonusText ? `Known Welcome Bonus: ${bonusText}` : ""}

Generate ONLY the following fields as a JSON object (no other text):
${fieldsNeeded.map((f) => `"${f}": ...`).join(",\n")}

Field requirements:
- tagline: 1 sentence, 10-15 words, highlight the main benefit
- rewardsRate: describe the primary earning rate (e.g. "2% cash back on all purchases")
- welcomeBonus: describe the current welcome offer in plain English (1-2 sentences)
- editorialSummary: 2-3 sentences summarizing who this card is best for and why

Return ONLY valid JSON.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are a financial content writer. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "card_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                tagline: { type: "string" },
                rewardsRate: { type: "string" },
                welcomeBonus: { type: "string" },
                editorialSummary: { type: "string" },
              },
              required: ["tagline", "rewardsRate", "welcomeBonus", "editorialSummary"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) continue;
      const content = typeof rawContent === "string" ? rawContent : (rawContent as { type: string; text?: string }[])[0]?.text ?? "";
      if (!content) continue;

      const generated = JSON.parse(content) as {
        tagline: string;
        rewardsRate: string;
        welcomeBonus: string;
        editorialSummary: string;
      };

      // Ensure row is long enough
      while (row.length <= COL.TRACKING_URL) row.push("");

      let changed = false;
      if (needsTagline && generated.tagline) {
        row[COL.TAGLINE] = generated.tagline;
        changed = true;
      }
      if (needsRewardsRate && generated.rewardsRate) {
        row[COL.REWARDS_RATE] = generated.rewardsRate;
        changed = true;
      }
      if (needsBonus && generated.welcomeBonus) {
        row[COL.BONUS] = generated.welcomeBonus;
        changed = true;
      }
      if (needsEditorial && generated.editorialSummary) {
        row[COL.EDITORIAL] = generated.editorialSummary;
        changed = true;
      }

      if (changed) {
        while (row.length < 25) row.push("");
        updates.push({
          range: `Credit Cards!A${sheetRow}:Y${sheetRow}`,
          values: [row.slice(0, 25)],
        });
        filled++;
      }
      llmCallCount++;
    } catch (e) {
      console.warn(`[GithubSync] Phase 2: LLM failed for "${productName}":`, e);
    }
  }

  // Write LLM-generated content in batches
  const BATCH_SIZE = 50;
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    await gwsBatchUpdate(spreadsheetId, batch);
    console.log(`[GithubSync] Phase 2: Wrote LLM batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(updates.length / BATCH_SIZE)}`);
  }

  console.log(`[GithubSync] Phase 2 done: ${filled} rows filled, ${skippedDueToTimeout} deferred to next run`);
  return { filled, skippedDueToTimeout };
}

// ─── Main pipeline ────────────────────────────────────────────────────────────────────────────────

export async function runGithubCardSync(triggeredBy: "manual" | "scheduled" = "manual"): Promise<{
  phase1: { added: number; updated: number; skipped: number };
  phase2: { filled: number; skippedDueToTimeout: number };
  phase3: { providersUpserted: number; offersUpserted: number; errors: string[] };
}> {
  const spreadsheetId = ENV.sheetsSpreadsheetId;
  if (!spreadsheetId) throw new Error("SHEETS_SPREADSHEET_ID not configured");

  console.log(`[GithubSync] Starting pipeline (triggeredBy: ${triggeredBy})`);

  // Phase 1: GitHub → Sheet
  const phase1 = await phase1_githubToSheet(spreadsheetId);

  // Phase 2: LLM fill blanks in sheet
  const phase2 = await phase2_llmFillBlanks(spreadsheetId);

  // Phase 3: Sheet → DB
  console.log("[GithubSync] Phase 3: Triggering Sheets→DB sync...");
  const phase3 = await runSheetsSync(triggeredBy);
  console.log(`[GithubSync] Phase 3 done: ${phase3.providersUpserted} providers, ${phase3.offersUpserted} offers`);

  return { phase1, phase2, phase3 };
}
