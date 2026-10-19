import "server-only";
import { env } from "@/server/env";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  /** Labelled fields, shown as a table by FormSubmit. */
  fields?: Record<string, string>;
};

/**
 * FormSubmit request for a message. FormSubmit only accepts submissions from
 * visitors' browsers, so the server validates the enquiry and returns this
 * request for the browser to send (see components/ui/action-form.tsx).
 */
export function formSubmitRequest(message: EmailMessage) {
  return {
    url: `https://formsubmit.co/ajax/${encodeURIComponent(env.FORMSUBMIT_ALIAS ?? message.to)}`,
    payload: {
      ...(message.fields ?? { Message: message.text }),
      _subject: message.subject,
      ...(message.replyTo ? { _replyto: message.replyTo } : {}),
      _template: "table",
      // Spam checks (honeypot, timing token, rate limit) already ran on our server.
      _captcha: "false",
    } as Record<string, string>,
  };
}

/**
 * Email adapter.
 * - console: development; prints the message.
 * - formsubmit: not sent from the server; see formSubmitRequest().
 * - resend: Resend API (needs RESEND_API_KEY and a verified sending domain).
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.EMAIL_DRIVER === "console") {
    console.info(`\n── email (dev) ──\nTo: ${message.to}\nReply-To: ${message.replyTo ?? "-"}\nSubject: ${message.subject}\n\n${message.text}\n─────────────────\n`);
    return;
  }

  if (env.EMAIL_DRIVER === "formsubmit") throw new Error("FormSubmit messages are sent from the browser; use formSubmitRequest()");

  if (!env.RESEND_API_KEY) throw new Error("EMAIL_DRIVER=resend requires RESEND_API_KEY");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Email provider rejected the message (HTTP ${res.status})`);
}
