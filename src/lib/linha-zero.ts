export const COLORS = {
  navy: "#1F3A5F",
  blue: "#2E75B6",
  accent: "#EAF2F8",
  warn: "#FEF3C7",
  warnBorder: "#F59E0B",
} as const;

export const STORAGE_KEY = "linha-zero-cases";

export type LinhaZeroCase = ReturnType<typeof emptyCase>;

export function emptyCase() {
  return {
    id: "case-" + Date.now(),
    codigo: "",
    iniciais: "",
    dn: "",
    cidade: "",
    uf: "PE",
    convenio: "",
    status: "Em coleta T0",
    dataInclusao: new Date().toISOString().substring(0, 10),
    articulacaoIndice: "",
    comorbidades: "",
    medicacoes: "",
    cirurgiasPrevias: "",
    historicoGinecologico: "",
    atividadeFisica: "",
    habitos: "",
    tipoMenopausa: "",
    idadeMenopausa: "",
    fsh: "",
    lh: "",
    e2: "",
    trhAtual: "",
    peso: "",
    altura: "",
    ca: "",
    pctGordura: "",
    asmi: "",
    vat: "",
    tscoreL1L4: "",
    tscoreColo: "",
    tscoreFemur: "",
    vasInicial: "",
    diagnosticoImagem: "",
    outrasArticulacoes: "",
    hsCRP: "",
    vhs: "",
    glicose: "",
    insulina: "",
    hba1c: "",
    homaIR: "",
    ct: "",
    hdl: "",
    ldl: "",
    tg: "",
    cortisol: "",
    dheaS: "",
    tTotal: "",
    tLivre: "",
    shbg: "",
    igf1: "",
    tsh: "",
    t4l: "",
    vitD: "",
    b12: "",
    folato: "",
    ferritina: "",
    homocisteina: "",
    zinco: "",
    trhDefinida: "",
    suplementacao: "",
    exercicioPrescrito: "",
    regenerativa: "",
    observacoes: "",
    eventosAdversos: "",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}

export function calcIdade(dn: string) {
  if (!dn) return "";
  const hoje = new Date();
  const nasc = new Date(dn);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return String(idade);
}

export function calcIMC(peso: string, altura: string) {
  const p = parseFloat(peso);
  const a = parseFloat(altura);
  if (!p || !a) return "";
  const imc = p / Math.pow(a / 100, 2);
  return imc.toFixed(1);
}

export function calcHOMA(glicose: string, insulina: string) {
  const g = parseFloat(glicose);
  const i = parseFloat(insulina);
  if (!g || !i) return "";
  return ((g * i) / 405).toFixed(2);
}

export type SemaforoCheck = {
  label: string;
  val: string | number;
  ok: boolean;
  target: string;
};

export function semaforoLinhaZero(c: LinhaZeroCase): SemaforoCheck[] {
  const checks: SemaforoCheck[] = [];
  if (c.hsCRP)
    checks.push({
      label: "hs-CRP",
      val: parseFloat(c.hsCRP),
      ok: parseFloat(c.hsCRP) < 0.1,
      target: "<0,1 mg/dL",
    });
  if (c.homaIR || (c.glicose && c.insulina)) {
    const h = c.homaIR
      ? parseFloat(c.homaIR)
      : parseFloat(calcHOMA(c.glicose, c.insulina));
    checks.push({ label: "HOMA-IR", val: h, ok: h < 1.5, target: "<1,5" });
  }
  if (c.vitD)
    checks.push({
      label: "25-OH-D",
      val: parseFloat(c.vitD),
      ok: parseFloat(c.vitD) >= 50 && parseFloat(c.vitD) <= 80,
      target: "50–80 ng/mL",
    });
  if (c.homocisteina)
    checks.push({
      label: "Homocisteína",
      val: parseFloat(c.homocisteina),
      ok: parseFloat(c.homocisteina) <= 8,
      target: "5–8 µmol/L",
    });
  if (c.hba1c)
    checks.push({
      label: "HbA1c",
      val: parseFloat(c.hba1c),
      ok: parseFloat(c.hba1c) < 5.7,
      target: "<5,7%",
    });
  if (c.e2) {
    const e2 = parseFloat(c.e2);
    const e2pgml = e2 >= 200 ? e2 / 3.67 : e2;
    checks.push({
      label: "E2",
      val: e2pgml.toFixed(1) + " pg/mL",
      ok: e2pgml >= 50 && e2pgml <= 80,
      target: "50–80 pg/mL",
    });
  }
  return checks;
}

export function loadCasesFromStorage(): LinhaZeroCase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as { cases?: LinhaZeroCase[] };
    return data.cases ?? [];
  } catch {
    return [];
  }
}

export function saveCasesToStorage(cases: LinhaZeroCase[]) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ cases, lastSaved: new Date().toISOString() })
  );
}
