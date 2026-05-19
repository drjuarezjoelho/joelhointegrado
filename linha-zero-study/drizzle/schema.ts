import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Papéis dos 7 coautores (+ readonly opcional). */
export const studyUserRoles = [
  "pi_admin",
  "investigator",
  "data_monitor",
  "readonly",
] as const;
export type StudyUserRole = (typeof studyUserRoles)[number];

export const visitTimepoints = ["T0", "T3", "T6", "T12"] as const;
export type VisitTimepoint = (typeof visitTimepoints)[number];

export const visitCollectionStatuses = [
  "draft",
  "complete",
  "locked",
] as const;
export type VisitCollectionStatus = (typeof visitCollectionStatuses)[number];

export const studyUsers = sqliteTable(
  "study_users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull().default("investigator"),
    isActive: integer("is_active", { mode: "number" }).notNull().default(1),
    mustChangePassword: integer("must_change_password", { mode: "number" })
      .notNull()
      .default(1),
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [index("study_users_role_idx").on(t.role)]
);

export const participants = sqliteTable(
  "participants",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    /** Pseudônimo único para análise (LZ-001). */
    studyCode: text("study_code").notNull().unique(),
    codigo: text("codigo"),
    iniciais: text("iniciais").notNull(),
    dateOfBirth: text("date_of_birth").notNull(),
    cidade: text("cidade"),
    uf: text("uf").default("PE"),
    convenio: text("convenio"),
    articulacaoIndice: text("articulacao_indice"),
    studyStatus: text("study_status").notNull().default("Em coleta T0"),
    inclusionDate: text("inclusion_date"),
    protocolVersion: text("protocol_version").notNull().default("1.0"),
    consentRecordedAt: text("consent_recorded_at"),
    excludedAt: text("excluded_at"),
    exclusionReason: text("exclusion_reason"),
    createdById: integer("created_by_id", { mode: "number" }).references(
      () => studyUsers.id
    ),
    updatedById: integer("updated_by_id", { mode: "number" }).references(
      () => studyUsers.id
    ),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("participants_status_idx").on(t.studyStatus),
    index("participants_inclusion_idx").on(t.inclusionDate),
  ]
);

export const visits = sqliteTable(
  "visits",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    participantId: integer("participant_id", { mode: "number" })
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    timepoint: text("timepoint").notNull(),
    assessmentDate: text("assessment_date"),
    collectionStatus: text("collection_status").notNull().default("draft"),
    /** CRF completo da visita (JSON). Ver web/src/lib/visit-payload.ts */
    payloadJson: text("payload_json").notNull().default("{}"),
    protocolVersion: text("protocol_version").notNull().default("1.0"),
    lockedAt: text("locked_at"),
    lockedById: integer("locked_by_id", { mode: "number" }).references(
      () => studyUsers.id
    ),
    createdById: integer("created_by_id", { mode: "number" }).references(
      () => studyUsers.id
    ),
    updatedById: integer("updated_by_id", { mode: "number" }).references(
      () => studyUsers.id
    ),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    uniqueIndex("visits_participant_timepoint_uidx").on(
      t.participantId,
      t.timepoint
    ),
    index("visits_status_idx").on(t.collectionStatus),
  ]
);

export const auditEvents = sqliteTable(
  "audit_events",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    userId: integer("user_id", { mode: "number" }).references(() => studyUsers.id),
    participantId: integer("participant_id", { mode: "number" }).references(
      () => participants.id,
      { onDelete: "set null" }
    ),
    visitId: integer("visit_id", { mode: "number" }).references(() => visits.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    fieldPath: text("field_path"),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (t) => [
    index("audit_user_idx").on(t.userId),
    index("audit_participant_idx").on(t.participantId),
    index("audit_created_idx").on(t.createdAt),
  ]
);

export const studySettings = sqliteTable("study_settings", {
  key: text("key").primaryKey(),
  valueJson: text("value_json").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
