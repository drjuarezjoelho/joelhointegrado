import type { StudyUserRole } from "../../drizzle/schema";

export type AuthUser = {
  id: number;
  email: string;
  displayName: string;
  role: StudyUserRole;
  mustChangePassword: boolean;
};

export function canWriteClinical(role: StudyUserRole): boolean {
  return role === "pi_admin" || role === "investigator";
}

export function canLockVisit(role: StudyUserRole): boolean {
  return role === "pi_admin" || role === "data_monitor";
}

export function canExport(role: StudyUserRole): boolean {
  return role === "pi_admin" || role === "data_monitor";
}

export function canRead(role: StudyUserRole): boolean {
  return true;
}
