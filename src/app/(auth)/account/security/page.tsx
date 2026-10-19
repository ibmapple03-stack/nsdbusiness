import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { FormSkeleton } from "@/components/ui/misc";
import { getSessionState } from "@/server/auth/session";
import { MfaSetup } from "./mfa-setup";

export const metadata: Metadata = { title: "Account security", robots: { index: false } };

export default function SecurityPage(props: PageProps<"/account/security">) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-paper p-6 shadow-[var(--shadow-floating)] sm:p-8">
      <h1 className="text-2xl font-bold tracking-[-0.02em]">Two-step sign-in</h1>
      <Suspense fallback={<FormSkeleton />}>
        <Content searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: Pick<PageProps<"/account/security">, "searchParams">) {
  const state = await getSessionState();
  if (state.kind === "anonymous") redirect("/login");
  const { setup } = await searchParams;
  const enabled = state.kind === "ready" && state.mfaEnabled;

  return (
    <div className="mt-4 space-y-4">
      {setup === "required" && !enabled && (
        <Alert tone="warning" title="Set up two-step sign-in to continue">
          <p>Staff accounts must use an authenticator app. This protects learner and financial records if a password is ever stolen.</p>
        </Alert>
      )}
      {enabled ? (
        <>
          <Alert tone="success" title="Two-step sign-in is on" />
          <ButtonLink href="/admin">Go to your dashboard</ButtonLink>
        </>
      ) : (
        <MfaSetup />
      )}
    </div>
  );
}
