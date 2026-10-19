@AGENTS.md

# NSD Business Academy — project rules

Website and academy management platform for NSD Business Academy Limited (Yola, Adamawa State; CAC RC 9902304). Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4 + PostgreSQL/Prisma 7 + Better Auth. Setup in `docs/setup.md`; stage status in `docs/feature-status.md`.

## Always do first

- Invoke the **frontend-design** skill before writing any frontend code.
- This is Next.js 16: check `node_modules/next/dist/docs/` before using an API you are unsure of (Cache Components, `proxy.ts`, `instant`, `updateTag`).

## Content integrity (non-negotiable)

- Never invent enrolment figures, partners, testimonials, facilities, outcomes, awards or accreditations. The brand guideline mock-ups ("500+ students", testimonial) must not be used.
- Describe the academy only as CAC-incorporated. Never claim NBTE, government or international accreditation, or nationally recognised qualifications.
- Real people's profiles stay unpublished until approved; never add facts about them that were not supplied.
- Unverified contact details, domain or email are never rendered publicly (only `verified` `SiteSetting` values).
- Demo data is fictional, uses `…@example.test`, and is prefixed `DEMO-` / `[Demo]`.

## Architecture rules

- **Authorisation on the server:** pages call `requireStaffPage(permission)`; actions go through `runAction(permission, …)`; services call `assertCan()` + `assertSameOrg()`. The permission matrix lives in `src/server/auth/permissions.ts` (update `docs/roles-and-permissions.md` with `npx tsx scripts/print-roles.ts`).
- **Maker-checker:** submitter ≠ approver; fee proposer ≠ fee approver; refunds and manual payments follow the same pattern.
- **Audit** every sensitive change with `audit()` inside the same transaction.
- **Money in kobo** (`Int`), via `src/lib/money.ts`. **Times in UTC**, displayed as WAT via `src/lib/time.ts`.
- Public reads go through cached functions in `src/server/public-data.ts` (`"use cache"` + `cacheTag`) and must filter to published/verified records; mutations call `updateTag(tag)`.
- Private files never go in `/public`; serve them through permission-checked routes.
- Payments (Stage 2): never trust the browser; verify server-side and process webhooks idempotently (`docs/payments-architecture.md`).

## Testing

- `npm run lint && npm run typecheck && npm test && npm run test:e2e` before declaring work done.
- Tests use the `nsd_test` database. Do not run `prisma migrate reset` — it is blocked for AI agents and needs the user's explicit consent.

## Screenshot workflow

- Dev server: `npm run dev` (http://localhost:3000). If it is already running, do not start a second one.
- `node scripts/screenshot.mjs <url> [label] [WIDTHxHEIGHT] [--viewport]` → `temporary_screenshots/screenshot-N[-label].png` (never overwritten). Read the PNG to review.
- Check mobile (390x844) and desktop (1440x900). Compare spacing, type sizes, colours, alignment; do at least two review rounds for visual changes.

## Brand

- Assets in `brand assets/`. Palette (from the guideline): navy `#1E3A5F`, deep navy `#0D1B2A`, gold `#F4B400`/`#FDBA0F`, dark `#333333`; pillar colours business `#1E3A5F`, digital `#16A34A`, professional `#7C3AED`, vocational `#F97316`, support `#0D9488`. Emerald `#0E7C5A` for positive/open states. Tokens in `src/app/globals.css`.
- Headings Poppins, body Inter. Logo files in `public/brand/` (mark + full lockup) were extracted from the screenshot `brand assets/logo.jpg`; replace them with exports from the original vector when supplied. On dark surfaces the navy mark sits on a white tile (`<LogoMark inverse />`).

## Design guardrails

- Never use the default Tailwind palette (`indigo-500`, `blue-600`…); use the brand tokens.
- Shadows: layered, navy-tinted (`--shadow-raised`, `--shadow-floating`), never flat `shadow-md`.
- Tight tracking on large headings, generous body line-height (1.7).
- Animate only `transform` and `opacity`; never `transition-all`; respect `prefers-reduced-motion`. The hero swoosh is the single load animation.
- Every clickable element has hover, focus-visible and active states.
- Surfaces use a layering system (base → raised → floating).
- Gold is an accent only — never body text on white (insufficient contrast).
- Avoid template tells: all-caps eyebrow labels, arrows appended to buttons, numbered markers on non-sequences, identical card grids.
