import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../trpc";
import { getDb } from "../db";

const timepointTypeSchema = z.enum([
  "baseline",
  "30days",
  "60days",
  "90days",
]);

export const patientsRouter = router({
  list: protectedProcedure.query(({ ctx }) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, name, phone, email, surgeryDate, surgeryType, age, gender
         FROM patients
         WHERE userId = ?
         ORDER BY (surgeryDate IS NULL) ASC, surgeryDate DESC, id DESC
         LIMIT 500`
      )
      .all(ctx.userId) as Array<{
      id: number;
      name: string;
      phone: string | null;
      email: string | null;
      surgeryDate: string | null;
      surgeryType: string | null;
      age: number | null;
      gender: string | null;
    }>;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone ?? null,
      email: r.email ?? null,
      surgeryDate: r.surgeryDate ? new Date(r.surgeryDate) : null,
      surgeryType: r.surgeryType ?? null,
      age: r.age ?? null,
      gender:
        r.gender === "M" || r.gender === "F" || r.gender === "Outro"
          ? r.gender
          : null,
    }));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        age: z.number().optional(),
        gender: z.enum(["M", "F", "Outro"]).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        surgeryDate: z.date().optional(),
        surgeryType: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const result = db
        .prepare(
          `INSERT INTO patients (userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          ctx.userId,
          input.name,
          input.age ?? null,
          input.gender ?? null,
          input.email ?? null,
          input.phone ?? null,
          input.surgeryDate?.toISOString().slice(0, 10) ?? null,
          input.surgeryType ?? null,
          input.notes ?? null
        );
      return { id: Number(result.lastInsertRowid) };
    }),

  update: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        name: z.string().min(1),
        age: z.number().optional(),
        gender: z.enum(["M", "F", "Outro"]).optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        surgeryDate: z.date().optional(),
        surgeryType: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const result = db
        .prepare(
          `UPDATE patients SET
            name = ?, age = ?, gender = ?, email = ?, phone = ?,
            surgeryDate = ?, surgeryType = ?, notes = ?,
            updatedAt = datetime('now')
           WHERE id = ? AND userId = ?`
        )
        .run(
          input.name,
          input.age ?? null,
          input.gender ?? null,
          input.email ?? null,
          input.phone ?? null,
          input.surgeryDate?.toISOString().slice(0, 10) ?? null,
          input.surgeryType ?? null,
          input.notes ?? null,
          input.patientId,
          ctx.userId
        );
      if (result.changes === 0)
        throw new Error("Paciente não encontrado ou sem permissão");
      return { ok: true };
    }),

  getById: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(({ ctx, input }) => {
      const db = getDb();
      const row = db
        .prepare(
          `SELECT id, userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes
           FROM patients WHERE id = ? AND userId = ?`
        )
        .get(input.patientId, ctx.userId) as
        | {
            id: number;
            userId: number;
            name: string;
            age: number | null;
            gender: string | null;
            email: string | null;
            phone: string | null;
            surgeryDate: string | null;
            surgeryType: string | null;
            notes: string | null;
          }
        | undefined;
      if (!row) return null;
      return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        age: row.age ?? null,
        gender: row.gender ?? null,
        email: row.email ?? null,
        phone: row.phone ?? null,
        surgeryDate: row.surgeryDate ? new Date(row.surgeryDate) : null,
        surgeryType: row.surgeryType ?? null,
        notes: row.notes ?? null,
      };
    }),

  getAllConsents: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(({ ctx, input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ? AND userId = ?")
        .get(input.patientId, ctx.userId);
      if (!patient) return [];
      const rows = db
        .prepare(
          `SELECT id, patientId, consentType, consentText, isAccepted, createdAt,
                  tcleVersion, acceptedAt, ipAddress, userAgent, isRevoked, revokedAt, revocationReason, updatedAt
           FROM consents WHERE patientId = ? ORDER BY createdAt DESC`
        )
        .all(input.patientId) as Array<{
        id: number;
        patientId: number;
        consentType: string;
        consentText: string | null;
        isAccepted: number;
        createdAt: string;
        tcleVersion?: string | null;
        acceptedAt?: string | null;
        ipAddress?: string | null;
        userAgent?: string | null;
        isRevoked?: number | null;
        revokedAt?: string | null;
        revocationReason?: string | null;
        updatedAt?: string | null;
      }>;
      return rows.map((r) => ({
        id: r.id,
        patientId: r.patientId,
        consentType: r.consentType,
        consentText: r.consentText ?? "",
        isAccepted: r.isAccepted,
        acceptedAt: r.acceptedAt ? new Date(r.acceptedAt) : (r.createdAt ? new Date(r.createdAt) : null),
        ipAddress: r.ipAddress ?? null,
        userAgent: r.userAgent ?? null,
        isRevoked: r.isRevoked ?? 0,
        revokedAt: r.revokedAt ? new Date(r.revokedAt) : null,
        revocationReason: r.revocationReason ?? null,
        createdAt: new Date(r.createdAt),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
        tcleVersion: r.tcleVersion ?? "1.0",
      }));
    }),

  revokeConsent: protectedProcedure
    .input(
      z.object({
        consentId: z.number(),
        patientId: z.number(),
        revocationReason: z.string().min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const consent = db
        .prepare(
          `SELECT c.id FROM consents c
           INNER JOIN patients p ON p.id = c.patientId AND p.userId = ?
           WHERE c.id = ? AND c.patientId = ? AND (c.isRevoked IS NULL OR c.isRevoked = 0)`
        )
        .get(ctx.userId, input.consentId, input.patientId);
      if (!consent) throw new Error("Consentimento não encontrado ou já revogado.");
      db.prepare(
        `UPDATE consents SET isRevoked = 1, revokedAt = datetime('now'), revocationReason = ?, updatedAt = datetime('now') WHERE id = ?`
      ).run(input.revocationReason, input.consentId);
      return { ok: true };
    }),

  getPatientScores: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(({ ctx, input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ? AND userId = ?")
        .get(input.patientId, ctx.userId);
      if (!patient) return [];
      // TODO: when questionnaire responses table exists, join and return EVA/IKDC/KOOS scores per timepoint
      const timepoints = db
        .prepare(
          "SELECT id, timepointType, assessmentDate FROM timepoints WHERE patientId = ? ORDER BY assessmentDate"
        )
        .all(input.patientId) as Array<{
        id: number;
        timepointType: string;
        assessmentDate: string;
      }>;
      return timepoints.map((tp) => ({
        timepointId: tp.id,
        timepointType: tp.timepointType,
        assessmentDate: tp.assessmentDate,
        eva: null as { painScore: number } | null,
        ikdc: null as { totalScore: number } | null,
        koos: null as {
          pain: number;
          symptoms: number;
          adl: number;
          sport: number;
          qol: number;
        } | null,
      }));
    }),

  getTimepoints: protectedProcedure
    .input(z.object({ patientId: z.number() }))
    .query(({ ctx, input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ? AND userId = ?")
        .get(input.patientId, ctx.userId);
      if (!patient) return [];
      const rows = db
        .prepare(
          `SELECT id, patientId, timepointType, assessmentDate, createdAt
           FROM timepoints WHERE patientId = ? ORDER BY assessmentDate`
        )
        .all(input.patientId) as Array<{
        id: number;
        patientId: number;
        timepointType: string;
        assessmentDate: string;
        createdAt: string;
      }>;
      return rows.map((r) => ({
        id: r.id,
        patientId: r.patientId,
        timepointType: r.timepointType,
        assessmentDate: r.assessmentDate,
        createdAt: r.createdAt,
      }));
    }),

  getTimepoint: protectedProcedure
    .input(z.object({ timepointId: z.number() }))
    .query(({ ctx, input }) => {
      const db = getDb();
      const row = db
        .prepare(
          `SELECT t.id, t.patientId, t.timepointType, t.assessmentDate, t.createdAt
           FROM timepoints t
           INNER JOIN patients p ON p.id = t.patientId AND p.userId = ?
           WHERE t.id = ?`
        )
        .get(ctx.userId, input.timepointId) as
        | {
            id: number;
            patientId: number;
            timepointType: string;
            assessmentDate: string;
            createdAt: string;
          }
        | undefined;
      if (!row) return null;
      return {
        id: row.id,
        patientId: row.patientId,
        timepointType: row.timepointType,
        assessmentDate: row.assessmentDate,
        createdAt: row.createdAt,
      };
    }),

  createTimepoint: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        timepointType: timepointTypeSchema,
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ? AND userId = ?")
        .get(input.patientId, ctx.userId);
      if (!patient)
        throw new Error("Paciente não encontrado ou sem permissão");
      const result = db
        .prepare(
          `INSERT INTO timepoints (patientId, timepointType) VALUES (?, ?)`
        )
        .run(input.patientId, input.timepointType);
      return { id: result.lastInsertRowid };
    }),

  createConsent: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        consentType: z.string(),
        consentText: z.string(),
        isAccepted: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ? AND userId = ?")
        .get(input.patientId, ctx.userId);
      if (!patient)
        throw new Error("Paciente não encontrado ou sem permissão");
      db.prepare(
        `INSERT INTO consents (patientId, consentType, consentText, isAccepted)
         VALUES (?, ?, ?, ?)`
      ).run(
        input.patientId,
        input.consentType,
        input.consentText,
        input.isAccepted
      );
      return { ok: true };
    }),

  updatePhone: protectedProcedure
    .input(z.object({ patientId: z.number(), phone: z.string() }))
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const result = db
        .prepare(
          "UPDATE patients SET phone = ?, updatedAt = datetime('now') WHERE id = ? AND userId = ?"
        )
        .run(input.phone, input.patientId, ctx.userId);
      if (result.changes === 0)
        throw new Error("Paciente não encontrado ou sem permissão");
      return { ok: true };
    }),

  saveEvaToTimepoint: protectedProcedure
    .input(
      z.object({
        timepointId: z.number(),
        painScore: z.number().min(0).max(10),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const tp = db
        .prepare(
          `SELECT t.id, t.patientId FROM timepoints t
           INNER JOIN patients p ON p.id = t.patientId AND p.userId = ?
           WHERE t.id = ?`
        )
        .get(ctx.userId, input.timepointId) as { id: number; patientId: number } | undefined;
      if (!tp) throw new Error("Marco temporal não encontrado ou sem permissão.");
      const valueJson = JSON.stringify({ painScore: input.painScore });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(tp.patientId, input.timepointId, "eva", valueJson);
      return { ok: true };
    }),

  saveIkdcToTimepoint: protectedProcedure
    .input(
      z.object({
        timepointId: z.number(),
        responses: z.object({
          item1: z.number(), item2: z.number(), item3: z.number(), item4: z.number(),
          item5: z.number(), item6: z.number(), item7: z.number(), item8: z.number(),
          item9: z.number(), item10: z.number(), item11: z.number(), item12: z.number(),
          item13: z.number(), item14: z.number(), item15: z.number(), item16: z.number(),
          item17: z.number(), item18: z.number(),
        }),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const tp = db
        .prepare(
          `SELECT t.id, t.patientId FROM timepoints t
           INNER JOIN patients p ON p.id = t.patientId AND p.userId = ?
           WHERE t.id = ?`
        )
        .get(ctx.userId, input.timepointId) as { id: number; patientId: number } | undefined;
      if (!tp) throw new Error("Marco temporal não encontrado ou sem permissão.");
      const totalRaw = Object.values(input.responses).reduce((s, v) => s + v, 0);
      const totalPossible = 81;
      const totalScore = Math.round((totalRaw / totalPossible) * 100);
      const valueJson = JSON.stringify({
        responses: input.responses,
        totalScore,
      });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(tp.patientId, input.timepointId, "ikdc", valueJson);
      return { ok: true };
    }),

  saveKoosToTimepoint: protectedProcedure
    .input(
      z.object({
        timepointId: z.number(),
        responses: z.record(z.string(), z.number().min(0).max(4)),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const tp = db
        .prepare(
          `SELECT t.id, t.patientId FROM timepoints t
           INNER JOIN patients p ON p.id = t.patientId AND p.userId = ?
           WHERE t.id = ?`
        )
        .get(ctx.userId, input.timepointId) as { id: number; patientId: number } | undefined;
      if (!tp) throw new Error("Marco temporal não encontrado ou sem permissão.");
      const valueJson = JSON.stringify({ responses: input.responses });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(tp.patientId, input.timepointId, "koos", valueJson);
      return { ok: true };
    }),

  checkWhatsAppStatus: protectedProcedure.query(() => ({
    configured: false,
    availableMethods: [] as string[],
    email: { configured: false },
    sms: { configured: false },
    usingSandbox: false,
    recommendedMethod: null as string | null,
  })),

  getRemindersStatus: protectedProcedure.query(({ ctx }) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT r.status, COUNT(*) as cnt
         FROM reminders r
         INNER JOIN patients p ON p.id = r.patientId AND p.userId = ?
         GROUP BY r.status`
      )
      .all(ctx.userId) as Array<{ status: string; cnt: number }>;
    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = row.cnt;
      total += row.cnt;
    }
    return {
      total,
      pending: byStatus["pending"] ?? 0,
      sent: byStatus["sent"] ?? 0,
      failed: byStatus["failed"] ?? 0,
      cancelled: byStatus["cancelled"] ?? 0,
    };
  }),

  getAllReminders: protectedProcedure.query(({ ctx }) => {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT r.id, r.patientId, r.reminderType, r.scheduledFor, r.status, r.sentAt, r.failureReason, p.name as patientName
         FROM reminders r
         INNER JOIN patients p ON p.id = r.patientId AND p.userId = ?
         ORDER BY r.scheduledFor DESC`
      )
      .all(ctx.userId) as Array<{
      id: number;
      patientId: number;
      reminderType: string;
      scheduledFor: string;
      status: string;
      sentAt: string | null;
      failureReason: string | null;
      patientName: string;
    }>;
    return rows.map((r) => ({
      reminder: {
        id: r.id,
        patientId: r.patientId,
        reminderType: r.reminderType,
        scheduledFor: r.scheduledFor ? new Date(r.scheduledFor) : null,
        status: r.status,
        sentAt: r.sentAt ? new Date(r.sentAt) : null,
        failureReason: r.failureReason,
      },
      patient: { name: r.patientName },
    }));
  }),

  createAllReminders: protectedProcedure.mutation(({ ctx }) => {
    const db = getDb();
    const patients = db
      .prepare(
        "SELECT id, surgeryDate FROM patients WHERE userId = ? AND surgeryDate IS NOT NULL AND surgeryDate != ''"
      )
      .all(ctx.userId) as Array<{ id: number; surgeryDate: string }>;
    let created = 0;
    const stmt = db.prepare(
      `INSERT INTO reminders (patientId, reminderType, scheduledFor, status)
       VALUES (?, ?, ?, 'pending')`
    );
    for (const p of patients) {
      const d = new Date(p.surgeryDate);
      if (Number.isNaN(d.getTime())) continue;
      const seven = new Date(d);
      seven.setDate(seven.getDate() - 7);
      const one = new Date(d);
      one.setDate(one.getDate() - 1);
      stmt.run(p.id, "7_days_before", seven.toISOString());
      created++;
      stmt.run(p.id, "1_day_before", one.toISOString());
      created++;
    }
    return {
      message:
        created > 0
          ? `${created} lembrete(s) criado(s).`
          : "Nenhum paciente com data de cirurgia. Nenhum lembrete criado.",
    };
  }),

  processReminders: protectedProcedure.mutation(({ ctx }) => {
    const db = getDb();
    const now = new Date().toISOString();
    const pending = db
      .prepare(
        `SELECT r.id FROM reminders r
         INNER JOIN patients p ON p.id = r.patientId AND p.userId = ?
         WHERE r.status = 'pending' AND r.scheduledFor <= ?`
      )
      .all(ctx.userId, now) as Array<{ id: number }>;
    const update = db.prepare(
      "UPDATE reminders SET status = ?, sentAt = ?, failureReason = ? WHERE id = ?"
    );
    for (const row of pending) {
      update.run(
        "failed",
        null,
        "Envio não configurado (integrar WhatsApp/Twilio).",
        row.id
      );
    }
    return {
      message:
        pending.length > 0
          ? `${pending.length} lembrete(s) processado(s) (marcados como falha até integrar envio).`
          : "Nenhum lembrete pendente para processar.",
    };
  }),

  cancelReminder: protectedProcedure
    .input(z.object({ reminderId: z.number() }))
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const r = db
        .prepare(
          `SELECT r.id FROM reminders r
           INNER JOIN patients p ON p.id = r.patientId AND p.userId = ?
           WHERE r.id = ? AND r.status = 'pending'`
        )
        .get(ctx.userId, input.reminderId) as { id: number } | undefined;
      if (!r) throw new Error("Lembrete não encontrado ou já processado.");
      db.prepare("UPDATE reminders SET status = 'cancelled' WHERE id = ?").run(
        input.reminderId
      );
      return { ok: true };
    }),

  sendQuestionnaireInvite: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        method: z.enum(["email", "sms", "whatsapp", "auto"]).optional(),
      })
    )
    .mutation(() => ({
      message: "Convite não enviado (notificações não configuradas).",
    })),

  publicRegister: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        phone: z.string().min(10),
        email: z.string().optional(),
        age: z.number().optional(),
        gender: z.enum(["M", "F", "Outro"]).optional(),
        consentAccepted: z.boolean(),
        consentText: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const db = getDb();
      const userId = 1;
      const result = db
        .prepare(
          `INSERT INTO patients (userId, name, age, gender, email, phone, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          userId,
          input.name,
          input.age ?? null,
          input.gender ?? null,
          input.email ?? null,
          input.phone,
          input.consentText.slice(0, 500)
        );
      const patientId = Number(result.lastInsertRowid);
      db.prepare(
        `INSERT INTO consents (patientId, consentType, consentText, isAccepted)
         VALUES (?, ?, ?, ?)`
      ).run(patientId, "tcle_public", input.consentText.slice(0, 2000), 1);
      return {
        patientId,
        message: "Cadastro realizado com sucesso. Prosseguir para os questionários.",
      };
    }),

  publicSaveEva: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        painScore: z.number().min(0).max(10),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ?")
        .get(input.patientId);
      if (!patient) throw new Error("Paciente não encontrado.");
      const valueJson = JSON.stringify({ painScore: input.painScore });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(input.patientId, null, "eva", valueJson);
      return { ok: true };
    }),

  publicSaveIkdc: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        responses: z.object({
          item1: z.number(),
          item2: z.number(),
          item3: z.number(),
          item4: z.number(),
          item5: z.number(),
          item6: z.number(),
          item7: z.number(),
          item8: z.number(),
          item9: z.number(),
          item10: z.number(),
          item11: z.number(),
          item12: z.number(),
          item13: z.number(),
          item14: z.number(),
          item15: z.number(),
          item16: z.number(),
          item17: z.number(),
          item18: z.number(),
        }),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ?")
        .get(input.patientId);
      if (!patient) throw new Error("Paciente não encontrado.");
      const responses = input.responses;
      const totalRaw = Object.values(responses).reduce((s, v) => s + v, 0);
      const maxScores = [4, 4, 10, 4, 4, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 10];
      const totalPossible = maxScores.reduce((a, b) => a + b, 0);
      const totalScore = Math.round((totalRaw / totalPossible) * 100);
      const valueJson = JSON.stringify({
        responses: input.responses,
        totalScore,
      });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(input.patientId, null, "ikdc", valueJson);
      return { ok: true };
    }),

  publicSaveKoos: publicProcedure
    .input(
      z.object({
        patientId: z.number(),
        responses: z.record(z.string(), z.number().min(0).max(4)),
      })
    )
    .mutation(({ input }) => {
      const db = getDb();
      const patient = db
        .prepare("SELECT id FROM patients WHERE id = ?")
        .get(input.patientId);
      if (!patient) throw new Error("Paciente não encontrado.");
      const valueJson = JSON.stringify({ responses: input.responses });
      db.prepare(
        `INSERT INTO questionnaire_responses (patientId, timepointId, questionnaireType, valueJson)
         VALUES (?, ?, ?, ?)`
      ).run(input.patientId, null, "koos", valueJson);
      return { ok: true };
    }),

  sendSurgeryReminder: protectedProcedure
    .input(
      z.object({
        patientId: z.number(),
        method: z.enum(["email", "sms", "whatsapp", "auto"]).optional(),
      })
    )
    .mutation(() => ({
      message: "Lembrete não enviado (notificações não configuradas).",
    })),
});
