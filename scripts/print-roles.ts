/** Prints the role → permission matrix as Markdown: `npx tsx scripts/print-roles.ts` */
import { PERMISSIONS, ROLE_PERMISSIONS } from "../src/server/auth/permissions";
const roles = Object.keys(ROLE_PERMISSIONS) as (keyof typeof ROLE_PERMISSIONS)[];
const short: Record<string, string> = { CEO: "CEO", OPERATIONS_COORDINATOR: "Coord.", ACADEMY_MANAGER: "Manager", SECRETARY_ADMIN: "Secretary", FINANCE_OFFICER: "Finance", INSTRUCTOR: "Instructor", STUDENT: "Student", GUARDIAN: "Guardian" };
console.log(`| Permission | ${roles.map((r) => short[r]).join(" | ")} |`);
console.log(`|---|${roles.map(() => ":-:").join("|")}|`);
for (const p of PERMISSIONS) console.log(`| \`${p}\` | ${roles.map((r) => (ROLE_PERMISSIONS[r].includes(p) ? "✓" : "")).join(" | ")} |`);
