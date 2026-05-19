import { COLORS } from "@/lib/linha-zero";
import type { LinhaZeroCase } from "@/lib/linha-zero";

type View = "list" | "form" | "detail";

export function Header({
  view,
  setView,
  cases,
  exportJSON,
  importJSON,
  startNew,
}: {
  view: View;
  setView: (v: View) => void;
  cases: LinhaZeroCase[];
  exportJSON: () => void;
  importJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  startNew: () => void;
}) {
  return (
    <header
      className="bg-slate-800 text-white border-b-4"
      style={{ borderColor: COLORS.blue }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <button
          type="button"
          className="text-left cursor-pointer"
          onClick={() => setView("list")}
        >
          <h1 className="text-xl font-bold tracking-tight">Projeto Linha Zero</h1>
          <p className="text-xs text-slate-300">
            Cadastro e acompanhamento de participantes · v0.1 protótipo
          </p>
        </button>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-300">
            {cases.length} caso{cases.length !== 1 ? "s" : ""}
          </span>
          {view === "list" && (
            <>
              <button
                type="button"
                onClick={startNew}
                className="px-3 py-1.5 rounded text-white font-medium"
                style={{ backgroundColor: COLORS.blue }}
              >
                + Novo caso
              </button>
              <button
                type="button"
                onClick={exportJSON}
                className="px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white"
              >
                Exportar
              </button>
              <label className="px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white cursor-pointer">
                Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={importJSON}
                  className="hidden"
                />
              </label>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function WarningBanner() {
  return (
    <div
      className="border-y"
      style={{
        backgroundColor: COLORS.warn,
        borderColor: COLORS.warnBorder,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-2 text-xs text-amber-900">
        <strong>⚠ Protótipo demonstrativo · pré-aprovação CEP.</strong> Os dados
        ficam armazenados apenas no seu navegador (localStorage — não há servidor
        remoto). Para uso em produção pelo estudo formal, migre para REDCap
        institucional. Não cadastre dados que você não cadastraria no seu prontuário
        SysLife.
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 mt-8 py-4">
      <div className="max-w-6xl mx-auto px-4 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <div>
          <strong>Projeto Linha Zero · Cadastro de Participantes</strong> · v0.1
          protótipo · Dr. Juarez Sebastian Lima e Lima
        </div>
        <div>Dados em armazenamento local · Exporte regularmente</div>
      </div>
    </footer>
  );
}
