import { useCallback, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Login } from "@/pages/Login";
import { ChangePassword } from "@/pages/ChangePassword";
import { api } from "@/lib/api";
import {
  emptyCase,
  type LinhaZeroCase,
} from "@/lib/case-model";
import {
  caseToParticipantPatch,
  caseToPayload,
  participantToCase,
} from "@/lib/map-case";
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

function StudyApp() {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState<LinhaZeroCase[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<LinhaZeroCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("identificacao");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const loadCases = useCallback(async () => {
    const { participants } = await api.listParticipants();
    setCases(
      participants.map((p) => participantToCase(p, p.visitT0 ?? null))
    );
  }, []);

  useEffect(() => {
    if (!user || user.mustChangePassword) return;
    loadCases()
      .catch((e) => alert(e.message))
      .finally(() => setLoading(false));
  }, [user, loadCases]);

  function startNew() {
    const novo = {
      ...emptyCase(),
      codigo: `Caso ${cases.length + 1}`,
    };
    setEditing(novo);
    setView("form");
    setTab("identificacao");
  }

  async function startEdit(c: LinhaZeroCase) {
    try {
      const { participant, visits } = await api.getParticipant(
        c.participantId
      );
      const t0 = visits.find((v) => v.timepoint === "T0");
      setEditing(participantToCase(participant, t0));
      setView("form");
      setTab("identificacao");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao carregar");
    }
  }

  function viewDetail(c: LinhaZeroCase) {
    setSelectedId(c.id);
    setView("detail");
  }

  async function handleSave() {
    if (!editing?.iniciais || !editing?.dn) {
      alert("Iniciais e Data de Nascimento são obrigatórios.");
      return;
    }
    if (editing.visitLocked) {
      alert("Visita T0 bloqueada — não é possível editar.");
      return;
    }
    setSaving(true);
    try {
      const isNew = !editing.participantId;
      let participantId = editing.participantId;
      let visitT0Id = editing.visitT0Id;

      if (isNew) {
        const { participant } = await api.createParticipant({
          ...caseToParticipantPatch(editing),
          codigo: editing.codigo,
        });
        participantId = participant.id;
        const detail = await api.getParticipant(participantId);
        visitT0Id = detail.visits.find((v) => v.timepoint === "T0")?.id ?? 0;
      } else {
        await api.updateParticipant(
          participantId,
          caseToParticipantPatch(editing)
        );
      }

      if (visitT0Id) {
        await api.updateVisit(visitT0Id, {
          payloadJson: caseToPayload(editing),
          collectionStatus: "draft",
        });
      }

      await loadCases();
      setView("list");
      setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const c = cases.find((x) => x.id === id);
    if (!c?.participantId) return;
    if (
      !confirm(
        "Tem certeza que deseja remover este participante? Esta ação não pode ser desfeita."
      )
    )
      return;
    try {
      await api.deleteParticipant(c.participantId);
      await loadCases();
      setView("list");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao remover");
    }
  }

  async function exportCsv() {
    try {
      const res = await api.exportCsv();
      if (!res.ok) throw new Error("Exportação negada");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `linha-zero-${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Sem permissão para exportar");
    }
  }

  function update(field: keyof LinhaZeroCase, val: string) {
    setEditing((prev) => (prev ? { ...prev, [field]: val } : prev));
  }

  if (loading) {
    return <div className="p-8 text-slate-600">Carregando participantes…</div>;
  }

  const selectedCase = cases.find((c) => c.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        view={view}
        setView={setView}
        cases={cases}
        userName={user?.displayName}
        onExportCsv={exportCsv}
        onLogout={logout}
        startNew={startNew}
        canExport={
          user?.role === "pi_admin" || user?.role === "data_monitor"
        }
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
            isNew={!editing.participantId}
            update={update}
            tab={tab}
            setTab={setTab}
            onSave={handleSave}
            saving={saving}
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
          <div className="text-slate-600">Participante não encontrado.</div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

function AppGate() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="p-8 text-slate-600">Verificando sessão…</div>;
  }
  if (!user) return <Login />;
  if (user.mustChangePassword) return <ChangePassword />;
  return <StudyApp />;
}
