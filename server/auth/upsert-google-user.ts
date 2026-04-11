import type Database from "better-sqlite3";

/**
 * Google `sub` is stored in users.openId (unique).
 * All logins via this flow get role `admin` (equipe clínica).
 */
export function upsertGoogleUser(
  db: Database.Database,
  googleSub: string,
  email: string | null,
  name: string | null
): number {
  const row = db
    .prepare("SELECT id FROM users WHERE openId = ?")
    .get(googleSub) as { id: number } | undefined;

  const now = new Date().toISOString();

  if (row) {
    db.prepare(
      `UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        loginMethod = 'google',
        lastSignedIn = ?,
        updatedAt = ?
       WHERE openId = ?`
    ).run(name, email, now, now, googleSub);
    return row.id;
  }

  /** Primeiro utilizador Google fica com `id = 1` para herdar pacientes seed (userId=1). */
  const userCount = db
    .prepare("SELECT COUNT(*) as c FROM users")
    .get() as { c: number };
  if (userCount.c === 0) {
    db.prepare(
      `INSERT INTO users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
       VALUES (1, ?, ?, ?, 'google', 'admin', ?, ?, ?)`
    ).run(googleSub, name ?? "Utilizador", email, now, now, now);
    return 1;
  }

  const ins = db
    .prepare(
      `INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, ?, 'google', 'admin', ?, ?, ?)`
    )
    .run(googleSub, name ?? "Utilizador", email, now, now, now);
  return Number(ins.lastInsertRowid);
}

export function getUserById(
  db: Database.Database,
  id: number
): {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
} | null {
  const row = db
    .prepare(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1"
    )
    .get(id) as
    | {
        id: number;
        name: string | null;
        email: string | null;
        role: string;
      }
    | undefined;
  return row ?? null;
}
