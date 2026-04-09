# -*- coding: utf-8 -*-
"""Extract surgical scheduling events from Pietra PDF exports into JSON."""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

from pypdf import PdfReader

MONTHS_PT = {
    "jan": 1,
    "fev": 2,
    "mar": 3,
    "abr": 4,
    "mai": 5,
    "jun": 6,
    "jul": 7,
    "ago": 8,
    "set": 9,
    "out": 10,
    "nov": 11,
    "dez": 12,
}

DATE_RE = re.compile(
    r"(?:seg|ter|qua|qui|sex|s[aá]b|dom)\.?\s+(\d+)\s+(\w+)\.?\s+(\d{4})",
    re.IGNORECASE,
)
TIME_ENTRY_RE = re.compile(
    r"^\s*(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2}|Dia inteiro)\s+(.+)$",
    re.IGNORECASE,
)
DAY_BLOCK_RE = re.compile(
    r"^\s*Dia\s+inteiro\s+(.+)$",
    re.IGNORECASE,
)
AGENDA_RE = re.compile(r"Agenda:\s*(.+)", re.IGNORECASE)
KNEE_KW = re.compile(
    r"joelh|LCA|menisc|artrosc|ATJ|artroplastia|patel|viscossup|synvisc|sutura.*joelh",
    re.IGNORECASE,
)


def parse_date(day: int, mon: str, year: int) -> str | None:
    m = MONTHS_PT.get(mon.lower()[:3])
    if not m:
        return None
    try:
        return datetime(year, m, day).date().isoformat()
    except ValueError:
        return None


def classify_procedure(text: str) -> str:
    u = text.upper()
    if re.search(
        r"URG[EÊ]N|CIRURGIA\s+DE\s+URG|URG[EÊ]NCIA|TRAUMA\s+AGUDO", u
    ):
        return "Urgência / trauma agudo"
    if re.search(r"\bATJ\b|ARTROPLASTIA.*JOELH", u):
        return "ATJ (joelho)"
    if "LCA" in u or "LIGAMENTO CRUZADO" in u:
        if "MENISC" in u or re.search(r"\bMM\b", u):
            return "LCA + menisco"
        return "LCA (isolado ou + estruturas)"
    if "MENISC" in u or "MENISCECTOMIA" in u or ("SUTURA" in u and "JOELH" in u):
        return "Menisco / sutura (joelho)"
    if "ARTROSC" in u and "JOELH" in u:
        return "Artroscopia joelho (outros)"
    if "ARTROSC" in u:
        return "Artroscopia (outro sítio)"
    if "VISCOSSUP" in u or "SYNVISC" in u:
        return "Procedimento ambulatorial (visco etc.)"
    if "FRAT" in u or "FRATURA" in u:
        return "Fratura / ortopedia geral"
    if "BLOQUEADO" in u:
        return "Bloqueio de agenda"
    if "CIRURGIA" in u or "CIURGIA" in u:
        return "Cirurgia (não classificada)"
    if "PROCEDIMENTO" in u:
        return "Procedimento"
    return "Outros"


def surgeon_bucket(agenda_line: str) -> str:
    a = agenda_line.upper()
    if "JUAREZ" in a:
        return "Dr. Juarez"
    if "HUMBERTO" in a:
        return "Dr. Humberto"
    if "HUMBERT" in a:
        return "Dr. Humberto"
    if "JO" in a and ("O C" in a or "ÃO C" in a or "JOAO" in a):
        return "Dr. João C."
    return "Outro"


def extract_pdf(path: Path) -> list[dict]:
    reader = PdfReader(str(path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    lines = text.splitlines()

    current_date: str | None = None
    pending_title: str | None = None
    pending_time: str | None = None
    events: list[dict] = []

    def flush(agenda: str | None, desc: str | None):
        nonlocal pending_title, pending_time, current_date
        if not pending_title or not current_date or not agenda:
            return
        title = pending_title
        if desc:
            title = f"{title} | {desc}"
        proc_type = classify_procedure(title)
        is_surgery = bool(
            re.search(r"CIRURGIA|CIURGIA", title, re.I)
            and "BLOQUEADO" not in title.upper()
        )
        knee = bool(KNEE_KW.search(title))
        events.append(
            {
                "date": current_date,
                "timeRange": pending_time,
                "rawTitle": pending_title[:500],
                "description": (desc or "")[:500],
                "agenda": agenda,
                "surgeon": surgeon_bucket(agenda),
                "procedureCategory": proc_type,
                "isSurgerySlot": is_surgery,
                "kneeRelated": knee,
            }
        )
        pending_title = None
        pending_time = None

    desc_buf: list[str] = []
    last_agenda: str | None = None

    for raw in lines:
        line = raw.strip()
        if not line:
            continue

        dm = DATE_RE.search(line)
        if dm:
            if pending_title and last_agenda:
                flush(last_agenda, "\n".join(desc_buf) if desc_buf else None)
                desc_buf = []
            current_date = parse_date(int(dm.group(1)), dm.group(2), int(dm.group(3)))
            continue

        am = AGENDA_RE.search(line)
        if am:
            agenda_line = am.group(1).strip()
            last_agenda = agenda_line
            flush(agenda_line, "\n".join(desc_buf) if desc_buf else None)
            desc_buf = []
            continue

        if line.lower().startswith("descri"):
            desc_buf.append(line)
            continue

        tm = TIME_ENTRY_RE.match(line)
        if tm and current_date:
            pending_time = f"{tm.group(1)}-{tm.group(2)}"
            pending_title = tm.group(3).strip()
            continue

        db = DAY_BLOCK_RE.match(line)
        if db and current_date:
            pending_time = "Dia inteiro"
            pending_title = db.group(1).strip()
            continue

    if pending_title and last_agenda:
        flush(last_agenda, "\n".join(desc_buf) if desc_buf else None)

    return events


def _event_key(ev: dict) -> tuple:
    return (
        ev.get("date"),
        ev.get("timeRange"),
        (ev.get("rawTitle") or "")[:180],
    )


def find_cij_pdfs(base: Path) -> list[Path]:
    """Localiza PDFs de programação CIJ (nome deve conter «cij»). Evita PROGRAMACAO ANO 20xx."""
    if not base.is_dir():
        return []
    out: list[Path] = []
    for p in base.rglob("*.pdf"):
        n = p.name.lower()
        if "logo" in n:
            continue
        if "cij" not in n:
            continue
        out.append(p)
    return sorted(set(out), key=lambda x: str(x))


def unique_cij_pdfs_by_filename(paths: list[Path]) -> list[Path]:
    """Evita processar o mesmo PDF duas vezes (pastas diferentes no Cursor)."""
    seen: set[str] = set()
    uniq: list[Path] = []
    for p in paths:
        if p.name in seen:
            continue
        seen.add(p.name)
        uniq.append(p)
    return uniq


def merge_cij_into_years(bundle: dict, annual_years: set[int]) -> None:
    """
    Integra eventos extraídos dos PDFs CIJ nos anos que **não** têm PDF anual
    (ex.: 2025), para não duplicar 2021–2024 já cobertos por PROGRAMACAO ANO.
    """
    for doc in bundle.get("cijDocuments", []):
        doc_name = doc.get("file", "CIJ.pdf")
        for ev in doc.get("events", []):
            d = ev.get("date")
            if not d or len(d) < 4:
                continue
            try:
                y = int(d[:4])
            except ValueError:
                continue
            if y in annual_years:
                continue
            ys = str(y)
            if ys not in bundle["years"]:
                bundle["years"][ys] = {
                    "file": f"CIJ: {doc_name}",
                    "eventCount": 0,
                    "events": [],
                }
            else:
                prev = bundle["years"][ys].get("file", "")
                if doc_name not in prev:
                    bundle["years"][ys]["file"] = f"{prev} + CIJ: {doc_name}"
            bundle["years"][ys]["events"].append(ev)

    for ys, block in bundle.get("years", {}).items():
        evs = block.get("events", [])
        seen: set[tuple] = set()
        deduped: list[dict] = []
        for ev in evs:
            k = _event_key(ev)
            if k in seen:
                continue
            seen.add(k)
            deduped.append(ev)
        block["events"] = deduped
        block["eventCount"] = len(deduped)


def _linreg(xs: list[float], ys: list[float]) -> tuple[float, float]:
    n = len(xs)
    if n < 2:
        return 0.0, sum(ys) / n if n else 0.0
    mx = sum(xs) / n
    my = sum(ys) / n
    num = sum((xs[i] - mx) * (ys[i] - my) for i in range(n))
    den = sum((x - mx) ** 2 for x in xs)
    if den == 0:
        return 0.0, my
    slope = num / den
    intercept = my - slope * mx
    return slope, intercept


def build_summary(bundle: dict) -> dict:
    years_sorted = sorted(int(y) for y in bundle.get("years", {}).keys())
    by_year: dict = {}
    juarez_knee_per_year: list[tuple[int, int]] = []
    juarez_surg_per_year: list[tuple[int, int]] = []

    for y in years_sorted:
        ys = str(y)
        evs = bundle["years"][ys]["events"]
        surgeons: dict[str, dict[str, int]] = {}
        by_month_juarez_knee: dict[str, int] = {}
        cat_juarez_knee: dict[str, int] = {}

        for e in evs:
            sur = e.get("surgeon") or "Outro"
            if sur not in surgeons:
                surgeons[sur] = {
                    "slots": 0,
                    "surgerySlots": 0,
                    "kneeSurgerySlots": 0,
                }
            surgeons[sur]["slots"] += 1
            if e.get("isSurgerySlot"):
                surgeons[sur]["surgerySlots"] += 1
            if e.get("isSurgerySlot") and e.get("kneeRelated"):
                surgeons[sur]["kneeSurgerySlots"] += 1
                if sur == "Dr. Juarez":
                    m = (e.get("date") or "")[5:7]
                    if len(m) == 2:
                        by_month_juarez_knee[m] = by_month_juarez_knee.get(m, 0) + 1
                    cat = e.get("procedureCategory") or "Outros"
                    cat_juarez_knee[cat] = cat_juarez_knee.get(cat, 0) + 1

        jk = surgeons.get("Dr. Juarez", {}).get("kneeSurgerySlots", 0)
        js = surgeons.get("Dr. Juarez", {}).get("surgerySlots", 0)
        juarez_knee_per_year.append((y, jk))
        juarez_surg_per_year.append((y, js))

        by_year[ys] = {
            "eventCount": len(evs),
            "bySurgeon": surgeons,
            "juarezKneeByMonth": dict(sorted(by_month_juarez_knee.items())),
            "juarezKneeByCategory": dict(
                sorted(cat_juarez_knee.items(), key=lambda x: -x[1])
            ),
        }

    xs = [float(y) for y, _ in juarez_knee_per_year]
    ys_k = [float(k) for _, k in juarez_knee_per_year]
    slope_k, icept_k = _linreg(xs, ys_k) if xs else (0.0, 0.0)
    pred_k_2026 = max(0.0, round(icept_k + slope_k * 2026.0, 1))

    last3 = ys_k[-3:] if len(ys_k) >= 3 else ys_k
    avg_last3 = round(sum(last3) / len(last3), 1) if last3 else 0.0

    cij_seen: set[str] = set()
    cij_meta: list[dict] = []
    for d in bundle.get("cijDocuments", []):
        fn = d.get("file", "")
        if not fn or fn in cij_seen:
            continue
        cij_seen.add(fn)
        cij_meta.append({"file": fn, "eventCount": d.get("eventCount", 0)})

    y_first = years_sorted[0] if years_sorted else None
    y_last = years_sorted[-1] if years_sorted else None
    k_first = juarez_knee_per_year[0][1] if juarez_knee_per_year else 0
    k_last = juarez_knee_per_year[-1][1] if juarez_knee_per_year else 0
    drop_pct = round((1 - k_last / k_first) * 100, 1) if k_first else 0.0

    ref_mid_year = years_sorted[len(years_sorted) // 2] if years_sorted else None
    k_ref = (
        juarez_knee_per_year[len(years_sorted) // 2][1]
        if juarez_knee_per_year and years_sorted
        else 0
    )

    suggestions = [
        f"O volume de cirurgias de joelho do Dr. Juarez entre {y_first} e {y_last}: {k_first} → {k_last} casos (variação ~{drop_pct}% no período); validar oferta de agenda, triagem, hospital ou artefato da exportação Pietra.",
        f"Para 2026, usar em conjunto: (A) extrapolação linear (~{pred_k_2026} casos de joelho), (B) média dos últimos 3 anos ({avg_last3} casos) como piso de OPME, (C) referência intermédia ({ref_mid_year}: {k_ref} casos) se a demanda justificar.",
        "Comparar perfil eletivo vs urgência diretamente no prontuário/BI hospitalar; a categorização aqui é proxy por texto do agendamento e não substitui auditoria clínica.",
        "Padronizar descrições no Pietra (LCA, menisco, ATJ, revisão, patela) para reduzir a classe 'Cirurgia (não classificada)' e melhorar o mix procedimental ano a ano.",
    ]

    team_knee: list[dict] = []
    team_surg: list[dict] = []
    for y in years_sorted:
        ys = str(y)
        sur = by_year[ys].get("bySurgeon", {})
        team_knee.append(
            {
                "year": y,
                "juarez": sur.get("Dr. Juarez", {}).get("kneeSurgerySlots", 0),
                "humberto": sur.get("Dr. Humberto", {}).get("kneeSurgerySlots", 0),
                "joao": sur.get("Dr. João C.", {}).get("kneeSurgerySlots", 0),
            }
        )
        team_surg.append(
            {
                "year": y,
                "juarez": sur.get("Dr. Juarez", {}).get("surgerySlots", 0),
                "humberto": sur.get("Dr. Humberto", {}).get("surgerySlots", 0),
                "joao": sur.get("Dr. João C.", {}).get("surgerySlots", 0),
            }
        )

    return {
        "extractedAt": bundle.get("extractedAt"),
        "source": bundle.get("source"),
        "yearsAvailable": [str(y) for y in years_sorted],
        "byYear": by_year,
        "series": {
            "juarezKneeSurgeryCountByYear": [
                {"year": y, "count": k} for y, k in juarez_knee_per_year
            ],
            "juarezSurgeryCountByYear": [
                {"year": y, "count": s} for y, s in juarez_surg_per_year
            ],
            "teamKneeSlotsByYear": team_knee,
            "teamSurgerySlotsByYear": team_surg,
        },
        "projection2026": {
            "juarezKneeSurgerySlots": {
                "linearOnCalendarYear": pred_k_2026,
                "averageLast3Years": avg_last3,
                "recommendedPlanningRange": {
                    "low": round(min(pred_k_2026, avg_last3) * 0.85, 1),
                    "high": round(max(pred_k_2026, avg_last3) * 1.15, 1),
                },
                "methodsNote": "Projeção estatística simples (regressão linear OLS). Não substitui planejamento clínico nem gestão de leitos/OPME.",
            }
        },
        "cijDocumentsMeta": cij_meta,
        "suggestionsForApproval": suggestions,
    }


def main():
    base = Path(
        r"c:\Users\JUAREZ\AppData\Roaming\Cursor\User\workspaceStorage"
        r"\423ae3fd4ff584d224b1cd678e6aa369\pdfs"
    )
    targets = {
        2021: base / "cbd80d9a-a487-441a-8a99-881f05738a7a" / "PROGRAMACAO ANO 2021 (1).pdf",
        2022: base / "6a1f9c02-dcb2-4210-ab1e-442822876855" / "PROGRAMACAO ANO 2022 (1).pdf",
        2023: base / "387037ff-f987-468f-9023-a53aa1eb2be1" / "PROGRAMACAO ANO 2023 (1).pdf",
        2024: base / "b84084fe-876c-435e-936f-8dd575c51d67" / "PROGRAMACAO ANO 2024 (1).pdf",
    }
    cij_pdfs = unique_cij_pdfs_by_filename(find_cij_pdfs(base))

    out_dir = Path(__file__).resolve().parent.parent / "src" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)

    bundle: dict = {
        "source": "Pietra Medical Advisor exports",
        "extractedAt": datetime.now().isoformat(timespec="seconds"),
        "years": {},
        "cijDocuments": [],
    }

    for year, pdf_path in targets.items():
        if not pdf_path.is_file():
            continue
        evs = extract_pdf(pdf_path)
        bundle["years"][str(year)] = {
            "file": pdf_path.name,
            "eventCount": len(evs),
            "events": evs,
        }

    for p in cij_pdfs:
        evs = extract_pdf(p)
        bundle["cijDocuments"].append(
            {
                "file": p.name,
                "eventCount": len(evs),
                "events": evs,
            }
        )

    merge_cij_into_years(bundle, set(targets.keys()))

    out_path = out_dir / "surgical-audit-raw.json"
    out_path.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

    summary = build_summary(bundle)
    sum_path = out_dir / "surgical-audit-summary.json"
    sum_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {sum_path} ({sum_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
