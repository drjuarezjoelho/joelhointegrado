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
  Activity,
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

const ikdcQuestions = [
  {
    id: 1,
    question:
      "Qual é o nível mais alto de atividade que você pode realizar sem dor significativa no joelho?",
    options: [
      {
        value: 4,
        label:
          "Atividades muito extenuantes como saltar ou girar em esportes de contato",
      },
      {
        value: 3,
        label:
          "Atividades extenuantes como trabalho físico pesado, esqui ou tênis",
      },
      {
        value: 2,
        label:
          "Atividades moderadas como trabalho físico moderado, corrida ou jogging",
      },
      {
        value: 1,
        label:
          "Atividades leves como caminhar, trabalho doméstico ou jardinagem",
      },
      {
        value: 0,
        label:
          "Incapaz de realizar qualquer das atividades acima devido à dor no joelho",
      },
    ],
  },
  {
    id: 2,
    question:
      "Durante as últimas 4 semanas, ou desde a sua lesão, com que frequência você sentiu dor?",
    options: [
      { value: 4, label: "Nunca" },
      { value: 3, label: "Raramente" },
      { value: 2, label: "Às vezes" },
      { value: 1, label: "Frequentemente" },
      { value: 0, label: "Constantemente" },
    ],
  },
  {
    id: 3,
    question: "Se você tem dor, qual é a intensidade?",
    options: [
      { value: 10, label: "Sem dor" },
      { value: 8, label: "Dor leve" },
      { value: 6, label: "Dor moderada" },
      { value: 4, label: "Dor intensa" },
      { value: 2, label: "Dor muito intensa" },
      { value: 0, label: "Pior dor imaginável" },
    ],
  },
  {
    id: 4,
    question:
      "Durante as últimas 4 semanas, ou desde a sua lesão, o seu joelho estava rígido ou inchado?",
    options: [
      { value: 4, label: "Não, de forma alguma" },
      { value: 3, label: "Levemente" },
      { value: 2, label: "Moderadamente" },
      { value: 1, label: "Muito" },
      { value: 0, label: "Extremamente" },
    ],
  },
  {
    id: 5,
    question:
      "Qual é o nível mais alto de atividade que você pode realizar sem inchaço significativo no joelho?",
    options: [
      {
        value: 4,
        label:
          "Atividades muito extenuantes como saltar ou girar em esportes de contato",
      },
      {
        value: 3,
        label:
          "Atividades extenuantes como trabalho físico pesado, esqui ou tênis",
      },
      {
        value: 2,
        label:
          "Atividades moderadas como trabalho físico moderado, corrida ou jogging",
      },
      {
        value: 1,
        label:
          "Atividades leves como caminhar, trabalho doméstico ou jardinagem",
      },
      {
        value: 0,
        label:
          "Incapaz de realizar qualquer das atividades acima devido ao inchaço no joelho",
      },
    ],
  },
  {
    id: 6,
    question:
      "Durante as últimas 4 semanas, ou desde a sua lesão, o seu joelho travou ou bloqueou?",
    options: [
      { value: 1, label: "Não" },
      { value: 0, label: "Sim" },
    ],
  },
  {
    id: 7,
    question:
      "Qual é o nível mais alto de atividade que você pode realizar sem que o joelho falhe ou ceda?",
    options: [
      {
        value: 4,
        label:
          "Atividades muito extenuantes como saltar ou girar em esportes de contato",
      },
      {
        value: 3,
        label:
          "Atividades extenuantes como trabalho físico pesado, esqui ou tênis",
      },
      {
        value: 2,
        label:
          "Atividades moderadas como trabalho físico moderado, corrida ou jogging",
      },
      {
        value: 1,
        label:
          "Atividades leves como caminhar, trabalho doméstico ou jardinagem",
      },
      {
        value: 0,
        label:
          "Incapaz de realizar qualquer das atividades acima devido à instabilidade do joelho",
      },
    ],
  },
  {
    id: 8,
    question:
      "Qual é o nível mais alto de atividade que você pode participar regularmente?",
    options: [
      {
        value: 4,
        label:
          "Atividades muito extenuantes como saltar ou girar em esportes de contato",
      },
      {
        value: 3,
        label:
          "Atividades extenuantes como trabalho físico pesado, esqui ou tênis",
      },
      {
        value: 2,
        label:
          "Atividades moderadas como trabalho físico moderado, corrida ou jogging",
      },
      {
        value: 1,
        label:
          "Atividades leves como caminhar, trabalho doméstico ou jardinagem",
      },
      {
        value: 0,
        label:
          "Incapaz de realizar qualquer das atividades acima devido ao joelho",
      },
    ],
  },
  {
    id: 9,
    question: "Como o seu joelho afeta a sua capacidade de subir escadas?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 10,
    question: "Como o seu joelho afeta a sua capacidade de descer escadas?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 11,
    question:
      "Como o seu joelho afeta a sua capacidade de ajoelhar-se na frente do joelho?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 12,
    question: "Como o seu joelho afeta a sua capacidade de agachar-se?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 13,
    question:
      "Como o seu joelho afeta a sua capacidade de sentar-se com o joelho dobrado?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 14,
    question:
      "Como o seu joelho afeta a sua capacidade de levantar-se de uma cadeira?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 15,
    question:
      "Como o seu joelho afeta a sua capacidade de correr em linha reta?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 16,
    question:
      "Como o seu joelho afeta a sua capacidade de saltar e aterrissar na perna afetada?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 17,
    question:
      "Como o seu joelho afeta a sua capacidade de parar e iniciar rapidamente?",
    options: [
      { value: 4, label: "Sem dificuldade" },
      { value: 3, label: "Dificuldade mínima" },
      { value: 2, label: "Dificuldade moderada" },
      { value: 1, label: "Dificuldade extrema" },
      { value: 0, label: "Incapaz de fazer" },
    ],
  },
  {
    id: 18,
    question:
      "Como você classificaria a função do seu joelho em uma escala de 0 a 10?",
    options: [
      { value: 10, label: "10 - Função normal, sem limitações" },
      { value: 8, label: "8 - Quase normal" },
      { value: 6, label: "6 - Moderadamente limitado" },
      { value: 4, label: "4 - Muito limitado" },
      { value: 2, label: "2 - Extremamente limitado" },
      { value: 0, label: "0 - Incapaz de realizar atividades diárias" },
    ],
  },
];

export default function QuestionnaireIKDC() {
  const [location, setLocation] = useLocation();
  const searchString = location.split('?')[1] || '';
  const params = new URLSearchParams(searchString);
  const patientIdFromUrl = params.get("patientId");

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (patientIdFromUrl) {
      localStorage.setItem("patientId", patientIdFromUrl);
    }
  }, [patientIdFromUrl]);

  const questionsPerPage = 3;
  const totalPages = Math.ceil(ikdcQuestions.length / questionsPerPage);
  const currentQuestions = ikdcQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const canGoNext = currentQuestions.every((q) => answers[q.id] !== undefined);
  const allAnswered = ikdcQuestions.every((q) => answers[q.id] !== undefined);

  const saveIkdcMutation = trpc.patients.publicSaveIkdc.useMutation();

  const calculateScore = () => {
    const totalPossible = ikdcQuestions.reduce((sum, q) => {
      const maxOption = Math.max(...q.options.map((o) => o.value));
      return sum + maxOption;
    }, 0);
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    return Math.round((totalScore / totalPossible) * 100);
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
      await saveIkdcMutation.mutateAsync({
        patientId: parseInt(patientId, 10),
        responses: {
          item1: answers[1],
          item2: answers[2],
          item3: answers[3],
          item4: answers[4],
          item5: answers[5],
          item6: answers[6],
          item7: answers[7],
          item8: answers[8],
          item9: answers[9],
          item10: answers[10],
          item11: answers[11],
          item12: answers[12],
          item13: answers[13],
          item14: answers[14],
          item15: answers[15],
          item16: answers[16],
          item17: answers[17],
          item18: answers[18],
        },
      });

      const key = patientId
        ? `completedQuestionnaires_${patientId}`
        : "completedQuestionnaires";
      const completed = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!completed.includes("ikdc")) {
        completed.push("ikdc");
        localStorage.setItem(key, JSON.stringify(completed));
      }

      setIsCompleted(true);
      toast.success("Questionário IKDC salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar IKDC:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backHref =
    "/questionarios" +
    (patientIdFromUrl ? `?patientId=${patientIdFromUrl}` : "");

  if (isCompleted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002855] p-4 flex flex-col items-center justify-center gap-4">
        <LogosStrip variant="header" size="sm" />
        <Card className="max-w-md w-full border-0 shadow-lg bg-card">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">
              Questionário Concluído!
            </h2>
            <p className="text-muted-foreground mb-6">
              Suas respostas do IKDC foram registradas com sucesso.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Pontuação IKDC:
              </p>
              <p className="text-4xl font-bold text-primary">{score}%</p>
              <p className="text-sm text-muted-foreground">
                {score >= 80
                  ? "Função excelente"
                  : score >= 60
                    ? "Função boa"
                    : score >= 40
                      ? "Função moderada"
                      : "Função limitada"}
              </p>
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
            <div className="p-3 rounded-lg bg-green-500">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              IKDC - Avaliação Subjetiva do Joelho
            </h1>
          </div>
          <p className="text-primary/90">
            International Knee Documentation Committee
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mt-4">
          <div className="flex justify-between text-sm text-white mb-2">
            <span>
              Página {currentPage + 1} de {totalPages}
            </span>
            <span>
              {Object.keys(answers).length} de {ikdcQuestions.length}{" "}
              respondidas
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{
                width: `${(Object.keys(answers).length / ikdcQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {currentQuestions.map((q, index) => (
          <Card key={q.id} className="border-0 shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">
                {currentPage * questionsPerPage + index + 1}. {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={
                  answers[q.id] !== undefined
                    ? String(answers[q.id])
                    : undefined
                }
                onValueChange={(value) => handleAnswer(q.id, parseInt(value, 10))}
              >
                {q.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-3 py-2"
                  >
                    <RadioGroupItem
                      value={String(option.value)}
                      id={`q${q.id}-${option.value}`}
                    />
                    <Label
                      htmlFor={`q${q.id}-${option.value}`}
                      className="cursor-pointer flex-1 text-foreground"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentPage < totalPages - 1 ? (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!canGoNext}
              className="bg-primary hover:bg-primary/90"
            >
              Próxima
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
