import { useState, useEffect } from "react";
import {
  emptyCase,
  loadCasesFromStorage,
  saveCasesToStorage,
  type LinhaZeroCase,
} from "@/lib/linha-zero";
import { Header, WarningBanner, Footer } from "@/components/linha-zero/Layout";
import { CaseList } from "@/components/linha-zero/CaseList";
import { CaseForm } from "@/components/linha-zero/CaseForm";
import { CaseDetail } from "@/components/linha-zero/CaseDetail";

type View = "list" | "form" | "detail";
type TabId =
  | "identificacao"
  | "anamnese"
  | "menopausa"
  | "antropo"
  | "queixa"
  | "labs"
  | "plano"
  | "obs";

export default function LinhaZero() {
  const [cases, setCases] = useState<LinhaZeroCase[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<LinhaZeroCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("identificacao");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setCases(loadCasesFromStorage());
    setLoading(false);
  }, []);

  function saveCases(newCases: LinhaZeroCase[]) {
    try {
      saveCasesToStorage(newCases);
      setCases(newCases);
    } catch (err) {
      alert(
        "Erro ao salvar localmente: " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  }

  function startNew() {
    const proximoNum = cases.length + 1;
    const novo = { ...emptyCase(), codigo: "Caso " + proximoNum };
    setEditing(novo);
    setView("form");
    setTab("identificacao");
  }

  function startEdit(c: LinhaZeroCase) {
    setEditing({ ...c });
    setView("form");
    setTab("identificacao");
  }

  function viewDetail(c: LinhaZeroCase) {
    setSelectedId(c.id);
    setView("detail");
  }

  function handleSave() {
    if (!editing?.iniciais || !editing?.dn) {
      alert("Iniciais e Data de Nascimento são obrigatórios.");
      return;
    }
    const updated = { ...editing, atualizadoEm: new Date().toISOString() };
    const exists = cases.some((c) => c.id === updated.id);
    const newCases = exists
      ? cases.map((c) => (c.id === updated.id ? updated : c))
      : [...cases, updated];
    saveCases(newCases);
    setView("list");
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (
      !confirm(
        "Tem certeza que deseja remover este caso? Esta ação não pode ser desfeita."
      )
    )
      return;
    saveCases(cases.filter((c) => c.id !== id));
    setView("list");
  }

  function exportJSON() {
    const blob = new Blob(
      [
        JSON.stringify(
          { cases, exportadoEm: new Date().toISOString(), versao: "1.0" },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "linha-zero-backup-" + new Date().toISOString().substring(0, 10) + ".json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as {
          cases?: LinhaZeroCase[];
        };
        if (!data.cases || !Array.isArray(data.cases))
          throw new Error("Formato inválido");
        if (
          !confirm(
            "Importar " +
              data.cases.length +
              " casos? Os casos existentes serão SUBSTITUÍDOS."
          )
        )
          return;
        saveCases(data.cases);
        alert("Importação concluída.");
      } catch (err) {
        alert(
          "Erro ao importar: " +
            (err instanceof Error ? err.message : String(err))
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function update(field: keyof LinhaZeroCase, val: string) {
    setEditing((prev) => (prev ? { ...prev, [field]: val } : prev));
  }

  if (loading) {
    return <div className="p-8 text-slate-600">Carregando...</div>;
  }

  const selectedCase = cases.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        view={view}
        setView={setView}
        cases={cases}
        exportJSON={exportJSON}
        importJSON={importJSON}
        startNew={startNew}
      />
      <WarningBanner />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {view === "list" && (
          <CaseList
            cases={cases}
            search={search}
            setSearch={setSearch}
            onView={viewDetail}
            onEdit={startEdit}
            onDelete={handleDelete}
            onNew={startNew}
          />
        )}
        {view === "form" && editing && (
          <CaseForm
            editing={editing}
            isNew={!cases.some((c) => c.id === editing.id)}
            update={update}
            tab={tab}
            setTab={setTab}
            onSave={handleSave}
            onCancel={() => {
              setView("list");
              setEditing(null);
            }}
          />
        )}
        {view === "detail" && selectedCase && (
          <CaseDetail
            caseData={selectedCase}
            onEdit={() => startEdit(selectedCase)}
            onBack={() => setView("list")}
            onDelete={handleDelete}
          />
        )}
        {view === "detail" && !selectedCase && (
          <div className="text-slate-600">Caso não encontrado.</div>
        )}
      </div>
      <Footer />
    </div>
  );
}
