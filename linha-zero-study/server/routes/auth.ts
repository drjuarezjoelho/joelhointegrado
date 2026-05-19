import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index";
import { studyUsers } from "../../drizzle/schema";
import { verifyPassword, hashPassword } from "../auth/password";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  sessionCookieOptions,
} from "../auth/session";
import { logAudit } from "../lib/audit";
import {
  type AuthedRequest,
  requireAuth,
} from "../middleware/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(12),
});

export const authRouter = Router();

authRouter.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "E-mail ou senha inválidos" });
    return;
  }
  const email = parsed.data.email.toLowerCase();
  const rows = await db
    .select()
    .from(studyUsers)
    .where(eq(studyUsers.email, email))
    .limit(1);
  const user = rows[0];
  if (!user?.isActive) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }
  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ error: "Credenciais inválidas" });
    return;
  }

  const token = await signSessionToken(user.id);
  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions());

  await db
    .update(studyUsers)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(studyUsers.id, user.id));

  await logAudit({
    userId: user.id,
    action: "login",
    entityType: "study_user",
    entityId: String(user.id),
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
  });
});

authRouter.post("/logout", requireAuth, async (req: AuthedRequest, res) => {
  await logAudit({
    userId: req.user!.id,
    action: "logout",
    entityType: "study_user",
    entityId: String(req.user!.id),
  });
  res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

authRouter.post(
  "/change-password",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Nova senha deve ter pelo menos 12 caracteres",
      });
      return;
    }

    const rows = await db
      .select()
      .from(studyUsers)
      .where(eq(studyUsers.id, req.user!.id))
      .limit(1);
    const user = rows[0];
    if (!user) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    const ok = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash
    );
    if (!ok) {
      res.status(400).json({ error: "Senha atual incorreta" });
      return;
    }

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await db
      .update(studyUsers)
      .set({
        passwordHash,
        mustChangePassword: 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(studyUsers.id, user.id));

    await logAudit({
      userId: user.id,
      action: "change_password",
      entityType: "study_user",
      entityId: String(user.id),
    });

    res.json({ ok: true });
  }
);
