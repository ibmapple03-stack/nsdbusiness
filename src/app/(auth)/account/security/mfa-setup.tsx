"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth-client";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";

const input =
  "block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 text-[1rem] hover:border-navy-400 focus:border-navy-700 focus:outline-none focus:ring-3 focus:ring-gold-500/50";

/** Enrol an authenticator app: confirm password → scan QR → enter first code → save backup codes. */
export function MfaSetup() {
  const [step, setStep] = useState<"password" | "scan" | "done">("password");
  const [qr, setQr] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function start(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const { data, error } = await authClient.twoFactor.enable({ password: String(new FormData(e.currentTarget).get("password")), method: "totp" });
    setPending(false);
    if (error?.status === 429) return setError("Too many attempts. Wait a few seconds and try again.");
    if (error || !data || data.method !== "totp") return setError("Your password is not correct.");
    setQr(await QRCode.toDataURL(data.totpURI, { margin: 1, width: 220, color: { dark: "#0d1b2a" } }));
    setSecret(new URL(data.totpURI).searchParams.get("secret") ?? "");
    setBackupCodes(data.backupCodes);
    setStep("scan");
  }

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const code = String(new FormData(e.currentTarget).get("code")).replace(/\s/g, "");
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    setPending(false);
    if (error?.status === 429) return setError("Too many attempts. Wait a few seconds and try again.");
    if (error) return setError("That code is not correct. Check the time on your phone and enter the current code.");
    setStep("done");
  }

  if (step === "password") {
    return (
      <form onSubmit={start} className="space-y-4" aria-live="polite">
        {error && <Alert tone="danger" title={error} />}
        <p className="text-[0.9375rem] text-muted">You will need an authenticator app such as Google Authenticator, Microsoft Authenticator or 2FAS on your phone.</p>
        <div>
          <label htmlFor="password" className="mb-1.5 block font-display text-[0.9375rem] font-medium">
            Confirm your password
          </label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
        </div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    );
  }

  if (step === "scan") {
    return (
      <form onSubmit={verify} className="space-y-5" aria-live="polite">
        {error && <Alert tone="danger" title={error} />}
        <p className="text-[0.9375rem]">Scan this code with your authenticator app, then enter the 6-digit code it shows.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="QR code for setting up your authenticator app" width={220} height={220} className="mx-auto rounded-[var(--radius-md)] border border-line" />
        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-navy-700">Can&rsquo;t scan? Enter the key manually</summary>
          <p className="mt-2 break-all rounded-[var(--radius-sm)] bg-surface p-3 font-mono">{secret}</p>
        </details>
        <div>
          <label htmlFor="code" className="mb-1.5 block font-display text-[0.9375rem] font-medium">
            6-digit code
          </label>
          <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" required className={`${input} font-mono text-xl tracking-[0.3em]`} />
        </div>
        <button type="submit" disabled={pending} className={buttonClass("primary", "md", "w-full")}>
          {pending ? "Checking…" : "Turn on two-step sign-in"}
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <Alert tone="success" title="Two-step sign-in is on" />
      <div>
        <h2 className="text-lg font-semibold">Save your backup codes</h2>
        <p className="mt-1 text-[0.9375rem] text-muted">Each code works once if you lose your phone. Store them somewhere safe and private. They will not be shown again.</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-surface p-4 font-mono text-[0.9375rem]">
          {backupCodes.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className={buttonClass("primary", "md", "w-full")}
        // Full navigation so the new session state is read fresh on the server.
        onClick={() => {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload so the server reads the new session
          window.location.assign("/admin");
        }}
      >
        I have saved my codes — continue
      </button>
    </div>
  );
}
