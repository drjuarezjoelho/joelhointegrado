import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { participants, visits } from "../../drizzle/schema";
import { logAudit } from "../lib/audit";
import { canExport } from "../lib/roles";
import {
  type AuthedRequest,
  requireAuth,
} from "../middleware/auth";

export const exportRouter = Router();

exportRouter.use(requireAuth);

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function ageFromDob(dob: string): string {
  const hoje = new Date();
  const nasc = new Date(dob);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return String(idade);
}

/** CSV wide — sem DN; apenas study_code e idade. */
exportRouter.get("/csv", async (req: AuthedRequest, res) => {
  if (!canExport(req.user!.role)) {
    res.status(403).json({ error: "Sem permissão para exportar" });
    return;
  }

  const format = (req.query.format as string) ?? "wide";
  const allParticipants = await db.select().from(participants);

  if (format === "long") {
    const headers = [
      "study_code",
      "timepoint",
      "collection_status",
      "assessment_date",
      "variable",
      "value",
    ];
    const lines = [headers.join(",")];

    for (const p of allParticipants) {
      const pVisits = await db
        .select()
        .from(visits)
        .where(eq(visits.participantId, p.id));
      for (const v of pVisits) {
        let payload: Record<string, unknown> = {};
        try {
          payload = JSON.parse(v.payloadJson) as Record<string, unknown>;
        } catch {
          /* ignore */
        }
        for (const [key, val] of Object.entries(payload)) {
          if (val === "" || val == null) continue;
          lines.push(
            [
              p.studyCode,
              v.timepoint,
              v.collectionStatus,
              v.assessmentDate ?? "",
              key,
              String(val),
            ]
              .map(csvEscape)
              .join(",")
          );
        }
      }
    }

    const csv = lines.join("\n");
    await logAudit({
      userId: req.user!.id,
      action: "export",
      entityType: "csv",
      metadata: { format: "long", rows: lines.length - 1 },
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="linha-zero-long.csv"'
    );
    res.send(csv);
    return;
  }

  const headers = [
    "study_code",
    "codigo",
    "iniciais",
    "idade_anos",
    "cidade",
    "uf",
    "convenio",
    "articulacao_indice",
    "study_status",
    "inclusion_date",
    "T0_status",
    "T3_status",
    "T6_status",
    "T12_status",
  ];
  const lines = [headers.join(",")];

  for (const p of allParticipants) {
    const pVisits = await db
      .select()
      .from(visits)
      .where(eq(visits.participantId, p.id));
    const byTp = Object.fromEntries(
      pVisits.map((v) => [v.timepoint, v.collectionStatus])
    );
    lines.push(
      [
        p.studyCode,
        p.codigo ?? "",
        p.iniciais,
        ageFromDob(p.dateOfBirth),
        p.cidade ?? "",
        p.uf ?? "",
        p.convenio ?? "",
        p.articulacaoIndice ?? "",
        p.studyStatus,
        p.inclusionDate ?? "",
        byTp.T0 ?? "",
        byTp.T3 ?? "",
        byTp.T6 ?? "",
        byTp.T12 ?? "",
      ]
        .map(csvEscape)
        .join(",")
    );
  }

  const csv = lines.join("\n");
  await logAudit({
    userId: req.user!.id,
    action: "export",
    entityType: "csv",
    metadata: { format: "wide", rows: lines.length - 1 },
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="linha-zero-wide.csv"'
  );
  res.send(csv);
});
