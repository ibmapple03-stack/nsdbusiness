import "server-only";
import { createHash } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import type { Actor } from "@/server/auth/actor";

type Tx = Prisma.TransactionClient;

const SENSITIVE_KEY = /pass|secret|token|backup|otp|card|cvv|pin|bvn|nin|ip|email|phone/i;

/** Remove values that must never be copied into audit snapshots. */
export function redact(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.map((v) => redact(v) ?? null) as Prisma.InputJsonValue;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const out: Record<string, Prisma.InputJsonValue | null> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = SENSITIVE_KEY.test(k) ? "[redacted]" : (redact(v) ?? null);
    }
    return out;
  }
  if (typeof value === "string" && value.length > 2000) return `${value.slice(0, 2000)}… [truncated]`;
  return value as Prisma.InputJsonValue;
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export type AuditEntry = {
  action: string;
  entityType: string;
  entityId: string;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
};

/** Record who did what, when and why. Call inside the same transaction as the change. */
export async function audit(tx: Tx, actor: Actor | null, organisationId: string, entry: AuditEntry) {
  await tx.auditLog.create({
    data: {
      organisationId,
      actorId: actor?.userId ?? null,
      actorLabel: actor ? `${actor.name} (${actor.roles.join(", ")})` : "Public visitor",
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      reason: entry.reason?.trim() || null,
      before: redact(entry.before),
      after: redact(entry.after),
      ipHash: hashIp(entry.ip),
    },
  });
}
