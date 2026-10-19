import "server-only";
import { cacheLife } from "next/cache";
import { db } from "@/server/db";

export const ACADEMY_SLUG = "nsd-business-academy";

/** The academy's organisation id. Every query in this app is scoped to it. */
export async function academyId(): Promise<string> {
  "use cache";
  cacheLife("max");
  const org = await db.organisation.findUnique({ where: { slug: ACADEMY_SLUG }, select: { id: true } });
  if (!org) throw new Error(`Organisation "${ACADEMY_SLUG}" not found. Run \`npm run db:seed\`.`);
  return org.id;
}
