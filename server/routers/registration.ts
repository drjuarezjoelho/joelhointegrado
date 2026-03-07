import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { getDb } from "../db";

const patientRegistrationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  age: z.number().optional(),
  gender: z.enum(["M", "F", "Outro"]).optional(),
  surgeryType: z.string().optional(),
  notes: z.string().optional(),
});

const studentRegistrationSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  institution: z.string().optional(),
  specialty: z.string().optional(),
  yearOfResidency: z.string().optional(),
  notes: z.string().optional(),
});

async function sendRegistrationEmail(
  to: string,
  name: string,
  type: "patient" | "student"
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY not set — skipping email");
    return { sent: false, reason: "no_api_key" };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  const subject =
    type === "patient"
      ? "C.I.J. - Cadastro de Paciente Confirmado"
      : "C.I.J. - Cadastro de Aluno Confirmado";

  const html =
    type === "patient"
      ? `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0B1426;color:#E8EDF4;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#2E86C1;font-size:24px;margin:0;">C.I.J. - Centro Integrado de Joelho</h1>
            <p style="color:#8BA3C4;font-size:14px;">Dr. Juarez Sebastian - Ortopedia e Traumatologia</p>
          </div>
          <h2 style="color:#E8EDF4;font-size:20px;">Olá, ${name}!</h2>
          <p style="color:#CBD5E1;line-height:1.6;">Seu cadastro como <strong>paciente</strong> foi realizado com sucesso no sistema C.I.J.</p>
          <p style="color:#CBD5E1;line-height:1.6;">Em breve você receberá informações sobre os questionários pré-operatórios e o TCLE (Termo de Consentimento).</p>
          <div style="background:#112240;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #2E86C1;">
            <p style="color:#8BA3C4;font-size:13px;margin:0;">Se tiver dúvidas, entre em contato com a equipe C.I.J.</p>
          </div>
          <p style="color:#5A6B82;font-size:12px;text-align:center;margin-top:32px;">© ${new Date().getFullYear()} Centro Integrado de Joelho (C.I.J.) - Juazeiro/Petrolina</p>
        </div>`
      : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0B1426;color:#E8EDF4;border-radius:12px;">
          <div style="text-align:center;margin-bottom:24px;">
            <h1 style="color:#2E86C1;font-size:24px;margin:0;">C.I.J. - Centro Integrado de Joelho</h1>
            <p style="color:#8BA3C4;font-size:14px;">Residência em Ortopedia e Traumatologia</p>
          </div>
          <h2 style="color:#E8EDF4;font-size:20px;">Olá, ${name}!</h2>
          <p style="color:#CBD5E1;line-height:1.6;">Seu cadastro como <strong>aluno</strong> foi realizado com sucesso no sistema C.I.J.</p>
          <p style="color:#CBD5E1;line-height:1.6;">Você terá acesso ao acompanhamento de pacientes e questionários clínicos da residência.</p>
          <div style="background:#112240;border-radius:8px;padding:16px;margin:20px 0;border-left:4px solid #2E86C1;">
            <p style="color:#8BA3C4;font-size:13px;margin:0;">Bem-vindo à equipe! Em breve compartilharemos mais informações.</p>
          </div>
          <p style="color:#5A6B82;font-size:12px;text-align:center;margin-top:32px;">© ${new Date().getFullYear()} Centro Integrado de Joelho (C.I.J.) - Juazeiro/Petrolina</p>
        </div>`;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    console.log(`[Resend] Email sent to ${to}:`, result);
    return { sent: true, id: result.data?.id };
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    return { sent: false, reason: "send_failed" };
  }
}

export const registrationRouter = router({
  registerPatient: publicProcedure
    .input(patientRegistrationSchema)
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = db
        .prepare(
          `INSERT INTO patients (name, email, phone, age, gender, surgeryType, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          input.name,
          input.email,
          input.phone || null,
          input.age || null,
          input.gender || null,
          input.surgeryType || null,
          input.notes || null
        );

      const patientId = result.lastInsertRowid as number;

      db.prepare(
        `INSERT INTO registrations (type, referenceId) VALUES ('patient', ?)`
      ).run(patientId);

      const emailResult = await sendRegistrationEmail(
        input.email,
        input.name,
        "patient"
      );

      if (emailResult.sent) {
        db.prepare(
          `UPDATE registrations SET emailSent = 1 WHERE referenceId = ? AND type = 'patient'`
        ).run(patientId);
      }

      return { id: patientId, emailSent: emailResult.sent };
    }),

  registerStudent: publicProcedure
    .input(studentRegistrationSchema)
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = db
        .prepare(
          `INSERT INTO students (name, email, phone, institution, specialty, yearOfResidency, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          input.name,
          input.email,
          input.phone || null,
          input.institution || null,
          input.specialty || null,
          input.yearOfResidency || null,
          input.notes || null
        );

      const studentId = result.lastInsertRowid as number;

      db.prepare(
        `INSERT INTO registrations (type, referenceId) VALUES ('student', ?)`
      ).run(studentId);

      const emailResult = await sendRegistrationEmail(
        input.email,
        input.name,
        "student"
      );

      if (emailResult.sent) {
        db.prepare(
          `UPDATE registrations SET emailSent = 1 WHERE referenceId = ? AND type = 'student'`
        ).run(studentId);
      }

      return { id: studentId, emailSent: emailResult.sent };
    }),
});
