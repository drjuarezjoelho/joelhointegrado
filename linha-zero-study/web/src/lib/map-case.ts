import type { ApiParticipant, ApiVisit } from "./api";
import {
  PAYLOAD_FIELD_KEYS,
  emptyCase,
  type LinhaZeroCase,
} from "./case-model";

function parsePayload(json: string): Record<string, string> {
  try {
    const o = JSON.parse(json) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const k of PAYLOAD_FIELD_KEYS) {
      const v = o[k];
      if (v != null && v !== "") out[k] = String(v);
    }
    return out;
  } catch {
    return {};
  }
}

export function participantToCase(
  p: ApiParticipant,
  visitT0?: ApiVisit | null
): LinhaZeroCase {
  const t0 = visitT0 ?? p.visitT0 ?? null;
  const payload = t0 ? parsePayload(t0.payloadJson) : {};
  return {
    ...emptyCase(),
    ...payload,
    id: String(p.id),
    participantId: p.id,
    visitT0Id: t0?.id ?? 0,
    studyCode: p.studyCode,
    codigo: p.codigo ?? "",
    iniciais: p.iniciais,
    dn: p.dateOfBirth,
    cidade: p.cidade ?? "",
    uf: p.uf ?? "PE",
    convenio: p.convenio ?? "",
    status: p.studyStatus,
    dataInclusao: p.inclusionDate ?? "",
    articulacaoIndice: p.articulacaoIndice ?? "",
    visitLocked: t0?.collectionStatus === "locked",
    criadoEm: p.createdAt,
    atualizadoEm: p.updatedAt,
  };
}

export function caseToParticipantPatch(c: LinhaZeroCase) {
  return {
    codigo: c.codigo || undefined,
    iniciais: c.iniciais,
    dateOfBirth: c.dn,
    cidade: c.cidade || undefined,
    uf: c.uf,
    convenio: c.convenio || undefined,
    articulacaoIndice: c.articulacaoIndice || undefined,
    studyStatus: c.status,
    inclusionDate: c.dataInclusao || undefined,
  };
}

export function caseToPayload(c: LinhaZeroCase): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of PAYLOAD_FIELD_KEYS) {
    const v = c[k];
    if (typeof v === "string" && v) out[k] = v;
  }
  return out;
}
