import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import KoosForm from "@/components/questionnaires/KoosForm";
import IkdcForm from "@/components/questionnaires/IkdcForm";
import EvaForm from "@/components/questionnaires/EvaForm";

export default function Questionnaires() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/questionarios/:id");
  const timepointId = parseInt(params?.id ?? "0", 10);

  const { data: timepoint, isLoading: timepointLoading } =
    trpc.patients.getTimepoint.useQuery(
      { timepointId },
      { enabled: timepointId > 0 }
    );

  const getTimepointLabel = (type: string) => {
    const labels: Record<string, string> = {
      baseline: "Baseline (Pré-operatório)",
      "30days": "30 Dias Pós-operatório",
      "60days": "60 Dias Pós-operatório",
      "90days": "90 Dias Pós-operatório",
    };
    return labels[type] ?? type;
  };

  if (timepointLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!timepoint) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Marco temporal não encontrado
          </p>
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation(`/pacientes/${timepoint.patientId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getTimepointLabel(timepoint.timepointType)}
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date(timepoint.assessmentDate).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questionários e Avaliações</CardTitle>
            <CardDescription>
              Preencha os questionários KOOS, IKDC e a escala visual de dor (EVA)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="koos" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="koos">KOOS</TabsTrigger>
                <TabsTrigger value="ikdc">IKDC</TabsTrigger>
                <TabsTrigger value="eva">EVA</TabsTrigger>
              </TabsList>

              <TabsContent value="koos" className="space-y-6">
                <KoosForm timepointId={timepointId} />
              </TabsContent>

              <TabsContent value="ikdc" className="space-y-6">
                <IkdcForm timepointId={timepointId} />
              </TabsContent>

              <TabsContent value="eva" className="space-y-6">
                <EvaForm timepointId={timepointId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
