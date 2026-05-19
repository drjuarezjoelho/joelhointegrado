/**
 * Cria as 7 contas de coautores a partir de COAUTHORS_JSON + LINHA_ZERO_SEED_PASSWORD.
 * Idempotente: não sobrescreve e-mail já existente.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";
import { studySettings, studyUsers } from "../drizzle/schema.js";
import type { StudyUserRole } from "../drizzle/schema.js";

type CoauthorSeed = {
  email: string;
  displayName: string;
  role: StudyUserRole;
};

const BCRYPT_ROUNDS = 12;

function getDbPath() {
  const url = process.env.DATABASE_URL ?? "file:./data/linha-zero.db";
  const filePath = url.replace(/^file:/, "");
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return filePath;
}

function parseCoauthors(): CoauthorSeed[] {
  const raw = process.env.COAUTHORS_JSON;
  if (!raw?.trim()) {
    throw new Error("COAUTHORS_JSON ausente no .env");
  }
  const list = JSON.parse(raw) as CoauthorSeed[];
  if (!Array.isArray(list) || list.length !== 7) {
    throw new Error(
      `COAUTHORS_JSON deve ser array com exatamente 7 coautores (recebido: ${list?.length ?? 0})`
    );
  }
  const emails = new Set<string>();
  for (const u of list) {
    if (!u.email?.includes("@")) throw new Error(`E-mail inválido: ${u.email}`);
    if (emails.has(u.email.toLowerCase())) {
      throw new Error(`E-mail duplicado: ${u.email}`);
    }
    emails.add(u.email.toLowerCase());
  }
  const admins = list.filter((u) => u.role === "pi_admin");
  if (admins.length !== 1) {
    throw new Error("Deve haver exatamente 1 usuário com role pi_admin");
  }
  return list;
}

async function main() {
  const password = process.env.LINHA_ZERO_SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "LINHA_ZERO_SEED_PASSWORD deve ter pelo menos 12 caracteres"
    );
  }

  const coauthors = parseCoauthors();
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const dbPath = getDbPath();
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  let created = 0;
  let skipped = 0;

  for (const c of coauthors) {
    const existing = await db
      .select({ id: studyUsers.id })
      .from(studyUsers)
      .where(eq(studyUsers.email, c.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      console.log(`  skip  ${c.email} (já existe)`);
      continue;
    }

    await db.insert(studyUsers).values({
      email: c.email.toLowerCase(),
      passwordHash: hash,
      displayName: c.displayName,
      role: c.role,
      mustChangePassword: 1,
      isActive: 1,
    });
    created++;
    console.log(`  +     ${c.email} (${c.role})`);
  }

  const protocolVersion =
    process.env.LINHA_ZERO_PROTOCOL_VERSION ?? "1.0";
  await db
    .insert(studySettings)
    .values({
      key: "protocol_version",
      valueJson: JSON.stringify({ version: protocolVersion }),
    })
    .onConflictDoUpdate({
      target: studySettings.key,
      set: {
        valueJson: JSON.stringify({ version: protocolVersion }),
        updatedAt: new Date().toISOString(),
      },
    });

  console.log(
    `\nSeed concluído: ${created} criados, ${skipped} ignorados. Senha temporária: (definida em LINHA_ZERO_SEED_PASSWORD)`
  );
  console.log("Peça a cada coautor para trocar a senha no primeiro login.\n");
  sqlite.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
