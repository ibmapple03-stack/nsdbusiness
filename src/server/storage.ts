import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Private file storage. Files are never placed in /public; every read goes
 * through a route that checks permission first.
 *
 * Stage 1: local disk driver under ./storage (development only).
 * Stage 2: S3-compatible driver (Cloudflare R2 / Supabase Storage) with
 * short-lived signed URLs, selected by STORAGE_DRIVER.
 */
const ROOT = path.resolve(process.cwd(), "storage", "media");

const MIME: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".pdf": "application/pdf" };

export async function readPrivateFile(relativePath: string): Promise<{ data: Buffer; contentType: string } | null> {
  const resolved = path.resolve(ROOT, relativePath);
  // Refuse anything that escapes the storage root.
  if (!resolved.startsWith(ROOT + path.sep)) return null;
  const contentType = MIME[path.extname(resolved).toLowerCase()];
  if (!contentType) return null;
  try {
    return { data: await readFile(resolved), contentType };
  } catch {
    return null;
  }
}
