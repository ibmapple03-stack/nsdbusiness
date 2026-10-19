import type { Course } from "@/generated/prisma/client";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { CheckboxGroup, SelectField, TextArea, TextField } from "@/components/ui/field";
import { saveCourseAction } from "@/app/admin/actions";
import { FORMAT_LABELS, PILLAR_LABELS } from "@/lib/site";

function curriculumText(curriculum: unknown): string {
  if (!Array.isArray(curriculum)) return "";
  return (curriculum as { title: string; topics: string[] }[]).map((m) => [`## ${m.title}`, ...m.topics.map((t) => `- ${t}`)].join("\n")).join("\n\n");
}

export function CourseForm({ course, readOnly = false }: { course?: Course; readOnly?: boolean }) {
  return (
    <ActionForm action={saveCourseAction} className="space-y-6">
      {course && <input type="hidden" name="id" value={course.id} />}
      <fieldset disabled={readOnly} className="space-y-6 disabled:opacity-80">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField name="title" label="Course title" required defaultValue={course?.title} />
          <TextField name="slug" label="Web address" required defaultValue={course?.slug} hint="Lowercase words separated by hyphens, e.g. digital-marketing" />
          <SelectField name="pillar" label="Subject area" required defaultValue={course?.pillar} options={Object.entries(PILLAR_LABELS).map(([value, label]) => ({ value, label }))} />
          <div className="grid grid-cols-2 gap-4">
            <TextField name="durationLabel" label="Duration (as shown)" defaultValue={course?.durationLabel} hint="e.g. 6 weeks, part-time" />
            <TextField name="durationWeeks" label="Weeks (for filters)" type="number" min={0} defaultValue={course?.durationWeeks ?? ""} />
          </div>
        </div>
        <CheckboxGroup name="deliveryFormats" legend="Delivery formats" hint="Tick only formats that will actually be offered." defaultValues={course?.deliveryFormats} options={Object.entries(FORMAT_LABELS).map(([value, label]) => ({ value, label }))} />
        <TextArea name="summary" label="Summary" rows={2} defaultValue={course?.summary} hint="One or two sentences shown in course lists." />
        <TextArea name="description" label="Description" rows={5} defaultValue={course?.description} />
        <TextArea name="targetAudience" label="Who it is for" rows={3} defaultValue={course?.targetAudience} />
        <div className="grid gap-5 md:grid-cols-2">
          <TextArea name="outcomes" label="Learning outcomes" rows={6} defaultValue={course?.outcomes.join("\n")} hint="One per line. Describe what learners will be able to do." />
          <TextArea name="prerequisites" label="Prerequisites" rows={6} defaultValue={course?.prerequisites.join("\n")} hint="One per line." />
        </div>
        <TextArea name="curriculum" label="Curriculum" rows={10} defaultValue={curriculumText(course?.curriculum)} hint="Start each module with ## and list topics with - on the lines below." />
        <div className="grid gap-5 md:grid-cols-2">
          <TextArea name="assessment" label="Assessment" rows={3} defaultValue={course?.assessment} />
          <TextArea name="completionRequirements" label="Completion requirements" rows={3} defaultValue={course?.completionRequirements} />
        </div>
        <TextArea
          name="certificateType"
          label="Certificate type"
          rows={2}
          defaultValue={course?.certificateType}
          hint="State exactly what is issued and by whom. Do not mention accreditation unless the academy holds written approval. Required before publishing."
        />
        <TextArea name="refundTerms" label="Refund and cancellation terms" rows={3} defaultValue={course?.refundTerms} hint="Required before publishing." />
      </fieldset>
      {!readOnly && <SubmitButton>{course ? "Save changes" : "Create course"}</SubmitButton>}
    </ActionForm>
  );
}
