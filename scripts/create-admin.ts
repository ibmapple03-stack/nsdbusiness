/**
 * Create the first CEO account on a fresh (e.g. production) database.
 *
 *   npm run admin:create -- "Full Name" person@example.com
 *
 * The account gets an unusable random password. The person then uses
 * "Forgot password" on /login to receive a link and set their own password,
 * and is required to set up two-step sign-in on first sign-in.
 */
import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";

const [name, email] = process.argv.slice(2);
if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: npm run admin:create -- "Full Name" person@example.com');
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const org = await db.organisation.upsert({
    where: { slug: "nsd-business-academy" },
    create: { slug: "nsd-business-academy", name: "NSD Business Academy Limited" },
    update: {},
  });
  if (await db.user.findUnique({ where: { email: email.toLowerCase() } })) {
    console.error("An account with that email already exists.");
    process.exit(1);
  }
  const userId = randomUUID();
  const password = await hashPassword(randomBytes(32).toString("base64url"));
  await db.$transaction([
    db.user.create({ data: { id: userId, name, email: email.toLowerCase(), emailVerified: false } }),
    db.account.create({ data: { id: randomUUID(), accountId: userId, providerId: "credential", userId, password } }),
    db.membership.create({ data: { userId, organisationId: org.id, role: "CEO" } }),
    db.auditLog.create({ data: { organisationId: org.id, actorLabel: "System (admin:create script)", action: "user.create", entityType: "user", entityId: userId, after: { roles: ["CEO"] } } }),
  ]);
  console.log(`Created CEO account for ${name}. Ask them to open /login, enter their email and choose "Forgot password" to set a password.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
