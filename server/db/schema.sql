-- SQLite schema for C.I.J. Cadastro
-- Run once to create tables (see server/db/init.ts)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openId TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  loginMethod TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_openId ON users(openId);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  email TEXT,
  phone TEXT,
  surgeryDate TEXT,
  surgeryType TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS timepoints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  timepointType TEXT NOT NULL,
  assessmentDate TEXT DEFAULT (date('now')),
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS consents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  consentType TEXT NOT NULL,
  consentText TEXT,
  isAccepted INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  timepointId INTEGER,
  questionnaireType TEXT NOT NULL,
  valueJson TEXT NOT NULL,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (timepointId) REFERENCES timepoints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_patients_userId ON patients(userId);
CREATE INDEX IF NOT EXISTS idx_timepoints_patientId ON timepoints(patientId);
CREATE INDEX IF NOT EXISTS idx_consents_patientId ON consents(patientId);
CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId INTEGER NOT NULL,
  reminderType TEXT NOT NULL,
  scheduledFor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sentAt TEXT,
  failureReason TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ikdc_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timepointId INTEGER NOT NULL,
  item1 INTEGER, item2 INTEGER, item3 INTEGER, item4 INTEGER, item5 INTEGER,
  item6 INTEGER, item7 INTEGER, item8 INTEGER, item9 INTEGER, item10 INTEGER,
  item11 INTEGER, item12 INTEGER, item13 INTEGER, item14 INTEGER, item15 INTEGER,
  item16 INTEGER, item17 INTEGER, item18 INTEGER, item19 INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (timepointId) REFERENCES timepoints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS koos_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timepointId INTEGER NOT NULL,
  pain1 INTEGER, pain2 INTEGER, pain3 INTEGER, pain4 INTEGER, pain5 INTEGER,
  pain6 INTEGER, pain7 INTEGER, pain8 INTEGER, pain9 INTEGER,
  symptoms1 INTEGER, symptoms2 INTEGER, symptoms3 INTEGER, symptoms4 INTEGER,
  symptoms5 INTEGER, symptoms6 INTEGER, symptoms7 INTEGER,
  adl1 INTEGER, adl2 INTEGER, adl3 INTEGER, adl4 INTEGER, adl5 INTEGER,
  adl6 INTEGER, adl7 INTEGER, adl8 INTEGER, adl9 INTEGER, adl10 INTEGER,
  adl11 INTEGER, adl12 INTEGER, adl13 INTEGER, adl14 INTEGER, adl15 INTEGER,
  adl16 INTEGER, adl17 INTEGER,
  sport1 INTEGER, sport2 INTEGER, sport3 INTEGER, sport4 INTEGER, sport5 INTEGER,
  qol1 INTEGER, qol2 INTEGER, qol3 INTEGER, qol4 INTEGER,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (timepointId) REFERENCES timepoints(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pain_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timepointId INTEGER NOT NULL,
  painScore INTEGER NOT NULL,
  assessmentDate TEXT NOT NULL DEFAULT (datetime('now')),
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (timepointId) REFERENCES timepoints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_patient ON questionnaire_responses(patientId);
CREATE INDEX IF NOT EXISTS idx_questionnaire_responses_timepoint ON questionnaire_responses(timepointId);
CREATE INDEX IF NOT EXISTS idx_ikdc_responses_timepointId ON ikdc_responses(timepointId);
CREATE INDEX IF NOT EXISTS idx_koos_responses_timepointId ON koos_responses(timepointId);
CREATE INDEX IF NOT EXISTS idx_pain_assessments_timepointId ON pain_assessments(timepointId);
CREATE INDEX IF NOT EXISTS idx_reminders_patientId ON reminders(patientId);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  specialty TEXT,
  yearOfResidency TEXT,
  notes TEXT,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('patient', 'student')),
  referenceId INTEGER NOT NULL,
  emailSent INTEGER DEFAULT 0,
  createdAt TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_registrations_type ON registrations(type);
