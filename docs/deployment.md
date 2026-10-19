# Deployment, backup and restoration

**Status:** documented, not yet performed. A production deployment needs the accounts listed in `management-decisions.md`.

## Target

- **Vercel** for the Next.js application (HTTPS by default; all traffic encrypted in transit)
- **Managed PostgreSQL** with daily backups and point-in-time recovery (e.g. Neon or Supabase), in the region closest to Nigeria that the provider offers
- **Resend** (or SMTP) for email from a verified domain
- Stage 2: S3-compatible private object storage (Cloudflare R2 or Supabase Storage), and Paystack

## Environments

| | Development | Preview (optional) | Production |
|---|---|---|---|
| Database | local `nsd_dev` | separate branch/database | production database |
| Email | console | console or sandbox | Resend |
| Paystack (Stage 2) | test keys | test keys | live keys |
| Demo data | allowed | fictional only | **never** — the seed refuses to run |
| MFA / draft preview | configurable | forced on / off | forced on / off |

Every environment has its own `BETTER_AUTH_SECRET`, `IP_HASH_SALT` and database. Secrets are entered in Vercel's encrypted environment settings, never committed.

## First deployment

1. Create the production database and copy its connection string (with `sslmode=require`).
2. In Vercel, import the repository. Set the environment variables from `.env.example` (production values), including `NODE_ENV` defaults.
3. Set the build command to `npm run build`. Run migrations as a release step:
   `DATABASE_URL=… npx prisma migrate deploy`
4. Create the first CEO account:
   `DATABASE_URL=… npm run admin:create -- "Full Name" ceo@your-domain`
5. Seed the base content (10 draft courses, page text, draft policies, unpublished profiles; no accounts, no demo data):
   `DATABASE_URL=… npm run db:seed:content`
6. Point the domain's DNS at Vercel and set up email DNS records (SPF, DKIM, DMARC) for the sending domain.
7. The CEO signs in, sets up two-step sign-in, creates the other staff accounts, verifies contact details, and approves content.

## Backups

- **Automatic:** enable the managed provider's daily backups and point-in-time recovery (minimum 7 days; 30 recommended).
- **Independent weekly copy:** a logical dump stored outside the database provider, encrypted:
  ```bash
  pg_dump --format=custom --no-owner "$PROD_DATABASE_URL" > nsd-$(date +%F).dump
  gpg --symmetric --cipher-algo AES256 nsd-$(date +%F).dump   # passphrase held by the CEO and Coordinator
  ```
  Keep at least 8 weekly copies. Never store backups in the code repository or personal email.
- **Uploaded files (Stage 2):** enable bucket versioning, plus a weekly sync to a second private bucket.

## Restore test (do this before launch, then every quarter)

1. Create an empty scratch database (never restore over production during a test).
2. `gpg -d nsd-YYYY-MM-DD.dump.gpg > restore.dump`
3. `pg_restore --no-owner --dbname "$SCRATCH_DATABASE_URL" restore.dump`
4. Run `DATABASE_URL=$SCRATCH_DATABASE_URL npx prisma migrate status`. It should report that the database is up to date.
5. Point a local copy of the app at the scratch database and check: sign in works; course count, published pages and the latest audit entries match production.
6. Record the date, backup used, time taken and result in the document register. Delete the scratch database.

## Security checklist before go-live

- [ ] Every staff account has two-step sign-in enabled (see Users & access)
- [ ] `CONTENT_PREVIEW` and demo seed are not used in production
- [ ] No `.env` files or secrets in the repository (`git log -p | grep -i secret` is clean)
- [ ] Policies approved after legal review and published
- [ ] Contact details verified
- [ ] Logo files in `public/brand/` re-exported from the original vector artwork (recommended)
- [ ] Backup restore test completed and recorded
- [ ] Content Security Policy tightened with nonces (Stage 4)
- [ ] Dependency audit (`npm audit`) reviewed
