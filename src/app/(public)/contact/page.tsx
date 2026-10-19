import type { Metadata } from "next";
import { Suspense } from "react";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { FormSkeleton, PageHeader } from "@/components/ui/misc";
import { SITE } from "@/lib/site";
import { getVerifiedContact } from "@/server/public-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact NSD Business Academy in Yola, Adamawa State.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const contact = await getVerifiedContact();
  return (
    <>
      <PageHeader title="Contact the academy" intro="Ask about courses, admissions or training for your organisation. We reply by email." />
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_1.3fr] lg:py-16">
        <section aria-labelledby="details-heading" className="space-y-8">
          <div>
            <h2 id="details-heading" className="text-[1.5rem] font-bold tracking-[-0.02em]">
              Contact details
            </h2>
            <dl className="mt-5 space-y-4">
              <Detail label="Address">{contact.address ?? SITE.location}</Detail>
              {contact.phone && (
                <Detail label="Telephone">
                  <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
                    {contact.phone}
                  </a>
                </Detail>
              )}
              {contact.email && (
                <Detail label="Email">
                  <a href={`mailto:${contact.email}`} className="underline decoration-navy-200 underline-offset-4 hover:decoration-gold-500">
                    {contact.email}
                  </a>
                </Detail>
              )}
              {contact.officeHours && <Detail label="Office hours">{contact.officeHours} (Nigeria time, WAT)</Detail>}
            </dl>
            {!contact.phone && !contact.email && <p className="mt-6 text-[0.9375rem] text-muted">Telephone and email details will be published here once confirmed. In the meantime, use the form to reach us.</p>}
          </div>
          {contact.mapQuery && (
            <div className="overflow-hidden rounded-[var(--radius-lg)] border border-line">
              <iframe
                title="Map showing the academy's location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
                className="aspect-[4/3] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </section>

        <section aria-labelledby="form-heading" className="rounded-[var(--radius-lg)] border border-line p-6 shadow-[var(--shadow-raised)] sm:p-8">
          <h2 id="form-heading" className="mb-6 text-[1.5rem] font-bold tracking-[-0.02em]">
            Send a message
          </h2>
          <Suspense fallback={<FormSkeleton />}>
            <EnquiryForm type="CONTACT" />
          </Suspense>
        </section>
      </div>
    </>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-[1.0625rem] font-medium">{children}</dd>
    </div>
  );
}
