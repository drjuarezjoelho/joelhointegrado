/**
 * CRF por visita — alinhado ao protótipo em cadastro-ci/src/lib/linha-zero.ts
 * Campos string vazios = não informado (exportar como missing).
 */
export type VisitPayloadT0 = {
  comorbidades?: string;
  medicacoes?: string;
  cirurgiasPrevias?: string;
  historicoGinecologico?: string;
  atividadeFisica?: string;
  habitos?: string;
  tipoMenopausa?: string;
  idadeMenopausa?: string;
  fsh?: string;
  lh?: string;
  e2?: string;
  trhAtual?: string;
  peso?: string;
  altura?: string;
  ca?: string;
  pctGordura?: string;
  asmi?: string;
  vat?: string;
  tscoreL1L4?: string;
  tscoreColo?: string;
  tscoreFemur?: string;
  vasInicial?: string;
  diagnosticoImagem?: string;
  outrasArticulacoes?: string;
  hsCRP?: string;
  vhs?: string;
  glicose?: string;
  insulina?: string;
  hba1c?: string;
  homaIR?: string;
  ct?: string;
  hdl?: string;
  ldl?: string;
  tg?: string;
  cortisol?: string;
  dheaS?: string;
  tTotal?: string;
  tLivre?: string;
  shbg?: string;
  igf1?: string;
  tsh?: string;
  t4l?: string;
  vitD?: string;
  b12?: string;
  folato?: string;
  ferritina?: string;
  homocisteina?: string;
  zinco?: string;
  trhDefinida?: string;
  suplementacao?: string;
  exercicioPrescrito?: string;
  regenerativa?: string;
  observacoes?: string;
  eventosAdversos?: string;
};

/** Seguimento — expandir conforme protocolo */
export type VisitPayloadFollowUp = {
  peso?: string;
  altura?: string;
  vas?: string;
  hsCRP?: string;
  vitD?: string;
  hba1c?: string;
  homaIR?: string;
  trhAtual?: string;
  suplementacao?: string;
  exercicioPrescrito?: string;
  eventosAdversos?: string;
  observacoes?: string;
};

export type VisitPayload = VisitPayloadT0 | VisitPayloadFollowUp;

export function emptyPayloadT0(): VisitPayloadT0 {
  return {};
}
