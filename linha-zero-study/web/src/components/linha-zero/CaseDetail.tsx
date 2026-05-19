import {
  COLORS,
  calcIdade,
  calcIMC,
  calcHOMA,
  semaforoLinhaZero,
  type LinhaZeroCase,
} from "@/lib/case-model";
import { Section, DetailRow } from "./shared";

export function CaseDetail({
  caseData,
  onEdit,
  onBack,
  onDelete,
}: {
  caseData: LinhaZeroCase;
  onEdit: () => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  const c = caseData;
  const idade = calcIdade(c.dn);
  const imc = calcIMC(c.peso, c.altura);
  const homa = c.homaIR || calcHOMA(c.glicose, c.insulina);
  const sem = semaforoLinhaZero(c);

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div
        className="px-6 py-4 border-b border-slate-200 flex items-center justify-between"
        style={{ backgroundColor: COLORS.accent }}
      >
        <div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-600 hover:text-slate-800 mb-1"
          >
            ← Voltar à lista
          </button>
          <h2 className="font-bold text-slate-800">
            {c.codigo} · {c.iniciais} {idade ? "· " + idade + "a" : ""}
          </h2>
          <div className="text-xs text-slate-500">
            {c.cidade}/{c.uf} · {c.convenio} · {c.status}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-1.5 rounded text-white text-sm"
            style={{ backgroundColor: COLORS.blue }}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(c.id)}
            className="px-3 py-1.5 rounded bg-red-100 hover:bg-red-200 text-red-700 text-sm"
          >
            Remover
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {sem.length > 0 && (
          <Section title="Semáforo Linha Zero">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {sem.map((s, i) => (
                <div
                  key={i}
                  className={
                    "px-3 py-2 rounded border text-sm " +
                    (s.ok
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-amber-50 border-amber-200 text-amber-800")
                  }
                >
                  <div className="text-xs font-medium uppercase tracking-wide">
                    {s.label}
                  </div>
                  <div className="font-bold">{s.val}</div>
                  <div className="text-xs">Alvo: {s.target}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section title="Articulação-índice & queixa">
          <DetailRow label="Articulação" value={c.articulacaoIndice} />
          <DetailRow label="VAS inicial" value={c.vasInicial} />
          <DetailRow
            label="Achado imaginológico"
            value={c.diagnosticoImagem}
            multiline
          />
          <DetailRow
            label="Outras articulações"
            value={c.outrasArticulacoes}
            multiline
          />
        </Section>

        <Section title="Anamnese">
          <DetailRow label="Comorbidades" value={c.comorbidades} multiline />
          <DetailRow label="Medicações" value={c.medicacoes} multiline />
          <DetailRow
            label="Cirurgias prévias"
            value={c.cirurgiasPrevias}
            multiline
          />
          <DetailRow
            label="Histórico ginecológico"
            value={c.historicoGinecologico}
            multiline
          />
          <DetailRow
            label="Atividade física"
            value={c.atividadeFisica}
            multiline
          />
          <DetailRow label="Hábitos" value={c.habitos} multiline />
        </Section>

        <Section title="Status menopausal">
          <DetailRow label="Tipo" value={c.tipoMenopausa} />
          <DetailRow label="Idade menopausa" value={c.idadeMenopausa} />
          <DetailRow
            label="FSH"
            value={c.fsh ? c.fsh + " mIU/mL" : ""}
          />
          <DetailRow label="LH" value={c.lh ? c.lh + " mIU/mL" : ""} />
          <DetailRow label="Estradiol" value={c.e2} />
          <DetailRow label="TRH atual" value={c.trhAtual} multiline />
        </Section>

        <Section title="Antropometria & composição">
          <DetailRow
            label="Peso/Altura/IMC"
            value={
              c.peso && c.altura
                ? c.peso + "kg · " + c.altura + "cm · IMC " + imc
                : ""
            }
          />
          <DetailRow
            label="Circ. abdominal"
            value={c.ca ? c.ca + " cm" : ""}
          />
          <DetailRow
            label="% Gordura"
            value={c.pctGordura ? c.pctGordura + "%" : ""}
          />
          <DetailRow
            label="ASMI"
            value={c.asmi ? c.asmi + " kg/m²" : ""}
          />
          <DetailRow label="VAT" value={c.vat} />
          <DetailRow
            label="DMO L1-L4 / Colo / Fêmur"
            value={[c.tscoreL1L4, c.tscoreColo, c.tscoreFemur]
              .filter((x) => x)
              .join(" / ")}
          />
        </Section>

        <Section title="Laboratoriais T0">
          <DetailRow
            label="hs-CRP / VHS"
            value={[c.hsCRP, c.vhs].filter((x) => x).join(" / ")}
          />
          <DetailRow
            label="Glicose / Insulina / HbA1c / HOMA-IR"
            value={[c.glicose, c.insulina, c.hba1c, homa]
              .filter((x) => x)
              .join(" / ")}
          />
          <DetailRow
            label="CT / HDL / LDL / TG"
            value={[c.ct, c.hdl, c.ldl, c.tg].filter((x) => x).join(" / ")}
          />
          <DetailRow
            label="Cortisol / DHEA-S / IGF-1"
            value={[c.cortisol, c.dheaS, c.igf1].filter((x) => x).join(" / ")}
          />
          <DetailRow
            label="T total / T livre / SHBG"
            value={[c.tTotal, c.tLivre, c.shbg].filter((x) => x).join(" / ")}
          />
          <DetailRow
            label="TSH / T4L"
            value={[c.tsh, c.t4l].filter((x) => x).join(" / ")}
          />
          <DetailRow
            label="Vit D / B12 / Folato / Ferritina"
            value={[c.vitD, c.b12, c.folato, c.ferritina]
              .filter((x) => x)
              .join(" / ")}
          />
          <DetailRow
            label="Homocisteína / Zinco"
            value={[c.homocisteina, c.zinco].filter((x) => x).join(" / ")}
          />
        </Section>

        <Section title="Plano">
          <DetailRow label="TRH definida" value={c.trhDefinida} multiline />
          <DetailRow
            label="Suplementação"
            value={c.suplementacao}
            multiline
          />
          <DetailRow
            label="Exercício prescrito"
            value={c.exercicioPrescrito}
            multiline
          />
          <DetailRow label="Regenerativa" value={c.regenerativa} multiline />
        </Section>

        <Section title="Observações">
          <DetailRow label="Observações" value={c.observacoes} multiline />
          <DetailRow
            label="Eventos adversos"
            value={c.eventosAdversos}
            multiline
          />
        </Section>

        <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
          Criado em {new Date(c.criadoEm).toLocaleString("pt-BR")} · Última
          atualização {new Date(c.atualizadoEm).toLocaleString("pt-BR")}
        </div>
      </div>
    </div>
  );
}
