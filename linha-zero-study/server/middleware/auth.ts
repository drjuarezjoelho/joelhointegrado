import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { studyUsers, type StudyUserRole } from "../../drizzle/schema";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "../auth/session";
import type { AuthUser } from "../lib/roles";

export type AuthedRequest = Request & { user?: AuthUser };

async function loadUser(uid: number): Promise<AuthUser | null> {
  const rows = await db
    .select()
    .from(studyUsers)
    .where(eq(studyUsers.id, uid))
    .limit(1);
  const row = rows[0];
  if (!row || !row.isActive) return null;
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role as StudyUserRole,
    mustChangePassword: Boolean(row.mustChangePassword),
  };
}

export async function attachUser(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = await verifySessionToken(token);
  if (session) {
    req.user = (await loadUser(session.uid)) ?? undefined;
  }
  next();
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
}

export function requireRole(...roles: StudyUserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Sem permissão" });
      return;
    }
    next();
  };
}
