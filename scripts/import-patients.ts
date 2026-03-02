/**
 * Importa pacientes a partir de um JSON.
 * Uso: npx tsx scripts/import-patients.ts
 * Coloque o arquivo em scripts/patients_import.json ou defina PATIENTS_IMPORT_JSON.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getDb, closeDb } from "../server/db/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const JSON_PATH =
  process.env.PATIENTS_IMPORT_JSON ??
  path.join(__dirname, "patients_import.json");

interface PatientInput {
  name: string;
  age?: number;
  gender?: string;
  email?: string;
  phone?: string;
  surgeryDate?: string;
  surgeryType?: string;
  notes?: string;
}

function toDateString(value: string | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

async function importPatients() {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`Arquivo não encontrado: ${JSON_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(JSON_PATH, "utf-8");
  const patientsData: PatientInput[] = JSON.parse(raw);

  const userId = Number(process.env.IMPORT_USER_ID) || 1;

  console.log(`\nIniciando importação de ${patientsData.length} pacientes...\n`);

  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO patients (userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let successCount = 0;
  let errorCount = 0;
  const errors: { name: string; error: string }[] = [];

  for (const p of patientsData) {
    try {
      const surgeryDate = toDateString(p.surgeryDate ?? undefined);
      insert.run(
        userId,
        p.name ?? "",
        p.age ?? null,
        p.gender ?? null,
        p.email ?? null,
        p.phone ?? null,
        surgeryDate,
        p.surgeryType ?? null,
        p.notes ?? null
      );
      console.log(`  ${p.name} (${surgeryDate ?? "-"})`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Erro: ${p.name}: ${message}`);
      errorCount++;
      errors.push({ name: p.name ?? "?", error: message });
    }
  }

  closeDb();

  console.log(`\nResultado: ${successCount} sucesso, ${errorCount} erros.`);
  if (errors.length > 0) {
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
  }
  process.exit(errorCount > 0 ? 1 : 0);
}

importPatients().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
