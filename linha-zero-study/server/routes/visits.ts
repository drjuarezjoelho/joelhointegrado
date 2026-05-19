import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index";
import {
  participants,
  visits,
  visitTimepoints,
} from "../../drizzle/schema";
import { logAudit } from "../lib/audit";
import { canLockVisit, canWriteClinical } from "../lib/roles";
import {
  type AuthedRequest,
  requireAuth,
} from "../middleware/auth";

const visitBody = z.object({
  timepoint: z.enum(visitTimepoints).optional(),
  assessmentDate: z.string().optional(),
  collectionStatus: z.enum(["draft", "complete", "locked"]).optional(),
  payloadJson: z.record(z.unknown()).optional(),
  protocolVersion: z.string().optional(),
});

export const visitsRouter = Router();

visitsRouter.use(requireAuth);

visitsRouter.get(
  "/participants/:participantId/visits",
  async (req: AuthedRequest, res) => {
    const participantId = Number(req.params.participantId);
    if (!Number.isFinite(participantId)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }
    const list = await db
      .select()
      .from(visits)
      .where(eq(visits.participantId, participantId));
    res.json({ visits: list });
  }
);

visitsRouter.post(
  "/participants/:participantId/visits",
  async (req: AuthedRequest, res) => {
    if (!canWriteClinical(req.user!.role)) {
      res.status(403).json({ error: "Sem permissão" });
      return;
    }
    const participantId = Number(req.params.participantId);
    const parsed = visitBody
      .extend({ timepoint: z.enum(visitTimepoints) })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const p = await db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);
    if (!p[0]) {
      res.status(404).json({ error: "Participante não encontrado" });
      return;
    }

    const now = new Date().toISOString();
    const protocolVersion =
      parsed.data.protocolVersion ??
      process.env.LINHA_ZERO_PROTOCOL_VERSION ??
      "1.0";

    try {
      const inserted = await db
        .insert(visits)
        .values({
          participantId,
          timepoint: parsed.data.timepoint,
          assessmentDate: parsed.data.assessmentDate ?? null,
          collectionStatus: "draft",
          payloadJson: JSON.stringify(parsed.data.payloadJson ?? {}),
          protocolVersion,
          createdById: req.user!.id,
          updatedById: req.user!.id,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      await logAudit({
        userId: req.user!.id,
        participantId,
        visitId: inserted[0]!.id,
        action: "create",
        entityType: "visit",
        entityId: String(inserted[0]!.id),
      });

      res.status(201).json({ visit: inserted[0] });
    } catch {
      res.status(409).json({
        error: "Visita já existe para este timepoint",
      });
    }
  }
);

visitsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  if (!canWriteClinical(req.user!.role)) {
    res.status(403).json({ error: "Sem permissão" });
    return;
  }
  const id = Number(req.params.id);
  const parsed = visitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await db
    .select()
    .from(visits)
    .where(eq(visits.id, id))
    .limit(1);
  const row = existing[0];
  if (!row) {
    res.status(404).json({ error: "Visita não encontrada" });
    return;
  }
  if (row.collectionStatus === "locked") {
    res.status(403).json({ error: "Visita bloqueada para edição" });
    return;
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const updated = await db
    .update(visits)
    .set({
      ...(data.assessmentDate !== undefined && {
        assessmentDate: data.assessmentDate,
      }),
      ...(data.collectionStatus !== undefined && {
        collectionStatus: data.collectionStatus,
      }),
      ...(data.payloadJson !== undefined && {
        payloadJson: JSON.stringify(data.payloadJson),
      }),
      updatedById: req.user!.id,
      updatedAt: now,
    })
    .where(and(eq(visits.id, id)))
    .returning();

  await logAudit({
    userId: req.user!.id,
    participantId: row.participantId,
    visitId: id,
    action: "update",
    entityType: "visit",
    entityId: String(id),
  });

  res.json({ visit: updated[0] });
});

visitsRouter.post("/:id/lock", async (req: AuthedRequest, res) => {
  if (!canLockVisit(req.user!.role)) {
    res.status(403).json({ error: "Sem permissão" });
    return;
  }
  const id = Number(req.params.id);
  const existing = await db
    .select()
    .from(visits)
    .where(eq(visits.id, id))
    .limit(1);
  const row = existing[0];
  if (!row) {
    res.status(404).json({ error: "Visita não encontrada" });
    return;
  }

  const now = new Date().toISOString();
  const updated = await db
    .update(visits)
    .set({
      collectionStatus: "locked",
      lockedAt: now,
      lockedById: req.user!.id,
      updatedAt: now,
    })
    .where(eq(visits.id, id))
    .returning();

  await logAudit({
    userId: req.user!.id,
    participantId: row.participantId,
    visitId: id,
    action: "lock",
    entityType: "visit",
    entityId: String(id),
  });

  res.json({ visit: updated[0] });
});
