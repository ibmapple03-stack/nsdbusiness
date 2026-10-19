import "server-only";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/components/ui/action-form";
import { AuthzError, UserFacingError, type Actor } from "@/server/auth/actor";
import type { Permission } from "@/server/auth/permissions";
import { requestIp, requireActionActor } from "@/server/auth/session";

type Outcome = { message?: string; tags?: string[]; redirectTo?: string } | void;

/**
 * Wraps every admin server action: re-checks the session and permission,
 * converts known errors into messages for the form, refreshes cached public
 * pages, and redirects only after success.
 */
export async function runAction(permission: Permission, fn: (actor: Actor, ip: string | null) => Promise<Outcome>): Promise<ActionResult> {
  let outcome: Outcome;
  try {
    const actor = await requireActionActor(permission);
    outcome = await fn(actor, await requestIp());
  } catch (e) {
    if (e instanceof UserFacingError) return { ok: false, message: e.message, fieldErrors: e.fieldErrors };
    if (e instanceof AuthzError) return { ok: false, message: e.message };
    console.error(e);
    return { ok: false, message: "Something went wrong and nothing was saved. Try again." };
  }
  for (const tag of outcome?.tags ?? []) updateTag(tag);
  if (outcome?.redirectTo) redirect(outcome.redirectTo);
  return { ok: true, message: outcome?.message ?? "Saved." };
}

export function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
