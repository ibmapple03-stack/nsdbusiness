import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { DraftMarker, FormSkeleton, PageHeader } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { getContentBlocks } from "@/server/public-data";

export const metadata: Metadata = {
  title: "Corporate training and partnerships",
  description: "Request custom training for your organisation or discuss sponsorship and partnership with NSD Business Academy.",
  alternates: { canonical: "/corporate-training" },
};

export default async function CorporatePage() {
  const blocks = await getContentBlocks();
  const corporate = blocks["corporate.intro"];
  const partnership = blocks["partnerships.intro"];

  return (
    <>
      <PageHeader title="Corporate training and partnerships" intro="Practical training shaped around your staff, members or beneficiaries — and opportunities to support learners in Adamawa State." />

      <div className="container-page grid gap-16 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
        <section aria-labelledby="corporate-heading" className="space-y-6">
          <div>
            {corporate && <DraftMarker show={corporate.isDraft} />}
            <h2 id="corporate-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
              {corporate?.title ?? "Training for your organisation"}
            </h2>
            {corporate && <RichText text={corporate.body} className="prose-academy mt-3 text-muted" />}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-line p-6 shadow-[var(--shadow-raised)]">
            <h3 className="mb-5 text-lg font-semibold">Request a training proposal</h3>
            <Suspense fallback={<FormSkeleton />}>
              <EnquiryForm type="CORPORATE_TRAINING" submitLabel="Request a proposal" />
            </Suspense>
          </div>
        </section>

        <section aria-labelledby="partnership-heading" className="space-y-6">
          <div>
            {partnership && <DraftMarker show={partnership.isDraft} />}
            <h2 id="partnership-heading" className="text-[1.75rem] font-bold tracking-[-0.02em]">
              {partnership?.title ?? "Partner with the academy"}
            </h2>
            {partnership && <RichText text={partnership.body} className="prose-academy mt-3 text-muted" />}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-line p-6 shadow-[var(--shadow-raised)]">
            <h3 className="mb-5 text-lg font-semibold">Register partnership interest</h3>
            <Suspense fallback={<FormSkeleton />}>
              <EnquiryForm type="PARTNERSHIP" submitLabel="Send partnership enquiry" />
            </Suspense>
          </div>
        </section>
      </div>
    </>
  );
}
