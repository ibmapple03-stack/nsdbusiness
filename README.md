# NSD Business Academy — website and academy platform

Public website and administration platform for **NSD Business Academy Limited**, Yola, Adamawa State, Nigeria (CAC RC 9902304).

**Current stage: 1 of 4 — design and foundation.** The public website, course catalogue, editable content with approvals, staff sign-in with two-step verification, and the permission system are all working. Admissions and payments come in Stage 2. See [`docs/feature-status.md`](docs/feature-status.md).

## Quick start

```bash
cp .env.example .env      # then fill in the values (see docs/setup.md)
npm install
npm run db:migrate
npm run db:seed
npm run dev               # http://localhost:3000
```

## Documentation

| Document | Contents |
|---|---|
| [docs/setup.md](docs/setup.md) | Local setup, demo accounts, tests |
| [docs/feature-status.md](docs/feature-status.md) | Working / demo / pending features and known limitations |
| [docs/management-decisions.md](docs/management-decisions.md) | Decisions and credentials needed from management |
| [docs/roles-and-permissions.md](docs/roles-and-permissions.md) | Role and permission matrix, how access is enforced |
| [docs/sitemap.md](docs/sitemap.md) | Public and admin pages |
| [docs/data-model.md](docs/data-model.md) | Database design for all four stages |
| [docs/payments-architecture.md](docs/payments-architecture.md) | Paystack integration and webhook design (Stage 2) |
| [docs/operating-guide.md](docs/operating-guide.md) | How staff use the administration area |
| [docs/deployment.md](docs/deployment.md) | Deployment, backups and restore testing |

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · PostgreSQL + Prisma 7 · Better Auth (email/password + TOTP) · Zod · Vitest · Playwright + axe.
