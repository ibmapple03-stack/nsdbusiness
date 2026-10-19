import "server-only";
import { env } from "@/server/env";

export type EmailMessage = { to: string; subject: string; text: string };

/**
 * Email adapter. Development prints messages to the server console.
 * Production uses Resend once RESEND_API_KEY and a verified sending domain exist.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (env.EMAIL_DRIVER === "console") {
    console.info(`\n── email (dev) ──\nTo: ${message.to}\nSubject: ${message.subject}\n\n${message.text}\n─────────────────\n`);
    return;
  }

  if (!env.RESEND_API_KEY) throw new Error("EMAIL_DRIVER=resend requires RESEND_API_KEY");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.EMAIL_FROM, to: [message.to], subject: message.subject, text: message.text }),
  });
  if (!res.ok) throw new Error(`Email provider rejected the message (HTTP ${res.status})`);
}
