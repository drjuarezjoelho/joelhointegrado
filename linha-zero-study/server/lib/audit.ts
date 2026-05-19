import { db } from "../db/index";
import { auditEvents } from "../../drizzle/schema";

export async function logAudit(input: {
  userId?: number;
  participantId?: number;
  visitId?: number;
  action: string;
  entityType: string;
  entityId?: string;
  fieldPath?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditEvents).values({
    userId: input.userId ?? null,
    participantId: input.participantId ?? null,
    visitId: input.visitId ?? null,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    fieldPath: input.fieldPath ?? null,
    oldValue: input.oldValue ?? null,
    newValue: input.newValue ?? null,
    metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}
