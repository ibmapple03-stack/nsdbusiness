"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";

/** A request the browser must send after the server accepted the form (e.g. to FormSubmit). */
export type Delivery = { url: string; payload: Record<string, string>; fallbackEmail: string };
export type ActionResult = { ok: boolean; message?: string; fieldErrors?: Record<string, string>; deliver?: Delivery } | null;
export type FormAction = (prev: ActionResult, formData: FormData) => Promise<ActionResult>;

const FormStateContext = createContext<ActionResult>(null);
export const useFieldError = (name: string) => useContext(FormStateContext)?.fieldErrors?.[name];

/**
 * Progressive-enhancement form: works as a plain POST without JavaScript and
 * shows field-level errors returned by the server action when JS is available.
 */
export function ActionForm({
  action,
  children,
  className = "",
  resetOnSuccess = false,
  successMessage,
  ...rest
}: {
  action: FormAction;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage?: string;
} & Omit<React.ComponentProps<"form">, "action" | "children">) {
  const [serverState, formAction] = useActionState(action, null);
  const [delivered, setDelivered] = useState<{ for: ActionResult; result: ActionResult } | null>(null);
  const ref = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  // When the server hands back a delivery, the browser sends it and its outcome becomes the result.
  const sending = !!serverState?.deliver && delivered?.for !== serverState;
  const state: ActionResult = serverState?.deliver ? (sending ? null : delivered!.result) : serverState;

  useEffect(() => {
    const deliver = serverState?.deliver;
    if (!deliver) return;
    let cancelled = false;
    deliverInBrowser(deliver).then((result) => {
      if (!cancelled) setDelivered({ for: serverState, result });
    });
    return () => {
      cancelled = true;
    };
  }, [serverState]);

  useEffect(() => {
    if (!state) return;
    if (state.ok && resetOnSuccess) ref.current?.reset();
    // Move focus to the result so screen-reader and keyboard users hear it.
    summaryRef.current?.focus();
  }, [state, resetOnSuccess]);

  const errorCount = Object.keys(state?.fieldErrors ?? {}).length;

  return (
    <FormStateContext.Provider value={state}>
      <form ref={ref} action={formAction} className={className} noValidate {...rest}>
        <div ref={summaryRef} tabIndex={-1} className="outline-none" aria-live="polite">
          {sending && <Alert tone="info" title="Sending your message…" />}
          {state && !state.ok && (
            <Alert tone="danger" title={state.message ?? "Check the form and try again."}>
              {errorCount > 0 && <p>{errorCount === 1 ? "One field needs attention." : `${errorCount} fields need attention.`}</p>}
            </Alert>
          )}
          {state?.ok && (state.message || successMessage) && <Alert tone="success" title={state.message ?? successMessage!} />}
        </div>
        {children}
      </form>
    </FormStateContext.Provider>
  );
}

const SENT = "Thank you. Your message has been sent to the academy office, and we will reply by email.";

async function deliverInBrowser({ url, payload, fallbackEmail }: Delivery): Promise<ActionResult> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
    const body = (await res.json().catch(() => null)) as { success?: string | boolean; message?: string } | null;
    if (res.ok && (body?.success === true || body?.success === "true")) return { ok: true, message: SENT };
    if (body?.message && /activat/i.test(body.message)) {
      return { ok: false, message: `Online messages are being switched on. Please email ${fallbackEmail} for now.` };
    }
  } catch {
    // Network error or blocked request: fall through.
  }
  return { ok: false, message: `Your message could not be sent. Please email ${fallbackEmail} instead.` };
}

export function SubmitButton({ children, pendingLabel, variant = "primary", size = "md", className = "", ...props }: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "quiet";
  size?: "sm" | "md" | "lg";
  className?: string;
} & Omit<React.ComponentProps<"button">, "type" | "children">) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={buttonClass(variant, size, className)} disabled={pending} aria-disabled={pending} {...props}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </button>
  );
}
