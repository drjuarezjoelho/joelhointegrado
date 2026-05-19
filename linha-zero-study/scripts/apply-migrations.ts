import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const migrationsDir = path.join(import.meta.dirname, "../drizzle/migrations");
const dbPath =
  (process.env.DATABASE_URL ?? "file:./data/linha-zero.db").replace(/^file:/, "");

const sqlFile = fs
  .readdirSync(migrationsDir)
  .find((f) => f.endsWith(".sql"));
if (!sqlFile) throw new Error("Nenhuma migration em drizzle/migrations");

const sql = fs.readFileSync(path.join(migrationsDir, sqlFile), "utf8");
const stmts = sql
  .split(/--> statement-breakpoint\n/)
  .map((s) => s.trim())
  .filter(Boolean);

const tableOrder = [
  "study_users",
  "study_settings",
  "participants",
  "visits",
  "audit_events",
];

const creates = stmts.filter((s) => s.startsWith("CREATE TABLE"));
const byTable = new Map<string, string>();
for (const s of creates) {
  const name = s.match(/CREATE TABLE `(\w+)`/)?.[1];
  if (name) byTable.set(name, s);
}

const db = new Database(dbPath);
for (const name of tableOrder) {
  const stmt = byTable.get(name);
  if (stmt) db.exec(stmt);
}
for (const s of stmts) {
  if (s.startsWith("CREATE INDEX") || s.startsWith("CREATE UNIQUE")) {
    db.exec(s);
  }
}
console.log("Migrations aplicadas:", sqlFile);
db.close();
