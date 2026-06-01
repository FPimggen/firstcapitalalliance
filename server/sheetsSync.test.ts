import { describe, expect, it, vi, beforeEach } from "vitest";

// ─── Mock the database and fetch dependencies ─────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("../drizzle/schema", () => ({
  providers: { slug: "slug", name: "name" },
  categories: { slug: "slug" },
  offers: { slug: "slug", categoryId: "categoryId" },
  syncLog: { startedAt: "startedAt" },
}));

// ─── Unit tests for slug generation utility ───────────────────────────────────
// We test the toSlug logic inline since it's not exported
function toSlug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

describe("toSlug", () => {
  it("converts a simple name to a slug", () => {
    expect(toSlug("American Express")).toBe("american-express");
  });

  it("handles special characters", () => {
    expect(toSlug("Capital One®")).toBe("capital-one");
  });

  it("handles multiple spaces and hyphens", () => {
    expect(toSlug("Bank  of  America")).toBe("bank-of-america");
  });

  it("strips leading and trailing hyphens", () => {
    expect(toSlug("  Chase  ")).toBe("chase");
  });

  it("lowercases everything", () => {
    expect(toSlug("DISCOVER")).toBe("discover");
  });

  it("handles numbers in names", () => {
    expect(toSlug("Citi 360 Savings")).toBe("citi-360-savings");
  });
});

// ─── Unit tests for APR parsing ───────────────────────────────────────────────
function parseApr(val: string | undefined): string {
  if (!val) return "";
  const num = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? "" : num.toFixed(2);
}

describe("parseApr", () => {
  it("parses a plain number", () => {
    expect(parseApr("19.99")).toBe("19.99");
  });

  it("strips percent signs", () => {
    expect(parseApr("24.99%")).toBe("24.99");
  });

  it("returns empty string for undefined", () => {
    expect(parseApr(undefined)).toBe("");
  });

  it("returns empty string for non-numeric", () => {
    expect(parseApr("N/A")).toBe("");
  });

  it("handles variable APR strings", () => {
    expect(parseApr("19.99% Variable")).toBe("19.99");
  });
});

// ─── Unit tests for fee parsing ───────────────────────────────────────────────
function parseFee(val: string | undefined): string {
  if (!val) return "0";
  const clean = val.replace(/[^0-9.]/g, "");
  if (!clean) return "0";
  const num = parseFloat(clean);
  return isNaN(num) ? "0" : num.toFixed(2);
}

describe("parseFee", () => {
  it("parses a dollar amount", () => {
    expect(parseFee("$95")).toBe("95.00");
  });

  it("returns 0 for No Annual Fee", () => {
    expect(parseFee("No Annual Fee")).toBe("0");
  });

  it("returns 0 for undefined", () => {
    expect(parseFee(undefined)).toBe("0");
  });

  it("handles $0", () => {
    expect(parseFee("$0")).toBe("0.00");
  });
});

// ─── Unit tests for rating parsing ───────────────────────────────────────────
function parseRating(val: string | undefined): string {
  if (!val) return "0";
  const num = parseFloat(val);
  if (isNaN(num)) return "0";
  return Math.min(5, Math.max(0, num)).toFixed(1);
}

describe("parseRating", () => {
  it("clamps to 5 max", () => {
    expect(parseRating("6")).toBe("5.0");
  });

  it("clamps to 0 min", () => {
    expect(parseRating("-1")).toBe("0.0");
  });

  it("parses a valid rating", () => {
    expect(parseRating("4.5")).toBe("4.5");
  });

  it("returns 0 for undefined", () => {
    expect(parseRating(undefined)).toBe("0");
  });

  it("returns 0 for non-numeric", () => {
    expect(parseRating("N/A")).toBe("0");
  });
});

// ─── Unit tests for boolean parsing ──────────────────────────────────────────
function parseBool(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.toLowerCase().trim();
  return lower !== "false" && lower !== "no" && lower !== "0" && lower !== "inactive";
}

describe("parseBool (active field)", () => {
  it("returns true for 'true'", () => {
    expect(parseBool("true")).toBe(true);
  });

  it("returns false for 'false'", () => {
    expect(parseBool("false")).toBe(false);
  });

  it("returns false for 'no'", () => {
    expect(parseBool("no")).toBe(false);
  });

  it("returns false for 'inactive'", () => {
    expect(parseBool("inactive")).toBe(false);
  });

  it("returns true for undefined (default active)", () => {
    expect(parseBool(undefined)).toBe(true);
  });

  it("returns true for 'yes'", () => {
    expect(parseBool("yes")).toBe(true);
  });
});

// ─── Sheet-to-category mapping ────────────────────────────────────────────────
const SHEET_TO_CATEGORY: Record<string, string> = {
  "Credit Cards": "credit-cards",
  "Personal Loans": "personal-loans",
  Mortgages: "mortgages",
  "Auto Loans": "auto-loans",
  "Savings Accounts": "savings-accounts",
  "Checking Accounts": "checking-accounts",
};

describe("SHEET_TO_CATEGORY mapping", () => {
  it("maps all 6 expected sheet names", () => {
    expect(Object.keys(SHEET_TO_CATEGORY)).toHaveLength(6);
  });

  it("maps Credit Cards to credit-cards", () => {
    expect(SHEET_TO_CATEGORY["Credit Cards"]).toBe("credit-cards");
  });

  it("maps Savings Accounts to savings-accounts", () => {
    expect(SHEET_TO_CATEGORY["Savings Accounts"]).toBe("savings-accounts");
  });

  it("maps Checking Accounts to checking-accounts", () => {
    expect(SHEET_TO_CATEGORY["Checking Accounts"]).toBe("checking-accounts");
  });

  it("returns undefined for unknown sheet names", () => {
    expect(SHEET_TO_CATEGORY["Unknown Sheet"]).toBeUndefined();
  });
});
