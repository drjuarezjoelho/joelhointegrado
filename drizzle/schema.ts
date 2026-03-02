import { sql } from "drizzle-orm";
import {
  integer,
  text,
  sqliteTable,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
  createdAt: text("createdAt").notNull().default(sql`datetime('now')`),
  updatedAt: text("updatedAt").notNull().default(sql`datetime('now')`),
  lastSignedIn: text("lastSignedIn").notNull().default(sql`datetime('now')`),
});

export const patients = sqliteTable("patients", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: integer("userId", { mode: "number" }).notNull().default(1),
  name: text("name").notNull(),
  age: integer("age", { mode: "number" }),
  gender: text("gender"),
  email: text("email"),
  phone: text("phone"),
  surgeryDate: text("surgeryDate"),
  surgeryType: text("surgeryType"),
  notes: text("notes"),
  createdAt: text("createdAt").default(sql`datetime('now')`),
  updatedAt: text("updatedAt").default(sql`datetime('now')`),
});

export const timepoints = sqliteTable(
  "timepoints",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    patientId: integer("patientId", { mode: "number" }).notNull().references(
      () => patients.id,
      { onDelete: "cascade" }
    ),
    timepointType: text("timepointType").notNull(),
    assessmentDate: text("assessmentDate").default(sql`date('now')`),
    createdAt: text("createdAt").default(sql`datetime('now')`),
  }
);

export const consents = sqliteTable("consents", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patientId: integer("patientId", { mode: "number" })
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  consentType: text("consentType").notNull(),
  consentText: text("consentText"),
  isAccepted: integer("isAccepted", { mode: "number" }).notNull().default(1),
  createdAt: text("createdAt").default(sql`datetime('now')`),
});

export const questionnaireResponses = sqliteTable("questionnaire_responses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patientId: integer("patientId", { mode: "number" })
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  timepointId: integer("timepointId", { mode: "number" }).references(
    () => timepoints.id,
    { onDelete: "cascade" }
  ),
  questionnaireType: text("questionnaireType").notNull(),
  valueJson: text("valueJson").notNull(),
  createdAt: text("createdAt").default(sql`datetime('now')`),
});

export const reminders = sqliteTable("reminders", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  patientId: integer("patientId", { mode: "number" })
    .notNull()
    .references(() => patients.id, { onDelete: "cascade" }),
  reminderType: text("reminderType").notNull(),
  scheduledFor: text("scheduledFor").notNull(),
  status: text("status").notNull().default("pending"),
  sentAt: text("sentAt"),
  failureReason: text("failureReason"),
  createdAt: text("createdAt").default(sql`datetime('now')`),
});

export const ikdcResponses = sqliteTable("ikdc_responses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timepointId: integer("timepointId", { mode: "number" })
    .notNull()
    .references(() => timepoints.id, { onDelete: "cascade" }),
  item1: integer("item1", { mode: "number" }),
  item2: integer("item2", { mode: "number" }),
  item3: integer("item3", { mode: "number" }),
  item4: integer("item4", { mode: "number" }),
  item5: integer("item5", { mode: "number" }),
  item6: integer("item6", { mode: "number" }),
  item7: integer("item7", { mode: "number" }),
  item8: integer("item8", { mode: "number" }),
  item9: integer("item9", { mode: "number" }),
  item10: integer("item10", { mode: "number" }),
  item11: integer("item11", { mode: "number" }),
  item12: integer("item12", { mode: "number" }),
  item13: integer("item13", { mode: "number" }),
  item14: integer("item14", { mode: "number" }),
  item15: integer("item15", { mode: "number" }),
  item16: integer("item16", { mode: "number" }),
  item17: integer("item17", { mode: "number" }),
  item18: integer("item18", { mode: "number" }),
  item19: integer("item19", { mode: "number" }),
  createdAt: text("createdAt").notNull().default(sql`datetime('now')`),
  updatedAt: text("updatedAt").notNull().default(sql`datetime('now')`),
});

export const koosResponses = sqliteTable("koos_responses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timepointId: integer("timepointId", { mode: "number" })
    .notNull()
    .references(() => timepoints.id, { onDelete: "cascade" }),
  pain1: integer("pain1", { mode: "number" }),
  pain2: integer("pain2", { mode: "number" }),
  pain3: integer("pain3", { mode: "number" }),
  pain4: integer("pain4", { mode: "number" }),
  pain5: integer("pain5", { mode: "number" }),
  pain6: integer("pain6", { mode: "number" }),
  pain7: integer("pain7", { mode: "number" }),
  pain8: integer("pain8", { mode: "number" }),
  pain9: integer("pain9", { mode: "number" }),
  symptoms1: integer("symptoms1", { mode: "number" }),
  symptoms2: integer("symptoms2", { mode: "number" }),
  symptoms3: integer("symptoms3", { mode: "number" }),
  symptoms4: integer("symptoms4", { mode: "number" }),
  symptoms5: integer("symptoms5", { mode: "number" }),
  symptoms6: integer("symptoms6", { mode: "number" }),
  symptoms7: integer("symptoms7", { mode: "number" }),
  adl1: integer("adl1", { mode: "number" }),
  adl2: integer("adl2", { mode: "number" }),
  adl3: integer("adl3", { mode: "number" }),
  adl4: integer("adl4", { mode: "number" }),
  adl5: integer("adl5", { mode: "number" }),
  adl6: integer("adl6", { mode: "number" }),
  adl7: integer("adl7", { mode: "number" }),
  adl8: integer("adl8", { mode: "number" }),
  adl9: integer("adl9", { mode: "number" }),
  adl10: integer("adl10", { mode: "number" }),
  adl11: integer("adl11", { mode: "number" }),
  adl12: integer("adl12", { mode: "number" }),
  adl13: integer("adl13", { mode: "number" }),
  adl14: integer("adl14", { mode: "number" }),
  adl15: integer("adl15", { mode: "number" }),
  adl16: integer("adl16", { mode: "number" }),
  adl17: integer("adl17", { mode: "number" }),
  sport1: integer("sport1", { mode: "number" }),
  sport2: integer("sport2", { mode: "number" }),
  sport3: integer("sport3", { mode: "number" }),
  sport4: integer("sport4", { mode: "number" }),
  sport5: integer("sport5", { mode: "number" }),
  qol1: integer("qol1", { mode: "number" }),
  qol2: integer("qol2", { mode: "number" }),
  qol3: integer("qol3", { mode: "number" }),
  qol4: integer("qol4", { mode: "number" }),
  createdAt: text("createdAt").notNull().default(sql`datetime('now')`),
  updatedAt: text("updatedAt").notNull().default(sql`datetime('now')`),
});

export const painAssessments = sqliteTable("pain_assessments", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  timepointId: integer("timepointId", { mode: "number" })
    .notNull()
    .references(() => timepoints.id, { onDelete: "cascade" }),
  painScore: integer("painScore", { mode: "number" }).notNull(),
  assessmentDate: text("assessmentDate").notNull().default(sql`datetime('now')`),
  createdAt: text("createdAt").notNull().default(sql`datetime('now')`),
  updatedAt: text("updatedAt").notNull().default(sql`datetime('now')`),
});
