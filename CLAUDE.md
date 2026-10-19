@AGENTS.md

# NSD Business Academy — project rules

Public website for NSD Business Academy Limited (Yola, Adamawa State; CAC RC 9902304). Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4. **No database and no logins**: content lives in `src/content/`; enquiry forms email the office via Resend. Student/staff portals are a separate project — do not add auth, admin or database code here (the earlier platform is on the `platform-stage1` branch). Setup in `docs/setup.md`; status in `docs/feature-status.md`.

## Always do first

- Invoke the **frontend-design** skill before writing any frontend code.
- This is Next.js 16: check `node_modules/next/dist/docs/` before using an API you are unsure of (Cache Components, `instant`).

## Content integrity (non-negotiable)

- Never invent enrolment figures, partners, testimonials, facilities, outcomes, awards or accreditations. The brand guideline mock-ups ("500+ students", testimonial) must not be used.
- Describe the academy only as CAC-incorporated. Never claim NBTE, government or international accreditation, or nationally recognised qualifications.
- Real people's profiles stay `published: false` until approved with their permission; never add facts about them that were not supplied.
- Only confirmed contact details go in `src/content/contact.ts` (office hours, map pin and WhatsApp await confirmation).
- Published content must not contain `[bracketed placeholders]`; `tests/unit/content.test.ts` enforces this.

## Architecture rules

- Pages read content only through `src/server/public-data.ts`, which returns `published` entries from `src/content/`.
- Enquiry forms: Zod validation, honeypot, signed timing token, rate limit, then `sendEmail()` to `ENQUIRY_TO`. Nothing is stored. In production the forms render only when Resend and `FORM_SECRET` are configured; otherwise the office phone/email are shown.
- Money displayed via `src/lib/money.ts`; times shown as WAT via `src/lib/time.ts`.

## Testing

- `npm run lint && npm run typecheck && npm test && npm run test:e2e` before declaring work done.

## Screenshot workflow

- Dev server: `npm run dev` (http://localhost:3000). If it is already running, do not start a second one.
- `node scripts/screenshot.mjs <url> [label] [WIDTHxHEIGHT] [--viewport]` → `temporary_screenshots/screenshot-N[-label].png` (never overwritten). Read the PNG to review.
- Check mobile (390x844) and desktop (1440x900). Compare spacing, type sizes, colours, alignment; do at least two review rounds for visual changes.

## Brand

- Assets in `brand assets/`. Palette (from the guideline): navy `#1E3A5F`, deep navy `#0D1B2A`, gold `#F4B400`/`#FDBA0F`, dark `#333333`; pillar colours business `#1E3A5F`, digital `#16A34A`, professional `#7C3AED`, vocational `#F97316`, support `#0D9488`. Emerald `#0E7C5A` for positive/open states. Tokens in `src/app/globals.css`.
- Headings Poppins, body Inter. Logo files in `public/brand/` were extracted from the screenshot `brand assets/logo.jpg`; replace them with exports from the original vector when supplied. Team photos live in `public/team/`. On dark surfaces the navy mark sits on a white tile (`<LogoMark inverse />`).

## Design guardrails

- Never use the default Tailwind palette (`indigo-500`, `blue-600`…); use the brand tokens.
- Shadows: layered, navy-tinted (`--shadow-raised`, `--shadow-floating`), never flat `shadow-md`.
- Tight tracking on large headings, generous body line-height (1.7).
- Animate only `transform` and `opacity`; never `transition-all`; respect `prefers-reduced-motion`. The hero swoosh is the single load animation.
- Every clickable element has hover, focus-visible and active states.
- Surfaces use a layering system (base → raised → floating).
- Gold is an accent only — never body text on white (insufficient contrast).
- Avoid template tells: all-caps eyebrow labels, arrows appended to buttons, numbered markers on non-sequences, identical card grids.
