import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index";
import { participants, visits } from "../../drizzle/schema";
import { logAudit } from "../lib/audit";
import { canWriteClinical } from "../lib/roles";
import {
  type AuthedRequest,
  requireAuth,
} from "../middleware/auth";

const participantBody = z.object({
  studyCode: z.string().min(1).optional(),
  codigo: z.string().optional(),
  iniciais: z.string().min(1),
  dateOfBirth: z.string().min(1),
  cidade: z.string().optional(),
  uf: z.string().optional(),
  convenio: z.string().optional(),
  articulacaoIndice: z.string().optional(),
  studyStatus: z.string().optional(),
  inclusionDate: z.string().optional(),
  protocolVersion: z.string().optional(),
  consentRecordedAt: z.string().optional(),
});

export const participantsRouter = Router();

participantsRouter.use(requireAuth);

async function nextStudyCode(): Promise<string> {
  const rows = await db
    .select({ studyCode: participants.studyCode })
    .from(participants)
    .orderBy(desc(participants.id))
    .limit(1);
  const last = rows[0]?.studyCode;
  const n = last?.match(/^LZ-(\d+)$/i);
  const num = n ? parseInt(n[1], 10) + 1 : 1;
  return `LZ-${String(num).padStart(3, "0")}`;
}

participantsRouter.get("/", async (_req: AuthedRequest, res) => {
  const list = await db
    .select()
    .from(participants)
    .orderBy(desc(participants.updatedAt));

  const withT0 = await Promise.all(
    list.map(async (p) => {
      const t0Rows = await db
        .select()
        .from(visits)
        .where(
          and(eq(visits.participantId, p.id), eq(visits.timepoint, "T0"))
        )
        .limit(1);
      return {
        ...p,
        visitT0: t0Rows[0] ?? null,
      };
    })
  );

  res.json({ participants: withT0 });
});

participantsRouter.get("/:id", async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const rows = await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1);
  if (!rows[0]) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }
  const visitList = await db
    .select()
    .from(visits)
    .where(eq(visits.participantId, id));
  res.json({ participant: rows[0], visits: visitList });
});

participantsRouter.post("/", async (req: AuthedRequest, res) => {
  if (!canWriteClinical(req.user!.role)) {
    res.status(403).json({ error: "Sem permissão" });
    return;
  }
  const parsed = participantBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const data = parsed.data;
  const studyCode = data.studyCode ?? (await nextStudyCode());
  const protocolVersion =
    data.protocolVersion ??
    process.env.LINHA_ZERO_PROTOCOL_VERSION ??
    "1.0";
  const now = new Date().toISOString();

  const inserted = await db
    .insert(participants)
    .values({
      studyCode,
      codigo: data.codigo ?? null,
      iniciais: data.iniciais.toUpperCase(),
      dateOfBirth: data.dateOfBirth,
      cidade: data.cidade ?? null,
      uf: data.uf ?? "PE",
      convenio: data.convenio ?? null,
      articulacaoIndice: data.articulacaoIndice ?? null,
      studyStatus: data.studyStatus ?? "Em coleta T0",
      inclusionDate: data.inclusionDate ?? now.substring(0, 10),
      protocolVersion,
      consentRecordedAt: data.consentRecordedAt ?? null,
      createdById: req.user!.id,
      updatedById: req.user!.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  const p = inserted[0]!;
  await db.insert(visits).values({
    participantId: p.id,
    timepoint: "T0",
    collectionStatus: "draft",
    payloadJson: "{}",
    protocolVersion,
    createdById: req.user!.id,
    updatedById: req.user!.id,
    createdAt: now,
    updatedAt: now,
  });

  await logAudit({
    userId: req.user!.id,
    participantId: p.id,
    action: "create",
    entityType: "participant",
    entityId: String(p.id),
    newValue: studyCode,
  });

  res.status(201).json({ participant: p });
});

participantsRouter.patch("/:id", async (req: AuthedRequest, res) => {
  if (!canWriteClinical(req.user!.role)) {
    res.status(403).json({ error: "Sem permissão" });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const parsed = participantBody.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1);
  if (!existing[0]) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }

  const data = parsed.data;
  const now = new Date().toISOString();
  const updated = await db
    .update(participants)
    .set({
      ...(data.studyCode !== undefined && { studyCode: data.studyCode }),
      ...(data.codigo !== undefined && { codigo: data.codigo }),
      ...(data.iniciais !== undefined && {
        iniciais: data.iniciais.toUpperCase(),
      }),
      ...(data.dateOfBirth !== undefined && {
        dateOfBirth: data.dateOfBirth,
      }),
      ...(data.cidade !== undefined && { cidade: data.cidade }),
      ...(data.uf !== undefined && { uf: data.uf }),
      ...(data.convenio !== undefined && { convenio: data.convenio }),
      ...(data.articulacaoIndice !== undefined && {
        articulacaoIndice: data.articulacaoIndice,
      }),
      ...(data.studyStatus !== undefined && { studyStatus: data.studyStatus }),
      ...(data.inclusionDate !== undefined && {
        inclusionDate: data.inclusionDate,
      }),
      ...(data.consentRecordedAt !== undefined && {
        consentRecordedAt: data.consentRecordedAt,
      }),
      updatedById: req.user!.id,
      updatedAt: now,
    })
    .where(eq(participants.id, id))
    .returning();

  await logAudit({
    userId: req.user!.id,
    participantId: id,
    action: "update",
    entityType: "participant",
    entityId: String(id),
  });

  res.json({ participant: updated[0] });
});

participantsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  if (req.user!.role !== "pi_admin") {
    res.status(403).json({ error: "Apenas o PI pode excluir participantes" });
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const existing = await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .limit(1);
  if (!existing[0]) {
    res.status(404).json({ error: "Participante não encontrado" });
    return;
  }
  await db.delete(participants).where(eq(participants.id, id));
  await logAudit({
    userId: req.user!.id,
    action: "delete",
    entityType: "participant",
    entityId: String(id),
    oldValue: existing[0].studyCode,
  });
  res.json({ ok: true });
});
