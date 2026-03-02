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
import { useMemo } from "react";

export default function PatientDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/pacientes/:id");
  const patientId = useMemo(
    () => parseInt(params?.id ?? "0", 10),
    [params?.id]
  );

  const { data: patient, isLoading: patientLoading } =
    trpc.patients.getById.useQuery(
      { patientId },
      { enabled: !!patientId }
    );

  const {
    data: timepoints,
    isLoading: timepointsLoading,
    refetch: refetchTimepoints,
  } = trpc.patients.getTimepoints.useQuery(
    { patientId },
    { enabled: !!patientId }
  );

  const createTimepointMutation = trpc.patients.createTimepoint.useMutation({
    onSuccess: () => refetchTimepoints(),
  });

  const handleCreateTimepoint = async (
    type: "baseline" | "30days" | "60days" | "90days"
  ) => {
    try {
      await createTimepointMutation.mutateAsync({
        patientId,
        timepointType: type,
      });
    } catch (error) {
      console.error("Erro ao criar marco temporal:", error);
    }
  };

  const getTimepointLabel = (type: string) => {
    const labels: Record<string, string> = {
      baseline: "Baseline (Pré-operatório)",
      "30days": "30 Dias Pós-operatório",
      "60days": "60 Dias Pós-operatório",
      "90days": "90 Dias Pós-operatório",
    };
    return labels[type] ?? type;
  };

  if (patientLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button onClick={() => setLocation("/")} className="mt-4">
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
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">
              {patient.age != null && `${patient.age} anos`}
              {patient.gender &&
                ` • ${patient.gender === "M" ? "Masculino" : "Feminino"}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {patient.email ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Telefone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {patient.phone ?? "—"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Tipo de Cirurgia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {patient.surgeryType ?? "—"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Marcos Temporais e Questionários</CardTitle>
            <CardDescription>
              Selecione um marco temporal para preencher os questionários KOOS,
              IKDC e EVA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="timepoints" className="space-y-4">
              <TabsList>
                <TabsTrigger value="timepoints">Marcos Temporais</TabsTrigger>
                <TabsTrigger value="create">Novo Marco</TabsTrigger>
              </TabsList>

              <TabsContent value="timepoints" className="space-y-4">
                {timepointsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : timepoints && timepoints.length > 0 ? (
                  <div className="space-y-3">
                    {timepoints.map((tp) => (
                      <div
                        key={tp.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">
                            {getTimepointLabel(tp.timepointType)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(
                              tp.assessmentDate
                            ).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            setLocation(`/questionarios/${tp.id}`)
                          }
                        >
                          Preencher
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum marco temporal criado ainda.
                  </p>
                )}
              </TabsContent>

              <TabsContent value="create" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(
                    [
                      "baseline",
                      "30days",
                      "60days",
                      "90days",
                    ] as const
                  ).map((type) => {
                    const exists = timepoints?.some(
                      (tp) => tp.timepointType === type
                    );
                    return (
                      <Button
                        key={type}
                        onClick={() => handleCreateTimepoint(type)}
                        disabled={exists || createTimepointMutation.isPending}
                        variant={exists ? "outline" : "default"}
                        className="gap-2 h-auto flex-col py-4"
                      >
                        {createTimepointMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        <span className="font-medium">
                          {getTimepointLabel(type)}
                        </span>
                        {exists && (
                          <span className="text-xs text-muted-foreground">
                            Já criado
                          </span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
