import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { makeActor, type Actor, AuthzError } from "@/server/auth/actor";
import type { Permission } from "@/server/auth/permissions";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { academyId } from "@/server/org";

export type SessionState =
  | { kind: "anonymous" }
  | { kind: "needs-mfa"; actor: Actor }
  | { kind: "ready"; actor: Actor; mfaEnabled: boolean };

/** Resolve the current session and the person's roles in the academy. Memoised per request. */
export const getSessionState = cache(async (): Promise<SessionState> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { kind: "anonymous" };

  const organisationId = await academyId();
  const memberships = await db.membership.findMany({
    where: { userId: session.user.id, organisationId, active: true },
    select: { role: true },
  });
  const actor = makeActor({
    userId: session.user.id,
    name: session.user.name,
    email: session.user.email,
    organisationId,
    roles: memberships.map((m) => m.role),
  });

  const mfaEnabled = !!session.user.twoFactorEnabled;
  const isStaff = actor.permissions.has("admin.access");
  if (isStaff && env.requireStaffMfa && !mfaEnabled) return { kind: "needs-mfa", actor };
  return { kind: "ready", actor, mfaEnabled };
});

/** For pages: send visitors to sign in, staff without MFA to set it up, and refuse missing permissions. */
export async function requireStaffPage(permission: Permission = "admin.access"): Promise<Actor> {
  const state = await getSessionState();
  if (state.kind === "anonymous") redirect("/login");
  if (state.kind === "needs-mfa") redirect("/account/security?setup=required");
  if (!state.actor.permissions.has(permission)) forbidden();
  return state.actor;
}

/** For server actions: never trust the UI — re-check the session and permission on every call. */
export async function requireActionActor(permission: Permission): Promise<Actor> {
  const state = await getSessionState();
  if (state.kind !== "ready") throw new AuthzError("Sign in again to continue.");
  if (!state.actor.permissions.has(permission)) throw new AuthzError();
  return state.actor;
}

export async function requestIp(): Promise<string | null> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}
