import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  ClipboardList,
  Activity,
  ThermometerSun,
} from "lucide-react";
import { useLocation } from "wouter";
import { LogosStrip } from "@/components/LogosStrip";

export default function PublicQuestionnaires() {
  const [location, setLocation] = useLocation();
  const searchString = location.split('?')[1] || '';
  const params = new URLSearchParams(searchString);
  const patientId = params.get("patientId");

  const [completedQuestionnaires, setCompletedQuestionnaires] = useState<
    string[]
  >(() => {
    if (typeof window !== "undefined") {
      const key = patientId
        ? `completedQuestionnaires_${patientId}`
        : "completedQuestionnaires";
      try {
        return JSON.parse(localStorage.getItem(key) ?? "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (patientId) {
      localStorage.setItem("currentPatientId", patientId);
    }
  }, [patientId]);

  const questionnaires = [
    {
      id: "koos",
      name: "KOOS",
      fullName: "Knee Injury and Osteoarthritis Outcome Score",
      description:
        "Questionário de avaliação funcional do joelho com 42 questões sobre dor, sintomas, atividades diárias, esporte e qualidade de vida.",
      icon: ClipboardList,
      color: "bg-blue-500",
      estimatedTime: "10-15 minutos",
    },
    {
      id: "ikdc",
      name: "IKDC",
      fullName: "International Knee Documentation Committee",
      description:
        "Avaliação subjetiva do joelho com foco em sintomas, atividades esportivas e função do joelho.",
      icon: Activity,
      color: "bg-green-500",
      estimatedTime: "5-10 minutos",
    },
    {
      id: "eva",
      name: "EVA",
      fullName: "Escala Visual Analógica de Dor",
      description:
        "Escala de 0 a 10 para avaliar a intensidade da sua dor atual no joelho.",
      icon: ThermometerSun,
      color: "bg-orange-500",
      estimatedTime: "1-2 minutos",
    },
  ];

  const handleStartQuestionnaire = (id: string) => {
    const queryParam = patientId ? `?patientId=${patientId}` : "";
    setLocation(`/questionario/${id}${queryParam}`);
  };

  const allCompleted = completedQuestionnaires.length === questionnaires.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001a4d] to-[#002855] p-4">
      <div className="max-w-4xl mx-auto mb-6">
        <div className="text-center py-6">
          <div className="flex justify-center mb-4">
            <LogosStrip variant="header" size="lg" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Questionários Pré-Operatórios
          </h1>
          <p className="text-primary/90 text-lg">
            C.I.J. - Centro Integrado de Joelho
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-0 shadow-lg bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Seu Progresso</h3>
                <p className="text-sm text-muted-foreground">
                  {completedQuestionnaires.length} de {questionnaires.length}{" "}
                  questionários concluídos
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">
                  {Math.round(
                    (completedQuestionnaires.length / questionnaires.length) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedQuestionnaires.length / questionnaires.length) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-primary/10 border-primary/20">
          <ClipboardList className="h-5 w-5 text-primary" />
          <AlertDescription className="ml-2">
            <strong>Importante:</strong> Complete todos os questionários abaixo
            para que possamos avaliar adequadamente sua condição antes da
            cirurgia. Suas respostas são confidenciais e protegidas pela LGPD.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-1">
          {questionnaires.map((q) => {
            const isCompleted = completedQuestionnaires.includes(q.id);
            const Icon = q.icon;

            return (
              <Card
                key={q.id}
                className={`border-0 shadow-lg transition-all ${
                  isCompleted ? "bg-green-500/10 border-green-500/20" : "bg-card"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${isCompleted ? "bg-green-500" : q.color}`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-6 w-6 text-white" />
                        ) : (
                          <Icon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {q.name}
                          {isCompleted && (
                            <span className="ml-2 text-sm font-normal text-green-600 dark:text-green-400">
                              ✓ Concluído
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {q.fullName}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {q.estimatedTime}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {q.description}
                  </p>
                  <Button
                    onClick={() => handleStartQuestionnaire(q.id)}
                    disabled={isCompleted}
                    className={`w-full ${
                      isCompleted
                        ? "bg-green-500/20 text-green-700 dark:text-green-300 hover:bg-green-500/20 cursor-default"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isCompleted
                      ? "Questionário Concluído"
                      : "Iniciar Questionário"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {allCompleted && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-primary text-primary-foreground">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Parabéns!</h2>
              <p className="text-lg mb-4 opacity-95">
                Você completou todos os questionários pré-operatórios.
              </p>
              <p className="text-sm opacity-90">
                A equipe C.I.J. analisará suas respostas e entrará em contato se
                necessário. Obrigado por sua colaboração!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => setLocation("/tcle")}
            className="bg-white/10 text-white border-white/30 hover:bg-white/20"
          >
            ← Voltar ao TCLE
          </Button>
        </div>
      </div>

      <footer className="max-w-4xl mx-auto mt-12 pb-8">
        <div className="bg-card rounded-xl p-6 shadow-lg border">
          <div className="flex flex-col items-center gap-6">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              Parceiros e Apoio
            </p>
            <LogosStrip variant="footer" size="lg" showSote showResidencia />
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
