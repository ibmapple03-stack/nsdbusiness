import { notFound } from "next/navigation";
import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { WorkflowPanel } from "@/components/admin/workflow-panel";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { TextArea, TextField } from "@/components/ui/field";
import { saveContentAction } from "@/app/admin/actions";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";

// Session-dependent staff page, rendered per request.
export const instant = false;


export default async function ContentBlockPage(props: PageProps<"/admin/content/[id]">) {
  const actor = await requireStaffPage("content.edit");
  const { id } = await props.params;
  const block = await db.contentBlock.findFirst({ where: { id, organisationId: actor.organisationId } });
  if (!block) notFound();
  const names = await userNames([block.submittedById, block.reviewedById]);
  const editable = block.status === "DRAFT" || block.status === "REJECTED";

  return (
    <>
      <AdminHeader title={block.title} description={block.location} back={{ href: "/admin/content", label: "All page text" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <Panel>
          <ActionForm action={saveContentAction} className="space-y-5">
            <input type="hidden" name="id" value={block.id} />
            <fieldset disabled={!editable} className="space-y-5 disabled:opacity-80">
              <TextField name="title" label="Heading" required defaultValue={block.title} />
              <TextArea name="body" label="Text" rows={12} defaultValue={block.body} hint="Plain text. Start a line with “- ” for a bullet, “## ” for a heading. Leave a blank line between paragraphs." />
            </fieldset>
            {editable && <SubmitButton>Save text</SubmitButton>}
          </ActionForm>
        </Panel>
        <WorkflowPanel actor={actor} entity="content" record={block} names={names} />
      </div>
    </>
  );
}
