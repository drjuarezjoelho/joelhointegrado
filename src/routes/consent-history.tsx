import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, ChevronLeft, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ConsentRecord {
  id: number;
  patientId: number;
  tcleVersion: string;
  consentType: string;
  consentText: string;
  isAccepted: number;
  acceptedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  isRevoked: number;
  revokedAt: Date | null;
  revocationReason: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

const consentTypeLabels: Record<string, string> = {
  surgery: "Consentimento Cirúrgico",
  data_collection: "Coleta de Dados",
  research_use: "Uso em Pesquisa",
  lgpd_compliance: "Conformidade LGPD",
  tcle_public: "TCLE (Cadastro Público)",
};

const consentTypeDescriptions: Record<string, string> = {
  surgery: "Consentimento para procedimento cirúrgico",
  data_collection: "Consentimento para coleta e armazenamento de dados",
  research_use: "Consentimento para uso em pesquisa científica",
  lgpd_compliance: "Consentimento de conformidade com LGPD",
  tcle_public: "Termo de Consentimento Livre e Esclarecido (cadastro público)",
};

export default function ConsentHistoryPage() {
  const [, params] = useRoute("/consent-history/:patientId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const patientId = parseInt(params?.patientId ?? "0", 10);

  const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(null);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [revokeLoading, setRevokeLoading] = useState(false);

  const patientQuery = trpc.patients.getById.useQuery(
    { patientId },
    { enabled: patientId > 0 }
  );
  const consentsQuery = trpc.patients.getAllConsents.useQuery(
    { patientId },
    { enabled: patientId > 0 }
  );
  const revokeMutation = trpc.patients.revokeConsent.useMutation();

  useEffect(() => {
    if (patientQuery.data && patientQuery.data.userId !== user?.id) {
      setLocation("/");
    }
  }, [patientQuery.data, user?.id, setLocation]);

  const handleRevokeClick = (consent: ConsentRecord) => {
    setSelectedConsent(consent);
    setShowRevokeDialog(true);
    setRevocationReason("");
  };

  const handleConfirmRevoke = async () => {
    if (!selectedConsent || !revocationReason.trim()) return;

    setRevokeLoading(true);
    try {
      await revokeMutation.mutateAsync({
        consentId: selectedConsent.id,
        patientId,
        revocationReason: revocationReason.trim(),
      });
      setShowRevokeDialog(false);
      setRevocationReason("");
      setSelectedConsent(null);
      await consentsQuery.refetch();
    } catch (error) {
      console.error("Erro ao revogar consentimento:", error);
    } finally {
      setRevokeLoading(false);
    }
  };

  if (patientQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!patientQuery.data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Paciente não encontrado</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setLocation("/")}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const patient = patientQuery.data;
  const consents = (consentsQuery.data ?? []) as ConsentRecord[];
  const activeConsents = consents.filter((c) => c.isRevoked === 0);
  const revokedConsents = consents.filter((c) => c.isRevoked === 1);

  const getLabel = (type: string) =>
    consentTypeLabels[type] ?? type;
  const getDesc = (type: string) =>
    consentTypeDescriptions[type] ?? "Consentimento registrado.";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation(`/pacientes/${patientId}`)}
            className="mb-4 text-primary hover:text-primary/90"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Histórico de Consentimentos
            </h1>
            <p className="text-muted-foreground">
              Paciente: <span className="text-primary font-semibold">{patient.name}</span>
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Visualize e gerencie todos os consentimentos (TCLE) de acordo com a LGPD.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <span className="h-2 w-2 bg-green-500 rounded-full mr-3" />
            Consentimentos Ativos ({activeConsents.length})
          </h2>

          {activeConsents.length === 0 ? (
            <div className="bg-card border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">Nenhum consentimento ativo</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {activeConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getLabel(consent.consentType)}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {getDesc(consent.consentType)}
                      </p>
                    </div>
                    <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold">
                      Ativo
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Versão TCLE</p>
                      <p className="font-semibold">{consent.tcleVersion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data de Aceite</p>
                      <p className="font-semibold">
                        {consent.acceptedAt
                          ? format(new Date(consent.acceptedAt), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          : "Não aceito"}
                      </p>
                    </div>
                    {consent.ipAddress && (
                      <div>
                        <p className="text-muted-foreground">IP de Aceite</p>
                        <p className="font-semibold text-xs">{consent.ipAddress}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedConsent(consent)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeClick(consent)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Revogar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {revokedConsents.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="h-2 w-2 bg-red-500 rounded-full mr-3" />
              Consentimentos Revogados ({revokedConsents.length})
            </h2>

            <div className="grid gap-4">
              {revokedConsents.map((consent) => (
                <div
                  key={consent.id}
                  className="bg-card border border-red-500/20 rounded-lg p-6 opacity-90"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {getLabel(consent.consentType)}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {getDesc(consent.consentType)}
                      </p>
                    </div>
                    <span className="bg-red-500/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-xs font-semibold">
                      Revogado
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Versão TCLE</p>
                      <p className="font-semibold">{consent.tcleVersion}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Data de Revogação</p>
                      <p className="font-semibold">
                        {consent.revokedAt
                          ? format(new Date(consent.revokedAt), "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {consent.revocationReason && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-sm">
                      <p className="text-muted-foreground mb-1">Motivo da Revogação:</p>
                      <p className="text-foreground">{consent.revocationReason}</p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedConsent(consent)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            Direitos LGPD - Lei nº 13.709/2018
          </h3>
          <ul className="text-muted-foreground text-sm space-y-2">
            <li><strong className="text-foreground">Direito de Acesso:</strong> Solicitar acesso a todos os dados pessoais coletados.</li>
            <li><strong className="text-foreground">Direito de Correção:</strong> Solicitar correção de dados imprecisos ou incompletos.</li>
            <li><strong className="text-foreground">Direito ao Esquecimento:</strong> Solicitar exclusão dos dados pessoais.</li>
            <li><strong className="text-foreground">Direito de Revogação:</strong> Revogar o consentimento a qualquer momento.</li>
            <li><strong className="text-foreground">Portabilidade de Dados:</strong> Solicitar os dados em formato estruturado e portável.</li>
          </ul>
        </div>
      </div>

      <Dialog open={!!selectedConsent && !showRevokeDialog} onOpenChange={() => setSelectedConsent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedConsent && getLabel(selectedConsent.consentType)}
            </DialogTitle>
            <DialogDescription>
              Detalhes completos do consentimento
            </DialogDescription>
          </DialogHeader>

          {selectedConsent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-semibold">
                    {selectedConsent.isRevoked === 0 ? "Ativo" : "Revogado"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Versão TCLE</p>
                  <p className="font-semibold">{selectedConsent.tcleVersion}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Data de Aceite</p>
                  <p className="font-semibold">
                    {selectedConsent.acceptedAt
                      ? format(new Date(selectedConsent.acceptedAt), "dd/MM/yyyy HH:mm")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">IP de Aceite</p>
                  <p className="font-semibold text-xs">{selectedConsent.ipAddress || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-sm mb-2">Texto do Consentimento</p>
                <div className="bg-muted rounded p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedConsent.consentText}
                  </p>
                </div>
              </div>

              {selectedConsent.isRevoked === 1 && selectedConsent.revocationReason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
                  <p className="text-muted-foreground text-sm mb-2">Motivo da Revogação</p>
                  <p>{selectedConsent.revocationReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revogar Consentimento</DialogTitle>
            <DialogDescription>
              Você está revogando o consentimento para{" "}
              <strong>{selectedConsent && getLabel(selectedConsent.consentType)}</strong>.
              Esta ação é irreversível e será registrada para fins de auditoria LGPD.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded p-4">
              <p className="text-destructive text-sm">
                Ao revogar este consentimento, você está exercendo seu direito garantido pela
                Lei nº 13.709/2018 (LGPD). Os dados coletados anteriormente permanecerão
                armazenados de forma segura conforme a lei.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Motivo da Revogação (obrigatório)
              </label>
              <Textarea
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="Explique o motivo da revogação do consentimento..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmRevoke}
                disabled={!revocationReason.trim() || revokeLoading}
              >
                {revokeLoading ? "Revogando..." : "Confirmar Revogação"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
