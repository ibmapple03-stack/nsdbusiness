# Local setup

Requirements: Node.js 24 and npm 11. No database is needed.

```bash
npm install
npm run dev          # http://localhost:3000
```

Without a `.env` file, the enquiry forms work locally and print each message to the terminal instead of emailing it. To try real sending, copy `.env.example` to `.env` and fill in the Resend values.

## Checks

```bash
npm run lint && npm run typecheck && npm test && npm run test:e2e
```

- `npm test` — unit tests, including content checks (no placeholders, no accreditation claims).
- `npm run test:e2e` — builds the production site on port 3100 and tests every page at desktop and mobile sizes, with accessibility checks. First run: `npx playwright install chromium`.

## Screenshots

`node scripts/screenshot.mjs <url> [label] [WIDTHxHEIGHT] [--viewport]` saves to `temporary_screenshots/`.
