import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ExportData from "@/components/ExportData";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  Loader2,
  BarChart3,
  MessageCircle,
  Bell,
  Send,
  Pencil,
  Phone,
  Mail,
  Smartphone,
  ChevronDown,
  Link,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type NotificationMethod = "email" | "sms" | "whatsapp" | "auto";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: patients, isLoading, refetch } = trpc.patients.list.useQuery();
  const { data: notificationStatus } =
    trpc.patients.checkWhatsAppStatus.useQuery(undefined, { retry: false });

  const [editingPatient, setEditingPatient] = useState<{
    id: number;
    name: string;
    phone: string;
    email?: string;
  } | null>(null);
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);

  const sendInviteMutation = trpc.patients.sendQuestionnaireInvite.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendReminderMutation = trpc.patients.sendSurgeryReminder.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updatePhoneMutation = trpc.patients.updatePhone.useMutation({
    onSuccess: () => {
      toast.success("Telefone atualizado com sucesso!");
      setEditingPatient(null);
      refetch();
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatPhoneInput = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditPhone(formatPhoneInput(e.target.value));
  };

  const handleSavePhone = () => {
    if (!editingPatient) return;
    const cleanPhone = editPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast.error("Telefone deve ter 10 ou 11 dígitos");
      return;
    }
    updatePhoneMutation.mutate({
      patientId: editingPatient.id,
      phone: cleanPhone,
    });
  };

  const handleSendInvite = (
    patientId: number,
    method: NotificationMethod = "auto"
  ) => {
    if (
      !notificationStatus?.configured &&
      notificationStatus?.availableMethods?.length === 0
    ) {
      toast.error("Nenhum serviço de notificação configurado.");
      return;
    }
    sendInviteMutation.mutate({ patientId, method });
  };

  const handleSendReminder = (
    patientId: number,
    method: NotificationMethod = "auto"
  ) => {
    if (
      !notificationStatus?.configured &&
      notificationStatus?.availableMethods?.length === 0
    ) {
      toast.error("Nenhum serviço de notificação configurado.");
      return;
    }
    sendReminderMutation.mutate({ patientId, method });
  };

  const handleCopyLink = async (patient: {
    id: number;
    name: string;
    phone: string | null;
  }) => {
    if (!patient.phone) {
      toast.error("Paciente não possui telefone cadastrado");
      return;
    }
    const phone = patient.phone.replace(/\D/g, "");
    const encodedPhone = btoa(phone);
    const baseUrl = window.location.origin;
    const fullLink = `${baseUrl}/tcle?p=${encodedPhone}`;
    const message = `Olá ${patient.name}! Você está agendado(a) para uma cirurgia com a equipe C.I.J. Por favor, preencha os questionários pré-operatórios acessando o link:\n\n${fullLink}\n\nO preenchimento leva cerca de 15-20 minutos. Obrigado!`;

    try {
      await navigator.clipboard.writeText(message);
      setCopiedLinkId(patient.id);
      toast.success(
        `Link copiado! Cole no WhatsApp para enviar a ${patient.name.split(" ")[0]}`
      );
      setTimeout(() => setCopiedLinkId(null), 3000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = message;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedLinkId(patient.id);
      toast.success(
        `Link copiado! Cole no WhatsApp para enviar a ${patient.name.split(" ")[0]}`
      );
      setTimeout(() => setCopiedLinkId(null), 3000);
    }
  };

  if (typeof document !== "undefined") {
    document.title = "C.I.J. - Cirurgia de Joelho";
  }

  const getNotificationBadge = () => {
    const methods = notificationStatus?.availableMethods ?? [];
    if (methods.length === 0) {
      return {
        color: "bg-red-500/10 text-red-500",
        text: "Notificações Não Configuradas",
        icon: Bell,
      };
    }
    if (methods.includes("email")) {
      return {
        color: "bg-green-500/10 text-green-500",
        text: `Email ${methods.includes("sms") ? "+ SMS" : ""} Ativo`,
        icon: Mail,
      };
    }
    if (methods.includes("sms")) {
      return {
        color: "bg-blue-500/10 text-blue-500",
        text: "SMS Ativo",
        icon: Smartphone,
      };
    }
    return {
      color: "bg-yellow-500/10 text-yellow-500",
      text: "WhatsApp Sandbox",
      icon: MessageCircle,
    };
  };

  const badge = getNotificationBadge();
  const BadgeIcon = badge.icon;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Pacientes</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerenciar e acompanhar pacientes do projeto C.I.J.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer hover:opacity-80 transition-opacity ${badge.color}`}
                >
                  <BadgeIcon className="h-4 w-4" />
                  <span>{badge.text}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Serviços de Notificação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-sm">
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
                    </span>
                    <span
                      className={
                        notificationStatus?.email?.configured
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {notificationStatus?.email?.configured
                        ? "✓ Ativo"
                        : "✗ Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" /> SMS
                    </span>
                    <span
                      className={
                        notificationStatus?.sms?.configured
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {notificationStatus?.sms?.configured
                        ? "✓ Ativo"
                        : "✗ Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </span>
                    <span
                      className={
                        notificationStatus?.usingSandbox
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {notificationStatus?.usingSandbox ? "⚠ Sandbox" : "✗ Inativo"}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Método recomendado:{" "}
                  <strong>
                    {notificationStatus?.recommendedMethod?.toUpperCase() ??
                      "Nenhum"}
                  </strong>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-5 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Cirurgias de Joelho Especializadas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Artroplastia, artroscopia e reconstrução de ligamentos em Juazeiro e
            Petrolina.
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : patients && patients.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Lista de Pacientes</h2>
                  <CardDescription>
                    Total de {patients.length} paciente(s) cadastrado(s)
                  </CardDescription>
                </div>
                {(notificationStatus?.availableMethods?.length ?? 0) > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={sendInviteMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Convites para Todos
                        <ChevronDown className="h-3 w-3 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Escolher Método</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          const patientsWithContact = patients.filter(
                            (p) => p.phone || p.email
                          );
                          if (patientsWithContact.length === 0) {
                            toast.error(
                              "Nenhum paciente possui contato cadastrado"
                            );
                            return;
                          }
                          toast.info(
                            `Enviando convites para ${patientsWithContact.length} pacientes...`
                          );
                          patientsWithContact.forEach((patient, index) => {
                            setTimeout(() => {
                              sendInviteMutation.mutate({
                                patientId: patient.id,
                                method: "auto",
                              });
                            }, index * 2000);
                          });
                        }}
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Automático (Recomendado)
                      </DropdownMenuItem>
                      {notificationStatus?.email?.configured && (
                        <DropdownMenuItem
                          onClick={() => {
                            const patientsWithEmail = patients.filter(
                              (p) => p.email
                            );
                            if (patientsWithEmail.length === 0) {
                              toast.error(
                                "Nenhum paciente possui email cadastrado"
                              );
                              return;
                            }
                            toast.info(
                              `Enviando emails para ${patientsWithEmail.length} pacientes...`
                            );
                            patientsWithEmail.forEach((patient, index) => {
                              setTimeout(() => {
                                sendInviteMutation.mutate({
                                  patientId: patient.id,
                                  method: "email",
                                });
                              }, index * 1000);
                            });
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Apenas Email
                        </DropdownMenuItem>
                      )}
                      {notificationStatus?.sms?.configured && (
                        <DropdownMenuItem
                          onClick={() => {
                            const patientsWithPhone = patients.filter(
                              (p) => p.phone
                            );
                            if (patientsWithPhone.length === 0) {
                              toast.error(
                                "Nenhum paciente possui telefone cadastrado"
                              );
                              return;
                            }
                            toast.info(
                              `Enviando SMS para ${patientsWithPhone.length} pacientes...`
                            );
                            patientsWithPhone.forEach((patient, index) => {
                              setTimeout(() => {
                                sendInviteMutation.mutate({
                                  patientId: patient.id,
                                  method: "sms",
                                });
                              }, index * 2000);
                            });
                          }}
                        >
                          <Smartphone className="h-4 w-4 mr-2" />
                          Apenas SMS
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Telefone
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Data Cirurgia
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Tipo Cirurgia
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {patients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">{patient.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {patient.phone ? (
                              <span className="text-primary">
                                ({patient.phone.slice(0, 2)}){" "}
                                {patient.phone.slice(2, 7)}-
                                {patient.phone.slice(7)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Não informado
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                setEditingPatient({
                                  id: patient.id,
                                  name: patient.name,
                                  phone: patient.phone || "",
                                  email: patient.email || "",
                                });
                                setEditPhone(
                                  patient.phone
                                    ? formatPhoneInput(patient.phone)
                                    : ""
                                );
                                setEditEmail(patient.email || "");
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(patient.surgeryDate)}
                        </td>
                        <td className="py-3 px-4">
                          {patient.surgeryType || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setLocation(`/pacientes/${patient.id}`)
                              }
                            >
                              Detalhes
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setLocation(`/pacientes/${patient.id}/scores`)
                              }
                              title="Ver Scores"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(patient)}
                              title="Copiar Link para WhatsApp"
                              className={
                                copiedLinkId === patient.id
                                  ? "text-green-500"
                                  : ""
                              }
                            >
                              {copiedLinkId === patient.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Link className="h-4 w-4" />
                              )}
                            </Button>
                            {(notificationStatus?.availableMethods?.length ??
                              0) > 0 && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={
                                      sendInviteMutation.isPending ||
                                      sendReminderMutation.isPending
                                    }
                                    title="Enviar Notificação"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>
                                    Enviar para{" "}
                                    {patient.name.split(" ")[0]}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSendInvite(patient.id, "auto")
                                    }
                                    disabled={
                                      !patient.phone && !patient.email
                                    }
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Convite Questionários
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSendReminder(patient.id, "auto")
                                    }
                                    disabled={
                                      !patient.surgeryDate ||
                                      (!patient.phone && !patient.email)
                                    }
                                  >
                                    <Bell className="h-4 w-4 mr-2" />
                                    Lembrete Cirurgia
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    Método específico
                                  </DropdownMenuLabel>
                                  {notificationStatus?.email?.configured &&
                                    patient.email && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSendInvite(
                                            patient.id,
                                            "email"
                                          )
                                        }
                                      >
                                        <Mail className="h-4 w-4 mr-2" />
                                        Via Email
                                      </DropdownMenuItem>
                                    )}
                                  {notificationStatus?.sms?.configured &&
                                    patient.phone && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleSendInvite(
                                            patient.id,
                                            "sms"
                                          )
                                        }
                                      >
                                        <Smartphone className="h-4 w-4 mr-2" />
                                        Via SMS
                                      </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-primary/10 p-4 mb-5">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Nenhum paciente cadastrado
              </h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Comece adicionando pacientes ao sistema para gerenciar cirurgias e questionários.
              </p>
              <Button onClick={() => setLocation("/pacientes/novo")} size="lg">
                Adicionar Paciente
              </Button>
            </CardContent>
          </Card>
        )}

        {patients && patients.length > 0 && (
          <ExportData patients={patients} />
        )}
      </div>

      <Dialog
        open={!!editingPatient}
        onOpenChange={(open) => !open && setEditingPatient(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
            <DialogDescription>
              Atualize os dados de contato de {editingPatient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={editPhone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={16}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Para editar o email, acesse os detalhes do paciente.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPatient(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePhone}
              disabled={updatePhoneMutation.isPending}
            >
              {updatePhoneMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
