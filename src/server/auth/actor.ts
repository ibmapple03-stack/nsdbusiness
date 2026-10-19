import type { Role } from "@/generated/prisma/enums";
import { permissionsFor, type Permission } from "@/server/auth/permissions";

/** The authenticated person performing an action, scoped to one organisation. */
export type Actor = {
  userId: string;
  name: string;
  email: string;
  organisationId: string;
  roles: Role[];
  permissions: ReadonlySet<Permission>;
};

export class AuthzError extends Error {
  constructor(message = "You do not have permission to do that.") {
    super(message);
  }
}

/** Input problems the person can fix. Messages are shown to them. */
export class UserFacingError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

export function makeActor(input: Omit<Actor, "permissions">): Actor {
  return { ...input, permissions: permissionsFor(input.roles) };
}

export function can(actor: Actor | null | undefined, permission: Permission): boolean {
  return !!actor && actor.permissions.has(permission);
}

export function assertCan(actor: Actor, permission: Permission): void {
  if (!can(actor, permission)) throw new AuthzError();
}

export function assertSameOrg(actor: Actor, organisationId: string): void {
  if (actor.organisationId !== organisationId) throw new AuthzError("That record belongs to another organisation.");
}
