# Deployment

**Hosting:** Vercel, connected to the GitHub repository `ibmapple03-stack/nsdbusiness`. Every push to `main` deploys automatically. No database is needed.

## First deployment

1. In Vercel, import the repository. Leave the build settings on their defaults.
2. Deploy. The site works with no environment variables, including the enquiry forms (see below).
3. Connect the domain: Vercel → Settings → Domains → add `www.nsdbusinessltd.com` (and `nsdbusinessltd.com`, redirecting to www). Add the DNS records Vercel shows at the domain registrar.

## Enquiry forms (FormSubmit — on by default)

On Vercel the forms work with no settings: the website checks each message, then the visitor's browser sends it through **FormSubmit** (formsubmit.co, free, no account or DNS records) to `ENQUIRY_TO`, which defaults to info@nsdbusinessltd.com. The visitor's address is set as Reply-To.

**One-time activation**
1. Make sure info@ can receive email.
2. Send a test message from the live site's Contact page. The site will say online messages are being switched on — that is expected.
3. Open info@: FormSubmit sends an email with an **Activate Form** button. Click it.
4. Send another test message; it should now arrive in info@ (check spam the first time).

**Optional, after activation**
- FormSubmit's confirmation email contains a random string that can replace the email address. Add it in Vercel as `FORMSUBMIT_ALIAS`, then redeploy.
- Add `FORM_SECRET` (a random value from `openssl rand -base64 32`) for stronger spam protection, then redeploy.
- To send copies elsewhere, set `ENQUIRY_TO` to another address (it then needs activating once too).

**Alternative: Resend.** For delivery through your own domain, set `EMAIL_DRIVER=resend`, `RESEND_API_KEY` and `EMAIL_FROM` after verifying the domain in Resend.

Never set `E2E_CONSOLE_EMAIL` on Vercel; it exists only for automated tests.

## Before go-live

- [ ] Contact details, mailboxes and phone tested
- [ ] Policies reviewed by a legal professional
- [ ] FormSubmit activated and a test message received at info@
- [ ] Logo replaced with the original vector export (recommended)
