# -*- coding: utf-8 -*-
"""Extract surgical scheduling events from Pietra PDF exports into JSON."""
from __future__ import annotations

import json
import re
from collections import defaultdict
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
    if "URG" in u or "URGEN" in u:
        return "Urgência / trauma agudo"
    if re.search(r"\bATJ\b|ARTROPLASTIA.*JOELH", u):
        return "ATJ (joelho)"
    if "LCA" in u or "LIGAMENTO CRUZADO" in u:
        if "MENISC" in u or "MM" in u:
            return "LCA + menisco"
        return "LCA (isolado ou + estruturas)"
    if "MENISC" in u or "MENISCECTOMIA" in u or "SUTURA" in u and "JOELH" in u:
        return "Menisco / suture (joelho)"
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
    if "JO" in a and ("O C" in a or "ÃO C" in a or "JOAO" in a):
        return "Dr. João C."
    return "Outro"


def extract_pdf(path: Path) -> list[dict]:
    reader = PdfReader(str(path))
    full = []
    for page in reader.pages:
        full.append(page.extract_text() or "")
    text = "\n".join(full)
    lines = text.splitlines()

    current_date: str | None = None
    pending_title: str | None = None
    pending_time: str | None = None
    events: list[dict] = []

    def flush(agenda: str | None, desc: str | None):
        nonlocal pending_title, pending_time, current_date
        if not pending_title or not current_date:
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
        ev = {
            "date": current_date,
            "timeRange": pending_time,
            "rawTitle": pending_title[:500],
            "description": (desc or "")[:500],
            "agenda": agenda,
            "surgeon": surgeon_bucket(agenda or ""),
            "procedureCategory": proc_type,
            "isSurgerySlot": is_surgery,
            "kneeRelated": knee,
        }
        events.append(ev)
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

    return [e for e in events if e.get("agenda")]


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
    cij_dir = base / "9a7a03c7-8990-4e3b-b821-43a38bcd724c"
    cij_pdfs = list(cij_dir.glob("*.pdf")) if cij_dir.is_dir() else []

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
        bundle["cijDocuments"].append(
            {
                "file": p.name,
                "eventCount": len(extract_pdf(p)),
                "events": extract_pdf(p),
            }
        )

    out_path = out_dir / "surgical-audit-raw.json"
    out_path.write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
