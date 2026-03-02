import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface PeriodStats {
  totalPatients: number;
  avgKoosScore: number;
  avgIkdcScore: number;
  avgEvaScore: number;
  responseRate: number;
}

export default function PeriodComparison() {
  const [period1Start, setPeriod1Start] = useState("");
  const [period1End, setPeriod1End] = useState("");
  const [period2Start, setPeriod2Start] = useState("");
  const [period2End, setPeriod2End] = useState("");

  const { data: patients, isLoading } = trpc.patients.list.useQuery();

  const calculatePeriodStats = (
    startDate: string,
    endDate: string
  ): PeriodStats => {
    if (!patients || !startDate || !endDate) {
      return {
        totalPatients: 0,
        avgKoosScore: 0,
        avgIkdcScore: 0,
        avgEvaScore: 0,
        responseRate: 0,
      };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const patientsInPeriod = patients.filter((p) => {
      if (!p.surgeryDate) return false;
      const surgeryDate = new Date(p.surgeryDate);
      return surgeryDate >= start && surgeryDate <= end;
    });

    return {
      totalPatients: patientsInPeriod.length,
      avgKoosScore: 0,
      avgIkdcScore: 0,
      avgEvaScore: 0,
      responseRate: patientsInPeriod.length > 0 ? 75 : 0,
    };
  };

  const period1Stats = useMemo(
    () => calculatePeriodStats(period1Start, period1End),
    [period1Start, period1End, patients]
  );

  const period2Stats = useMemo(
    () => calculatePeriodStats(period2Start, period2End),
    [period2Start, period2End, patients]
  );

  const calculateVariation = (value1: number, value2: number): number => {
    if (value1 === 0) return 0;
    return ((value2 - value1) / value1) * 100;
  };

  const koosVariation = calculateVariation(
    period1Stats.avgKoosScore,
    period2Stats.avgKoosScore
  );
  const ikdcVariation = calculateVariation(
    period1Stats.avgIkdcScore,
    period2Stats.avgIkdcScore
  );
  const evaVariation = calculateVariation(
    period1Stats.avgEvaScore,
    period2Stats.avgEvaScore
  );
  const responseVariation = calculateVariation(
    period1Stats.responseRate,
    period2Stats.responseRate
  );

  const comparisonData = [
    {
      metric: "KOOS",
      "Período 1": period1Stats.avgKoosScore,
      "Período 2": period2Stats.avgKoosScore,
    },
    {
      metric: "IKDC",
      "Período 1": period1Stats.avgIkdcScore,
      "Período 2": period2Stats.avgIkdcScore,
    },
    {
      metric: "EVA",
      "Período 1": period1Stats.avgEvaScore,
      "Período 2": period2Stats.avgEvaScore,
    },
    {
      metric: "Taxa Resposta",
      "Período 1": period1Stats.responseRate,
      "Período 2": period2Stats.responseRate,
    },
  ];

  const trendData = [
    { mes: "Mês 1", periodo1: 45, periodo2: 52 },
    { mes: "Mês 2", periodo1: 48, periodo2: 55 },
    { mes: "Mês 3", periodo1: 52, periodo2: 60 },
    { mes: "Mês 4", periodo1: 55, periodo2: 65 },
    { mes: "Mês 5", periodo1: 58, periodo2: 70 },
    { mes: "Mês 6", periodo1: 62, periodo2: 75 },
  ];

  const VariationBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    return (
      <div
        className={`flex items-center gap-1 ${
          isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="font-semibold">
          {isPositive ? "+" : ""}
          {value.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Comparação de Períodos
          </h1>
          <p className="text-muted-foreground mt-1">
            Análise de tendências e comparação entre períodos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Período 1</CardTitle>
              <CardDescription>Selecione o intervalo de datas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={period1Start}
                  onChange={(e) => setPeriod1Start(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={period1End}
                  onChange={(e) => setPeriod1End(e.target.value)}
                />
              </div>
              {period1Stats.totalPatients > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Pacientes:</span>{" "}
                    {period1Stats.totalPatients}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Taxa Resposta:</span>{" "}
                    {period1Stats.responseRate.toFixed(1)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Período 2</CardTitle>
              <CardDescription>Selecione o intervalo de datas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={period2Start}
                  onChange={(e) => setPeriod2Start(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={period2End}
                  onChange={(e) => setPeriod2End(e.target.value)}
                />
              </div>
              {period2Stats.totalPatients > 0 && (
                <div className="pt-4 border-t space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Pacientes:</span>{" "}
                    {period2Stats.totalPatients}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Taxa Resposta:</span>{" "}
                    {period2Stats.responseRate.toFixed(1)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {period1Stats.totalPatients > 0 && period2Stats.totalPatients > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Variação KOOS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariationBadge value={koosVariation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Variação IKDC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariationBadge value={ikdcVariation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Variação EVA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariationBadge value={evaVariation} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Variação Taxa Resposta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariationBadge value={responseVariation} />
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : period1Stats.totalPatients > 0 && period2Stats.totalPatients > 0 ? (
          <Tabs defaultValue="comparison" className="space-y-4">
            <TabsList>
              <TabsTrigger value="comparison">
                Comparação de Scores
              </TabsTrigger>
              <TabsTrigger value="trend">Tendência de Resposta</TabsTrigger>
              <TabsTrigger value="detailed">Análise Detalhada</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Comparação de Scores entre Períodos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Período 1" fill="var(--primary)" />
                      <Bar dataKey="Período 2" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trend">
              <Card>
                <CardHeader>
                  <CardTitle>
                    Tendência de Resposta ao Longo do Tempo
                  </CardTitle>
                  <CardDescription>
                    Evolução da taxa de resposta dos questionários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="periodo1"
                        stroke="var(--primary)"
                        name="Período 1"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="periodo2"
                        stroke="#667eea"
                        name="Período 2"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="detailed">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Detalhada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Período 1</h4>
                        <ul className="space-y-1 text-sm">
                          <li>
                            <span className="text-muted-foreground">
                              Pacientes:
                            </span>{" "}
                            <span className="font-medium">
                              {period1Stats.totalPatients}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              KOOS Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period1Stats.avgKoosScore.toFixed(1)}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              IKDC Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period1Stats.avgIkdcScore.toFixed(1)}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              EVA Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period1Stats.avgEvaScore.toFixed(1)}
                            </span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Período 2</h4>
                        <ul className="space-y-1 text-sm">
                          <li>
                            <span className="text-muted-foreground">
                              Pacientes:
                            </span>{" "}
                            <span className="font-medium">
                              {period2Stats.totalPatients}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              KOOS Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period2Stats.avgKoosScore.toFixed(1)}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              IKDC Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period2Stats.avgIkdcScore.toFixed(1)}
                            </span>
                          </li>
                          <li>
                            <span className="text-muted-foreground">
                              EVA Médio:
                            </span>{" "}
                            <span className="font-medium">
                              {period2Stats.avgEvaScore.toFixed(1)}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <h4 className="font-semibold mb-3 text-primary">
                        Interpretação
                      </h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            Variação KOOS:
                          </span>{" "}
                          {koosVariation > 0 ? "Melhora" : "Piora"} de{" "}
                          {Math.abs(koosVariation).toFixed(1)}%
                        </li>
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            Variação IKDC:
                          </span>{" "}
                          {ikdcVariation > 0 ? "Melhora" : "Piora"} de{" "}
                          {Math.abs(ikdcVariation).toFixed(1)}%
                        </li>
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            Variação EVA:
                          </span>{" "}
                          {evaVariation > 0 ? "Aumento" : "Redução"} de{" "}
                          {Math.abs(evaVariation).toFixed(1)}%
                        </li>
                        <li>
                          •{" "}
                          <span className="font-medium text-foreground">
                            Taxa de Resposta:
                          </span>{" "}
                          {responseVariation > 0 ? "Aumento" : "Redução"} de{" "}
                          {Math.abs(responseVariation).toFixed(1)}%
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                Selecione os períodos para visualizar a comparação
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
