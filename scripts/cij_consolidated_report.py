# -*- coding: utf-8 -*-
"""
Gera relatório consolidado: PDF parcial CIJ 2026 + séries históricas (surgical-audit-summary.json).
Saída: src/data/cij-consolidated-report.json (sem nomes de pacientes — só agregados).
"""
from __future__ import annotations

import json
import re
from collections import Counter
from datetime import date, datetime
from pathlib import Path

from pypdf import PdfReader


def classify_procedure(text: str) -> str:
    u = text.upper()
    if re.search(
        r"URG[EÊ]N|CIRURGIA\s+DE\s+URG|URG[EÊ]NCIA|TRAUMA\s+AGUDO", u
    ):
        return "Urgência / trauma agudo"
    if re.search(r"\bATJ\b|ARTROPLASTIA|PR[ÓO]TESE.*JOELH|PRÓTESE.*JOELH", u):
        return "ATJ / artroplastia joelho"
    if "LCA" in u or "LIGAMENTO CRUZADO" in u:
        if "MENISC" in u or re.search(r"\bMM\b", u):
            return "LCA + menisco"
        return "LCA (isolado ou + estruturas)"
    if "MENISC" in u or "MENISCECTOMIA" in u or ("SUTURA" in u and "JOELH" in u):
        return "Menisco / sutura (joelho)"
    if "ARTROSC" in u and "JOELH" in u:
        return "Artroscopia joelho"
    if "ARTROSC" in u:
        return "Artroscopia (outro)"
    if "FRAT" in u or "FRATURA" in u or "REFRATURA" in u:
        return "Fratura / trauma"
    if "REVIS" in u:
        return "Revisão (joelho)"
    if "OSTEOTOM" in u:
        return "Osteotomia / procedimento associado"
    if "MANIPULA" in u:
        return "Manipulação articular"
    return "Outros / não classificado"


def detect_hospital(block: str) -> str:
    b = block.upper().replace("\n", " ")
    if "SOTE" in b and "JUAZEIRO" in b:
        return "Hospital SOTE Juazeiro"
    if "UNIMED" in b and "PETROLINA" in b:
        return "Hospital UNIMED Petrolina"
    if "UNIMED" in b and "JUAZEIRO" in b:
        return "Hospital UNIMED Juazeiro"
    if "HUP" in b or "UNIVERSIT" in b:
        return "HUP / universitário (Petrolina)"
    if "SOTE" in b:
        return "Hospital SOTE Juazeiro"
    return "Outros / não informado"


def detect_doctor(block: str) -> str:
    u = block.upper()
    if re.search(r"DR\.?\s*JUAREZ|JUAREZ\s+SEBASTIAN", u):
        return "Dr. Juarez"
    if re.search(r"DR\.?\s*HUMBERTO", u):
        return "Dr. Humberto"
    if re.search(r"DR\.?\s*JO[AÃ]O|JOAO\s+CARNEIRO|JOÃO\s+CARNEIRO", u):
        return "Dr. João C."
    return "Não informado"


def detect_side(block: str) -> str:
    t = re.sub(r"\s+", " ", block)
    if re.search(r"Joelho\s*([DE])\b", t, re.I):
        m = re.search(r"Joelho\s*([DE])\b", t, re.I)
        return "Direito" if m.group(1).upper() == "D" else "Esquerdo"
    if re.search(r"Menisco\s*([DE])\b", t, re.I):
        m = re.search(r"Menisco\s*([DE])\b", t, re.I)
        return "Direito" if m.group(1).upper() == "D" else "Esquerdo"
    if re.search(r"\bATJ\s*([DE])\b", t, re.I):
        m = re.search(r"\bATJ\s*([DE])\b", t, re.I)
        return "Direito" if m.group(1).upper() == "D" else "Esquerdo"
    if re.search(r"Mão\s*E\b", t, re.I):
        return "Esquerdo (mão)"
    if re.search(r"(?:Artrosc|LCA|Menisco|Sutura)[^.]{0,40}\b([DE])\b", t, re.I):
        m = re.search(r"(?:Artrosc|LCA|Menisco|Sutura)[^.]{0,40}\b([DE])\b", t, re.I)
        if m.group(1).upper() in ("D", "E"):
            return (
                "Direito" if m.group(1).upper() == "D" else "Esquerdo"
            )
    return "Não informado"


def detect_opme(block: str) -> str:
    u = block.upper().replace(" ", "")
    if "MEDVALE" in u and "QUALY" in u:
        return "MEDVALE + QUALY"
    if "ORTOPLAN" in u or "ORTHOPLAN" in u:
        return "ORTOPLAN"
    if "QUALY" in u:
        return "QUALY"
    if "SANVAL" in u or "SANVALL" in u:
        return "SANVALEN (referência)"
    if "ORTHOMAC" in u:
        return "ORTHOMAC"
    if "MEDVALE" in u:
        return "MEDVALE"
    return "Não informado"


def clean_procedure_source(block: str) -> str:
    s = re.sub(r"\d{10,14}", " ", block)
    s = re.sub(r"\s+", " ", s)
    return s[:500]


def parse_parcial_pdf(path: Path) -> tuple[dict, list[dict]]:
    reader = PdfReader(str(path))
    full = "\n".join(page.extract_text() or "" for page in reader.pages)

    exec_summary: dict = {}
    m_tot = re.search(
        r"Total\s+de\s+Cirurgias\s+[ÚU]nicas\s*:?\s*(\d+)", full, re.I
    )
    exec_summary["uniqueSurgeries"] = int(m_tot.group(1)) if m_tot else None

    doc_date_m = re.search(
        r"(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})", full[:800], re.I
    )
    doc_date = None
    if doc_date_m:
        months_pt = {
            "janeiro": 1,
            "fevereiro": 2,
            "março": 3,
            "marco": 3,
            "abril": 4,
            "maio": 5,
            "junho": 6,
        }
        mo = months_pt.get(doc_date_m.group(2).lower()[:5], 4)
        try:
            doc_date = date(int(doc_date_m.group(3)), mo, int(doc_date_m.group(1)))
        except ValueError:
            doc_date = None

    status_counts: dict[str, int] = {}
    for label, key in [
        (r"Realizado\s*:?\s*(\d+)", "Realizado"),
        (r"Agendado\s*:?\s*(\d+)", "Agendado"),
        (r"Urg[êe]ncia\s*:?\s*(\d+)", "Urgência"),
        (r"Reagendado\s*:?\s*(\d+)", "Reagendado"),
    ]:
        mm = re.search(label, full[:2500], re.I)
        if mm:
            status_counts[key] = int(mm.group(1))

    hosp_counts: dict[str, int] = {}
    for line in full[:2200].splitlines():
        line = line.strip()
        m = re.match(r"^[•\-\u2022\u25cf]\s*(.+?):\s*(\d+)\s*$", line)
        if not m:
            continue
        name, n = m.group(1).strip(), int(m.group(2))
        if len(name) > 80:
            continue
        if any(
            x in name
            for x in ("Hospital", "HUP", "Outros", "Universit")
        ):
            hosp_counts[name] = n

    parts = re.split(r"(?=\d{2}/\d{2}/\d{4})", full)
    records: list[dict] = []
    for part in parts:
        part = part.strip()
        if not re.match(r"(\d{2})/(\d{2})/(\d{4})", part):
            continue
        d, m, y = part[:10].split("/")
        if y != "2026":
            continue
        rest = part[10:]
        one_line = re.sub(r"\s+", " ", rest)
        hospital = detect_hospital(one_line)
        doctor = detect_doctor(one_line)
        side = detect_side(one_line)
        opme = detect_opme(one_line)
        proc_src = clean_procedure_source(one_line)
        technique = classify_procedure(proc_src)
        records.append(
            {
                "date": f"{d}/{m}/{y}",
                "hospital": hospital,
                "doctor": doctor,
                "side": side,
                "supplier": opme,
                "technique": technique,
                "diagnosisGroup": technique,
            }
        )

    return (
        {
            "documentDate": doc_date.isoformat() if doc_date else None,
            "executiveSummary": {
                "uniqueSurgeries": exec_summary.get("uniqueSurgeries"),
                "byStatus": status_counts,
                "byHospitalExecutive": hosp_counts,
            },
            "parsedRowCount": len(records),
        },
        records,
    )


def aggregate_records(records: list[dict]) -> dict:
    def cnt(key: str) -> dict[str, int]:
        c: Counter[str] = Counter()
        for r in records:
            c[r.get(key) or "?"] += 1
        return dict(c.most_common())

    return {
        "byHospital": cnt("hospital"),
        "byDoctor": cnt("doctor"),
        "bySide": cnt("side"),
        "bySupplier": cnt("supplier"),
        "byTechnique": cnt("technique"),
        "byDiagnosis": cnt("diagnosisGroup"),
    }


def project_eoy_2026(
    records: list[dict],
    meta: dict,
    hist_team_knee_2025: dict[str, int] | None,
) -> dict:
    """Projeções para o total de 2026 com base no parcial e na história."""
    dates: list[date] = []
    for r in records:
        try:
            d, m, y = r["date"].split("/")
            dates.append(date(int(y), int(m), int(d)))
        except (ValueError, KeyError):
            continue
    if not dates:
        return {"note": "Sem datas válidas para projeção."}

    d_min, d_max = min(dates), max(dates)
    snapshot = None
    if meta.get("documentDate"):
        snapshot = date.fromisoformat(meta["documentDate"])
    else:
        snapshot = d_max

    days_window = (d_max - d_min).days + 1
    n = len(records)
    rate_per_day = n / days_window if days_window > 0 else 0

    year_end = date(2026, 12, 31)
    remaining_days = (year_end - snapshot).days if snapshot else 0
    projected_additional = max(0.0, rate_per_day * remaining_days)
    projected_total_density = n + projected_additional

    # Baseline histórico: soma joelho equipe 2025
    baseline_2025 = None
    if hist_team_knee_2025:
        baseline_2025 = sum(hist_team_knee_2025.values())

    linear_mid = None
    if baseline_2025 is not None:
        linear_mid = round(baseline_2025 * 1.02, 1)

    return {
        "snapshotDate": snapshot.isoformat() if snapshot else None,
        "firstCaseDate": d_min.isoformat(),
        "lastCaseDateInFile": d_max.isoformat(),
        "listedCasesInParser": n,
        "executiveUniqueCount": meta.get("executiveSummary", {}).get(
            "uniqueSurgeries"
        ),
        "methods": {
            "densityExtrapolation": {
                "daysInCalendarWindow": days_window,
                "casesPerDayInWindow": round(rate_per_day, 4),
                "remainingDaysInYearAfterSnapshot": remaining_days,
                "projectedAdditionalCases": round(projected_additional, 1),
                "projectedTotalYearEnd": round(projected_total_density, 1),
                "note": "Assume ritmo médio do intervalo entre primeira e última data na lista (agenda mista).",
            },
            "historicalBaseline2025TeamKnee": {
                "totalKnee2025": baseline_2025,
                "projected2026SimilarOrder": linear_mid,
                "note": "Referência: soma cirurgias de joelho (3 médicos) em 2025 no relatório Pietra; +2% ilustrativo.",
            },
        },
        "recommendedRange": {
            "low": round(min(projected_total_density, linear_mid or projected_total_density) * 0.9, 1)
            if linear_mid
            else round(projected_total_density * 0.85, 1),
            "high": round(max(projected_total_density, linear_mid or 0) * 1.1, 1)
            if linear_mid
            else round(projected_total_density * 1.15, 1),
        },
    }


def find_parcial_pdf(base: Path) -> Path | None:
    if not base.is_dir():
        return None
    for p in base.rglob("parcial*cij*2026*.pdf"):
        return p
    for p in base.rglob("*parcial*2026*.pdf"):
        if "cij" in p.name.lower():
            return p
    return None


def main():
    repo = Path(__file__).resolve().parent.parent
    base_pdfs = Path(
        r"c:\Users\JUAREZ\AppData\Roaming\Cursor\User\workspaceStorage"
        r"\423ae3fd4ff584d224b1cd678e6aa369\pdfs"
    )
    parcial = find_parcial_pdf(base_pdfs)
    if parcial is None:
        parcial = Path(
            r"c:\Users\JUAREZ\AppData\Roaming\Cursor\User\workspaceStorage"
            r"\423ae3fd4ff584d224b1cd678e6aa369\pdfs"
            r"\58665570-02d5-4276-8e04-2ae94908e56a\parcial_1_cij_2026.pdf"
        )
    if not parcial.is_file():
        print(f"PDF parcial não encontrado: {parcial}")
        return

    meta, records = parse_parcial_pdf(parcial)
    aggregates = aggregate_records(records)
    meta["aggregates"] = aggregates
    uc = meta.get("executiveSummary", {}).get("uniqueSurgeries")
    if uc is not None and len(records) < uc:
        meta["parseNote"] = (
            f"Resumo executivo: {uc} cirurgias únicas; parser com data: {len(records)} linhas."
        )

    summary_path = repo / "src" / "data" / "surgical-audit-summary.json"
    hist_team_2025 = None
    if summary_path.is_file():
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        by25 = summary.get("byYear", {}).get("2025", {}).get("bySurgeon", {})
        hist_team_2025 = {
            "Dr. Juarez": by25.get("Dr. Juarez", {}).get("kneeSurgerySlots", 0),
            "Dr. Humberto": by25.get("Dr. Humberto", {}).get("kneeSurgerySlots", 0),
            "Dr. João C.": by25.get("Dr. João C.", {}).get("kneeSurgerySlots", 0),
        }

    meta["projectionEnd2026"] = project_eoy_2026(records, meta, hist_team_2025)

    consolidated = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "sourcePdfs": {
            "parcial2026": parcial.name,
            "historicalSummary": "surgical-audit-summary.json",
        },
        "parcial2026": meta,
        "consolidatedFinal": {},
    }

    if summary_path.is_file():
        summary = json.loads(summary_path.read_text(encoding="utf-8"))
        consolidated["consolidatedFinal"] = {
            "yearsAvailable": summary.get("yearsAvailable", []),
            "teamKneeByYear": summary.get("series", {}).get(
                "teamKneeSlotsByYear", []
            ),
            "teamSurgeryByYear": summary.get("series", {}).get(
                "teamSurgerySlotsByYear", []
            ),
            "juarezKneeByYear": summary.get("series", {}).get(
                "juarezKneeSurgeryCountByYear", []
            ),
            "note": "Dimensões hospital/lado/fornecedor/técnica apenas para o parcial 2026; anos anteriores vêm da exportação Pietra (agenda) sem esses campos.",
        }

    out = repo / "src" / "data" / "cij-consolidated-report.json"
    out.write_text(
        json.dumps(consolidated, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"Wrote {out} ({out.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
