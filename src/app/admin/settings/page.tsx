import { AdminHeader, Panel } from "@/components/admin/page-parts";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { TextField } from "@/components/ui/field";
import { updateSettingAction, verifySettingAction } from "@/app/admin/actions";
import { can } from "@/server/auth/actor";
import { requireStaffPage } from "@/server/auth/session";
import { userNames } from "@/server/admin-data";
import { db } from "@/server/db";
import { formatDateTimeWAT } from "@/lib/time";

// Session-dependent staff page, rendered per request.
export const instant = false;

export const metadata = { title: "Contact details" };

export default async function SettingsPage() {
  const actor = await requireStaffPage("settings.edit");
  const settings = await db.siteSetting.findMany({ where: { organisationId: actor.organisationId }, orderBy: { key: "asc" } });
  const names = await userNames(settings.map((s) => s.verifiedById));
  const canVerify = can(actor, "settings.verify");

  return (
    <>
      <AdminHeader
        title="Contact details"
        description="Only verified details appear on the website. Changing a value withdraws it until someone authorised verifies it again. Never publish an address, number or email that has not been confirmed."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {settings.map((s) => (
          <Panel key={s.id}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display font-semibold">{s.label}</h2>
              {s.verified ? <Badge tone="positive">Verified · public</Badge> : <Badge tone="muted">Not verified · hidden</Badge>}
            </div>
            <ActionForm action={updateSettingAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input type="hidden" name="id" value={s.id} />
              <TextField name="value" label="Value" defaultValue={s.value} className="flex-1" />
              <SubmitButton size="sm" variant="secondary">
                Save
              </SubmitButton>
            </ActionForm>
            {s.verified && s.verifiedAt && (
              <p className="mt-2 text-sm text-muted">
                Verified by {names.get(s.verifiedById ?? "") ?? "—"}, {formatDateTimeWAT(s.verifiedAt)}
              </p>
            )}
            {canVerify && (s.value || s.verified) && (
              <ActionForm action={verifySettingAction} className="mt-3">
                <input type="hidden" name="id" value={s.id} />
                <input type="hidden" name="verified" value={s.verified ? "false" : "true"} />
                <SubmitButton size="sm" variant={s.verified ? "quiet" : "primary"}>
                  {s.verified ? "Withdraw from website" : "Mark as verified and publish"}
                </SubmitButton>
              </ActionForm>
            )}
          </Panel>
        ))}
      </div>
    </>
  );
}
