import type { Event, NewsPost } from "@/generated/prisma/client";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { SelectField, TextArea, TextField } from "@/components/ui/field";
import { saveEventAction, saveNewsAction } from "@/app/admin/actions";
import { toWATLocalInput } from "@/lib/time";

export function NewsForm({ post, readOnly = false }: { post?: NewsPost; readOnly?: boolean }) {
  return (
    <ActionForm action={saveNewsAction} className="space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-80">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="title" label="Title" required defaultValue={post?.title} />
          <TextField name="slug" label="Web address" required defaultValue={post?.slug} />
          <SelectField
            name="kind"
            label="Type"
            required
            defaultValue={post?.kind ?? "ANNOUNCEMENT"}
            options={[
              { value: "ANNOUNCEMENT", label: "Announcement" },
              { value: "UPDATE", label: "Update" },
              { value: "GUIDE", label: "Guide" },
            ]}
          />
        </div>
        <TextArea name="summary" label="Summary" rows={2} defaultValue={post?.summary} />
        <TextArea name="body" label="Text" rows={12} defaultValue={post?.body} hint="Plain text. “## ” for headings, “- ” for bullets." />
      </fieldset>
      {!readOnly && <SubmitButton>{post ? "Save post" : "Create post"}</SubmitButton>}
    </ActionForm>
  );
}

export function EventForm({ event, readOnly = false }: { event?: Event; readOnly?: boolean }) {
  return (
    <ActionForm action={saveEventAction} className="space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}
      <fieldset disabled={readOnly} className="space-y-5 disabled:opacity-80">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="title" label="Title" required defaultValue={event?.title} />
          <TextField name="slug" label="Web address" required defaultValue={event?.slug} />
          <TextField name="startsAt" label="Starts (WAT)" type="datetime-local" required defaultValue={toWATLocalInput(event?.startsAt)} />
          <TextField name="endsAt" label="Ends (WAT)" type="datetime-local" defaultValue={toWATLocalInput(event?.endsAt)} />
          <TextField name="location" label="Location" className="md:col-span-2" defaultValue={event?.location} />
        </div>
        <TextArea name="description" label="Description" rows={6} defaultValue={event?.description} />
      </fieldset>
      {!readOnly && <SubmitButton>{event ? "Save event" : "Create event"}</SubmitButton>}
    </ActionForm>
  );
}
