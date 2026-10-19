import type { Cohort } from "@/generated/prisma/client";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { CheckboxField, SelectField, TextArea, TextField } from "@/components/ui/field";
import { saveCohortAction } from "@/app/admin/actions";
import { FORMAT_LABELS } from "@/lib/site";
import { toDateInput } from "@/lib/time";

const STATUS = { PLANNED: "Planned (upcoming)", OPEN: "Open for applications", RUNNING: "Running", COMPLETED: "Completed", CANCELLED: "Cancelled" };

export function CohortForm({
  cohort,
  courses,
  venues,
  instructors,
  defaultCourseId,
  readOnly = false,
  statusOnly = false,
}: {
  cohort?: Cohort;
  courses: { id: string; title: string }[];
  venues: { id: string; name: string }[];
  instructors: { id: string; name: string }[];
  defaultCourseId?: string;
  readOnly?: boolean;
  /** Published cohorts may still move through planned → open → running → completed. */
  statusOnly?: boolean;
}) {
  const locked = readOnly || statusOnly;
  const hidden = (name: string, value: string | null | undefined) => (statusOnly ? <input type="hidden" name={name} value={value ?? ""} /> : null);
  return (
    <ActionForm action={saveCohortAction} className="space-y-6">
      {cohort && <input type="hidden" name="id" value={cohort.id} />}
      {statusOnly && cohort && (
        <>
          {hidden("courseId", cohort.courseId)}
          {hidden("code", cohort.code)}
          {hidden("startDate", toDateInput(cohort.startDate))}
          {hidden("endDate", toDateInput(cohort.endDate))}
          {hidden("applicationDeadline", toDateInput(cohort.applicationDeadline))}
          {hidden("timetableSummary", cohort.timetableSummary)}
          {hidden("deliveryFormat", cohort.deliveryFormat)}
          {hidden("venueId", cohort.venueId)}
          {hidden("instructorId", cohort.instructorId)}
          {hidden("capacity", String(cohort.capacity))}
          {hidden("paymentOptions", cohort.paymentOptions)}
          {cohort.instalmentsAllowed && hidden("instalmentsAllowed", "on")}
        </>
      )}
      <fieldset disabled={locked} className="grid gap-5 md:grid-cols-2 disabled:opacity-80">
        <SelectField name="courseId" label="Course" required defaultValue={cohort?.courseId ?? defaultCourseId} placeholder="Choose a course" options={courses.map((c) => ({ value: c.id, label: c.title }))} />
        <TextField name="code" label="Cohort code" required defaultValue={cohort?.code} hint="A short reference, e.g. ENT-2027-01" />
        <TextField name="startDate" label="Start date" type="date" required defaultValue={toDateInput(cohort?.startDate)} />
        <TextField name="endDate" label="End date" type="date" required defaultValue={toDateInput(cohort?.endDate)} />
        <TextField name="applicationDeadline" label="Application deadline" type="date" defaultValue={toDateInput(cohort?.applicationDeadline)} />
        <TextField name="capacity" label="Places available" type="number" min={1} required defaultValue={cohort?.capacity ?? 25} />
        <SelectField name="deliveryFormat" label="Delivery format" required defaultValue={cohort?.deliveryFormat ?? "CLASSROOM"} options={Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label }))} />
        <SelectField name="venueId" label="Venue" defaultValue={cohort?.venueId ?? ""} placeholder="No venue yet" options={venues.map((v) => ({ value: v.id, label: v.name }))} />
        <SelectField name="instructorId" label="Instructor" defaultValue={cohort?.instructorId ?? ""} placeholder="Not yet assigned" options={instructors.map((i) => ({ value: i.id, label: i.name }))} />
        <TextField name="timetableSummary" label="Timetable summary" defaultValue={cohort?.timetableSummary} hint="Shown publicly, e.g. Mondays and Wednesdays, 10:00–13:00 WAT" />
        <TextArea name="paymentOptions" label="Payment options" rows={2} className="md:col-span-2" defaultValue={cohort?.paymentOptions} hint="Describe accepted payment methods. Fees are set separately and need approval." />
        <CheckboxField name="instalmentsAllowed" label="Instalment plans may be offered for this cohort" defaultChecked={cohort?.instalmentsAllowed} className="md:col-span-2" />
      </fieldset>
      <fieldset disabled={readOnly}>
        <SelectField name="cohortStatus" label="Cohort stage" required defaultValue={cohort?.cohortStatus ?? "PLANNED"} options={Object.entries(STATUS).map(([value, label]) => ({ value, label }))} hint={statusOnly ? "This cohort is published. Only its stage can change here." : undefined} />
      </fieldset>
      {!readOnly && <SubmitButton>{cohort ? (statusOnly ? "Update stage" : "Save changes") : "Create cohort"}</SubmitButton>}
    </ActionForm>
  );
}
