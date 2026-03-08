import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Shield,
  User,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { LogosStrip } from "@/components/LogosStrip";

const TCLEFormatted = () => (
  <div className="space-y-6">
    <div className="text-center border-b pb-4 mb-6">
      <h2 className="text-lg font-bold text-foreground mb-1">
        TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
      </h2>
      <p className="text-sm font-semibold text-muted-foreground">
        CADASTRO DE CIRURGIAS ELETIVAS - EQUIPE C.I.J.
      </p>
      <p className="text-sm font-semibold text-muted-foreground">
        (CENTRO INTEGRADO DE JOELHO)
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        JUAZEIRO/PETROLINA - DEZEMBRO/2025
      </p>
    </div>

    <section>
      <h3 className="font-bold text-foreground mb-2">
        1. INFORMAÇÕES SOBRE A PESQUISA E PROCEDIMENTOS
      </h3>
      <p className="text-muted-foreground mb-2">
        Você está sendo convidado a participar de um estudo de pesquisa clínica
        conduzido pela Equipe C.I.J. (Centro Integrado de Joelho), que visa
        coletar e analisar dados sobre procedimentos cirúrgicos eletivos
        relacionados ao joelho, incluindo artroplastia total, artroscopia,
        transferência de tendão e osteotomia.
      </p>
      <p className="text-muted-foreground">
        O objetivo deste estudo é otimizar tratamentos futuros, avançar a
        pesquisa em ortopedia e aprimorar as técnicas cirúrgicas através da
        coleta sistemática de dados clínicos e funcionais.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">
        2. PROCEDIMENTOS CIRÚRGICOS
      </h3>
      <p className="text-muted-foreground mb-2">
        Os procedimentos cirúrgicos propostos podem incluir:
      </p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Artroplastia Total de Joelho (ATJ)</li>
        <li>Artroscopia de Joelho (meniscos, cartilagem)</li>
        <li>Transferência de Tendão</li>
        <li>Osteotomia do Joelho</li>
        <li><strong>Reconstrução do Ligamento Cruzado Anterior (LCA)</strong></li>
        <li><strong>Reconstrução do Ligamento Cruzado Posterior (LCP)</strong></li>
        <li><strong>Reconstrução dos Ligamentos Colaterais (LCM/LCL)</strong></li>
        <li><strong>Reconstrução do MPFL (Instabilidade Patelofemoral)</strong></li>
      </ul>
      <p className="text-muted-foreground mt-2">
        Cada procedimento será realizado sob anestesia apropriada e seguirá os
        protocolos padrão de segurança cirúrgica.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">
        3. RISCOS GERAIS DE QUALQUER PROCEDIMENTO CIRÚRGICO
      </h3>
      <p className="text-muted-foreground mb-2">
        Como em qualquer procedimento cirúrgico, existem riscos associados,
        incluindo:
      </p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Sangramento</li>
        <li>Infecção</li>
        <li>Reação adversa à anestesia</li>
        <li>Coágulos de sangue (trombose)</li>
        <li>Complicações respiratórias</li>
        <li>Lesão de estruturas vizinhas</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">
        4. RISCOS ESPECÍFICOS POR TIPO DE CIRURGIA
      </h3>
      <h4 className="font-semibold text-foreground mt-3 mb-1">Artroplastia Total de Joelho (ATJ):</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Infecção profunda (pode exigir remoção da prótese)</li>
        <li>Falha do implante ou afrouxamento</li>
        <li>Instabilidade da prótese</li>
        <li>Fratura periprotética</li>
        <li>Rigidez ou limitação de movimento</li>
        <li>Dor neuropática persistente</li>
        <li>Necessidade de revisão cirúrgica</li>
      </ul>

      <h4 className="font-semibold text-foreground mt-3 mb-1">Artroscopia de Joelho:</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Lesão iatrogênica à cartilagem ou meniscos</li>
        <li>Infecção nas pequenas incisões</li>
        <li>Rigidez pós-operatória</li>
        <li>Persistência de sintomas</li>
        <li>Sangramento intra-articular</li>
        <li>Possível necessidade de artroplastia futura</li>
      </ul>

      <h4 className="font-semibold text-foreground mt-3 mb-1">Transferência de Tendão:</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Insuficiência do tendão transferido</li>
        <li>Infecção no local da cirurgia</li>
        <li>Lesão nervosa ou vascular</li>
        <li>Rigidez articular</li>
        <li>Dor persistente na região de onde o tendão foi retirado</li>
      </ul>

      <h4 className="font-semibold text-foreground mt-3 mb-1">Osteotomia do Joelho:</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Não-união ou má-união óssea</li>
        <li>Infecção no sítio ósseo</li>
        <li>Lesão nervosa (nervo fibular)</li>
        <li>Rigidez ou perda de movimento</li>
        <li>Piora da dor</li>
        <li>Complicações do hardware (parafusos, placas)</li>
        <li>Possível necessidade de prótese total no futuro</li>
      </ul>

      <h4 className="font-semibold text-primary mt-4 mb-1">Reconstrução do Ligamento Cruzado Anterior (LCA):</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Falha do enxerto (re-ruptura)</li>
        <li>Dor no local de retirada do enxerto</li>
        <li>Rigidez articular (artrofibrose)</li>
        <li>Infecção do enxerto ou articular</li>
        <li>Lesão de estruturas neurovasculares</li>
        <li>Instabilidade residual</li>
        <li>Dor anterior do joelho</li>
        <li>Fraqueza muscular persistente</li>
        <li>Necessidade de cirurgia de revisão</li>
      </ul>

      <h4 className="font-semibold text-primary mt-4 mb-1">Reconstrução do Ligamento Cruzado Posterior (LCP):</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Falha do enxerto ou afrouxamento</li>
        <li>Lesão neurovascular (artéria poplítea, nervo tibial)</li>
        <li>Rigidez articular</li>
        <li>Instabilidade residual posterior</li>
        <li>Dor persistente na região posterior do joelho</li>
        <li>Complicações relacionadas ao túnel ósseo</li>
        <li>Necessidade de cirurgia de revisão</li>
      </ul>

      <h4 className="font-semibold text-primary mt-4 mb-1">Reconstrução dos Ligamentos Colaterais (LCM/LCL):</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Falha do enxerto ou cicatrização inadequada</li>
        <li>Lesão do nervo fibular (especialmente no LCL)</li>
        <li>Rigidez articular</li>
        <li>Instabilidade residual em varo ou valgo</li>
        <li>Dor no local de fixação</li>
        <li>Complicações do hardware (parafusos, âncoras)</li>
        <li>Necessidade de cirurgia adicional</li>
      </ul>

      <h4 className="font-semibold text-primary mt-4 mb-1">Reconstrução do MPFL (Instabilidade Patelofemoral):</h4>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Falha do enxerto ou re-luxação patelar</li>
        <li>Rigidez articular (limitação de flexão)</li>
        <li>Dor patelofemoral persistente</li>
        <li>Fratura da patela (durante fixação)</li>
        <li>Tensão excessiva do enxerto (restrição de movimento)</li>
        <li>Lesão da cartilagem patelar ou troclear</li>
        <li>Complicações do local doador do enxerto</li>
        <li>Necessidade de procedimentos adicionais</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">5. BENEFÍCIOS ESPERADOS</h3>
      <p className="text-muted-foreground mb-2">Os benefícios esperados incluem:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Alívio da dor</li>
        <li>Melhoria significativa da mobilidade e função do joelho</li>
        <li><strong>Restauração da estabilidade articular</strong></li>
        <li><strong>Retorno às atividades esportivas</strong></li>
        <li>Aumento da qualidade de vida</li>
        <li>Retorno seguro às atividades diárias e/ou esportivas</li>
        <li>Contribuição para otimizar tratamentos futuros e avançar a pesquisa em ortopedia</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">6. COLETA E USO DE DADOS</h3>
      <p className="text-muted-foreground mb-2">Você autoriza a coleta dos seguintes dados:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Dados demográficos (idade, sexo, contato)</li>
        <li>Histórico clínico e cirúrgico</li>
        <li>Resultados de questionários de avaliação funcional (KOOS, IKDC)</li>
        <li>Escala Visual Analógica de dor (EVA)</li>
        <li>Dados de acompanhamento pós-operatório em marcos temporais (30, 60, 90 dias)</li>
      </ul>
      <p className="text-muted-foreground mt-3 mb-2">Estes dados serão utilizados para:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Análise clínica e pesquisa acadêmica</li>
        <li>Publicação em periódicos científicos</li>
        <li>Apresentação em congressos e eventos científicos</li>
        <li>Melhoria contínua dos protocolos cirúrgicos</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">7. PROTEÇÃO DE DADOS (LGPD)</h3>
      <p className="text-muted-foreground mb-2">
        Em conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, seus dados pessoais serão:
      </p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Armazenados de forma segura e criptografada</li>
        <li>Utilizados exclusivamente para os fins descritos neste termo</li>
        <li>Protegidos contra acesso não autorizado</li>
        <li>Mantidos pelo período necessário para a pesquisa</li>
      </ul>
      <p className="text-muted-foreground mt-3 mb-2">Você tem direito a:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Acessar seus dados a qualquer momento</li>
        <li>Solicitar correção de dados incorretos</li>
        <li>Solicitar exclusão de seus dados (respeitando obrigações legais)</li>
        <li>Revogar este consentimento a qualquer momento</li>
      </ul>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">8. PARTICIPAÇÃO VOLUNTÁRIA</h3>
      <p className="text-muted-foreground">
        Sua participação é <strong>voluntária</strong>. Você pode recusar-se a participar ou retirar seu consentimento
        a qualquer momento, sem penalidades ou prejuízo ao seu tratamento médico.
      </p>
    </section>

    <section>
      <h3 className="font-bold text-foreground mb-2">9. CONTATO</h3>
      <p className="text-muted-foreground mb-2">Para dúvidas ou esclarecimentos, entre em contato com:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Equipe C.I.J. (Centro Integrado de Joelho)</li>
        <li>Juazeiro/Petrolina</li>
        <li>E-mail: contato@cij.med.br</li>
      </ul>
    </section>

    <section className="border-t pt-4">
      <h3 className="font-bold text-foreground mb-2">10. DECLARAÇÃO DE CONSENTIMENTO</h3>
      <p className="text-muted-foreground mb-2">Ao aceitar este termo, declaro que:</p>
      <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1">
        <li>Li e compreendi todas as informações acima</li>
        <li>Tive oportunidade de esclarecer minhas dúvidas</li>
        <li>Concordo em participar voluntariamente</li>
        <li>Autorizo a coleta e uso dos meus dados conforme descrito</li>
        <li>Estou ciente de que posso revogar este consentimento a qualquer momento</li>
      </ul>
    </section>
  </div>
);

const TCLE_TEXT = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE) - CADASTRO DE CIRURGIAS ELETIVAS - EQUIPE C.I.J. (CENTRO INTEGRADO DE JOELHO) - JUAZEIRO/PETROLINA - DEZEMBRO/2025. 1. INFORMAÇÕES SOBRE A PESQUISA E PROCEDIMENTOS. 2. PROCEDIMENTOS CIRÚRGICOS: ATJ, Artroscopia, Transferência de Tendão, Osteotomia. 3-4. RISCOS: Gerais e específicos. 5. BENEFÍCIOS ESPERADOS. 6. COLETA E USO DE DADOS. 7. PROTEÇÃO DE DADOS (LGPD). 8. PARTICIPAÇÃO VOLUNTÁRIA. 9. CONTATO: contato@cij.med.br. 10. DECLARAÇÃO DE CONSENTIMENTO.`;

type Step = "tcle" | "register" | "complete";

export default function PublicTCLE() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("tcle");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const encodedPhone = urlParams.get("p");
  let prefilledPhone = "";
  if (encodedPhone) {
    try {
      const decoded = atob(encodedPhone);
      if (decoded.length === 11) {
        prefilledPhone = `(${decoded.slice(0, 2)}) ${decoded.slice(2, 7)}-${decoded.slice(7)}`;
      } else if (decoded.length === 10) {
        prefilledPhone = `(${decoded.slice(0, 2)}) ${decoded.slice(2, 6)}-${decoded.slice(6)}`;
      } else {
        prefilledPhone = decoded;
      }
    } catch {
      // ignore invalid base64
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: prefilledPhone,
    email: "",
    age: "",
    gender: "" as "" | "M" | "F" | "Outro",
  });

  const [patientId, setPatientId] = useState<number | null>(null);

  const registerMutation = trpc.patients.publicRegister.useMutation({
    onSuccess: (data) => {
      setPatientId(data.patientId);
      toast.success(data.message);
      setCurrentStep("complete");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao realizar cadastro");
    },
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 10;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAcceptTCLE = () => {
    if (!hasScrolledToBottom || !hasAccepted) {
      toast.error(
        "Por favor, leia o termo completo e marque a caixa de concordância"
      );
      return;
    }
    setCurrentStep("register");
  };

  const handleRegister = () => {
    if (!formData.name.trim()) {
      toast.error("Por favor, informe seu nome completo");
      return;
    }
    if (
      !formData.phone ||
      formData.phone.replace(/\D/g, "").length < 10
    ) {
      toast.error("Por favor, informe um telefone válido");
      return;
    }

    registerMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone.replace(/\D/g, ""),
      email: formData.email || undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      gender: formData.gender || undefined,
      consentAccepted: true,
      consentText: TCLE_TEXT,
    });
  };

  const handleGoToQuestionnaires = () => {
    if (patientId) {
      setLocation(`/questionarios?patientId=${patientId}`);
    } else {
      setLocation("/questionarios");
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002855] p-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <LogosStrip variant="header" size="lg" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Centro Integrado de Joelho
          </h1>
          <p className="text-primary/90 text-lg">
            C.I.J. - Juazeiro/Petrolina
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${currentStep === "tcle" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "tcle" ? "bg-primary text-primary-foreground" : currentStep === "register" || currentStep === "complete" ? "bg-primary/50 text-primary-foreground" : "bg-muted"}`}
            >
              {currentStep === "register" || currentStep === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                "1"
              )}
            </div>
            <span className="hidden sm:inline text-sm">TCLE</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div
            className={`flex items-center gap-2 ${currentStep === "register" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "register" ? "bg-primary text-primary-foreground" : currentStep === "complete" ? "bg-primary/50 text-primary-foreground" : "bg-muted"}`}
            >
              {currentStep === "complete" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                "2"
              )}
            </div>
            <span className="hidden sm:inline text-sm">Cadastro</span>
          </div>
          <div className="w-12 h-0.5 bg-muted" />
          <div
            className={`flex items-center gap-2 ${currentStep === "complete" ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "complete" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              3
            </div>
            <span className="hidden sm:inline text-sm">Questionários</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {currentStep === "tcle" && (
          <Card className="shadow-2xl border-0 bg-card">
            <CardHeader className="bg-gradient-to-r from-background to-card text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-full">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Termo de Consentimento</CardTitle>
                  <CardDescription className="text-primary-foreground/80 mt-1">
                    Leia atentamente o termo abaixo antes de prosseguir
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <Alert className="bg-amber-500/10 border-amber-500/30">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <AlertDescription className="ml-2">
                  Role até o final do documento para habilitar o botão de
                  concordância.
                </AlertDescription>
              </Alert>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="h-[400px] overflow-y-auto border rounded-lg p-6 bg-muted/30 text-foreground text-sm leading-relaxed"
              >
                <TCLEFormatted />
              </div>

              {!hasScrolledToBottom && (
                <p className="text-center text-sm text-muted-foreground animate-pulse">
                  ↓ Role até o final para continuar ↓
                </p>
              )}

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="accept"
                  checked={hasAccepted}
                  onCheckedChange={(checked) => setHasAccepted(checked === true)}
                  disabled={!hasScrolledToBottom}
                  className="mt-1"
                />
                <Label
                  htmlFor="accept"
                  className={`text-sm cursor-pointer ${!hasScrolledToBottom ? "text-muted-foreground" : "text-foreground"}`}
                >
                  Li e compreendi todas as informações acima. Concordo em
                  participar voluntariamente e autorizo a coleta e uso dos meus
                  dados conforme descrito neste Termo de Consentimento Livre e
                  Esclarecido.
                </Label>
              </div>

              <Button
                onClick={handleAcceptTCLE}
                disabled={!hasScrolledToBottom || !hasAccepted}
                className="w-full py-6 text-lg gap-2 bg-primary hover:bg-primary/90"
              >
                Aceitar e Continuar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "register" && (
          <Card className="shadow-2xl border-0 bg-card">
            <CardHeader className="bg-gradient-to-r from-background to-card text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Cadastro de Paciente</CardTitle>
                  <CardDescription className="text-primary-foreground/80 mt-1">
                    Preencha seus dados para prosseguir aos questionários
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="ml-2">
                  Consentimento registrado com sucesso! Agora complete seu
                  cadastro.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="py-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">
                    Telefone (WhatsApp) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(XX) XXXXX-XXXX"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: formatPhone(e.target.value),
                      })
                    }
                    className="py-5"
                    maxLength={15}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">
                    E-mail (opcional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="py-5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-base font-medium">
                      Idade (opcional)
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Ex: 45"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                      className="py-5"
                      min={1}
                      max={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-medium">
                      Sexo (opcional)
                    </Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          gender: value as "M" | "F" | "Outro",
                        })
                      }
                    >
                      <SelectTrigger className="py-5">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={registerMutation.isPending}
                className="w-full py-6 text-lg gap-2 bg-primary hover:bg-primary/90"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  <>
                    Cadastrar e Continuar
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {currentStep === "complete" && (
          <Card className="shadow-2xl border-0 bg-card">
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Cadastro Concluído!</CardTitle>
                  <CardDescription className="text-primary-foreground/90 mt-1">
                    Seus dados foram registrados com sucesso
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6 text-center">
              <div className="py-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Obrigado, {formData.name.split(" ")[0]}!
                </h3>
                <p className="text-muted-foreground">
                  Seu consentimento foi registrado e seus dados foram salvos com
                  segurança.
                </p>
              </div>

              <Alert className="bg-primary/10 border-primary/20 text-left">
                <Shield className="h-5 w-5 text-primary" />
                <AlertDescription className="ml-2">
                  Agora você pode prosseguir para responder aos questionários
                  pré-operatórios (KOOS, IKDC e EVA).
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleGoToQuestionnaires}
                className="w-full py-6 text-lg gap-2 bg-primary hover:bg-primary/90"
              >
                Ir para os Questionários
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="max-w-4xl mx-auto mt-12 pb-8">
        <div className="bg-card rounded-xl p-6 shadow-lg border">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Parceiros e Apoio
            </p>
            <LogosStrip variant="footer" size="lg" showSote showViver showResidencia />
            <div className="text-center text-muted-foreground text-sm pt-4 border-t border-border w-full">
              <p>
                © {new Date().getFullYear()} Centro Integrado de Joelho (C.I.J.)
                - Juazeiro/Petrolina
              </p>
              <p className="mt-1 opacity-80">
                Em conformidade com a LGPD (Lei nº 13.709/2018)
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
