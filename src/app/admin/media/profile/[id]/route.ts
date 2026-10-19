import { getSessionState } from "@/server/auth/session";
import { db } from "@/server/db";
import { readPrivateFile } from "@/server/storage";

/** Staff-only preview of a profile photo, whether or not it is approved for publication. */
export async function GET(_req: Request, ctx: RouteContext<"/admin/media/profile/[id]">) {
  const state = await getSessionState();
  if (state.kind !== "ready" || !state.actor.permissions.has("profile.edit")) return new Response("Forbidden", { status: 403 });
  const { id } = await ctx.params;
  const profile = await db.staffProfile.findFirst({ where: { id, organisationId: state.actor.organisationId }, select: { photoPath: true } });
  const file = profile?.photoPath ? await readPrivateFile(profile.photoPath) : null;
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { "Content-Type": file.contentType, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
