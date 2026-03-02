import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

type Patient = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  surgeryDate?: Date | string | null;
  surgeryType?: string | null;
};

type ExportDataProps = {
  patients: Patient[];
};

export default function ExportData({ patients }: ExportDataProps) {
  const handleExportCSV = () => {
    const headers = ["Nome", "Telefone", "Email", "Data Cirurgia", "Tipo Cirurgia"];
    const rows = patients.map((p) => [
      p.name,
      p.phone ?? "",
      p.email ?? "",
      p.surgeryDate
        ? new Date(p.surgeryDate).toLocaleDateString("pt-BR")
        : "",
      p.surgeryType ?? "",
    ]);
    const csv =
      "\uFEFF" +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pacientes-cij-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Exportar dados</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Baixar CSV
        </Button>
      </CardContent>
    </Card>
  );
}
