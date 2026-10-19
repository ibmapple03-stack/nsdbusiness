import Link from "next/link";
import { connection } from "next/server";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/ui/field";
import { submitEnquiry } from "@/app/actions/enquiry";
import { issueFormToken } from "@/server/form-token";
import type { EnquiryType } from "@/generated/prisma/enums";

/**
 * One accessible enquiry form used for contact, corporate training and
 * partnership enquiries. Rendered per request so its timing token is fresh.
 */
export async function EnquiryForm({ type, submitLabel = "Send message" }: { type: EnquiryType; submitLabel?: string }) {
  await connection();
  const token = issueFormToken();

  return (
    <ActionForm action={submitEnquiry} resetOnSuccess className="space-y-5">
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="token" value={token} />
      {/* Honeypot — hidden from people and assistive technology. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="name" label="Your name" required autoComplete="name" />
        <TextField name="email" label="Email address" type="email" required autoComplete="email" />
        <TextField name="phone" label="Phone number" type="tel" autoComplete="tel" placeholder="+234 803 000 0000" />
        {type !== "CONTACT" ? (
          <TextField name="organisationName" label="Organisation" required autoComplete="organization" />
        ) : (
          <TextField name="subject" label="Subject" />
        )}
      </div>

      {type === "CORPORATE_TRAINING" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            name="headcount"
            label="Number of participants"
            placeholder="Choose a range"
            options={["1–10", "11–25", "26–50", "51–100", "More than 100"].map((v) => ({ value: v, label: v }))}
          />
          <TextField name="preferredDates" label="Preferred dates or timeframe" />
          <TextField name="topics" label="Topics you need" className="sm:col-span-2" hint="For example: bookkeeping for market traders, digital marketing for staff." />
        </div>
      )}

      {type === "PARTNERSHIP" && (
        <SelectField
          name="interest"
          label="Area of interest"
          placeholder="Choose one"
          options={["Sponsoring learners", "Co-delivering training", "Providing venues or equipment", "Employer links and placements", "Other"].map((v) => ({ value: v, label: v }))}
        />
      )}

      <TextArea name="message" label={type === "CONTACT" ? "Your message" : "Tell us more"} required rows={6} />

      <CheckboxField
        name="consent"
        label="I agree that NSD Business Academy may use these details to reply to my enquiry."
        hint={
          <>
            See the <Link href="/policies/privacy" className="underline underline-offset-2">privacy notice</Link> for how we handle personal information.
          </>
        }
      />

      <SubmitButton pendingLabel="Sending…">{submitLabel}</SubmitButton>
    </ActionForm>
  );
}
