# Local setup

## Requirements

- macOS, Linux or Windows with **Node.js 24** (`node -v`)
- **PostgreSQL 16+**. On macOS, [Postgres.app](https://postgresapp.com) (installed at `/Applications/Postgres.app`).

## 1. Start Postgres and create the databases

Open Postgres.app and press **Start** (or **Initialize** the first time). Then:

```bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -U postgres -c "CREATE DATABASE nsd_dev;"
/Applications/Postgres.app/Contents/Versions/latest/bin/psql -U postgres -c "CREATE DATABASE nsd_test;"
```

> On this machine the server was initialised at `~/Library/Application Support/Postgres/var-18`. If Postgres.app does not list it, choose **+** → **Data directory** and select that folder, or start it from the terminal:
> `/Applications/Postgres.app/Contents/Versions/18/bin/pg_ctl -D ~/Library/Application\ Support/Postgres/var-18 start`

## 2. Configure the environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | Development value |
|---|---|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `IP_HASH_SALT` | `openssl rand -hex 16` |
| `SEED_DEMO_PASSWORD` | any 12+ character password for the fictional demo staff |
| `SEED_DEMO_CATALOGUE` | `true` to publish fictional demo courses for review |
| `REQUIRE_STAFF_MFA` | `false` to skip the authenticator step locally (always on in production) |
| `CONTENT_PREVIEW` | `true` to see draft page text and policies with draft markers |

## 3. Install, migrate, seed, run

```bash
npm install          # also generates the Prisma client
npm run db:migrate   # applies migrations to nsd_dev
npm run db:seed      # base records (+ fictional demo catalogue if enabled)
npm run dev          # http://localhost:3000
```

## Demo staff accounts (fictional, development only)

| Email | Role |
|---|---|
| `ceo.demo@example.test` | CEO |
| `coordinator.demo@example.test` | Operations Coordinator |
| `manager.demo@example.test` | Academy Manager |
| `secretary.demo@example.test` | Secretary/Administrator |
| `finance.demo@example.test` | Finance Officer |
| `instructor.demo@example.test` | Instructor |

Password: the `SEED_DEMO_PASSWORD` value. The seed refuses to run when `NODE_ENV=production`.

Emails (password links, verification) are printed in the terminal running `npm run dev` while `EMAIL_DRIVER=console`.

## Tests

```bash
npm run lint
npm run typecheck
npm test            # unit + database integration tests (uses nsd_test)
npm run test:e2e    # builds for production and runs Playwright on :3100 (uses nsd_test)
```

The test setup never deletes the test database: it applies migrations, re-runs the idempotent seed, and tests create run-unique records. To start the test database completely fresh, run this yourself (it deletes all data in `nsd_test` only):

```bash
DATABASE_URL=postgresql://postgres@localhost:5432/nsd_test npx prisma migrate reset --force
```

## Screenshots

`npm run screenshot -- http://localhost:3000/courses courses 390x844` saves to `temporary_screenshots/`.

## Useful commands

| Command | Purpose |
|---|---|
| `npm run db:migrate -- --name <change>` | Create a migration after editing `prisma/schema.prisma` |
| `npx prisma studio` | Browse the dev database |
| `npx tsx scripts/print-roles.ts` | Print the permission matrix |
| `npm run admin:create -- "Name" email` | Create the first CEO account on a new database |
