import "server-only";

/**
 * Best-effort, in-memory fixed-window rate limit for the enquiry forms.
 * Each server instance keeps its own counts; together with the honeypot and
 * timing token this is enough for a brochure site with no database.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowSeconds: number, now = Date.now()): boolean {
  if (buckets.size > 5000) for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}
