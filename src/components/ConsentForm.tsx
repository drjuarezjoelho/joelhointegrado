import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const TCLE_CONTENT = `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
CADASTRO DE CIRURGIAS ELETIVAS - EQUIPE C.I.J. (CENTRO INTEGRADO DE JOELHO)
JUAZEIRO/PETROLINA - DEZEMBRO/2025

1. INFORMAÇÕES SOBRE A PESQUISA E PROCEDIMENTOS

Você está sendo convidado a participar de um estudo de pesquisa clínica conduzido pela Equipe C.I.J. (Centro Integrado de Joelho), que visa coletar e analisar dados sobre procedimentos cirúrgicos eletivos relacionados ao joelho, incluindo artroplastia total, artroscopia, transferência de tendão e osteotomia.

O objetivo deste estudo é otimizar tratamentos futuros, avançar a pesquisa em ortopedia e aprimorar as técnicas cirúrgicas através da coleta sistemática de dados clínicos e funcionais.

2. PROCEDIMENTOS CIRÚRGICOS

Os procedimentos cirúrgicos propostos podem incluir:
- Artroplastia Total de Joelho (ATJ)
- Artroscopia de Joelho (meniscos, cartilagem)
- Transferência de Tendão
- Osteotomia do Joelho

Cada procedimento será realizado sob anestesia apropriada e seguirá os protocolos padrão de segurança cirúrgica.

3. RISCOS GERAIS DE QUALQUER PROCEDIMENTO CIRÚRGICO

Como em qualquer procedimento cirúrgico, existem riscos associados, incluindo:
- Sangramento
- Infecção
- Reação adversa à anestesia
- Coágulos de sangue (trombose)
- Complicações respiratórias
- Lesão de estruturas vizinhas

4. RISCOS ESPECÍFICOS POR TIPO DE CIRURGIA

Artroplastia Total de Joelho (ATJ):
- Infecção profunda (pode exigir remoção da prótese)
- Falha do implante ou afrouxamento
- Instabilidade da prótese
- Fratura periprotética
- Rigidez ou limitação de movimento
- Dor neuropática persistente
- Necessidade de revisão cirúrgica

Artroscopia de Joelho:
- Lesão iatrogênica à cartilagem ou meniscos
- Infecção nas pequenas incisões
- Rigidez pós-operatória
- Persistência de sintomas
- Sangramento intra-articular
- Possível necessidade de artroplastia futura

Transferência de Tendão:
- Insuficiência do tendão transferido
- Infecção no local da cirurgia
- Lesão nervosa ou vascular
- Rigidez articular
- Dor persistente na região de onde o tendão foi retirado

Osteotomia do Joelho:
- Não-união ou má-união óssea
- Infecção no sítio ósseo
- Lesão nervosa (nervo fibular)
- Rigidez ou perda de movimento
- Piora da dor
- Complicações do hardware (parafusos, placas)
- Possível necessidade de prótese total no futuro

5. BENEFÍCIOS ESPERADOS

Os benefícios esperados incluem:
- Alívio da dor
- Melhoria significativa da mobilidade e função do joelho
- Aumento da qualidade de vida
- Retorno seguro às atividades diárias e/ou esportivas
- Contribuição para otimizar tratamentos futuros e avançar a pesquisa em ortopedia

6. COLETA E USO DE DADOS

Você autoriza a coleta dos seguintes dados:
- Dados demográficos (idade, sexo, contato)
- Histórico clínico e cirúrgico
- Resultados de questionários de avaliação funcional (KOOS, IKDC)
- Escala Visual Analógica de dor (EVA)
- Dados de acompanhamento pós-operatório em marcos temporais (30, 60, 90 dias)

Estes dados serão utilizados para:
- Análise clínica e pesquisa acadêmica
- Publicação em periódicos científicos
- Apresentação em congressos e eventos científicos
- Melhoria contínua dos protocolos cirúrgicos

7. CONFORMIDADE COM A LEI GERAL DE PROTEÇÃO DE DADOS PESSOAIS (LGPD)

Conforme a Lei nº 13.709/2018 (LGPD), você tem direito a:
- Acessar seus dados pessoais
- Corrigir dados incompletos ou inexatos
- Solicitar a exclusão de seus dados (direito ao esquecimento)
- Revogar este consentimento a qualquer momento
- Receber informações sobre como seus dados são utilizados

Seus dados serão armazenados de forma segura e confidencial, acessíveis apenas pela Equipe C.I.J. e pesquisadores autorizados. Os dados serão mantidos pelo período necessário para a pesquisa e conforme exigido pela legislação.

8. CONFIDENCIALIDADE E PRIVACIDADE

Sua privacidade será protegida. Todos os dados coletados serão identificados por número de registro, não por nome, em qualquer publicação ou apresentação pública. Apenas a Equipe C.I.J. terá acesso aos dados que o identificam pessoalmente.

9. DIREITO DE RECUSA E RETIRADA

Sua participação é completamente voluntária. Você pode:
- Recusar-se a participar sem qualquer penalidade
- Retirar seu consentimento a qualquer momento
- Solicitar a exclusão de seus dados
- Continuar recebendo cuidados médicos mesmo se recusar ou se retirar

10. DÚVIDAS E ESCLARECIMENTOS

Você teve a oportunidade de fazer todas as perguntas que considerou pertinentes sobre:
- O cadastro e coleta de dados
- Os procedimentos cirúrgicos propostos
- Os riscos e benefícios envolvidos
- Seus direitos conforme a LGPD

Todas as suas dúvidas foram respondidas de forma clara, completa e satisfatória.

11. DECLARAÇÃO DE CONSENTIMENTO

Eu declaro que:
- Li e compreendi integralmente este termo
- Tive a oportunidade de fazer perguntas e todas foram respondidas
- Concordo livre e voluntariamente com todos os termos
- Autorizo o armazenamento e uso de meus dados pessoais e sensíveis
- Estou ciente dos riscos e benefícios associados
- Consinto com a realização dos procedimentos cirúrgicos propostos

12. CONTATO PARA DÚVIDAS

Para dúvidas ou informações adicionais sobre este estudo, entre em contato com a Equipe C.I.J. através dos canais fornecidos no cadastro.

Este documento está em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD, Lei nº 13.709/2018) e com as normas éticas de pesquisa clínica.`;

interface ConsentFormProps {
  patientId: number;
  patientName: string;
  onConsentAccepted?: () => void;
}

export default function ConsentForm({
  patientId,
  patientName,
  onConsentAccepted,
}: ConsentFormProps) {
  const [, setLocation] = useLocation();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const createConsentMutation = trpc.patients.createConsent.useMutation({
    onSuccess: () => {
      toast.success("Consentimento registrado com sucesso!");
      if (onConsentAccepted) {
        onConsentAccepted();
      } else {
        setLocation(`/pacientes/${patientId}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao registrar consentimento: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrollHeight = element.scrollHeight - element.clientHeight;
    const progress = scrollHeight > 0 ? (element.scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(progress);
    const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 10;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleAccept = async () => {
    if (!hasScrolledToBottom || !hasAccepted) {
      toast.error(
        "Por favor, leia o termo completo e marque a caixa de concordância"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createConsentMutation.mutateAsync({
        patientId,
        consentType: "surgery",
        consentText:
          "TCLE v1.0 - Termo de Consentimento Livre e Esclarecido para Cirurgias do Joelho - C.I.J.",
        isAccepted: 1,
      });
    } catch (error) {
      console.error("Erro ao aceitar consentimento:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="text-2xl">
            Termo de Consentimento Livre e Esclarecido
          </CardTitle>
          <CardDescription className="text-primary-foreground/90 mt-2">
            Centro Integrado de Joelho (C.I.J.) - Juazeiro/Petrolina
          </CardDescription>
          <p className="text-sm mt-3 text-primary-foreground/95">
            <strong>Paciente:</strong> {patientName}
          </p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <Alert className="bg-primary/10 border-primary/30">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground ml-2">
              Você deve ler este termo completamente antes de aceitar. O botão
              de concordância só será ativado após você chegar ao final do
              documento.
            </AlertDescription>
          </Alert>

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="bg-muted/50 border border-border rounded-lg p-6 h-96 overflow-y-auto space-y-4 text-sm text-foreground leading-relaxed"
          >
            {TCLE_CONTENT.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {hasScrolledToBottom ? (
                  <span className="flex items-center gap-2 text-green-600 font-medium dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Você leu o termo completo
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium dark:text-amber-400">
                    Role até o final para continuar
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  hasScrolledToBottom ? "bg-green-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.min(100, scrollProgress)}%` }}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <Checkbox
              id="consent-checkbox"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked === true)}
              disabled={!hasScrolledToBottom}
              className="mt-1"
            />
            <label
              htmlFor="consent-checkbox"
              className={`text-sm leading-relaxed cursor-pointer ${
                hasScrolledToBottom ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              Eu li e compreendi integralmente este Termo de Consentimento Livre
              e Esclarecido. Autorizo o armazenamento e uso de meus dados
              pessoais e sensíveis pela Equipe C.I.J. para as finalidades
              descritas, em conformidade com a Lei Geral de Proteção de Dados
              Pessoais (LGPD). Estou ciente dos riscos e benefícios associados
              aos procedimentos cirúrgicos e consinto com a realização dos
              mesmos.
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation(`/pacientes/${patientId}`)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleAccept}
              disabled={!hasScrolledToBottom || !hasAccepted || isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Concordo e Aceito"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground border-t pt-4">
            <p className="font-semibold mb-2 text-foreground">
              Conformidade LGPD (Lei nº 13.709/2018):
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                Você pode acessar, corrigir ou solicitar a exclusão de seus
                dados a qualquer momento
              </li>
              <li>Pode revogar este consentimento sem penalidades</li>
              <li>
                Seus dados serão protegidos conforme a legislação de proteção
                de dados
              </li>
              <li>
                Apenas a Equipe C.I.J. terá acesso aos dados que o identificam
                pessoalmente
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
