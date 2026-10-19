"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";

const input =
  "block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 text-[1rem] hover:border-navy-400 focus:border-navy-700 focus:outline-none focus:ring-3 focus:ring-gold-500/50";
const label = "mb-1.5 block font-display text-[0.9375rem] font-medium text-navy-900";

export function LoginForm() {
  const [step, setStep] = useState<"password" | "totp">("password");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  async function onPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(
        error.status === 429
          ? "Too many attempts. Wait a minute and try again."
          : error.status === 403
            ? "Confirm your email address first. We have sent you a new confirmation link."
            : "The email or password is not correct.",
      );
      return;
    }
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      setStep("totp");
      return;
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload so the server reads the new session
    window.location.assign("/admin");
  }

  async function onTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    const { error } = await authClient.twoFactor.verifyTotp({ code: String(form.get("code")).replace(/\s/g, ""), trustDevice: false });
    setPending(false);
    if (error) {
      setError(error.status === 429 ? "Too many attempts. Your account is locked briefly — try again later." : "That code is not correct or has expired. Enter the current code.");
      return;
    }
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload so the server reads the new session
    window.location.assign("/admin");
  }

  async function onForgot() {
    const email = emailRef.current?.value.trim();
    if (!email) {
      setError("Enter your email address first, then choose “Forgot password”.");
      emailRef.current?.focus();
      return;
    }
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
    // Same message whether or not the account exists.
    setForgotSent(true);
    setError(null);
  }

  return (
    <div aria-live="polite">
      {error && <Alert tone="danger" title={error} />}
      {forgotSent && <Alert tone="success" title="If that email has an account, a link to reset the password is on its way." />}

      {step === "password" ? (
        <form onSubmit={onPassword} className="space-y-4">
          <div>
            <label htmlFor="email" className={label}>
              Email address
            </label>
            <input ref={emailRef} id="email" name="email" type="email" required autoComplete="username" className={input} />
          </div>
          <div>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
          </div>
          <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
          <button type="button" onClick={onForgot} className="text-[0.9375rem] font-medium text-navy-700 underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
            Forgot password
          </button>
        </form>
      ) : (
        <form onSubmit={onTotp} className="space-y-4">
          <div>
            <label htmlFor="code" className={label}>
              Authenticator code
            </label>
            <p id="code-hint" className="mb-2 text-sm text-muted">
              Open your authenticator app and enter the 6-digit code for NSD Business Academy.
            </p>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              required
              autoFocus
              aria-describedby="code-hint"
              className={`${input} font-mono text-xl tracking-[0.3em]`}
            />
          </div>
          <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
            {pending ? "Checking…" : "Verify and continue"}
          </button>
        </form>
      )}
    </div>
  );
}
