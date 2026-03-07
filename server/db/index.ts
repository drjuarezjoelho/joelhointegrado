import Database from "better-sqlite3";
import { readFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = process.env.SQLITE_DB_PATH ?? join(process.cwd(), "data", "cij.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = join(process.cwd(), "data");
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  const schemaPath = join(__dirname, "schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");
  database.exec(schema);
  migrateConsents(database);
}

function migrateConsents(database: Database.Database) {
  const columns = [
    "tcleVersion TEXT",
    "acceptedAt TEXT",
    "ipAddress TEXT",
    "userAgent TEXT",
    "isRevoked INTEGER DEFAULT 0",
    "revokedAt TEXT",
    "revocationReason TEXT",
    "updatedAt TEXT",
  ];
  for (const col of columns) {
    const name = col.split(" ")[0];
    try {
      database.exec(`ALTER TABLE consents ADD COLUMN ${col}`);
    } catch {
      // column already exists
    }
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
