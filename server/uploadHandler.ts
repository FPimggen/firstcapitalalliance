import { Request, Response } from "express";
import { storagePut } from "./storage";
import { getUserByOpenId } from "./db";
import { sdk } from "./_core/sdk";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload/image
 * Expects a raw binary body with Content-Type set to the image mime type.
 * Header: x-filename — original filename (used to derive storage key extension)
 * Returns: { url: string }
 *
 * Admin-only: validates session cookie and checks role === "admin".
 */
export async function handleImageUpload(req: Request, res: Response) {
  try {
    // ── Auth check ──────────────────────────────────────────────────────────
    // Parse cookies manually (parseCookies is private on sdk)
    const rawCookie = req.headers.cookie ?? "";
    const cookieVal = rawCookie
      .split(";")
      .map((c) => c.trim().split("="))
      .find(([k]) => k === "app_session_id")
      ?.slice(1)
      .join("=");
    const session = await sdk.verifySession(cookieVal);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const openId = session.openId;

    const user = await getUserByOpenId(openId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // ── Validate content type ────────────────────────────────────────────────
    const contentType = (req.headers["content-type"] ?? "").split(";")[0].trim();
    if (!ALLOWED_MIME.includes(contentType)) {
      return res.status(400).json({ error: `Unsupported image type: ${contentType}` });
    }

    // ── Collect body ─────────────────────────────────────────────────────────
    const chunks: Buffer[] = [];
    let totalSize = 0;
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => {
        totalSize += chunk.length;
        if (totalSize > MAX_SIZE_BYTES) {
          reject(new Error("File too large (max 5 MB)"));
        } else {
          chunks.push(chunk);
        }
      });
      req.on("end", resolve);
      req.on("error", reject);
    });

    const buffer = Buffer.concat(chunks);

    // ── Derive file extension ────────────────────────────────────────────────
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/svg+xml": "svg",
    };
    const ext = extMap[contentType] ?? "bin";
    const filename = (req.headers["x-filename"] as string | undefined)
      ?.replace(/[^a-z0-9._-]/gi, "_")
      .toLowerCase() ?? `upload.${ext}`;
    const storageKey = `offer-images/${Date.now()}-${filename}`;

    // ── Upload to S3 ─────────────────────────────────────────────────────────
    const { url } = await storagePut(storageKey, buffer, contentType);

    return res.json({ url });
  } catch (err: any) {
    console.error("[ImageUpload] Error:", err);
    return res.status(500).json({ error: err?.message ?? "Upload failed" });
  }
}
