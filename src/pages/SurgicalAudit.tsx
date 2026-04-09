import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import type { SurgicalAuditSummary } from "@/types/surgical-audit-summary";
import type { CijConsolidatedReport } from "@/types/cij-consolidated-report";
import auditSummary from "@/data/surgical-audit-summary.json";
import cijConsolidated from "@/data/cij-consolidated-report.json";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Info, Stethoscope } from "lucide-react";

const summary = auditSummary as SurgicalAuditSummary;
const cijReport = cijConsolidated as CijConsolidatedReport;

function entriesToChartData(
  rec: Record<string, number> | undefined,
  labelKey: string
) {
  if (!rec) return [];
  return Object.entries(rec).map(([name, value]) => ({
    [labelKey]: name.length > 42 ? `${name.slice(0, 40)}…` : name,
    value,
  }));
}

const MONTH_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const CHART_COLORS = [
  "#14b8a6",
  "#0369a1",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#22c55e",
  "#64748b",
];

export default function SurgicalAudit() {
  const years = summary.yearsAvailable;

  const surgeonYearRows = useMemo(() => {
    return years.map((y) => {
      const b = summary.byYear[y]?.bySurgeon ?? {};
      return {
        year: y,
        juarez: b["Dr. Juarez"]?.kneeSurgerySlots ?? 0,
        humberto: b["Dr. Humberto"]?.kneeSurgerySlots ?? 0,
        joao: b["Dr. João C."]?.kneeSurgerySlots ?? 0,
      };
    });
  }, [years]);

  const categoryStack = useMemo(() => {
    const keys = new Set<string>();
    years.forEach((y) => {
      Object.keys(summary.byYear[y]?.juarezKneeByCategory ?? {}).forEach((k) =>
        keys.add(k)
      );
    });
    const ordered = [...keys];
    return years.map((y) => {
      const row: Record<string, number | string> = { year: y };
      const cat = summary.byYear[y]?.juarezKneeByCategory ?? {};
      ordered.forEach((k) => {
        row[k] = cat[k] ?? 0;
      });
      return row;
    });
  }, [years]);

  const categoryKeys = useMemo(() => {
    const keys = new Set<string>();
    years.forEach((y) => {
      Object.keys(summary.byYear[y]?.juarezKneeByCategory ?? {}).forEach((k) =>
        keys.add(k)
      );
    });
    return [...keys];
  }, [years]);

  const latestYear = years[years.length - 1];
  const pieData = useMemo(() => {
    const cat = summary.byYear[latestYear]?.juarezKneeByCategory ?? {};
    return Object.entries(cat).map(([name, value]) => ({ name, value }));
  }, [latestYear]);

  const projection = summary.projection2026.juarezKneeSurgerySlots;

  const yearRangeLabel =
    years.length > 0
      ? `${years[0]}–${years[years.length - 1]}`
      : "—";

  const teamKneeSeries = useMemo(() => {
    const t = summary.series.teamKneeSlotsByYear;
    if (t?.length) {
      return t.map((r) => ({
        ano: String(r.year),
        juarez: r.juarez,
        humberto: r.humberto,
        joao: r.joao,
      }));
    }
    return years.map((y) => {
      const b = summary.byYear[y]?.bySurgeon ?? {};
      return {
        ano: y,
        juarez: b["Dr. Juarez"]?.kneeSurgerySlots ?? 0,
        humberto: b["Dr. Humberto"]?.kneeSurgerySlots ?? 0,
        joao: b["Dr. João C."]?.kneeSurgerySlots ?? 0,
      };
    });
  }, [summary.series.teamKneeSlotsByYear, summary.byYear, years]);

  const teamSurgSeries = useMemo(() => {
    const t = summary.series.teamSurgerySlotsByYear;
    if (t?.length) {
      return t.map((r) => ({
        ano: String(r.year),
        juarez: r.juarez,
        humberto: r.humberto,
        joao: r.joao,
      }));
    }
    return years.map((y) => {
      const b = summary.byYear[y]?.bySurgeon ?? {};
      return {
        ano: y,
        juarez: b["Dr. Juarez"]?.surgerySlots ?? 0,
        humberto: b["Dr. Humberto"]?.surgerySlots ?? 0,
        joao: b["Dr. João C."]?.surgerySlots ?? 0,
      };
    });
  }, [summary.series.teamSurgerySlotsByYear, summary.byYear, years]);

  const juarezLineData = useMemo(() => {
    const knee = summary.series.juarezKneeSurgeryCountByYear;
    const surg = summary.series.juarezSurgeryCountByYear;
    return knee.map((k) => ({
      year: String(k.year),
      joelho: k.count,
      total: surg.find((s) => s.year === k.year)?.count ?? 0,
    }));
  }, [summary.series]);

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-7 w-7 text-primary" aria-hidden />
            <h1 className="text-2xl font-semibold tracking-tight">
              Central de auditoria cirúrgica — C.I.J.
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Volume e perfil procedimental a partir das exportações de agenda
            (Pietra) e programação CIJ quando aplicável; série {yearRangeLabel}.
            Atualizado em{" "}
            <span className="text-foreground/90">
              {summary.extractedAt?.slice(0, 10) ?? "—"}
            </span>
            .
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Escopo técnico</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Este módulo roda no mesmo front-end do cadastro (Vite + React +
            shadcn/ui). Os totais são agregados sem nomes de pacientes no ficheiro{" "}
            <code className="text-xs">surgical-audit-summary.json</code>. Para
            reprocessar PDFs localmente:{" "}
            <code className="text-xs">npm run audit:extract</code>.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.series.juarezKneeSurgeryCountByYear.map((row) => (
            <Card key={row.year}>
              <CardHeader className="pb-2">
                <CardDescription>Joelho (Dr. Juarez) — {row.year}</CardDescription>
                <CardTitle className="text-3xl tabular-nums">
                  {row.count}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Cirurgias classificadas como joelho na extração automática.
              </CardContent>
            </Card>
          ))}
          <Card className="border-primary/30 bg-primary/5 sm:col-span-2 lg:col-span-4">
            <CardHeader className="pb-2">
              <CardDescription>Projeção 2026 — joelho (Dr. Juarez)</CardDescription>
              <CardTitle className="text-lg flex flex-wrap items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Cenários para planejamento
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Regressão linear (ano civil)
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {projection.linearOnCalendarYear}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extrapola a tendência ao longo dos anos disponíveis; sensível a
                  quedas recentes.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Média últimos 3 anos
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {projection.averageLast3Years}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cenário base conservador para OPME e ocupação de sala.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Faixa sugerida (±15%)
                </p>
                <p className="text-2xl font-semibold tabular-nums">
                  {projection.recommendedPlanningRange.low} —{" "}
                  {projection.recommendedPlanningRange.high}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {projection.methodsNote}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="series" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="series">Séries anuais</TabsTrigger>
            <TabsTrigger value="team">Equipe por ano</TabsTrigger>
            <TabsTrigger value="monthly">Sazonalidade</TabsTrigger>
            <TabsTrigger value="category">Perfil procedimental</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
            <TabsTrigger value="parcial2026">Parcial 2026 &amp; consolidado</TabsTrigger>
          </TabsList>

          <TabsContent value="series" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cirurgias de joelho vs. total cirúrgico (Juarez)</CardTitle>
                <CardDescription>
                  Comparativo entre todos os slots cirúrgicos e subconjunto joelho
                  (heurística por texto do agendamento).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={juarezLineData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="joelho"
                      name="Joelho (subconjunto)"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total cirúrgico (Juarez)"
                      stroke="#0369a1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução — joelho por membro da equipe</CardTitle>
                <CardDescription>
                  Cirurgias de joelho por titular da agenda (mesmas regras de
                  classificação). Inclui 2025 quando integrado pela programação
                  CIJ.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamKneeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="ano" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="juarez"
                      name="Dr. Juarez"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="humberto"
                      name="Dr. Humberto"
                      stroke="#0369a1"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="joao"
                      name="Dr. João C."
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo lado a lado — joelho (barras)</CardTitle>
                <CardDescription>
                  Mesmos dados da série anterior, em barras agrupadas por ano.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamKneeSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="ano" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="juarez" name="Dr. Juarez" fill="#14b8a6" />
                    <Bar dataKey="humberto" name="Dr. Humberto" fill="#0369a1" />
                    <Bar dataKey="joao" name="Dr. João C." fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total cirúrgico (todas as especialidades) por membro</CardTitle>
                <CardDescription>
                  Slots de cirurgia com classificação automática; inclui
                  ortopedia/trauma fora do joelho.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamSurgSeries}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="ano" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="juarez" name="Dr. Juarez" fill="#14b8a6" />
                    <Bar dataKey="humberto" name="Dr. Humberto" fill="#0369a1" />
                    <Bar dataKey="joao" name="Dr. João C." fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Composição do volume de joelho (empilhado)</CardTitle>
                <CardDescription>
                  Parte de cada membro no total de joelho por ano (soma = barra
                  completa).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={surgeonYearRows}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="juarez"
                      name="Dr. Juarez"
                      stackId="a"
                      fill="#14b8a6"
                    />
                    <Bar
                      dataKey="humberto"
                      name="Dr. Humberto"
                      stackId="a"
                      fill="#0369a1"
                    />
                    <Bar
                      dataKey="joao"
                      name="Dr. João C."
                      stackId="a"
                      fill="#f59e0b"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="mt-4 space-y-4">
            {years.map((y) => {
              const jm = summary.byYear[y]?.juarezKneeByMonth ?? {};
              const chartData = MONTH_PT.map((label, idx) => {
                const key = String(idx + 1).padStart(2, "0");
                return { mes: label, casos: jm[key] ?? 0 };
              });
              return (
                <Card key={y}>
                  <CardHeader>
                    <CardTitle>Sazonalidade — Dr. Juarez ({y})</CardTitle>
                    <CardDescription>
                      Cirurgias de joelho por mês (contagem da extração).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="mes" />
                        <YAxis allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid hsl(var(--border))",
                          }}
                        />
                        <Bar dataKey="casos" name="Casos" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="category" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mix procedimental (Joelho — Juarez)</CardTitle>
                <CardDescription>
                  Barras empilhadas por ano; classificação automática a partir do
                  texto (LCA, menisco, ATJ, etc.).
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStack}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                      }}
                    />
                    <Legend />
                    {categoryKeys.map((k, i) => (
                      <Bar
                        key={k}
                        dataKey={k}
                        stackId="c"
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                        name={k}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Último ano ({latestYear}) — distribuição</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] flex flex-col md:flex-row gap-6">
                <div className="flex-1 min-h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name.slice(0, 18)}${name.length > 18 ? "…" : ""} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <Separator className="md:hidden" />
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">n</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pieData.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell className="max-w-[220px]">{row.name}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {row.value}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parcial2026" className="mt-4 space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Parcial 2026 (agenda consolidada)</AlertTitle>
              <AlertDescription className="text-muted-foreground space-y-2">
                <p>
                  Dados extraídos do PDF{" "}
                  <code className="text-xs">
                    {cijReport.sourcePdfs?.parcial2026 ?? "parcial CIJ"}
                  </code>{" "}
                  (sem identificação de pacientes no JSON). Dimensões hospital /
                  fornecedor / técnica aplicam-se a este recorte;{" "}
                  <strong>anos anteriores</strong> continuam a vir da exportação
                  Pietra na aba Equipe.
                </p>
                {cijReport.consolidatedFinal?.note && (
                  <p className="text-xs">{cijReport.consolidatedFinal.note}</p>
                )}
              </AlertDescription>
            </Alert>

            {cijReport.parcial2026?.parseNote && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {cijReport.parcial2026.parseNote}
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cirurgias únicas (resumo PDF)</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {cijReport.parcial2026?.executiveSummary?.uniqueSurgeries ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Documento gerado em{" "}
                  {cijReport.parcial2026?.documentDate ?? "—"}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Linhas com data 2026 (parser)</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">
                    {cijReport.parcial2026?.parsedRowCount ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  Última data na lista:{" "}
                  {cijReport.parcial2026?.projectionEnd2026?.lastCaseDateInFile ??
                    "—"}
                </CardContent>
              </Card>
              <Card className="border-primary/30 bg-primary/5 sm:col-span-2">
                <CardHeader className="pb-2">
                  <CardDescription>
                    Projeção fim de ano 2026 (joelho / equipe — ordem de grandeza)
                  </CardDescription>
                  <CardTitle className="text-2xl tabular-nums">
                    {cijReport.parcial2026?.projectionEnd2026?.recommendedRange
                      ?.low ?? "—"}{" "}
                    —{" "}
                    {cijReport.parcial2026?.projectionEnd2026?.recommendedRange
                      ?.high ?? "—"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>
                    Densidade na janela Jan–mai:{" "}
                    <strong>
                      {cijReport.parcial2026?.projectionEnd2026?.methods?.densityExtrapolation?.projectedTotalYearEnd?.toString() ??
                        "—"}
                    </strong>{" "}
                    casos (extrapolação); referência 2025:{" "}
                    <strong>
                      {cijReport.parcial2026?.projectionEnd2026?.methods?.historicalBaseline2025TeamKnee?.projected2026SimilarOrder?.toString() ??
                        "—"}
                    </strong>{" "}
                    (ordem similar +2% ilustrativo).
                  </p>
                  <p>
                    Snapshot:{" "}
                    {cijReport.parcial2026?.projectionEnd2026?.snapshotDate ?? "—"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Por hospital (parcial 2026)</CardTitle>
                  <CardDescription>
                    Contagem agregada do parser (detalhe) vs. resumo executivo
                    quando disponível.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={entriesToChartData(
                        cijReport.parcial2026?.aggregates?.byHospital,
                        "hospital"
                      )}
                      layout="vertical"
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="hospital"
                        width={140}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#14b8a6" name="n" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Por médico (parcial 2026)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={entriesToChartData(
                        cijReport.parcial2026?.aggregates?.byDoctor,
                        "medico"
                      )}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="medico" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0369a1" name="n" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Fornecedor OPME (parcial 2026)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={entriesToChartData(
                        cijReport.parcial2026?.aggregates?.bySupplier,
                        "forn"
                      )}
                      layout="vertical"
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="forn"
                        width={120}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Técnica / grupo (parcial 2026)</CardTitle>
                  <CardDescription>
                    Classificação automática a partir do texto do procedimento.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={entriesToChartData(
                        cijReport.parcial2026?.aggregates?.byTechnique,
                        "tec"
                      )}
                      layout="vertical"
                      margin={{ left: 8, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="tec"
                        width={140}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lado (parcial 2026)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lado</TableHead>
                      <TableHead className="text-right">n</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(
                      cijReport.parcial2026?.aggregates?.bySide ?? {}
                    ).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell>{k}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {v}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico consolidado (joelho — equipe)</CardTitle>
                <CardDescription>
                  2021–2025 a partir do Pietra; 2026 não inclui série completa
                  neste gráfico.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={
                      cijReport.consolidatedFinal?.teamKneeByYear?.map((r) => ({
                        ano: String(r.year),
                        juarez: r.juarez,
                        humberto: r.humberto,
                        joao: r.joao,
                        total: r.juarez + r.humberto + r.joao,
                      })) ?? []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="ano" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="juarez"
                      name="Dr. Juarez"
                      stroke="#14b8a6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="humberto"
                      name="Dr. Humberto"
                      stroke="#0369a1"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="joao"
                      name="Dr. João C."
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total equipe"
                      stroke="#a855f7"
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sugestões para aprovação da equipe</CardTitle>
                <CardDescription>
                  Pontos derivados da análise quantitativa; exigem validação
                  clínica e administrativa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.suggestionsForApproval.map((s, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg border bg-card/50 p-3 text-sm"
                  >
                    <Badge variant="secondary" className="shrink-0 h-6">
                      {i + 1}
                    </Badge>
                    <p className="text-muted-foreground leading-relaxed">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            {summary.cijDocumentsMeta.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Documento complementar (programação CIJ)</CardTitle>
                  <CardDescription>
                    Metadados do PDF de programação CIJ analisado nesta extração.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {summary.cijDocumentsMeta.map((d) => (
                      <li key={d.file}>
                        <span className="text-foreground font-medium">
                          {d.eventCount}
                        </span>{" "}
                        eventos com agenda resolvida — ficheiro: {d.file}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
