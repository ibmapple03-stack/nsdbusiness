import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { TextArea, TextField } from "@/components/ui/field";
import { saveVenueAction } from "@/app/admin/actions";
import { requireStaffPage } from "@/server/auth/session";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Venues" };

export default async function VenuesPage() {
  const actor = await requireStaffPage("venue.edit");
  const venues = await db.venue.findMany({ where: { organisationId: actor.organisationId }, orderBy: { name: "asc" } });
  return (
    <>
      <AdminHeader title="Venues" description="Classrooms and other spaces used for teaching. Venues are used for timetable clash checks." />
      <div className="grid gap-6 xl:grid-cols-2">
        {venues.map((v) => (
          <Panel key={v.id} title={v.name}>
            <VenueForm venue={v} />
          </Panel>
        ))}
        <Panel title="Add a venue">
          <VenueForm />
        </Panel>
      </div>
    </>
  );
}

function VenueForm({ venue }: { venue?: { id: string; name: string; address: string; capacity: number | null; notes: string } }) {
  return (
    <ActionForm action={saveVenueAction} resetOnSuccess={!venue} className="space-y-4">
      {venue && <input type="hidden" name="id" value={venue.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <TextField name="name" label="Name" required defaultValue={venue?.name} />
        <TextField name="capacity" label="Capacity" type="number" min={0} defaultValue={venue?.capacity ?? ""} />
      </div>
      <TextField name="address" label="Address" defaultValue={venue?.address} />
      <TextArea name="notes" label="Notes" rows={2} defaultValue={venue?.notes} />
      <SubmitButton size="sm" variant="secondary">
        {venue ? "Save venue" : "Add venue"}
      </SubmitButton>
    </ActionForm>
  );
}
