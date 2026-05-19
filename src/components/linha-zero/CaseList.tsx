import {
  COLORS,
  calcIdade,
  calcIMC,
  semaforoLinhaZero,
  type LinhaZeroCase,
} from "@/lib/linha-zero";

export function CaseList({
  cases,
  search,
  setSearch,
  onView,
  onEdit,
  onDelete,
  onNew,
}: {
  cases: LinhaZeroCase[];
  search: string;
  setSearch: (s: string) => void;
  onView: (c: LinhaZeroCase) => void;
  onEdit: (c: LinhaZeroCase) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}) {
  const filtered = cases.filter(
    (c) =>
      !search ||
      (c.iniciais || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.codigo || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.cidade || "").toLowerCase().includes(search.toLowerCase())
  );

  if (cases.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
        <h2 className="text-lg font-semibold text-slate-700 mb-2">
          Nenhum caso cadastrado ainda
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Comece adicionando a primeira participante do estudo.
        </p>
        <button
          type="button"
          onClick={onNew}
          className="px-4 py-2 rounded text-white font-medium"
          style={{ backgroundColor: COLORS.blue }}
        >
          + Cadastrar primeiro caso
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por iniciais, código ou cidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded bg-white text-sm"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <CaseCard
            key={c.id}
            c={c}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Nenhum caso encontrado para a busca.
        </div>
      )}
    </div>
  );
}

function CaseCard({
  c,
  onView,
  onEdit,
  onDelete,
}: {
  c: LinhaZeroCase;
  onView: (c: LinhaZeroCase) => void;
  onEdit: (c: LinhaZeroCase) => void;
  onDelete: (id: string) => void;
}) {
  const idade = calcIdade(c.dn);
  const imc = calcIMC(c.peso, c.altura);
  const sem = semaforoLinhaZero(c);
  const okCount = sem.filter((s) => s.ok).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="px-4 py-3 border-b border-slate-100"
        style={{ backgroundColor: COLORS.accent }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800">
            {c.codigo || "(sem código)"}
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-white">
            {c.status}
          </span>
        </div>
        <div className="text-sm text-slate-600">
          {c.iniciais} {idade ? "· " + idade + "a" : ""}
        </div>
      </div>
      <div className="p-4 text-sm space-y-1">
        {c.cidade && (
          <div>
            <span className="text-slate-500">Cidade:</span> {c.cidade}/{c.uf}
          </div>
        )}
        {c.convenio && (
          <div>
            <span className="text-slate-500">Convênio:</span> {c.convenio}
          </div>
        )}
        {c.articulacaoIndice && (
          <div>
            <span className="text-slate-500">Art. índice:</span>{" "}
            {c.articulacaoIndice}
          </div>
        )}
        {c.tipoMenopausa && (
          <div>
            <span className="text-slate-500">Status:</span> {c.tipoMenopausa}
          </div>
        )}
        {imc && (
          <div>
            <span className="text-slate-500">IMC:</span> {imc} kg/m²
          </div>
        )}
        {sem.length > 0 && (
          <div className="pt-2 mt-2 border-t border-slate-100">
            <span className="text-slate-500 text-xs">Linha Zero:</span>{" "}
            <strong>
              {okCount}/{sem.length}
            </strong>{" "}
            alvos atingidos
          </div>
        )}
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => onView(c)}
          className="px-2 py-1 rounded text-white"
          style={{ backgroundColor: COLORS.navy }}
        >
          Ver
        </button>
        <button
          type="button"
          onClick={() => onEdit(c)}
          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(c.id)}
          className="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 ml-auto"
        >
          Remover
        </button>
      </div>
    </div>
  );
}
