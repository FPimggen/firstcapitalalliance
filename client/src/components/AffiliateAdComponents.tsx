/**
 * Affiliate Ad Display Components
 *
 * Four placement types:
 *  - NotificationBarAd  — full-width sticky banner at the top of the page
 *  - SidebarAd          — tall vertical ad for sidebar columns
 *  - InlineAd           — horizontal card injected inside content lists
 *  - InSearchAd         — compact square+text card sprinkled in search/filter results
 *
 * All components accept a `tags` prop (string[]) to filter ads by context.
 * Ads are fetched client-side via trpc.ads.listActive and randomly selected
 * weighted by priority (high=3, moderate=2, low=1).
 */

import { useMemo, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { X, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ad {
  id: number;
  name: string;
  affiliateLink: string;
  squareImageUrl: string | null;
  verticalImageUrl: string | null;
  horizontalImageUrl: string | null;
  priority: string;
  tags: string | null;
}

// ─── Weighted random selection ─────────────────────────────────────────────
const WEIGHTS: Record<string, number> = { high: 3, moderate: 2, low: 1 };

function pickAd(ads: Ad[]): Ad | null {
  if (!ads.length) return null;
  const pool: Ad[] = [];
  for (const ad of ads) {
    const w = WEIGHTS[ad.priority] ?? 1;
    for (let i = 0; i < w; i++) pool.push(ad);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Hook: fetch + filter ads ─────────────────────────────────────────────
function useAd(tags: string[], imageField: keyof Ad) {
  const { data: ads = [] } = trpc.ads.listActive.useQuery({ tags }, { staleTime: 5 * 60 * 1000 });
  return useMemo(() => {
    const eligible = ads.filter((a) => a[imageField]);
    return pickAd(eligible);
  }, [ads, imageField]);
}

// ─── Tracking click ───────────────────────────────────────────────────────
function AdLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
      onClick={() => {
        // Future: fire impression/click event to analytics
      }}
    >
      {children}
    </a>
  );
}

// ─── Sponsored label ─────────────────────────────────────────────────────
function SponsoredLabel({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wide ${className}`}>
      Sponsored
    </span>
  );
}

// ─── 1. Notification Bar Ad ───────────────────────────────────────────────
/**
 * Full-width sticky banner at the very top of the page.
 * Uses the horizontal image. Dismissible.
 */
export function NotificationBarAd({ tags = [] }: { tags?: string[] }) {
  const ad = useAd(tags, "horizontalImageUrl");
  const [dismissed, setDismissed] = useState(false);

  // Re-show on page navigation
  useEffect(() => { setDismissed(false); }, [ad?.id]);

  if (!ad || dismissed) return null;

  return (
    <div className="w-full bg-[var(--navy-900)] border-b border-[var(--navy-700)] relative">
      <AdLink href={ad.affiliateLink} className="flex items-center justify-center py-2 px-10 gap-3 group">
        {ad.horizontalImageUrl && (
          <img
            src={ad.horizontalImageUrl}
            alt={ad.name}
            className="h-8 object-contain max-w-[320px]"
          />
        )}
        <span className="text-xs text-white/80 group-hover:text-white transition-colors flex items-center gap-1">
          Learn more <ExternalLink className="w-3 h-3" />
        </span>
      </AdLink>
      <SponsoredLabel className="absolute left-3 top-1/2 -translate-y-1/2" />
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
        aria-label="Dismiss ad"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── 2. Sidebar Ad ────────────────────────────────────────────────────────
/**
 * Tall vertical ad for sidebar placement.
 * Prefers vertical image, falls back to square.
 */
export function SidebarAd({ tags = [] }: { tags?: string[] }) {
  const adV = useAd(tags, "verticalImageUrl");
  const adS = useAd(tags, "squareImageUrl");
  const ad = adV ?? adS;

  if (!ad) return null;

  const imgSrc = ad.verticalImageUrl ?? ad.squareImageUrl;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm">
      <AdLink href={ad.affiliateLink} className="block group">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={ad.name}
            className="w-full object-cover group-hover:opacity-90 transition-opacity"
          />
        )}
        <div className="px-3 py-2 flex items-center justify-between">
          <SponsoredLabel />
          <span className="text-xs text-accent flex items-center gap-1 group-hover:underline">
            Learn more <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      </AdLink>
    </div>
  );
}

// ─── 3. Inline Content Ad ────────────────────────────────────────────────
/**
 * Horizontal card injected between rows in a content list.
 * Uses horizontal image if available, falls back to square.
 */
export function InlineAd({ tags = [] }: { tags?: string[] }) {
  const adH = useAd(tags, "horizontalImageUrl");
  const adS = useAd(tags, "squareImageUrl");
  const ad = adH ?? adS;

  if (!ad) return null;

  const imgSrc = ad.horizontalImageUrl ?? ad.squareImageUrl;

  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm my-2">
      <AdLink href={ad.affiliateLink} className="flex items-center gap-4 p-3 group hover:bg-muted/40 transition-colors">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={ad.name}
            className="h-16 w-auto object-contain rounded-lg shrink-0 max-w-[160px]"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
            {ad.name}
          </p>
          <SponsoredLabel className="mt-0.5" />
        </div>
        <span className="text-xs text-accent flex items-center gap-1 shrink-0 group-hover:underline">
          Learn more <ExternalLink className="w-3 h-3" />
        </span>
      </AdLink>
    </div>
  );
}

// ─── 4. In-Search Ad ─────────────────────────────────────────────────────
/**
 * Compact card that blends into search/filter result lists.
 * Uses square image. Visually distinct with a subtle "Sponsored" badge.
 */
export function InSearchAd({ tags = [] }: { tags?: string[] }) {
  const ad = useAd(tags, "squareImageUrl");

  if (!ad) return null;

  return (
    <AdLink
      href={ad.affiliateLink}
      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors group"
    >
      {ad.squareImageUrl ? (
        <img
          src={ad.squareImageUrl}
          alt={ad.name}
          className="w-10 h-10 object-contain rounded-lg shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-muted shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
          {ad.name}
        </p>
        <SponsoredLabel />
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-accent shrink-0" />
    </AdLink>
  );
}
