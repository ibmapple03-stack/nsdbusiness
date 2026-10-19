"use client";

import { createContext, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/button";

export type ActionResult = { ok: boolean; message?: string; fieldErrors?: Record<string, string> } | null;
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
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

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
