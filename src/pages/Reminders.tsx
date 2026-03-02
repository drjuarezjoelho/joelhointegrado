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
import { trpc } from "@/lib/trpc";
import {
  Loader2,
  Bell,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reminders() {
  useAuth();
  const {
    data: remindersStatus,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = trpc.patients.getRemindersStatus.useQuery();
  const {
    data: allReminders,
    isLoading: remindersLoading,
    refetch: refetchReminders,
  } = trpc.patients.getAllReminders.useQuery();
  const { data: whatsappStatus } = trpc.patients.checkWhatsAppStatus.useQuery();

  const createAllRemindersMutation =
    trpc.patients.createAllReminders.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        refetchStatus();
        refetchReminders();
      },
      onError: (error: { message?: string }) => {
        toast.error(error.message ?? "Erro ao criar lembretes");
      },
    });

  const processRemindersMutation =
    trpc.patients.processReminders.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        refetchStatus();
        refetchReminders();
      },
      onError: (error: { message?: string }) => {
        toast.error(error.message ?? "Erro ao processar");
      },
    });

  const cancelReminderMutation = trpc.patients.cancelReminder.useMutation({
    onSuccess: () => {
      toast.success("Lembrete cancelado");
      refetchStatus();
      refetchReminders();
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message ?? "Erro ao cancelar");
    },
  });

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "7_days_before":
        return "7 dias antes";
      case "1_day_before":
        return "1 dia antes";
      case "questionnaire_reminder":
        return "Lembrete questionário";
      case "post_operative_followup":
        return "Pós-operatório";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        );
      case "sent":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 border-green-500/30"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Enviado
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-500/30"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Falhou
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-border"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Lembretes Automáticos
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerenciar lembretes de cirurgia via WhatsApp
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              whatsappStatus?.configured
                ? "bg-green-500/10 text-green-600"
                : "bg-yellow-500/10 text-yellow-600"
            }`}
          >
            <Send className="h-4 w-4" />
            <span>
              {whatsappStatus?.configured
                ? "WhatsApp Ativo"
                : "WhatsApp Não Configurado"}
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {remindersStatus?.total ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {remindersStatus?.pending ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">
                Enviados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {remindersStatus?.sent ?? 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">
                Falhas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {remindersStatus?.failed ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ações</CardTitle>
            <CardDescription>
              Criar e processar lembretes automáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => createAllRemindersMutation.mutate()}
              disabled={createAllRemindersMutation.isPending}
            >
              {createAllRemindersMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Criar Lembretes para Todos
            </Button>

            <Button
              onClick={() => processRemindersMutation.mutate()}
              disabled={
                processRemindersMutation.isPending || !whatsappStatus?.configured
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {processRemindersMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Enviar Lembretes Pendentes
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                refetchStatus();
                refetchReminders();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lembretes Agendados</CardTitle>
            <CardDescription>
              Lista de todos os lembretes de cirurgia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {remindersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : allReminders && allReminders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Agendado Para</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Enviado Em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allReminders.map(({ reminder, patient }) => (
                    <TableRow key={reminder.id}>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>
                        {getReminderTypeLabel(reminder.reminderType)}
                      </TableCell>
                      <TableCell>
                        {formatDate(reminder.scheduledFor)}
                      </TableCell>
                      <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                      <TableCell>
                        {reminder.sentAt
                          ? formatDate(reminder.sentAt)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {reminder.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              cancelReminderMutation.mutate({
                                reminderId: reminder.id,
                              })
                            }
                            disabled={cancelReminderMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {reminder.status === "failed" &&
                          reminder.failureReason && (
                            <span
                              className="text-xs text-red-600"
                              title={reminder.failureReason}
                            >
                              {reminder.failureReason.substring(0, 30)}...
                            </span>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lembrete agendado.</p>
                <p className="text-sm mt-2">
                  Clique em &quot;Criar Lembretes para Todos&quot; para
                  agendar lembretes automáticos.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Lembretes Automáticos</h3>
                <p className="text-sm text-muted-foreground">
                  O sistema cria automaticamente lembretes para 7 dias e 1 dia
                  antes da cirurgia de cada paciente.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-500/10 p-2 rounded-full">
                <Send className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold">Envio via WhatsApp</h3>
                <p className="text-sm text-muted-foreground">
                  Os lembretes são enviados automaticamente via WhatsApp usando
                  a integração Twilio.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-yellow-500/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold">Processamento</h3>
                <p className="text-sm text-muted-foreground">
                  Clique em &quot;Enviar Lembretes Pendentes&quot; para processar
                  e enviar todos os lembretes que já passaram da data agendada.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
