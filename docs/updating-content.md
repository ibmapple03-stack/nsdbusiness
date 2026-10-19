# Updating the website's content

All text on the website lives in plain files in `src/content/`. There is no admin area: to change something, edit the file (or ask your developer), commit, and push to GitHub. Vercel publishes the change automatically within a few minutes.

| To change… | Edit | Notes |
|---|---|---|
| Phone, email, address, office hours, map | `contact.ts` | Add office hours, map pin or WhatsApp only once confirmed. |
| A course, or publish a new one | `courses.ts` | Set `published: true` only when management has approved its details, fee, certificate wording and refund terms. |
| Course dates and fees | the course's `cohorts` list in `courses.ts` | Add only approved dates, venue and fee. `status: "OPEN"` shows "Open for applications". |
| Page text (home, about, admissions, corporate) | `pages.ts` | |
| Policies | `policies.ts` | Update `POLICIES_EFFECTIVE_FROM` when the wording changes. |
| Team | `people.ts` | Publish a person only with approval and their permission. Photos go in `public/team/`. |
| News and events | `news.ts` | Confirmed facts only. |

## Text format

- A line starting with `- ` is a bullet point.
- A blank line starts a new paragraph.
- `## Heading` makes a heading (used in policies).

## Rules that always apply

- Never invent figures, partners, testimonials, outcomes or accreditation. Describe the academy only as CAC-incorporated.
- Real people appear only with approval and their permission.
- The automated checks (`npm test`) fail if published content contains `[bracketed placeholders]`, draft notes or accreditation claims.

## Enquiry forms

Messages from the contact, corporate-training and partnership forms are delivered by FormSubmit to `ENQUIRY_TO` (info@nsdbusinessltd.com by default), with the visitor's address as Reply-To, so the office simply replies. Nothing is stored on the website. FormSubmit needs a one-time activation (see `deployment.md`).
