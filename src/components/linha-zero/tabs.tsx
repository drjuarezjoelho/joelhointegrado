import {
  calcIdade,
  calcIMC,
  calcHOMA,
  type LinhaZeroCase,
} from "@/lib/linha-zero";
import { Field, Select, TextArea, SectionTitle } from "./shared";

type TabProps = {
  c: LinhaZeroCase;
  update: (field: keyof LinhaZeroCase, val: string) => void;
};

export function TabIdentificacao({ c, update }: TabProps) {
  const idade = calcIdade(c.dn);
  return (
    <div>
      <SectionTitle>Identificação básica</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Código do caso"
          value={c.codigo}
          onChange={(v) => update("codigo", v)}
          placeholder="Ex: Caso 5"
        />
        <Field
          label="Iniciais *"
          value={c.iniciais}
          onChange={(v) => update("iniciais", v.toUpperCase())}
          placeholder="Ex: V.R.O."
          hint="Use apenas iniciais (LGPD)."
        />
        <Field
          label="Data de Nascimento *"
          type="date"
          value={c.dn}
          onChange={(v) => update("dn", v)}
          hint={idade ? "Idade calculada: " + idade + " anos" : ""}
        />
        <Select
          label="Status no estudo"
          value={c.status}
          onChange={(v) => update("status", v)}
          options={[
            "Triagem",
            "Em coleta T0",
            "Em seguimento T3",
            "Em seguimento T6",
            "Em seguimento T12",
            "Concluído",
            "Excluído",
          ]}
        />
        <Field
          label="Cidade"
          value={c.cidade}
          onChange={(v) => update("cidade", v)}
          placeholder="Petrolina"
        />
        <Select
          label="UF"
          value={c.uf}
          onChange={(v) => update("uf", v)}
          options={["PE", "BA", "CE", "PI", "AL", "SE", "PB", "RN", "MA", "Outro"]}
        />
        <Field
          label="Convênio"
          value={c.convenio}
          onChange={(v) => update("convenio", v)}
          placeholder="Unimed, CAMED, Particular..."
        />
        <Field
          label="Data de inclusão no estudo"
          type="date"
          value={c.dataInclusao}
          onChange={(v) => update("dataInclusao", v)}
        />
      </div>
      <div className="mt-6">
        <Field
          label="Articulação-índice"
          value={c.articulacaoIndice}
          onChange={(v) => update("articulacaoIndice", v)}
          placeholder="Ex: Joelho direito · Quadril direito · Ombro esquerdo"
        />
      </div>
    </div>
  );
}

export function TabAnamnese({ c, update }: TabProps) {
  return (
    <div className="space-y-4">
      <SectionTitle>Anamnese</SectionTitle>
      <TextArea
        label="Comorbidades"
        value={c.comorbidades}
        onChange={(v) => update("comorbidades", v)}
        placeholder="HAS, DM, dislipidemia, autoimune, etc."
      />
      <TextArea
        label="Medicações atuais"
        value={c.medicacoes}
        onChange={(v) => update("medicacoes", v)}
        placeholder="Nome, dose, via, frequência."
      />
      <TextArea
        label="Cirurgias prévias"
        value={c.cirurgiasPrevias}
        onChange={(v) => update("cirurgiasPrevias", v)}
        placeholder="Datas e procedimentos."
      />
      <TextArea
        label="Histórico ginecológico"
        value={c.historicoGinecologico}
        onChange={(v) => update("historicoGinecologico", v)}
        placeholder="Paridade, ciclos, histerectomia, ooforectomia, contraceptivos, mamografias prévias."
      />
      <TextArea
        label="Atividade física"
        value={c.atividadeFisica}
        onChange={(v) => update("atividadeFisica", v)}
        placeholder="Modalidade, frequência, há quanto tempo."
        rows={2}
      />
      <TextArea
        label="Hábitos"
        value={c.habitos}
        onChange={(v) => update("habitos", v)}
        placeholder="Tabagismo, álcool, sono, alimentação."
        rows={2}
      />
    </div>
  );
}

export function TabMenopausa({ c, update }: TabProps) {
  return (
    <div>
      <SectionTitle>Status menopausal</SectionTitle>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Select
          label="Tipo de menopausa"
          value={c.tipoMenopausa}
          onChange={(v) => update("tipoMenopausa", v)}
          options={[
            "Perimenopausa inicial",
            "Perimenopausa final",
            "Pós-menopausa natural",
            "Pós-menopausa cirúrgica",
            "Indefinido",
          ]}
        />
        <Field
          label="Idade na menopausa"
          type="number"
          value={c.idadeMenopausa}
          onChange={(v) => update("idadeMenopausa", v)}
          placeholder="anos"
        />
      </div>
      <SectionTitle>Perfil hormonal basal</SectionTitle>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Field
          label="FSH (mIU/mL)"
          type="number"
          value={c.fsh}
          onChange={(v) => update("fsh", v)}
          hint="Menopausa: 21,5–131"
        />
        <Field
          label="LH (mIU/mL)"
          type="number"
          value={c.lh}
          onChange={(v) => update("lh", v)}
          hint="Menopausa: 13,1–86,5"
        />
        <Field
          label="Estradiol"
          type="number"
          value={c.e2}
          onChange={(v) => update("e2", v)}
          hint="pg/mL ou pmol/L · alvo Linha Zero: 50–80 pg/mL"
        />
      </div>
      <SectionTitle>TRH atual</SectionTitle>
      <TextArea
        label="Regime atual de TRH"
        value={c.trhAtual}
        onChange={(v) => update("trhAtual", v)}
        placeholder="Estradiol transdérmico (gel/adesivo, dose, freq.), progestínio (Utrogestan, LNG-IUS, etc.), testosterona feminina (manipulada, dose), DHEA, há quanto tempo, eventos adversos."
        rows={3}
      />
    </div>
  );
}

export function TabAntropo({ c, update }: TabProps) {
  const imc = calcIMC(c.peso, c.altura);
  return (
    <div>
      <SectionTitle>Antropometria</SectionTitle>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Field
          label="Peso (kg)"
          type="number"
          value={c.peso}
          onChange={(v) => update("peso", v)}
        />
        <Field
          label="Altura (cm)"
          type="number"
          value={c.altura}
          onChange={(v) => update("altura", v)}
        />
        <Field
          label="IMC (kg/m²)"
          value={imc}
          onChange={() => {}}
          hint="Calculado automaticamente"
          readOnly
        />
        <Field
          label="Circunf. abdominal (cm)"
          type="number"
          value={c.ca}
          onChange={(v) => update("ca", v)}
        />
      </div>
      <SectionTitle>Composição corporal (DEXA)</SectionTitle>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Field
          label="% Gordura corporal"
          type="number"
          value={c.pctGordura}
          onChange={(v) => update("pctGordura", v)}
          hint="Alvo: <40%"
        />
        <Field
          label="ASMI (kg/m²)"
          type="number"
          value={c.asmi}
          onChange={(v) => update("asmi", v)}
          hint="Alvo: ≥7,5"
        />
        <Field
          label="VAT (cm² ou kg)"
          type="number"
          value={c.vat}
          onChange={(v) => update("vat", v)}
          hint="Gordura visceral"
        />
      </div>
      <SectionTitle>Densidade mineral óssea (T-score)</SectionTitle>
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="L1-L4 T-score"
          type="number"
          value={c.tscoreL1L4}
          onChange={(v) => update("tscoreL1L4", v)}
        />
        <Field
          label="Colo femoral T-score"
          type="number"
          value={c.tscoreColo}
          onChange={(v) => update("tscoreColo", v)}
        />
        <Field
          label="Fêmur total T-score"
          type="number"
          value={c.tscoreFemur}
          onChange={(v) => update("tscoreFemur", v)}
        />
      </div>
    </div>
  );
}

export function TabQueixa({ c, update }: TabProps) {
  return (
    <div className="space-y-4">
      <SectionTitle>Queixa-índice musculoesquelética</SectionTitle>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="VAS dor inicial (0-10)"
          type="number"
          value={c.vasInicial}
          onChange={(v) => update("vasInicial", v)}
          hint="Escala visual analógica"
        />
      </div>
      <TextArea
        label="Diagnóstico imaginológico"
        value={c.diagnosticoImagem}
        onChange={(v) => update("diagnosticoImagem", v)}
        placeholder="Achados em RM/US/Raio-X da articulação-índice."
        rows={4}
      />
      <TextArea
        label="Outras articulações comprometidas"
        value={c.outrasArticulacoes}
        onChange={(v) => update("outrasArticulacoes", v)}
        placeholder="Lista de comorbidades musculoesqueléticas (síndrome multi-articular da menopausa)."
        rows={3}
      />
    </div>
  );
}

export function TabLabs({ c, update }: TabProps) {
  const homa = c.homaIR || calcHOMA(c.glicose, c.insulina);
  return (
    <div>
      <SectionTitle>Inflamação</SectionTitle>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Field
          label="hs-CRP (mg/dL)"
          type="number"
          value={c.hsCRP}
          onChange={(v) => update("hsCRP", v)}
          hint="Alvo: <0,1"
        />
        <Field
          label="VHS (mm/h)"
          type="number"
          value={c.vhs}
          onChange={(v) => update("vhs", v)}
        />
      </div>
      <SectionTitle>Metabolismo glicídico</SectionTitle>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Field
          label="Glicose jejum (mg/dL)"
          type="number"
          value={c.glicose}
          onChange={(v) => update("glicose", v)}
        />
        <Field
          label="Insulina (µUI/mL)"
          type="number"
          value={c.insulina}
          onChange={(v) => update("insulina", v)}
        />
        <Field
          label="HbA1c (%)"
          type="number"
          value={c.hba1c}
          onChange={(v) => update("hba1c", v)}
          hint="Alvo: <5,7"
        />
        <Field
          label="HOMA-IR"
          value={homa}
          onChange={(v) => update("homaIR", v)}
          hint="Calc. automático · alvo <1,5"
        />
      </div>
      <SectionTitle>Perfil lipídico</SectionTitle>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Field
          label="Colest. Total (mg/dL)"
          type="number"
          value={c.ct}
          onChange={(v) => update("ct", v)}
        />
        <Field
          label="HDL (mg/dL)"
          type="number"
          value={c.hdl}
          onChange={(v) => update("hdl", v)}
          hint=">60 desejável"
        />
        <Field
          label="LDL (mg/dL)"
          type="number"
          value={c.ldl}
          onChange={(v) => update("ldl", v)}
        />
        <Field
          label="Triglicérides (mg/dL)"
          type="number"
          value={c.tg}
          onChange={(v) => update("tg", v)}
        />
      </div>
      <SectionTitle>Eixo adrenal/gonadal</SectionTitle>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Field
          label="Cortisol matinal (µg/dL)"
          type="number"
          value={c.cortisol}
          onChange={(v) => update("cortisol", v)}
        />
        <Field
          label="DHEA-S (µg/dL)"
          type="number"
          value={c.dheaS}
          onChange={(v) => update("dheaS", v)}
        />
        <Field
          label="IGF-1 (ng/mL)"
          type="number"
          value={c.igf1}
          onChange={(v) => update("igf1", v)}
        />
        <Field
          label="T total (ng/dL)"
          type="number"
          value={c.tTotal}
          onChange={(v) => update("tTotal", v)}
        />
        <Field
          label="T livre (ng/dL)"
          type="number"
          value={c.tLivre}
          onChange={(v) => update("tLivre", v)}
        />
        <Field
          label="SHBG (nmol/L)"
          type="number"
          value={c.shbg}
          onChange={(v) => update("shbg", v)}
        />
      </div>
      <SectionTitle>Tireoide</SectionTitle>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Field
          label="TSH (µUI/mL)"
          type="number"
          value={c.tsh}
          onChange={(v) => update("tsh", v)}
        />
        <Field
          label="T4 livre (ng/dL)"
          type="number"
          value={c.t4l}
          onChange={(v) => update("t4l", v)}
        />
      </div>
      <SectionTitle>Micronutrientes / metilação</SectionTitle>
      <div className="grid grid-cols-3 gap-4">
        <Field
          label="25-OH-Vit D (ng/mL)"
          type="number"
          value={c.vitD}
          onChange={(v) => update("vitD", v)}
          hint="Alvo: 50–80"
        />
        <Field
          label="B12 (pg/mL)"
          type="number"
          value={c.b12}
          onChange={(v) => update("b12", v)}
        />
        <Field
          label="Folato (ng/mL)"
          type="number"
          value={c.folato}
          onChange={(v) => update("folato", v)}
        />
        <Field
          label="Ferritina (ng/mL)"
          type="number"
          value={c.ferritina}
          onChange={(v) => update("ferritina", v)}
        />
        <Field
          label="Homocisteína (µmol/L)"
          type="number"
          value={c.homocisteina}
          onChange={(v) => update("homocisteina", v)}
          hint="Alvo: 5–8"
        />
        <Field
          label="Zinco sérico (µg/dL)"
          type="number"
          value={c.zinco}
          onChange={(v) => update("zinco", v)}
        />
      </div>
    </div>
  );
}

export function TabPlano({ c, update }: TabProps) {
  return (
    <div className="space-y-4">
      <SectionTitle>Plano de tratamento individualizado</SectionTitle>
      <TextArea
        label="TRH definida"
        value={c.trhDefinida}
        onChange={(v) => update("trhDefinida", v)}
        placeholder="Regime de TRH proposto ou iniciado."
        rows={3}
      />
      <TextArea
        label="Suplementação prescrita"
        value={c.suplementacao}
        onChange={(v) => update("suplementacao", v)}
        placeholder="Lista por blocos: anti-aterogênico, metilação, solo metabólico, sarcopenia, climatério, eixo intestino-osso."
        rows={5}
      />
      <TextArea
        label="Exercício prescrito"
        value={c.exercicioPrescrito}
        onChange={(v) => update("exercicioPrescrito", v)}
        placeholder="Treino resistido, aeróbico, HIIT, Pilates, modalidades adaptadas."
        rows={3}
      />
      <TextArea
        label="Procedimentos regenerativos"
        value={c.regenerativa}
        onChange={(v) => update("regenerativa", v)}
        placeholder="PRP, ESWT, BMAC, viscossuplementação — planejados ou realizados."
        rows={2}
      />
    </div>
  );
}

export function TabObservacoes({ c, update }: TabProps) {
  return (
    <div className="space-y-4">
      <SectionTitle>Observações livres</SectionTitle>
      <TextArea
        label="Observações gerais"
        value={c.observacoes}
        onChange={(v) => update("observacoes", v)}
        placeholder="Anotações livres sobre o caso."
        rows={6}
      />
      <TextArea
        label="Eventos adversos registrados"
        value={c.eventosAdversos}
        onChange={(v) => update("eventosAdversos", v)}
        placeholder="Data, descrição, severidade, conduta."
        rows={4}
      />
    </div>
  );
}
