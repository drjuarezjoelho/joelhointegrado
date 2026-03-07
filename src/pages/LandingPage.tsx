import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogosStrip } from "@/components/LogosStrip";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  GraduationCap,
  UserPlus,
  Stethoscope,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Heart,
  BookOpen,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  age: z.string().optional(),
  gender: z.enum(["M", "F", "Outro"]).optional(),
  surgeryType: z.string().optional(),
  notes: z.string().optional(),
});

const studentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  institution: z.string().optional(),
  specialty: z.string().optional(),
  yearOfResidency: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;
type StudentFormData = z.infer<typeof studentSchema>;

type RegistrationType = "patient" | "student" | null;

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedType, setSelectedType] = useState<RegistrationType>(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<number | null>(null);

  const registerPatient = trpc.registration.registerPatient.useMutation({
    onSuccess: (data) => {
      setCreatedPatientId(data.id);
      setRegistrationComplete(true);
      toast.success("Cadastro realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar");
    },
  });

  const registerStudent = trpc.registration.registerStudent.useMutation({
    onSuccess: () => {
      setRegistrationComplete(true);
      toast.success("Cadastro realizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cadastrar");
    },
  });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: "M" },
  });

  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const handleTypeSelect = (type: RegistrationType) => {
    setSelectedType(type);
    setRegistrationComplete(false);
    setCreatedPatientId(null);
    patientForm.reset();
    studentForm.reset();
  };

  const handlePatientSubmit = (data: PatientFormData) => {
    registerPatient.mutate({
      ...data,
      age: data.age ? parseInt(data.age, 10) : undefined,
    });
  };

  const handleStudentSubmit = (data: StudentFormData) => {
    registerStudent.mutate(data);
  };

  const handleGoToSurgery = () => {
    setShowPopup(false);
    if (createdPatientId) {
      setLocation(`/pacientes/${createdPatientId}`);
    } else {
      setLocation("/");
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    setSelectedType(null);
    setRegistrationComplete(false);
    setCreatedPatientId(null);
  };

  const isSubmitting = registerPatient.isPending || registerStudent.isPending;

  if (typeof document !== "undefined") {
    document.title =
      "Dr. Juarez Sebastian - Ortopedia e Traumatologia - Cirurgia do Joelho";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060E1A] via-[#0B1426] to-[#112240] flex flex-col">
      <header className="w-full border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <LogosStrip variant="header" size="sm" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/")}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            Acesso Interno
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Stethoscope className="h-4 w-4" />
              Centro Integrado de Joelho
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Dr. Juarez Sebastian
            </h1>
            <p className="text-xl sm:text-2xl text-primary font-medium">
              Ortopedia e Traumatologia
            </p>
            <p className="text-lg text-[#8BA3C4] max-w-2xl mx-auto">
              Cirurgias especializadas de joelho: artroplastia, artroscopia e
              reconstrução ligamentar em Juazeiro e Petrolina.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              onClick={() => {
                setShowPopup(true);
                setSelectedType(null);
                setRegistrationComplete(false);
              }}
              className="bg-primary hover:bg-primary/90 text-white h-14 px-8 text-lg gap-3 shadow-lg shadow-primary/25"
            >
              <UserPlus className="h-5 w-5" />
              Cadastre-se
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="p-3 rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-white font-semibold">Pacientes</h3>
              <p className="text-sm text-[#8BA3C4] text-center">
                Cadastro e acompanhamento pré e pós-operatório
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-white font-semibold">Questionários</h3>
              <p className="text-sm text-[#8BA3C4] text-center">
                KOOS, IKDC e EVA para avaliação funcional
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="p-3 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-white font-semibold">Residência</h3>
              <p className="text-sm text-[#8BA3C4] text-center">
                Programa de Ortopedia e Traumatologia 2024
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="flex flex-col items-center gap-4">
          <LogosStrip variant="footer" size="md" showSote showResidencia />
          <p className="text-xs text-white/30 text-center">
            © {new Date().getFullYear()} Centro Integrado de Joelho (C.I.J.) -
            Juazeiro/Petrolina
          </p>
        </div>
      </footer>

      <Dialog open={showPopup} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {!selectedType && !registrationComplete && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-center">
                  Como deseja se cadastrar?
                </DialogTitle>
                <DialogDescription className="text-center">
                  Selecione seu perfil para iniciar o cadastro no sistema C.I.J.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
                <button
                  onClick={() => handleTypeSelect("student")}
                  className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                >
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      Aluno
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Residente ou estudante de medicina
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleTypeSelect("patient")}
                  className="group flex flex-col items-center gap-4 p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                >
                  <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <UserPlus className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      Paciente
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastro para cirurgia de joelho
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          {selectedType === "patient" && !registrationComplete && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Cadastro de Paciente
                </DialogTitle>
                <DialogDescription>
                  Preencha seus dados para iniciar o acompanhamento cirúrgico
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={patientForm.handleSubmit(handlePatientSubmit)}
                className="space-y-4 py-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="p-name">Nome completo *</Label>
                    <Input
                      id="p-name"
                      placeholder="Seu nome completo"
                      {...patientForm.register("name")}
                    />
                    {patientForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {patientForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-email">Email *</Label>
                    <Input
                      id="p-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...patientForm.register("email")}
                    />
                    {patientForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {patientForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-phone">Telefone</Label>
                    <Input
                      id="p-phone"
                      placeholder="(XX) XXXXX-XXXX"
                      {...patientForm.register("phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-age">Idade</Label>
                    <Input
                      id="p-age"
                      type="number"
                      placeholder="Idade"
                      {...patientForm.register("age")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="p-gender">Sexo</Label>
                    <select
                      id="p-gender"
                      {...patientForm.register("gender")}
                      className="w-full h-9 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="p-surgery">Tipo de Cirurgia (se já definida)</Label>
                    <Input
                      id="p-surgery"
                      placeholder="Ex: Artroplastia Total, Artroscopia..."
                      {...patientForm.register("surgeryType")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="p-notes">Observações</Label>
                    <Textarea
                      id="p-notes"
                      placeholder="Informações adicionais"
                      rows={3}
                      {...patientForm.register("notes")}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedType(null)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Cadastrar
                  </Button>
                </div>
              </form>
            </>
          )}

          {selectedType === "student" && !registrationComplete && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Cadastro de Aluno
                </DialogTitle>
                <DialogDescription>
                  Preencha seus dados para acesso ao programa de residência
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={studentForm.handleSubmit(handleStudentSubmit)}
                className="space-y-4 py-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="s-name">Nome completo *</Label>
                    <Input
                      id="s-name"
                      placeholder="Seu nome completo"
                      {...studentForm.register("name")}
                    />
                    {studentForm.formState.errors.name && (
                      <p className="text-xs text-destructive">
                        {studentForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-email">Email *</Label>
                    <Input
                      id="s-email"
                      type="email"
                      placeholder="seu@email.com"
                      {...studentForm.register("email")}
                    />
                    {studentForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {studentForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-phone">Telefone</Label>
                    <Input
                      id="s-phone"
                      placeholder="(XX) XXXXX-XXXX"
                      {...studentForm.register("phone")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-institution">Instituição</Label>
                    <Input
                      id="s-institution"
                      placeholder="Hospital / Universidade"
                      {...studentForm.register("institution")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="s-specialty">Especialidade</Label>
                    <Input
                      id="s-specialty"
                      placeholder="Ortopedia, Traumatologia..."
                      {...studentForm.register("specialty")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="s-year">Ano de Residência</Label>
                    <select
                      id="s-year"
                      {...studentForm.register("yearOfResidency")}
                      className="w-full h-9 px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione</option>
                      <option value="R1">R1 - Primeiro ano</option>
                      <option value="R2">R2 - Segundo ano</option>
                      <option value="R3">R3 - Terceiro ano</option>
                      <option value="R4">R4 - Quarto ano</option>
                      <option value="Fellow">Fellow</option>
                      <option value="Preceptor">Preceptor</option>
                    </select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="s-notes">Observações</Label>
                    <Textarea
                      id="s-notes"
                      placeholder="Informações adicionais"
                      rows={3}
                      {...studentForm.register("notes")}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedType(null)}
                    className="flex-1"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 gap-2"
                  >
                    {isSubmitting && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Cadastrar
                  </Button>
                </div>
              </form>
            </>
          )}

          {registrationComplete && (
            <div className="flex flex-col items-center gap-6 py-8">
              <div className="p-4 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Cadastro Realizado!
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedType === "patient"
                    ? "Seu cadastro como paciente foi registrado. Você receberá um email de confirmação."
                    : "Seu cadastro como aluno foi registrado. Você receberá um email de confirmação."}
                </p>
              </div>
              {selectedType === "patient" && createdPatientId ? (
                <div className="flex flex-col gap-3 w-full">
                  <Button
                    onClick={handleGoToSurgery}
                    className="w-full gap-2 h-12"
                  >
                    <Stethoscope className="h-5 w-5" />
                    Ir para Cadastro de Cirurgia
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <Button onClick={handleClose} className="w-full">
                  Fechar
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
