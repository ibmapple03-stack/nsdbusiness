"use client";

import { useId, type ReactNode } from "react";
import { useFieldError } from "@/components/ui/action-form";

const control =
  "block w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2.5 text-[1rem] text-ink " +
  "placeholder:text-muted/70 transition-[border-color,box-shadow] duration-150 " +
  "hover:border-navy-400 focus:border-navy-700 focus:outline-none focus:ring-3 focus:ring-gold-500/50 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger/20 disabled:bg-surface";

type Common = { name: string; label: string; hint?: ReactNode; required?: boolean; className?: string };

function Wrapper({ id, label, hint, error, required, children, className = "" }: { id: string; label: string; hint?: ReactNode; error?: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={id} className="block font-display text-[0.9375rem] font-medium text-navy-900">
        {label}
        {required ? <span className="text-danger"> *</span> : <span className="font-sans text-sm font-normal text-muted"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm leading-snug text-muted">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function TextField({ name, label, hint, required, className, type = "text", ...props }: Common & Omit<React.ComponentProps<"input">, "name">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input id={id} name={name} type={type} required={required} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={control} {...props} />
    </Wrapper>
  );
}

export function TextArea({ name, label, hint, required, className, rows = 5, ...props }: Common & Omit<React.ComponentProps<"textarea">, "name">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea id={id} name={name} rows={rows} required={required} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control} leading-relaxed`} {...props} />
    </Wrapper>
  );
}

export function SelectField({ name, label, hint, required, className, options, placeholder, ...props }: Common & { options: { value: string; label: string }[]; placeholder?: string } & Omit<React.ComponentProps<"select">, "name">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select id={id} name={name} required={required} aria-invalid={!!error} aria-describedby={describedBy(id, hint, error)} className={`${control} pr-8`} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ name, label, hint, value = "on", className = "", ...props }: Omit<Common, "required"> & Omit<React.ComponentProps<"input">, "name" | "type">) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className={`flex gap-3 ${className}`}>
      <input
        id={id}
        name={name}
        type="checkbox"
        value={value}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, hint, error)}
        className="mt-1 size-5 shrink-0 rounded border-line accent-navy-700"
        {...props}
      />
      <div>
        <label htmlFor={id} className="text-[0.9375rem] text-ink">
          {label}
        </label>
        {hint && (
          <p id={`${id}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/** Group of checkboxes sharing one name (e.g. delivery formats, roles). */
export function CheckboxGroup({ name, legend, options, defaultValues = [], hint }: { name: string; legend: string; options: { value: string; label: string }[]; defaultValues?: string[]; hint?: string }) {
  const error = useFieldError(name);
  const id = useId();
  return (
    <fieldset className="space-y-2" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="font-display text-[0.9375rem] font-medium text-navy-900">{legend}</legend>
      {hint && <p className="text-sm text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-[0.9375rem]">
            <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValues.includes(o.value)} className="size-5 rounded accent-navy-700" />
            {o.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
