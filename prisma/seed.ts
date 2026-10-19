/**
 * Seed script — safe to re-run.
 *
 *   npm run db:seed                      base records only (everything unpublished)
 *   SEED_DEMO_CATALOGUE=true npm run db:seed   also publishes FICTIONAL demo data for local review
 *
 * Login accounts created here are fictional (…@example.test) and exist only
 * for development. Real people appear only as unpublished profile drafts.
 */
import "dotenv/config";
import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Role } from "../src/generated/prisma/enums";
import { COURSES } from "./seed-data/courses";
import { POLICIES } from "./seed-data/policies";
import { CONTENT_BLOCKS, FOUNDER_BIO, INCORPORATION_NEWS, MUKTAR_BIO } from "./seed-data/content";

// SEED_CONTENT_ONLY=true inserts draft content only (no accounts, no demo data) — the only mode allowed in production.
const CONTENT_ONLY = process.env.SEED_CONTENT_ONLY === "true";
if (process.env.NODE_ENV === "production" && !CONTENT_ONLY) {
  console.error("Refusing to seed demo accounts in production. Use `npm run db:seed:content`, and create the first CEO with `npm run admin:create`.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const DEMO = !CONTENT_ONLY && process.env.SEED_DEMO_CATALOGUE === "true";

const DEMO_USERS: { email: string; name: string; roles: Role[] }[] = [
  { email: "ceo.demo@example.test", name: "Demo CEO", roles: ["CEO"] },
  { email: "coordinator.demo@example.test", name: "Demo Operations Coordinator", roles: ["OPERATIONS_COORDINATOR"] },
  { email: "manager.demo@example.test", name: "Demo Academy Manager", roles: ["ACADEMY_MANAGER"] },
  { email: "secretary.demo@example.test", name: "Demo Secretary", roles: ["SECRETARY_ADMIN"] },
  { email: "finance.demo@example.test", name: "Demo Finance Officer", roles: ["FINANCE_OFFICER"] },
  { email: "instructor.demo@example.test", name: "Demo Instructor", roles: ["INSTRUCTOR"] },
];

async function main() {
  const org = await db.organisation.upsert({
    where: { slug: "nsd-business-academy" },
    create: { slug: "nsd-business-academy", name: "NSD Business Academy Limited" },
    update: {},
  });
  const organisationId = org.id;

  // ── Demo staff logins (development only) ──
  const userIds: Record<string, string> = {};
  const password = process.env.SEED_DEMO_PASSWORD;
  if (!CONTENT_ONLY && (!password || password.length < 12)) throw new Error("Set SEED_DEMO_PASSWORD (12+ characters) in .env");
  const hash = CONTENT_ONLY ? "" : await hashPassword(password!);
  for (const u of CONTENT_ONLY ? [] : DEMO_USERS) {
    const user = await db.user.upsert({
      where: { email: u.email },
      create: { id: randomUUID(), email: u.email, name: u.name, emailVerified: true },
      update: { name: u.name },
    });
    userIds[u.email] = user.id;
    const account = await db.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    if (account) await db.account.update({ where: { id: account.id }, data: { password: hash } });
    else await db.account.create({ data: { id: randomUUID(), accountId: user.id, providerId: "credential", userId: user.id, password: hash } });
    for (const role of u.roles) {
      await db.membership.upsert({
        where: { userId_organisationId_role: { userId: user.id, organisationId, role } },
        create: { userId: user.id, organisationId, role },
        update: { active: true },
      });
    }
  }

  // ── Team profiles (real people: unpublished drafts) ──
  const founderPhoto = await copyFounderPhoto();
  const founder = await db.staffProfile.upsert({
    where: { organisationId_slug: { organisationId, slug: "mohammed-abdullahi-nasidi" } },
    create: {
      organisationId,
      slug: "mohammed-abdullahi-nasidi",
      kind: "LEADERSHIP",
      name: "Dr. Mohammed Abdullahi Nasidi",
      publicTitle: "Founder and Managing Director/CEO",
      bio: FOUNDER_BIO,
      internalNote: "Biography and photo approved for publication by management (18 Oct 2026).",
      photoPath: founderPhoto,
      photoApproved: founderPhoto !== null,
      sortOrder: 1,
      status: "SUBMITTED",
    },
    update: {},
  });
  const muktar = await db.staffProfile.upsert({
    where: { organisationId_slug: { organisationId, slug: "muktar-buba" } },
    create: {
      organisationId,
      slug: "muktar-buba",
      kind: "STAFF",
      name: "Muktar Buba",
      publicTitle: "Administration, Training and Operations Coordinator",
      bio: MUKTAR_BIO,
      internalNote: "Proposed public title — subject to confirmation. Keep unpublished until confirmed.",
      sortOrder: 2,
      reportsToId: founder.id,
    },
    update: {},
  });
  await db.staffProfile.upsert({
    where: { organisationId_slug: { organisationId, slug: "academy-manager" } },
    create: {
      organisationId,
      slug: "academy-manager",
      kind: "STAFF",
      name: "Academy Manager (to be appointed)",
      publicTitle: "Academy Manager",
      internalNote: "Name and biography to be supplied. Reports to Muktar Buba.",
      sortOrder: 3,
      reportsToId: muktar.id,
    },
    update: {},
  });
  await db.staffProfile.upsert({
    where: { organisationId_slug: { organisationId, slug: "maryam-muhammad-gabdo" } },
    create: {
      organisationId,
      slug: "maryam-muhammad-gabdo",
      kind: "STAFF",
      name: "Maryam Muhammad Gabdo",
      publicTitle: "Secretary and Administrative Officer",
      internalNote: "Public listing subject to approval. Coordinates daily work through Muktar Buba; may receive document assignments directly from the CEO.",
      sortOrder: 4,
      reportsToId: muktar.id,
    },
    update: {},
  });

  // ── Courses (all DRAFT) ──
  for (const c of COURSES) {
    await db.course.upsert({
      where: { organisationId_slug: { organisationId, slug: c.slug } },
      create: { organisationId, ...c, description: c.description ?? c.summary },
      update: {},
    });
  }

  // ── Page text and policies (DRAFT) ──
  for (const b of CONTENT_BLOCKS) {
    await db.contentBlock.upsert({ where: { organisationId_key: { organisationId, key: b.key } }, create: { organisationId, ...b }, update: {} });
  }
  for (const p of POLICIES) {
    await db.policy.upsert({ where: { organisationId_slug_version: { organisationId, slug: p.slug, version: 1 } }, create: { organisationId, ...p }, update: {} });
  }

  // ── Contact details supplied by management (19 Oct 2026). Office hours and map pin still awaiting confirmation. ──
  const settings = [
    {
      key: "contact.address",
      label: "Address",
      value: "No. 40/42 Lamido Ahmadu Road, Lamido Zubairu Way, adjacent to Modibbo Adama University Teaching Hospital, Yola, Yola South LGA, Adamawa State, Nigeria",
      verified: true,
    },
    { key: "contact.phone", label: "Telephone", value: "+234 803 758 8888", verified: true },
    { key: "contact.email", label: "Email", value: "info@nsdbusinessltd.com", verified: true },
    { key: "contact.officeHours", label: "Office hours", value: "Monday–Friday, 8:00 a.m.–5:00 p.m.", verified: false },
    { key: "contact.mapQuery", label: "Map location (address or coordinates)", value: "", verified: false },
  ];
  for (const s of settings) {
    await db.siteSetting.upsert({
      where: { organisationId_key: { organisationId, key: s.key } },
      create: { organisationId, ...s, verifiedAt: s.verified ? new Date() : null },
      update: {},
    });
  }

  await db.newsPost.upsert({
    where: { organisationId_slug: { organisationId, slug: INCORPORATION_NEWS.slug } },
    create: { organisationId, ...INCORPORATION_NEWS },
    update: {},
  });

  if (DEMO) await seedDemo(organisationId, userIds, founder.id);

  console.log(`Seed complete${DEMO ? " (with FICTIONAL demo catalogue)" : ""}.`);
  if (!CONTENT_ONLY) {
    console.log(`Demo staff logins: ${DEMO_USERS.map((u) => u.email).join(", ")}`);
    console.log("Password: the SEED_DEMO_PASSWORD value in your .env file.");
  }
}

async function copyFounderPhoto(): Promise<string | null> {
  const source = path.join(process.cwd(), "brand assets", "ceo image.jpg");
  const relative = "profiles/founder.jpg";
  const target = path.join(process.cwd(), "storage", "media", relative);
  try {
    await access(source);
  } catch {
    return null;
  }
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(source, target);
  return relative;
}

/** Fictional records for local review only. Codes are prefixed DEMO- so they are easy to spot and remove. */
async function seedDemo(organisationId: string, userIds: Record<string, string>, founderId: string) {
  const manager = userIds["manager.demo@example.test"];
  const coordinator = userIds["coordinator.demo@example.test"];
  const reviewed = { submittedById: manager, submittedAt: new Date(), reviewedById: coordinator, reviewedAt: new Date() };

  await db.staffProfile.update({ where: { id: founderId }, data: { status: "PUBLISHED", photoApproved: true, ...reviewed } });

  const instructor = await db.staffProfile.upsert({
    where: { organisationId_slug: { organisationId, slug: "demo-instructor" } },
    create: {
      organisationId,
      slug: "demo-instructor",
      kind: "INSTRUCTOR",
      name: "Demo Instructor",
      publicTitle: "Instructor (fictional demo profile)",
      bio: "Fictional profile used to demonstrate instructor listings during development.",
      userId: userIds["instructor.demo@example.test"],
      status: "PUBLISHED",
      sortOrder: 50,
      ...reviewed,
    },
    update: {},
  });

  const venue =
    (await db.venue.findFirst({ where: { organisationId, name: "Demo Training Room A" } })) ??
    (await db.venue.create({ data: { organisationId, name: "Demo Training Room A", address: "Fictional venue for development", capacity: 25 } }));

  const demo: { slug: string; code: string; start: string; end: string; deadline: string; status: "OPEN" | "PLANNED" | "RUNNING"; fee: number }[] = [
    { slug: "entrepreneurship-small-business", code: "DEMO-ENT-01", start: "2026-11-16", end: "2026-12-18", deadline: "2026-11-06", status: "OPEN", fee: 4500000 },
    { slug: "digital-marketing", code: "DEMO-DGM-01", start: "2027-01-11", end: "2027-02-19", deadline: "2026-12-18", status: "PLANNED", fee: 5500000 },
    { slug: "computer-digital-skills", code: "DEMO-CDS-01", start: "2026-10-05", end: "2026-11-13", deadline: "2026-09-25", status: "RUNNING", fee: 3500000 },
  ];

  for (const d of demo) {
    const course = await db.course.update({
      where: { organisationId_slug: { organisationId, slug: d.slug } },
      data: {
        status: "PUBLISHED",
        durationLabel: "Demo duration — to be confirmed",
        certificateType: "Certificate of Completion issued by NSD Business Academy Limited. This is not an accredited national qualification.",
        refundTerms: "[DEMO] Refund terms to be confirmed by management. See the enrolment and refund policy.",
        assessment: "[DEMO] Practical assignments and a final project, reviewed by the instructor.",
        completionRequirements: "[DEMO] At least 75% attendance and all assessed work submitted and passed.",
        ...reviewed,
      },
    });
    const cohortData = {
      organisationId,
      courseId: course.id,
      code: d.code,
      startDate: new Date(`${d.start}T00:00:00Z`),
      endDate: new Date(`${d.end}T00:00:00Z`),
      applicationDeadline: new Date(`${d.deadline}T00:00:00Z`),
      timetableSummary: "Mondays and Wednesdays, 10:00–13:00 WAT (demo)",
      deliveryFormat: "CLASSROOM" as const,
      venueId: venue.id,
      instructorId: instructor.id,
      capacity: 25,
      feeKobo: d.fee,
      proposedFeeKobo: null,
      feeProposedById: null,
      feeProposedAt: null,
      feeProposalReason: null,
      paymentOptions: "[DEMO] Full payment, or two instalments where approved.",
      instalmentsAllowed: true,
      cohortStatus: d.status,
      status: "PUBLISHED" as const,
      ...reviewed,
    };
    await db.cohort.upsert({ where: { organisationId_code: { organisationId, code: d.code } }, create: cohortData, update: cohortData });
  }

  await db.newsPost.upsert({
    where: { organisationId_slug: { organisationId, slug: "demo-website-preview" } },
    create: {
      organisationId,
      slug: "demo-website-preview",
      kind: "ANNOUNCEMENT",
      title: "[Demo] Website preview",
      summary: "A fictional announcement used to show how news appears on the site.",
      body: "This post is demonstration content for development and review. It will not be published on the live site.",
      publishedAt: new Date(),
      status: "PUBLISHED",
      ...reviewed,
    },
    update: {},
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
