import "server-only";
import { siteUrl } from "@/lib/site";
import { env } from "@/server/env";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  /** Labelled fields, shown as a table by FormSubmit. */
  fields?: Record<string, string>;
};

export class EmailNotActivatedError extends Error {}

/**
 * Email adapter.
 * - console: development; prints the message.
 * - formsubmit: posts to FormSubmit's AJAX endpoint, which emails `to`.
 * - resend: Resend API (needs RESEND_API_KEY and a verified sending domain).
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.EMAIL_DRIVER === "console") {
    console.info(`\n── email (dev) ──\nTo: ${message.to}\nReply-To: ${message.replyTo ?? "-"}\nSubject: ${message.subject}\n\n${message.text}\n─────────────────\n`);
    return;
  }

  if (env.EMAIL_DRIVER === "formsubmit") {
    const target = env.FORMSUBMIT_ALIAS ?? message.to;
    const site = siteUrl();
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(target)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", Origin: site, Referer: `${site}/` },
      body: JSON.stringify({
        ...(message.fields ?? { Message: message.text }),
        _subject: message.subject,
        ...(message.replyTo ? { _replyto: message.replyTo } : {}),
        _template: "table",
        // Spam checks (honeypot, timing token, rate limit) run on our server before this call.
        _captcha: "false",
      }),
    });
    const body = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
    if (res.ok && (body?.success === true || body?.success === "true")) return;
    if (body?.message && /activat/i.test(body.message)) throw new EmailNotActivatedError(body.message);
    throw new Error(`FormSubmit rejected the message (HTTP ${res.status}): ${body?.message ?? "no details"}`);
  }

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
