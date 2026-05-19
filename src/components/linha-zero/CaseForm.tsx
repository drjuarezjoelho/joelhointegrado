import { COLORS, type LinhaZeroCase } from "@/lib/linha-zero";
import {
  TabIdentificacao,
  TabAnamnese,
  TabMenopausa,
  TabAntropo,
  TabQueixa,
  TabLabs,
  TabPlano,
  TabObservacoes,
} from "./tabs";

export type TabId =
  | "identificacao"
  | "anamnese"
  | "menopausa"
  | "antropo"
  | "queixa"
  | "labs"
  | "plano"
  | "obs";

const TABS: { id: TabId; label: string }[] = [
  { id: "identificacao", label: "1. Identificação" },
  { id: "anamnese", label: "2. Anamnese" },
  { id: "menopausa", label: "3. Menopausa" },
  { id: "antropo", label: "4. Antropometria" },
  { id: "queixa", label: "5. Queixa-índice" },
  { id: "labs", label: "6. Laboratoriais T0" },
  { id: "plano", label: "7. Plano" },
  { id: "obs", label: "8. Observações" },
];

export function CaseForm({
  editing,
  isNew,
  update,
  tab,
  setTab,
  onSave,
  onCancel,
}: {
  editing: LinhaZeroCase;
  isNew: boolean;
  update: (field: keyof LinhaZeroCase, val: string) => void;
  tab: TabId;
  setTab: (t: TabId) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div
        className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"
        style={{ backgroundColor: COLORS.accent }}
      >
        <h2 className="font-bold text-slate-800">
          {isNew ? "Novo caso" : "Editar caso"} ·{" "}
          {editing.codigo || "(sem código)"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-1.5 rounded text-white font-medium text-sm"
            style={{ backgroundColor: COLORS.blue }}
          >
            Salvar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors " +
              (tab === t.id
                ? "border-blue-600 text-blue-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700")
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "identificacao" && (
          <TabIdentificacao c={editing} update={update} />
        )}
        {tab === "anamnese" && <TabAnamnese c={editing} update={update} />}
        {tab === "menopausa" && <TabMenopausa c={editing} update={update} />}
        {tab === "antropo" && <TabAntropo c={editing} update={update} />}
        {tab === "queixa" && <TabQueixa c={editing} update={update} />}
        {tab === "labs" && <TabLabs c={editing} update={update} />}
        {tab === "plano" && <TabPlano c={editing} update={update} />}
        {tab === "obs" && <TabObservacoes c={editing} update={update} />}
      </div>
    </div>
  );
}
