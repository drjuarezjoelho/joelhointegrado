import { useAuth } from "@/hooks/useAuth";
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
  Users,
  ClipboardCheck,
  TrendingUp,
  BarChart3,
  Activity,
  FileText,
} from "lucide-react";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const COLORS = ["#14b8a6", "#003366", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Analytics() {
  const { user } = useAuth();
  const queriesEnabled = Boolean(user);
  const { data: patients, isLoading: patientsLoading } =
    trpc.patients.list.useQuery(undefined, { enabled: queriesEnabled });
  const { data: remindersStatus } =
    trpc.patients.getRemindersStatus.useQuery(undefined, {
      retry: false,
      enabled: queriesEnabled,
    });

  const stats = useMemo(() => {
    if (!patients || patients.length === 0) {
      return {
        totalPatients: 0,
        patientsWithPhone: 0,
        phonePercentage: 0,
        patientsWithSurgeryDate: 0,
        surgeryDatePercentage: 0,
        questionnaireStats: {
          eva: { completed: 0, total: 0, percentage: 0 },
          ikdc: { completed: 0, total: 0, percentage: 0 },
          koos: { completed: 0, total: 0, percentage: 0 },
        },
        surgeryTypes: [] as { name: string; value: number }[],
        genderDistribution: [] as { name: string; value: number }[],
        ageDistribution: [] as { range: string; count: number }[],
      };
    }

    const totalPatients = patients.length;
    const patientsWithPhone = patients.filter((p) => p.phone).length;
    const patientsWithSurgeryDate = patients.filter((p) => p.surgeryDate).length;

    const surgeryTypeCounts: Record<string, number> = {};
    patients.forEach((p) => {
      const type = p.surgeryType || "Não especificado";
      surgeryTypeCounts[type] = (surgeryTypeCounts[type] || 0) + 1;
    });
    const surgeryTypes = Object.entries(surgeryTypeCounts).map(
      ([name, value]) => ({ name, value })
    );

    const genderCounts: Record<string, number> = {
      Masculino: 0,
      Feminino: 0,
      Outro: 0,
    };
    patients.forEach((p) => {
      if (p.gender === "M") genderCounts["Masculino"]++;
      else if (p.gender === "F") genderCounts["Feminino"]++;
      else genderCounts["Outro"]++;
    });
    const genderDistribution = Object.entries(genderCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const ageRanges: Record<string, number> = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "80+": 0,
    };
    patients.forEach((p) => {
      const age = p.age ?? 0;
      if (age <= 20) ageRanges["0-20"]++;
      else if (age <= 40) ageRanges["21-40"]++;
      else if (age <= 60) ageRanges["41-60"]++;
      else if (age <= 80) ageRanges["61-80"]++;
      else ageRanges["80+"]++;
    });
    const ageDistribution = Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count,
    }));

    return {
      totalPatients,
      patientsWithPhone,
      phonePercentage: Math.round((patientsWithPhone / totalPatients) * 100),
      patientsWithSurgeryDate,
      surgeryDatePercentage: Math.round(
        (patientsWithSurgeryDate / totalPatients) * 100
      ),
      questionnaireStats: {
        eva: { completed: 0, total: totalPatients, percentage: 0 },
        ikdc: { completed: 0, total: totalPatients, percentage: 0 },
        koos: { completed: 0, total: totalPatients, percentage: 0 },
      },
      surgeryTypes,
      genderDistribution,
      ageDistribution,
    };
  }, [patients]);

  const fillRateData = useMemo(() => {
    return [
      {
        name: "Telefone",
        preenchido: stats.patientsWithPhone,
        total: stats.totalPatients,
      },
      {
        name: "Data Cirurgia",
        preenchido: stats.patientsWithSurgeryDate,
        total: stats.totalPatients,
      },
    ];
  }, [stats]);

  const remindersData = useMemo(() => {
    if (!remindersStatus) return [];
    return [
      { name: "Pendentes", value: remindersStatus.pending, color: "#f59e0b" },
      { name: "Enviados", value: remindersStatus.sent, color: "#14b8a6" },
      { name: "Falhas", value: remindersStatus.failed, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  }, [remindersStatus]);

  if (queriesEnabled && patientsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {!user && import.meta.env.DEV && (
          <Card className="border-amber-500/40 bg-amber-500/5">
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Modo local sem sessão: os gráficos usam valores vazios. Inicie{" "}
              <code className="text-xs">npm run server</code> e faça login para
              carregar dados reais.
            </CardContent>
          </Card>
        )}
        <header>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics e Relatórios
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão consolidada dos dados e métricas do sistema
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">
                {stats.patientsWithPhone} com telefone cadastrado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Taxa de Telefone
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-teal-500">
                {stats.phonePercentage}%
              </div>
              <Progress value={stats.phonePercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Cirurgias Agendadas
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.patientsWithSurgeryDate}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.surgeryDatePercentage}% dos pacientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lembretes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {remindersStatus?.total ?? 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {remindersStatus?.sent ?? 0} enviados,{" "}
                {remindersStatus?.pending ?? 0} pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="demographics">Demografia</TabsTrigger>
            <TabsTrigger value="reminders">Lembretes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Preenchimento de Dados</CardTitle>
                  <CardDescription>
                    Comparativo de campos preenchidos por paciente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={fillRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="preenchido" fill="#14b8a6" name="Preenchido" />
                      <Bar dataKey="total" fill="#003366" name="Total" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tipos de Cirurgia</CardTitle>
                  <CardDescription>
                    Distribuição dos procedimentos agendados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.surgeryTypes.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.surgeryTypes}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.surgeryTypes.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      Nenhum tipo de cirurgia cadastrado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="demographics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Gênero</CardTitle>
                  <CardDescription>
                    Proporção de pacientes por gênero
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.genderDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.genderDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.genderDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      Nenhum dado de gênero disponível
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Faixa Etária</CardTitle>
                  <CardDescription>
                    Número de pacientes por faixa de idade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#14b8a6" name="Pacientes" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Status dos Lembretes</CardTitle>
                  <CardDescription>
                    Distribuição dos lembretes por status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {remindersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={remindersData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {remindersData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      Nenhum lembrete cadastrado
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Lembretes</CardTitle>
                  <CardDescription>
                    Detalhamento dos lembretes agendados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                    <span className="text-sm font-medium">Pendentes</span>
                    <span className="text-2xl font-bold text-yellow-500">
                      {remindersStatus?.pending ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                    <span className="text-sm font-medium">Enviados</span>
                    <span className="text-2xl font-bold text-green-500">
                      {remindersStatus?.sent ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                    <span className="text-sm font-medium">Falhas</span>
                    <span className="text-2xl font-bold text-red-500">
                      {remindersStatus?.failed ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-2xl font-bold">
                      {remindersStatus?.total ?? 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes com Dados Incompletos</CardTitle>
            <CardDescription>
              Pacientes que precisam de atualização de cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patients &&
            patients.filter((p) => !p.phone || !p.surgeryDate).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-semibold">Nome</th>
                      <th className="text-left py-2 px-4 font-semibold">
                        Telefone
                      </th>
                      <th className="text-left py-2 px-4 font-semibold">
                        Data Cirurgia
                      </th>
                      <th className="text-left py-2 px-4 font-semibold">
                        Pendências
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients
                      .filter((p) => !p.phone || !p.surgeryDate)
                      .slice(0, 10)
                      .map((patient) => (
                        <tr
                          key={patient.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-4">{patient.name}</td>
                          <td className="py-3 px-4">
                            {patient.phone ? (
                              <span className="text-green-500">
                                {patient.phone}
                              </span>
                            ) : (
                              <span className="text-red-500">
                                Não cadastrado
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {patient.surgeryDate ? (
                              new Date(
                                patient.surgeryDate
                              ).toLocaleDateString("pt-BR")
                            ) : (
                              <span className="text-red-500">
                                Não definida
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              {!patient.phone && (
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                                  Telefone
                                </span>
                              )}
                              {!patient.surgeryDate && (
                                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                                  Data
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Todos os pacientes possuem dados completos!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
