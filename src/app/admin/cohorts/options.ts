import "server-only";
import { db } from "@/server/db";

export async function cohortFormOptions(organisationId: string) {
  const [courses, venues, instructors] = await Promise.all([
    db.course.findMany({ where: { organisationId, status: { not: "ARCHIVED" } }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.venue.findMany({ where: { organisationId, active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.staffProfile.findMany({ where: { organisationId, kind: "INSTRUCTOR" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return { courses, venues, instructors };
}
