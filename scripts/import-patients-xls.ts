<<<<<<< Current (Your changes)
=======
/**
 * Importa pacientes a partir de planilha XLS ou XLSX (cirurgias marcadas).
 * Uso: npm run db:import-xls -- scripts/cirurgias.xlsx
 *   ou: XLS_PATH=./cirurgias.xlsx npm run db:import-xls
 *
 * Colunas esperadas (primeira linha = cabeçalho). Reconhece variações:
 * - Nome: nome, paciente, name
 * - Idade: idade, age
 * - Sexo: sexo, gênero, gender (M/F ou Masculino/Feminino)
 * - Email: email, e-mail
 * - Telefone: telefone, phone, celular, fone
 * - Data da cirurgia: data cirurgia, data da cirurgia, surgery date, cirurgia
 * - Tipo de cirurgia: tipo, tipo cirurgia, surgery type, procedimento
 * - Observações: observações, notes, obs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as XLSX from "xlsx";
import { getDb, closeDb } from "../server/db/index";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PATH = path.join(__dirname, "cirurgias.xlsx");

function getPath(): string {
  const envPath = process.env.XLS_PATH;
  if (envPath) return path.resolve(envPath);
  const arg = process.argv[2];
  if (arg) return path.resolve(arg);
  return DEFAULT_PATH;
}

/** Normaliza cabeçalho para chave: minúsculo, sem acentos, trim */
function norm(s: string): string {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const COLUMN_ALIASES: Record<string, string> = {
  name: "name",
  nome: "name",
  paciente: "name",
  patient: "name",
  age: "age",
  idade: "age",
  gender: "gender",
  sexo: "gender",
  genero: "gender",
  email: "email",
  "e-mail": "email",
  phone: "phone",
  telefone: "phone",
  celular: "phone",
  fone: "phone",
  surgerydate: "surgeryDate",
  "data cirurgia": "surgeryDate",
  "data da cirurgia": "surgeryDate",
  cirurgia: "surgeryDate",
  "data": "surgeryDate",
  surgerytype: "surgeryType",
  "tipo cirurgia": "surgeryType",
  "tipo de cirurgia": "surgeryType",
  tipo: "surgeryType",
  procedimento: "surgeryType",
  notes: "notes",
  observacoes: "notes",
  observações: "notes",
  obs: "notes",
};

function buildHeaderMap(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    const key = COLUMN_ALIASES[norm(h)];
    if (key) map[key] = i;
  });
  return map;
}

/** Converte número serial Excel (dias desde 1900-01-01) para YYYY-MM-DD */
function excelSerialToDateString(serial: number): string | null {
  if (serial < 1) return null;
  const utcDays = Math.floor(serial - 25569);
  const d = new Date(utcDays * 86400 * 1000);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function toDateString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const s = excelSerialToDateString(value);
    if (s) return s;
  }
  const text = String(value).trim();
  const ddmmyyyy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    const d = new Date(Date.UTC(year, month - 1, day));
    if (
      d.getUTCFullYear() === year &&
      d.getUTCMonth() === month - 1 &&
      d.getUTCDate() === day
    ) {
      return d.toISOString().slice(0, 10);
    }
    return null;
  }
  const d = new Date(text);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function cell(row: unknown[], index: number): string | null {
  const v = row[index];
  if (v == null || v === "") return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function cellNum(row: unknown[], index: number): number | null {
  const v = row[index];
  if (v == null || v === "") return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function normalizeGender(val: string | null): string | null {
  if (!val) return null;
  const v = val.trim().toUpperCase();
  if (v === "M" || v === "MASC" || v === "MASCULINO") return "M";
  if (v === "F" || v === "FEM" || v === "FEMININO") return "F";
  return val;
}

async function importFromXls() {
  const filePath = getPath();

  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    console.error("Uso: npm run db:import-xls -- <caminho.xlsx>");
    console.error("  ou: XLS_PATH=./cirurgias.xlsx npm run db:import-xls");
    process.exit(1);
  }

  const buf = fs.readFileSync(filePath);
  const workbook = XLSX.read(buf, { type: "buffer", cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  if (!data.length) {
    console.error("Planilha vazia.");
    process.exit(1);
  }

  const headers = (data[0] as unknown[]).map((h) => String(h ?? ""));
  const headerMap = buildHeaderMap(headers);

  if (headerMap.name == null) {
    console.error(
      "Nenhuma coluna de nome encontrada. Cabeçalhos vistos:",
      headers.join(" | ")
    );
    process.exit(1);
  }

  const rows = data.slice(1) as unknown[][];
  const userId = Number(process.env.IMPORT_USER_ID) || 1;

  console.log(`\nImportando ${rows.length} linhas de ${path.basename(filePath)}...\n`);

  const db = getDb();
  const insert = db.prepare(`
    INSERT INTO patients (userId, name, age, gender, email, phone, surgeryDate, surgeryType, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let successCount = 0;
  let errorCount = 0;
  const errors: { row: number; name: string; error: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = cell(row, headerMap.name);
    if (!name) {
      console.log(`  Linha ${i + 2}: ignorada (sem nome)`);
      continue;
    }
    try {
      const surgeryDate = toDateString(
        headerMap.surgeryDate != null ? row[headerMap.surgeryDate] : null
      );
      insert.run(
        userId,
        name,
        cellNum(row, headerMap.age ?? -1),
        normalizeGender(cell(row, headerMap.gender ?? -1)),
        cell(row, headerMap.email ?? -1),
        cell(row, headerMap.phone ?? -1),
        surgeryDate,
        cell(row, headerMap.surgeryType ?? -1),
        cell(row, headerMap.notes ?? -1)
      );
      console.log(`  ${name} (${surgeryDate ?? "-"})`);
      successCount++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  Erro linha ${i + 2} (${name}): ${message}`);
      errorCount++;
      errors.push({ row: i + 2, name, error: message });
    }
  }

  closeDb();

  console.log(`\nResultado: ${successCount} importados, ${errorCount} erros.`);
  if (errors.length > 0) {
    errors.forEach((e) => console.log(`  - Linha ${e.row} (${e.name}): ${e.error}`));
  }
  process.exit(errorCount > 0 ? 1 : 0);
}

importFromXls().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
>>>>>>> Incoming (Background Agent changes)
