import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { SelectField, TextArea } from "@/components/ui/field";
import { updateEnquiryAction } from "@/app/admin/actions";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";
import { formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

const TYPE = { CONTACT: "Contact", CORPORATE_TRAINING: "Corporate training", PARTNERSHIP: "Partnership" } as const;
const DETAIL_LABELS: Record<string, string> = { headcount: "Participants", preferredDates: "Preferred dates", topics: "Topics", interest: "Area of interest" };

export default async function EnquiryPage(props: PageProps<"/admin/enquiries/[id]">) {
  const actor = await requireStaffPage("enquiry.view");
  const { id } = await props.params;
  const e = await db.enquiry.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!e) notFound();
  const details = (e.details ?? {}) as Record<string, string>;

  return (
    <>
      <AdminHeader title={e.subject || `${TYPE[e.type]} enquiry`} description={`Received ${formatDateTimeWAT(e.createdAt)}`} back={{ href: "/admin/enquiries", label: "All enquiries" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Panel>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Item label="Name">{e.name}</Item>
            <Item label="Email">
              <a href={`mailto:${e.email}`} className="underline underline-offset-2">
                {e.email}
              </a>
            </Item>
            {e.phone && <Item label="Phone">{e.phone}</Item>}
            {e.organisationName && <Item label="Organisation">{e.organisationName}</Item>}
            {Object.entries(details).map(([k, v]) => (
              <Item key={k} label={DETAIL_LABELS[k] ?? k}>
                {v}
              </Item>
            ))}
          </dl>
          <h2 className="mt-6 font-display font-semibold">Message</h2>
          <p className="mt-2 whitespace-pre-wrap">{e.message}</p>
        </Panel>
        {can(actor, "enquiry.manage") && (
          <Panel title="Handling">
            <ActionForm action={updateEnquiryAction} className="space-y-4">
              <input type="hidden" name="id" value={e.id} />
              <SelectField
                name="status"
                label="Status"
                required
                defaultValue={e.status}
                options={[
                  { value: "NEW", label: "New" },
                  { value: "IN_PROGRESS", label: "In progress" },
                  { value: "CLOSED", label: "Closed" },
                ]}
              />
              <TextArea name="note" label="Internal note" rows={4} defaultValue={e.handledNote} hint="e.g. Replied by email on 3 Nov; proposal sent." />
              <SubmitButton>Update</SubmitButton>
            </ActionForm>
          </Panel>
        )}
      </div>
    </>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="font-medium">{children}</dd>
    </div>
  );
}
