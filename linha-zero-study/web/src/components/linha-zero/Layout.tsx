import { COLORS } from "@/lib/case-model";
import type { LinhaZeroCase } from "@/lib/case-model";

type View = "list" | "form" | "detail";

export function Header({
  view,
  setView,
  cases,
  userName,
  onExportCsv,
  onLogout,
  startNew,
  canExport,
}: {
  view: View;
  setView: (v: View) => void;
  cases: LinhaZeroCase[];
  userName?: string;
  onExportCsv: () => void;
  onLogout: () => void;
  startNew: () => void;
  canExport: boolean;
}) {
  return (
    <header
      className="bg-slate-800 text-white border-b-4"
      style={{ borderColor: COLORS.blue }}
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <button
          type="button"
          className="text-left cursor-pointer"
          onClick={() => setView("list")}
        >
          <h1 className="text-xl font-bold tracking-tight">Projeto Linha Zero</h1>
          <p className="text-xs text-slate-300">
            Coleta de dados · estudo para publicação
          </p>
        </button>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {userName && (
            <span className="text-slate-300 hidden sm:inline">{userName}</span>
          )}
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
              {canExport && (
                <button
                  type="button"
                  onClick={onExportCsv}
                  className="px-3 py-1.5 rounded bg-slate-600 hover:bg-slate-500 text-white"
                >
                  Exportar CSV
                </button>
              )}
            </>
          )}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded border border-slate-500 text-slate-200 hover:bg-slate-700"
          >
            Sair
          </button>
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
        <strong>⚠ Uso exclusivo do estudo · pré-aprovação CEP.</strong> Dados no
        servidor seguro do projeto (não compartilhado com cadastro CIJ). Use apenas
        pseudônimos. Não cadastre informações que não entrariam no protocolo
        aprovado.
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100 mt-8 py-4">
      <div className="max-w-6xl mx-auto px-4 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
        <div>
          <strong>Projeto Linha Zero · Cadastro de Participantes</strong> · v0.2 ·
          Dr. Juarez Sebastian Lima e Lima
        </div>
        <div>Servidor do estudo · exporte CSV regularmente</div>
      </div>
    </footer>
  );
}
