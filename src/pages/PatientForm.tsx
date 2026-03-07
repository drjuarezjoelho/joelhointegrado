import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  age: z.string().optional(),
  gender: z.enum(["M", "F", "Outro"]).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  surgeryDate: z.string().optional(),
  surgeryType: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function PatientForm() {
  const [, setLocation] = useLocation();
  const [, paramsNovo] = useRoute("/pacientes/novo");
  const [, paramsEditar] = useRoute("/pacientes/:id/editar");
  const isNew = !!paramsNovo;
  const patientIdParam = paramsEditar?.id;
  const patientId = patientIdParam && patientIdParam !== "novo" ? patientIdParam : null;
  const patientIdNum = patientId ? parseInt(patientId, 10) : 0;

  const [isLoading, setIsLoading] = useState(false);

  const { data: patient } = trpc.patients.getById.useQuery(
    { patientId: patientIdNum },
    { enabled: !!patientIdNum }
  );

  const createMutation = trpc.patients.create.useMutation();
  const updateMutation = trpc.patients.update.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "M",
    },
  });

  useEffect(() => {
    if (patient) {
      reset({
        name: patient.name,
        age: patient.age?.toString() ?? "",
        gender: (patient.gender as "M" | "F" | "Outro") ?? "M",
        email: patient.email ?? "",
        phone: patient.phone ?? "",
        surgeryDate: patient.surgeryDate
          ? new Date(patient.surgeryDate).toISOString().split("T")[0]
          : "",
        surgeryType: patient.surgeryType ?? "",
        notes: patient.notes ?? "",
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      const submitData = {
        name: data.name,
        age: data.age ? parseInt(data.age, 10) : undefined,
        gender: data.gender,
        email: data.email || undefined,
        phone: data.phone || undefined,
        surgeryDate: data.surgeryDate ? new Date(data.surgeryDate) : undefined,
        surgeryType: data.surgeryType || undefined,
        notes: data.notes || undefined,
      };

      if (patientIdNum) {
        await updateMutation.mutateAsync({
          patientId: patientIdNum,
          ...submitData,
        });
        setLocation("/dashboard");
      } else {
        const newPatient = await createMutation.mutateAsync(submitData);
        if (newPatient && typeof newPatient === "object" && "id" in newPatient) {
          setLocation(`/consent-history/${(newPatient as { id: number }).id}`);
        } else {
          setLocation("/dashboard");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar paciente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isNew ? "Novo Paciente" : "Editar Paciente"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do Paciente</CardTitle>
            <CardDescription>
              Preencha as informações básicas do paciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    placeholder="Nome completo"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Idade"
                    {...register("age")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo</Label>
                  <select
                    id="gender"
                    {...register("gender")}
                    className="w-full h-9 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(XX) XXXXX-XXXX"
                    {...register("phone")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surgeryDate">Data da Cirurgia</Label>
                  <Input
                    id="surgeryDate"
                    type="date"
                    {...register("surgeryDate")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="surgeryType">Tipo de Cirurgia</Label>
                  <Input
                    id="surgeryType"
                    placeholder="Ex: Artroscopia, Reconstrução ACL, etc."
                    {...register("surgeryType")}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais sobre o paciente"
                    {...register("notes")}
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {isNew ? "Cadastrar" : "Atualizar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
