import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  TrendingUp,
  Activity,
  ThermometerSun,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function PatientScores() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const patientId = parseInt(params?.id ?? "0", 10);

  const { data: patient, isLoading: patientLoading } =
    trpc.patients.getById.useQuery(
      { patientId },
      { enabled: patientId > 0 }
    );

  const { data: scores, isLoading: scoresLoading } =
    trpc.patients.getPatientScores.useQuery(
      { patientId },
      { enabled: patientId > 0 }
    );

  const isLoading = patientLoading || scoresLoading;

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 40) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreLabel = (score: number | null) => {
    if (score === null) return "Não avaliado";
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bom";
    if (score >= 40) return "Moderado";
    return "Limitado";
  };

  const getEvaColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score <= 2) return "text-green-600 dark:text-green-400";
    if (score <= 4) return "text-yellow-600 dark:text-yellow-400";
    if (score <= 6) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getEvaLabel = (score: number | null) => {
    if (score === null) return "Não avaliado";
    if (score === 0) return "Sem dor";
    if (score <= 2) return "Dor leve";
    if (score <= 4) return "Dor moderada";
    if (score <= 6) return "Dor intensa";
    return "Dor muito intensa";
  };

  const latestScores =
    scores && scores.length > 0 ? scores[scores.length - 1] : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation(`/pacientes/${patientId}`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Relatório de Scores</h1>
            {patient && (
              <p className="text-muted-foreground">{patient.name}</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : !patient ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Paciente não encontrado.</p>
              <Button onClick={() => setLocation("/")} className="mt-4">
                Voltar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Informações do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">
                      {patient.phone ?? "Não informado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Procedimento</p>
                    <p className="font-medium">
                      {patient.surgeryType ?? "Não definido"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Data da Cirurgia
                    </p>
                    <p className="font-medium">
                      {patient.surgeryDate
                        ? new Date(
                            patient.surgeryDate
                          ).toLocaleDateString("pt-BR")
                        : "Não agendada"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ThermometerSun className="h-5 w-5 text-orange-500" />
                    EVA - Escala de Dor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p
                      className={`text-5xl font-bold ${getEvaColor(latestScores?.eva?.painScore ?? null)}`}
                    >
                      {latestScores?.eva?.painScore ?? "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">de 10</p>
                    <p
                      className={`text-sm font-medium mt-2 ${getEvaColor(latestScores?.eva?.painScore ?? null)}`}
                    >
                      {getEvaLabel(latestScores?.eva?.painScore ?? null)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-blue-500" />
                    IKDC - Função do Joelho
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p
                      className={`text-5xl font-bold ${getScoreColor(latestScores?.ikdc?.totalScore ?? null)}`}
                    >
                      {latestScores?.ikdc?.totalScore ?? "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">pontos</p>
                    <p
                      className={`text-sm font-medium mt-2 ${getScoreColor(latestScores?.ikdc?.totalScore ?? null)}`}
                    >
                      {getScoreLabel(latestScores?.ikdc?.totalScore ?? null)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    KOOS - Visão Geral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    {latestScores?.koos ? (
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="text-muted-foreground">Dor:</span>{" "}
                          <span
                            className={getScoreColor(latestScores.koos.pain)}
                          >
                            {latestScores.koos.pain?.toFixed(0) ?? "-"}%
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Sintomas:
                          </span>{" "}
                          <span
                            className={getScoreColor(
                              latestScores.koos.symptoms
                            )}
                          >
                            {latestScores.koos.symptoms?.toFixed(0) ?? "-"}%
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">AVD:</span>{" "}
                          <span
                            className={getScoreColor(latestScores.koos.adl)}
                          >
                            {latestScores.koos.adl?.toFixed(0) ?? "-"}%
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">
                            Esporte:
                          </span>{" "}
                          <span
                            className={getScoreColor(latestScores.koos.sport)}
                          >
                            {latestScores.koos.sport?.toFixed(0) ?? "-"}%
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">QV:</span>{" "}
                          <span
                            className={getScoreColor(latestScores.koos.qol)}
                          >
                            {latestScores.koos.qol?.toFixed(0) ?? "-"}%
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Não avaliado</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {latestScores?.koos && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    KOOS - Detalhamento por Subescala
                  </CardTitle>
                  <CardDescription>
                    Pontuação de 0 a 100, onde 100 representa função perfeita
                    sem sintomas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "Dor",
                        value: latestScores.koos.pain,
                        color: "bg-red-500",
                      },
                      {
                        name: "Sintomas",
                        value: latestScores.koos.symptoms,
                        color: "bg-orange-500",
                      },
                      {
                        name: "Atividades da Vida Diária",
                        value: latestScores.koos.adl,
                        color: "bg-yellow-500",
                      },
                      {
                        name: "Esporte e Recreação",
                        value: latestScores.koos.sport,
                        color: "bg-green-500",
                      },
                      {
                        name: "Qualidade de Vida",
                        value: latestScores.koos.qol,
                        color: "bg-primary",
                      },
                    ].map((item) => (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className={getScoreColor(item.value)}>
                            {item.value?.toFixed(0) ?? "-"}%
                          </span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} transition-all duration-500`}
                            style={{ width: `${item.value ?? 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {scores && scores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Histórico de Avaliações
                  </CardTitle>
                  <CardDescription>
                    Evolução dos scores ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scores.map((score) => (
                      <div
                        key={score.timepointId}
                        className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-24">
                          <p className="text-sm font-medium">
                            {score.timepointType === "baseline"
                              ? "Pré-op"
                              : score.timepointType === "30days"
                                ? "30 dias"
                                : score.timepointType === "60days"
                                  ? "60 dias"
                                  : score.timepointType === "90days"
                                    ? "90 dias"
                                    : score.timepointType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {score.assessmentDate
                              ? new Date(
                                  score.assessmentDate
                                ).toLocaleDateString("pt-BR")
                              : "Data não informada"}
                          </p>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              EVA
                            </p>
                            <p
                              className={`font-medium ${getEvaColor(score.eva?.painScore ?? null)}`}
                            >
                              {score.eva?.painScore ?? "-"}/10
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              IKDC
                            </p>
                            <p
                              className={`font-medium ${getScoreColor(score.ikdc?.totalScore ?? null)}`}
                            >
                              {score.ikdc?.totalScore ?? "-"} pts
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              KOOS (QV)
                            </p>
                            <p
                              className={`font-medium ${getScoreColor(score.koos?.qol ?? null)}`}
                            >
                              {score.koos?.qol?.toFixed(0) ?? "-"}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(!scores || scores.length === 0) && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Nenhuma avaliação registrada
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Este paciente ainda não completou os questionários
                    pré-operatórios.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Envie um convite para que o paciente preencha os
                    questionários.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
