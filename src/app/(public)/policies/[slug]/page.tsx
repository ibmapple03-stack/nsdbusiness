import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Breadcrumb } from "@/components/ui/misc";
import { RichText } from "@/components/ui/rich-text";
import { formatDate } from "@/lib/time";
import { getPolicies, getPolicy } from "@/server/public-data";

// Blocks on purpose: unknown or unpublished slugs must return a real HTTP 404.
export const instant = false;

export async function generateStaticParams() {
  const policies = await getPolicies();
  return policies.length ? policies.map((p) => ({ slug: p.slug })) : [{ slug: "__none" }];
}

export async function generateMetadata(props: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const policy = await getPolicy((await props.params).slug);
  if (!policy) return { title: "Not found", robots: { index: false } };
  return {
    title: policy.title,
    description: policy.summary || undefined,
    alternates: { canonical: `/policies/${policy.slug}` },
    robots: policy.isDraft ? { index: false, follow: false } : undefined,
  };
}

export default async function PolicyPage(props: PageProps<"/policies/[slug]">) {
  const policy = await getPolicy((await props.params).slug);
  if (!policy) notFound();
  return (
    <article className="container-page py-10 lg:py-14">
      <Breadcrumb items={[{ href: "/policies", label: "Policies" }, { label: policy.title }]} />
      <h1 className="mt-6 max-w-3xl text-[clamp(2rem,4.5vw,2.75rem)] font-bold tracking-[-0.03em]">{policy.title}</h1>
      <p className="mt-3 text-muted">
        Version {policy.version}
        {policy.effectiveFrom && !policy.isDraft && <> · effective {formatDate(policy.effectiveFrom)}</>}
      </p>
      {policy.isDraft && (
        <Alert tone="warning" title="Draft — pending management and legal review" className="mt-6 max-w-3xl">
          <p>This text has not been approved and is shown only in the development preview. Bracketed items are facts the academy still needs to supply.</p>
        </Alert>
      )}
      <RichText text={policy.body} className="prose-academy mt-8 text-[1.0625rem]" />
    </article>
  );
}
