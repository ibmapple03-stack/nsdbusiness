import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Set your password", robots: { index: false } };

export default function ResetPasswordPage(props: PageProps<"/reset-password">) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-paper p-6 shadow-[var(--shadow-floating)] sm:p-8">
      <h1 className="text-2xl font-bold tracking-[-0.02em]">Set your password</h1>
      <p className="mt-1 text-[0.9375rem] text-muted">Use at least 12 characters. A short sentence is easier to remember than a complex word.</p>
      <div className="mt-6">
        <Suspense>
          <TokenGate searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function TokenGate({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  const { token, error } = await searchParams;
  if (error || typeof token !== "string") {
    return <p className="text-danger">This link is invalid or has expired. Ask for a new one from the sign-in page.</p>;
  }
  return <ResetForm token={token} />;
}
