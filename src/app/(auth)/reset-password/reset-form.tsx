"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";

const input =
  "block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 text-[1rem] hover:border-navy-400 focus:border-navy-700 focus:outline-none focus:ring-3 focus:ring-gold-500/50";

export function ResetForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    if (password !== String(form.get("confirm"))) return setError("The two passwords do not match.");
    if (password.length < 12) return setError("Use at least 12 characters.");
    setState("pending");
    setError(null);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    if (error) {
      setState("idle");
      return setError("This link is invalid or has expired. Ask for a new one from the sign-in page.");
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <Alert tone="success" title="Your password is set">
        <p>
          <Link href="/login" className="underline underline-offset-2">
            Sign in now
          </Link>
          . Staff will then set up an authenticator app.
        </p>
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-live="polite">
      {error && <Alert tone="danger" title={error} />}
      <div>
        <label htmlFor="password" className="mb-1.5 block font-display text-[0.9375rem] font-medium">
          New password
        </label>
        <input id="password" name="password" type="password" minLength={12} required autoComplete="new-password" className={input} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block font-display text-[0.9375rem] font-medium">
          Confirm new password
        </label>
        <input id="confirm" name="confirm" type="password" minLength={12} required autoComplete="new-password" className={input} />
      </div>
      <button type="submit" disabled={state === "pending"} className={buttonClass("primary", "md", "w-full")}>
        {state === "pending" ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
