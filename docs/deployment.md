# Deployment

**Hosting:** Vercel, connected to the GitHub repository `ibmapple03-stack/nsdbusiness`. Every push to `main` deploys automatically. No database is needed.

## First deployment

1. In Vercel, import the repository. Leave the build settings on their defaults.
2. Deploy. The site works with no environment variables; the enquiry forms show the office phone and email until step 3 is done.
3. Connect the domain: Vercel → Settings → Domains → add `www.nsdbusinessltd.com` (and `nsdbusinessltd.com`, redirecting to www). Add the DNS records Vercel shows at the domain registrar.

## Turning on the enquiry forms

1. Create a Resend account (resend.com), add the domain `nsdbusinessltd.com`, and add the DNS records it shows (SPF, DKIM; add a DMARC record too). Wait until Resend shows the domain as verified.
2. Create a Resend API key with "sending access".
3. In Vercel → Settings → Environment Variables, add:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.nsdbusinessltd.com` |
| `EMAIL_DRIVER` | `resend` |
| `RESEND_API_KEY` | the key from Resend |
| `EMAIL_FROM` | `NSD Business Academy <no-reply@nsdbusinessltd.com>` |
| `ENQUIRY_TO` | `info@nsdbusinessltd.com` |
| `FORM_SECRET` | a random value: `openssl rand -base64 32` |

4. Redeploy (Deployments → ⋯ → Redeploy), then send a test message from each form and confirm it arrives at info@.

Never set `E2E_CONSOLE_EMAIL` on Vercel; it exists only for automated tests.

## Before go-live

- [ ] Contact details, mailboxes and phone tested
- [ ] Policies reviewed by a legal professional
- [ ] Enquiry forms send to info@ (or are deliberately left as phone/email)
- [ ] Logo replaced with the original vector export (recommended)
