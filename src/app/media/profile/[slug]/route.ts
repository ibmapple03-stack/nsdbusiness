import { db } from "@/server/db";
import { academyId } from "@/server/org";
import { readPrivateFile } from "@/server/storage";

/** Serves a profile photo only when the profile is published AND the photo is approved. */
export async function GET(_req: Request, ctx: RouteContext<"/media/profile/[slug]">) {
  const { slug } = await ctx.params;
  const organisationId = await academyId();
  const profile = await db.staffProfile.findFirst({
    where: { organisationId, slug, status: "PUBLISHED", photoApproved: true },
    select: { photoPath: true },
  });
  const file = profile?.photoPath ? await readPrivateFile(profile.photoPath) : null;
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
