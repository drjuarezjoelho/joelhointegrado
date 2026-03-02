/**
 * Seed SQLite with sample patients. Run: npm run db:seed
 * Requires server to be built or run with tsx (tsx scripts/seed-sqlite.ts).
 */
import Database from "better-sqlite3";
import { join } from "path";
import { readFileSync } from "fs";

const DB_PATH = process.env.SQLITE_DB_PATH ?? join(process.cwd(), "data", "cij.db");

const schemaPath = join(process.cwd(), "server", "db", "schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

const db = new Database(DB_PATH);
db.exec(schema);

const insert = db.prepare(`
  INSERT INTO patients (userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes)
  VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const patients = [
  ["Valdice Hermano Gomes de Souza", null, null, null, "(11) 99999-0001", "2026-01-06", "Gonartrose Avançada (ATJ)", "PAC-2026-001"],
  ["Vera Lucia Leite", null, null, null, "(11) 99999-0002", "2026-01-09", "Gonartrose Avançada (ATJ Esq)", "PAC-2026-002"],
  ["Lucas Magalhães da Silva", null, null, null, "(11) 99999-0003", "2026-01-09", "Ruptura de LCA + Lesão Meniscal (Dir)", "PAC-2026-003"],
  ["Maria do Carmo Passos Pionorio", null, null, null, "74999408008", "2026-01-31", "Artroplastia do Joelho (ATJ Esq)", "PAC-2026-012"],
  ["Wilson Nery da Cunha", null, null, null, "74988054233", "2026-02-07", "Artroscopia - Menisco Joelho (Esq)", "PAC-2026-013"],
];

for (const p of patients) {
  insert.run(...p);
}

console.log(`Seed OK: ${patients.length} patients in ${DB_PATH}`);
db.close();
