import { db } from "@/server/db";
import { makeActor, type Actor } from "@/server/auth/actor";

export async function orgId() {
  return (await db.organisation.findUniqueOrThrow({ where: { slug: "nsd-business-academy" } })).id;
}

/** Build an actor for one of the seeded fictional demo accounts. */
export async function actorFor(role: "ceo" | "coordinator" | "manager" | "secretary" | "finance" | "instructor"): Promise<Actor> {
  const user = await db.user.findUniqueOrThrow({ where: { email: `${role}.demo@example.test` }, include: { memberships: true } });
  return makeActor({
    userId: user.id,
    name: user.name,
    email: user.email,
    organisationId: user.memberships[0].organisationId,
    roles: user.memberships.filter((m) => m.active).map((m) => m.role),
  });
}

/** Unique per test run so tests can be repeated against the same database. */
export const RUN = Date.now().toString(36);

export async function draftCourse(name: string) {
  const slug = `${name}-${RUN}`;
  const organisationId = await orgId();
  return db.course.create({
    data: { organisationId, slug, title: `Test ${slug}`, pillar: "BUSINESS_SUPPORT", outcomes: [], prerequisites: [], deliveryFormats: ["CLASSROOM"] },
  });
}
