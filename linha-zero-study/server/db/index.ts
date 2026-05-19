import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../../drizzle/schema";

const url = process.env.DATABASE_URL ?? "file:./data/linha-zero.db";
const filePath = url.replace(/^file:/, "");

const sqlite = new Database(filePath);
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
