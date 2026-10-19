import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";

/**
 * Signed timestamp embedded in public forms. Lets the server reject posts
 * that arrive faster than a person could type, without cookies or JS.
 * Not exported through any server action, so it cannot be minted by clients.
 */
function sign(ts: string) {
  return createHmac("sha256", env.formSecret).update(`form:${ts}`).digest("base64url");
}

export function issueFormToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

/** Milliseconds since the token was issued, or null if it is forged or malformed. */
export function formTokenAge(token: string, now = Date.now()): number | null {
  const [ts, sig] = token.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return null;
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return now - Number(ts);
}
