import type { StaffProfile } from "@/generated/prisma/client";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { saveProfileAction } from "@/app/admin/actions";

export function ProfileForm({ profile, people, readOnly = false }: { profile?: StaffProfile; people: { id: string; name: string }[]; readOnly?: boolean }) {
  return (
    <ActionForm action={saveProfileAction} className="space-y-5">
      {profile && <input type="hidden" name="id" value={profile.id} />}
      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-80">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="name" label="Full name" required defaultValue={profile?.name} />
          <TextField name="slug" label="Web address" required defaultValue={profile?.slug} />
          <TextField name="publicTitle" label="Public title" required defaultValue={profile?.publicTitle} />
          <SelectField
            name="kind"
            label="Type"
            required
            defaultValue={profile?.kind ?? "STAFF"}
            options={[
              { value: "LEADERSHIP", label: "Leadership" },
              { value: "STAFF", label: "Staff" },
              { value: "INSTRUCTOR", label: "Instructor" },
            ]}
          />
          <SelectField name="reportsToId" label="Reports to" defaultValue={profile?.reportsToId ?? ""} placeholder="No one" options={people.filter((p) => p.id !== profile?.id).map((p) => ({ value: p.id, label: p.name }))} />
          <TextField name="sortOrder" label="Display order" type="number" min={0} defaultValue={profile?.sortOrder ?? 100} hint="Lower numbers appear first." />
        </div>
        <TextArea
          name="bio"
          label="Public biography"
          rows={6}
          defaultValue={profile?.bio}
          hint="Use only facts the person has approved. Do not add qualifications, affiliations or achievements that have not been supplied, or any private family, health, financial or residential information."
        />
        <TextArea name="internalNote" label="Internal note" rows={2} defaultValue={profile?.internalNote} hint="Never shown on the website." />
      </fieldset>
      {!readOnly && <SubmitButton>{profile ? "Save profile" : "Create profile"}</SubmitButton>}
    </ActionForm>
  );
}
