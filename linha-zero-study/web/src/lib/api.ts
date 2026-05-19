export type StudyUser = {
  id: number;
  email: string;
  displayName: string;
  role: string;
  mustChangePassword: boolean;
};

export type ApiVisit = {
  id: number;
  participantId: number;
  timepoint: string;
  assessmentDate: string | null;
  collectionStatus: string;
  payloadJson: string;
  protocolVersion: string;
  lockedAt: string | null;
};

export type ApiParticipant = {
  id: number;
  studyCode: string;
  codigo: string | null;
  iniciais: string;
  dateOfBirth: string;
  cidade: string | null;
  uf: string | null;
  convenio: string | null;
  articulacaoIndice: string | null;
  studyStatus: string;
  inclusionDate: string | null;
  createdAt: string;
  updatedAt: string;
  visitT0?: ApiVisit | null;
};

async function request<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Erro ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export const api = {
  login(email: string, password: string) {
    return request<{ user: StudyUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout() {
    return request<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
  },
  me() {
    return request<{ user: StudyUser }>("/api/auth/me");
  },
  changePassword(currentPassword: string, newPassword: string) {
    return request<{ ok: boolean }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  listParticipants() {
    return request<{ participants: ApiParticipant[] }>("/api/participants");
  },
  getParticipant(id: number) {
    return request<{ participant: ApiParticipant; visits: ApiVisit[] }>(
      `/api/participants/${id}`
    );
  },
  createParticipant(body: Record<string, unknown>) {
    return request<{ participant: ApiParticipant }>("/api/participants", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
  updateParticipant(id: number, body: Record<string, unknown>) {
    return request<{ participant: ApiParticipant }>(`/api/participants/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  deleteParticipant(id: number) {
    return request<{ ok: boolean }>(`/api/participants/${id}`, {
      method: "DELETE",
    });
  },
  updateVisit(id: number, body: Record<string, unknown>) {
    return request<{ visit: ApiVisit }>(`/api/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  exportCsv(format?: "wide" | "long") {
    const q = format === "long" ? "?format=long" : "";
    return fetch(`/api/export/csv${q}`, { credentials: "include" });
  },
};
