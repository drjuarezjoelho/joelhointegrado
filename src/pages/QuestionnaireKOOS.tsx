import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LogosStrip } from "@/components/LogosStrip";

function getPatientIdFromContext(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("patientId");
  if (fromUrl) return fromUrl;
  return (
    localStorage.getItem("patientId") ||
    localStorage.getItem("currentPatientId")
  );
}

const koosSubscales = [
  {
    name: "Dor",
    description:
      "As perguntas a seguir referem-se à dor no joelho que você sentiu durante a última semana.",
    questions: [
      { id: "pain1", question: "Com que frequência você sente dor no joelho?" },
      { id: "pain2", question: "Dor ao girar/torcer o joelho" },
      { id: "pain3", question: "Dor ao esticar completamente o joelho" },
      { id: "pain4", question: "Dor ao dobrar completamente o joelho" },
      { id: "pain5", question: "Dor ao caminhar em superfície plana" },
      { id: "pain6", question: "Dor ao subir ou descer escadas" },
      { id: "pain7", question: "Dor à noite enquanto está na cama" },
      { id: "pain8", question: "Dor ao sentar ou deitar" },
      { id: "pain9", question: "Dor ao ficar em pé" },
    ],
  },
  {
    name: "Sintomas",
    description:
      "As perguntas a seguir referem-se a outros sintomas no joelho durante a última semana.",
    questions: [
      { id: "symptoms1", question: "Você tem inchaço no joelho?" },
      {
        id: "symptoms2",
        question:
          "Você sente rangido, estalido ou qualquer outro tipo de ruído quando move o joelho?",
      },
      { id: "symptoms3", question: "O seu joelho trava ou bloqueia?" },
      { id: "symptoms4", question: "Você consegue esticar o joelho completamente?" },
      { id: "symptoms5", question: "Você consegue dobrar o joelho completamente?" },
      {
        id: "symptoms6",
        question:
          "Quão rígido é o seu joelho logo após acordar de manhã?",
      },
      {
        id: "symptoms7",
        question:
          "Quão rígido é o seu joelho após sentar, deitar ou descansar mais tarde no dia?",
      },
    ],
  },
  {
    name: "Atividades da Vida Diária",
    description:
      "As perguntas a seguir referem-se à sua função física durante a última semana.",
    questions: [
      { id: "adl1", question: "Descer escadas" },
      { id: "adl2", question: "Subir escadas" },
      { id: "adl3", question: "Levantar-se de uma posição sentada" },
      { id: "adl4", question: "Ficar em pé" },
      { id: "adl5", question: "Abaixar-se para pegar um objeto do chão" },
      { id: "adl6", question: "Caminhar em superfície plana" },
      { id: "adl7", question: "Entrar/sair do carro" },
      { id: "adl8", question: "Fazer compras" },
      { id: "adl9", question: "Colocar meias/meia-calça" },
      { id: "adl10", question: "Levantar-se da cama" },
      { id: "adl11", question: "Tirar meias/meia-calça" },
      {
        id: "adl12",
        question:
          "Deitar na cama (virar-se, manter a posição do joelho)",
      },
      { id: "adl13", question: "Entrar/sair da banheira ou chuveiro" },
      { id: "adl14", question: "Sentar-se" },
      { id: "adl15", question: "Sentar/levantar do vaso sanitário" },
      {
        id: "adl16",
        question:
          "Tarefas domésticas pesadas (mover caixas, esfregar pisos, etc.)",
      },
      {
        id: "adl17",
        question:
          "Tarefas domésticas leves (cozinhar, tirar pó, etc.)",
      },
    ],
  },
  {
    name: "Esportes e Recreação",
    description:
      "As perguntas a seguir referem-se à sua função física em um nível mais alto de atividade.",
    questions: [
      { id: "sport1", question: "Agachar-se" },
      { id: "sport2", question: "Correr" },
      { id: "sport3", question: "Pular" },
      { id: "sport4", question: "Girar/torcer sobre o joelho lesionado" },
      { id: "sport5", question: "Ajoelhar-se" },
    ],
  },
  {
    name: "Qualidade de Vida",
    description:
      "As perguntas a seguir referem-se à qualidade de vida relacionada ao joelho.",
    questions: [
      {
        id: "qol1",
        question:
          "Com que frequência você está ciente do problema do seu joelho?",
      },
      {
        id: "qol2",
        question:
          "Você modificou seu estilo de vida para evitar atividades potencialmente prejudiciais ao joelho?",
      },
      {
        id: "qol3",
        question:
          "Quanto você está incomodado com a falta de confiança no seu joelho?",
      },
      {
        id: "qol4",
        question:
          "Em geral, quanta dificuldade você tem com o seu joelho?",
      },
    ],
  },
];

const responseOptions = [
  { value: 4, label: "Nenhum(a) / Nunca" },
  { value: 3, label: "Leve / Raramente" },
  { value: 2, label: "Moderado(a) / Às vezes" },
  { value: 1, label: "Grave / Frequentemente" },
  { value: 0, label: "Extremo(a) / Sempre" },
];

export default function QuestionnaireKOOS() {
  const [, setLocation] = useLocation();
  const searchString = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(searchString);
  const patientIdFromUrl = params.get("patientId");

  const [currentSubscale, setCurrentSubscale] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (patientIdFromUrl) {
      localStorage.setItem("patientId", patientIdFromUrl);
    }
  }, [patientIdFromUrl]);

  const currentSection = koosSubscales[currentSubscale];
  const totalQuestions = koosSubscales.reduce(
    (sum, s) => sum + s.questions.length,
    0
  );

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canGoNext = currentSection.questions.every(
    (q) => answers[q.id] !== undefined
  );
  const allAnswered = koosSubscales.every((s) =>
    s.questions.every((q) => answers[q.id] !== undefined)
  );

  const saveKoosMutation = trpc.patients.publicSaveKoos.useMutation();

  const calculateSubscaleScore = (subscaleName: string) => {
    const subscale = koosSubscales.find((s) => s.name === subscaleName);
    if (!subscale) return 0;

    const answeredQuestions = subscale.questions.filter(
      (q) => answers[q.id] !== undefined
    );
    if (answeredQuestions.length === 0) return 0;

    const totalScore = answeredQuestions.reduce(
      (sum, q) => sum + (answers[q.id] ?? 0),
      0
    );
    const maxPossible = answeredQuestions.length * 4;
    return Math.round((totalScore / maxPossible) * 100);
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Por favor, responda todas as perguntas.");
      return;
    }

    const patientId = getPatientIdFromContext();
    if (!patientId) {
      toast.error("Sessão expirada. Por favor, faça o cadastro novamente.");
      setLocation("/tcle");
      return;
    }

    setIsSubmitting(true);

    try {
      await saveKoosMutation.mutateAsync({
        patientId: parseInt(patientId, 10),
        responses: {
          pain1: answers["pain1"],
          pain2: answers["pain2"],
          pain3: answers["pain3"],
          pain4: answers["pain4"],
          pain5: answers["pain5"],
          pain6: answers["pain6"],
          pain7: answers["pain7"],
          pain8: answers["pain8"],
          pain9: answers["pain9"],
          symptoms1: answers["symptoms1"],
          symptoms2: answers["symptoms2"],
          symptoms3: answers["symptoms3"],
          symptoms4: answers["symptoms4"],
          symptoms5: answers["symptoms5"],
          symptoms6: answers["symptoms6"],
          symptoms7: answers["symptoms7"],
          adl1: answers["adl1"],
          adl2: answers["adl2"],
          adl3: answers["adl3"],
          adl4: answers["adl4"],
          adl5: answers["adl5"],
          adl6: answers["adl6"],
          adl7: answers["adl7"],
          adl8: answers["adl8"],
          adl9: answers["adl9"],
          adl10: answers["adl10"],
          adl11: answers["adl11"],
          adl12: answers["adl12"],
          adl13: answers["adl13"],
          adl14: answers["adl14"],
          adl15: answers["adl15"],
          adl16: answers["adl16"],
          adl17: answers["adl17"],
          sport1: answers["sport1"],
          sport2: answers["sport2"],
          sport3: answers["sport3"],
          sport4: answers["sport4"],
          sport5: answers["sport5"],
          qol1: answers["qol1"],
          qol2: answers["qol2"],
          qol3: answers["qol3"],
          qol4: answers["qol4"],
        },
      });

      const key = patientId
        ? `completedQuestionnaires_${patientId}`
        : "completedQuestionnaires";
      const completed = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!completed.includes("koos")) {
        completed.push("koos");
        localStorage.setItem(key, JSON.stringify(completed));
      }

      setIsCompleted(true);
      toast.success("Questionário KOOS salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar KOOS:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref =
    "/questionarios" +
    (patientIdFromUrl ? `?patientId=${patientIdFromUrl}` : "");

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002855] p-4 flex flex-col items-center justify-center gap-4">
        <LogosStrip variant="header" size="sm" />
        <Card className="max-w-lg w-full border-0 shadow-lg bg-card">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Questionário Concluído!
            </h2>
            <p className="text-muted-foreground mb-6">
              Suas respostas do KOOS foram registradas com sucesso.
            </p>

            <div className="space-y-3 mb-6">
              {koosSubscales.map((subscale) => {
                const score = calculateSubscaleScore(subscale.name);
                return (
                  <div
                    key={subscale.name}
                    className="bg-muted rounded-lg p-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground">
                        {subscale.name}
                      </span>
                      <span
                        className={`font-bold ${
                          score >= 70
                            ? "text-green-600"
                            : score >= 50
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 70
                            ? "bg-green-500"
                            : score >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              onClick={() => setLocation(backHref)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Voltar aos Questionários
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002855] p-4">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-center mb-2">
          <LogosStrip variant="header" size="sm" />
        </div>
        <Button
          variant="ghost"
          onClick={() => setLocation(backHref)}
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-500">
              <ClipboardList className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              KOOS - Avaliação do Joelho
            </h1>
          </div>
          <p className="text-primary/90">
            Knee Injury and Osteoarthritis Outcome Score
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mt-4">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>
              Seção: {currentSection.name} ({currentSubscale + 1}/
              {koosSubscales.length})
            </span>
            <span>
              {Object.keys(answers).length} de {totalQuestions} respondidas
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(answers).length / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {koosSubscales.map((subscale, index) => {
            const isComplete = subscale.questions.every(
              (q) => answers[q.id] !== undefined
            );
            return (
              <button
                key={subscale.name}
                type="button"
                onClick={() => setCurrentSubscale(index)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-all ${
                  index === currentSubscale
                    ? "bg-primary text-primary-foreground"
                    : isComplete
                      ? "bg-green-500/20 text-green-300 border border-green-500/50"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {isComplete && "✓ "}
                {subscale.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-4">
        <Card className="border-0 shadow-lg bg-primary/10 border-primary/20">
          <CardContent className="p-4">
            <p className="text-foreground">{currentSection.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {currentSection.questions.map((q, index) => (
          <Card key={q.id} className="border-0 shadow-lg bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-foreground">
                {index + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={
                  answers[q.id] !== undefined
                    ? String(answers[q.id])
                    : undefined
                }
                onValueChange={(value) =>
                  handleAnswer(q.id, parseInt(value, 10))
                }
                className="flex flex-wrap gap-2"
              >
                {responseOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <RadioGroupItem
                      value={String(option.value)}
                      id={`${q.id}-${option.value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`${q.id}-${option.value}`}
                      className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition-all ${
                        answers[q.id] === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between pt-4 pb-8">
          <Button
            variant="outline"
            onClick={() => setCurrentSubscale((s) => s - 1)}
            disabled={currentSubscale === 0}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Seção Anterior
          </Button>

          {currentSubscale < koosSubscales.length - 1 ? (
            <Button
              onClick={() => setCurrentSubscale((s) => s + 1)}
              disabled={!canGoNext}
              className="bg-primary hover:bg-primary/90"
            >
              Próxima Seção
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Salvando..." : "Finalizar Questionário"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
