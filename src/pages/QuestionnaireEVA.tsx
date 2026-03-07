import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, ThermometerSun, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { LogosStrip } from "@/components/LogosStrip";

function getPatientIdFromContext(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get("patientId");
  if (fromUrl) return fromUrl;
  return localStorage.getItem("patientId") || localStorage.getItem("currentPatientId");
}

export default function QuestionnaireEVA() {
  const [location, setLocation] = useLocation();
  const searchString = location.split('?')[1] || '';
  const params = new URLSearchParams(searchString);
  const patientIdFromUrl = params.get("patientId");

  const [painScore, setPainScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (patientIdFromUrl) {
      localStorage.setItem("patientId", patientIdFromUrl);
    }
  }, [patientIdFromUrl]);

  const saveEvaMutation = trpc.patients.publicSaveEva.useMutation();

  const handleSubmit = async () => {
    if (painScore === null) {
      toast.error("Por favor, selecione um nível de dor.");
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
      await saveEvaMutation.mutateAsync({
        patientId: parseInt(patientId, 10),
        painScore,
      });

      const key = patientId
        ? `completedQuestionnaires_${patientId}`
        : "completedQuestionnaires";
      const completed = JSON.parse(localStorage.getItem(key) ?? "[]");
      if (!completed.includes("eva")) {
        completed.push("eva");
        localStorage.setItem(key, JSON.stringify(completed));
      }

      setIsCompleted(true);
      toast.success("Questionário EVA salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar EVA:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPainLabel = (score: number) => {
    if (score === 0) return "Sem dor";
    if (score <= 2) return "Dor leve";
    if (score <= 4) return "Dor moderada";
    if (score <= 6) return "Dor intensa";
    if (score <= 8) return "Dor muito intensa";
    return "Pior dor imaginável";
  };

  const getPainColor = (score: number) => {
    if (score <= 2) return "bg-green-500";
    if (score <= 4) return "bg-yellow-500";
    if (score <= 6) return "bg-orange-500";
    if (score <= 8) return "bg-red-500";
    return "bg-red-700";
  };

  if (isCompleted) {
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
              Sua avaliação de dor foi registrada com sucesso.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground">Sua resposta:</p>
              <p className="text-3xl font-bold text-primary">
                {painScore}/10
              </p>
              <p className="text-sm text-muted-foreground">
                {painScore != null && getPainLabel(painScore)}
              </p>
            </div>
            <Button
              onClick={() => setLocation("/questionarios" + (patientIdFromUrl ? `?patientId=${patientIdFromUrl}` : ""))}
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
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex justify-center mb-2">
          <LogosStrip variant="header" size="sm" />
        </div>
        <Button
          variant="ghost"
          onClick={() =>
            setLocation("/questionarios" + (patientIdFromUrl ? `?patientId=${patientIdFromUrl}` : ""))
          }
          className="text-white hover:bg-white/10 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-orange-500">
              <ThermometerSun className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              EVA - Escala Visual Analógica
            </h1>
          </div>
          <p className="text-primary/90">
            Avaliação da intensidade da dor
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-8">
        <Card className="border-0 shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Qual é o nível da sua dor no joelho?
            </CardTitle>
            <CardDescription>
              Selecione o número que melhor representa a intensidade da sua dor
              atual, onde 0 significa &quot;sem dor&quot; e 10 significa &quot;pior dor
              imaginável&quot;.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Sem dor</span>
                <span>Pior dor imaginável</span>
              </div>

              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setPainScore(score)}
                    className={`
                      aspect-square rounded-lg font-bold text-lg transition-all
                      ${
                        painScore === score
                          ? `${getPainColor(score)} text-white scale-110 shadow-lg`
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }
                    `}
                  >
                    {score}
                  </button>
                ))}
              </div>

              <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-700" />

              {painScore !== null && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Nível selecionado:
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      painScore <= 4
                        ? "text-green-600"
                        : painScore <= 6
                          ? "text-orange-600"
                          : "text-red-600"
                    }`}
                  >
                    {painScore}
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {getPainLabel(painScore)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-green-500/10 rounded text-center">
                <span className="font-semibold text-green-700">0-2:</span>
                <span className="text-green-600"> Dor leve</span>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded text-center">
                <span className="font-semibold text-yellow-700">3-4:</span>
                <span className="text-yellow-600"> Dor moderada</span>
              </div>
              <div className="p-2 bg-orange-500/10 rounded text-center">
                <span className="font-semibold text-orange-700">5-6:</span>
                <span className="text-orange-600"> Dor intensa</span>
              </div>
              <div className="p-2 bg-red-500/10 rounded text-center col-span-2 md:col-span-3">
                <span className="font-semibold text-red-700">7-10:</span>
                <span className="text-red-600">
                  {" "}
                  Dor muito intensa a insuportável
                </span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={painScore === null || isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 h-12 text-lg"
            >
              {isSubmitting ? "Salvando..." : "Confirmar Resposta"}
            </Button>
          </CardContent>
        </Card>

        <footer className="mt-10 flex flex-col items-center gap-3">
          <LogosStrip variant="footer" size="md" showResidencia />
          <p className="text-xs text-white/40 text-center">
            © {new Date().getFullYear()} Centro Integrado de Joelho (C.I.J.) - Juazeiro/Petrolina
          </p>
        </footer>
      </div>
    </div>
  );
}
