import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DraftMarker, PageHeader } from "@/components/ui/misc";
import { RichText, listItems } from "@/components/ui/rich-text";
import { getContentBlocks, getVerifiedContact } from "@/server/public-data";

export const metadata: Metadata = {
  title: "Admissions",
  description: "How to apply to NSD Business Academy: steps, requirements, fees and help with your application.",
  alternates: { canonical: "/admissions" },
};

export default async function AdmissionsPage() {
  const [blocks, contact] = await Promise.all([getContentBlocks(), getVerifiedContact()]);
  const steps = blocks["admissions.steps"];
  const others = (["admissions.requirements", "admissions.fees", "admissions.support"] as const).map((k) => blocks[k]).filter(Boolean);

  return (
    <>
      <PageHeader title="Admissions" intro="Applying is a few clear steps. Paying a fee alone does not secure a place — we confirm your place once your application is accepted and your payment is verified." />

      <div className="container-page py-12 lg:py-16">
        <Alert tone="info" title="Online applications are not open yet">
          <p>
            Online applications open when the student portal launches. Until then, contact the academy office to register your interest in a course
            {contact.phone ? <> on {contact.phone}</> : null}, or <Link href="/contact" className="underline underline-offset-2">send us a message</Link>.
          </p>
        </Alert>

        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          {steps && (
            <section aria-labelledby="steps-heading">
              <DraftMarker show={steps.isDraft} />
              <h2 id="steps-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
                {steps.title}
              </h2>
              {/* These steps really are a sequence, so they are numbered. */}
              <ol className="mt-6 space-y-0">
                {listItems(steps.body).map((step, i, all) => (
                  <li key={step} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-6">
                    {i < all.length - 1 && <span aria-hidden className="absolute left-[1.2rem] top-10 h-[calc(100%-2.5rem)] w-px bg-navy-200" />}
                    <span aria-hidden className="flex size-10 items-center justify-center rounded-full border-2 border-navy-700 bg-paper font-display font-semibold text-navy-800">
                      {i + 1}
                    </span>
                    <p className="pt-1.5 text-[1.0625rem]">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="space-y-8">
            {others.map((b) => (
              <section key={b!.title} className="rounded-[var(--radius-lg)] border border-line p-6">
                <DraftMarker show={b!.isDraft} />
                <h2 className="text-xl font-semibold">{b!.title}</h2>
                <RichText text={b!.body} className="prose-academy mt-2 text-[0.9375rem]" />
              </section>
            ))}
            <section className="rounded-[var(--radius-lg)] bg-surface p-6">
              <h2 className="text-xl font-semibold">Scholarships</h2>
              <p className="mt-2 text-[0.9375rem] text-muted">There is no scholarship scheme at present. Any approved scheme will be announced here.</p>
            </section>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/courses">Browse courses</ButtonLink>
          <ButtonLink href="/policies/enrolment-and-refunds" variant="secondary">
            Read the enrolment and refund policy
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
