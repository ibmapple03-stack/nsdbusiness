import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { getPolicies } from "@/server/public-data";

export const metadata: Metadata = {
  title: "Policies",
  description: "Privacy, terms of use, enrolment and refunds, complaints and accessibility policies.",
  alternates: { canonical: "/policies" },
};

export default async function PoliciesPage() {
  const policies = await getPolicies();
  return (
    <>
      <PageHeader title="Policies" intro="How we handle your information, enrolment, refunds and complaints." />
      <div className="container-page py-12">
        {policies.length ? (
          <ul className="max-w-3xl divide-y divide-line border-y border-line">
            {policies.map((p) => (
              <li key={p.slug} className="py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-semibold">
                    <Link href={`/policies/${p.slug}`} className="hover:underline hover:decoration-gold-500 hover:underline-offset-4">
                      {p.title}
                    </Link>
                  </h2>
                </div>
                {p.summary && <p className="mt-1 text-muted">{p.summary}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Policies are being finalised">
            <p>Our policies will be published here after management and legal review.</p>
          </EmptyState>
        )}
      </div>
    </>
  );
}
