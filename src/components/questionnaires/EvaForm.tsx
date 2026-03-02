import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

function getPainColor(score: number) {
  if (score <= 2) return "bg-green-500";
  if (score <= 4) return "bg-yellow-500";
  if (score <= 6) return "bg-orange-500";
  if (score <= 8) return "bg-red-500";
  return "bg-red-700";
}

type Props = { timepointId: number };

export default function EvaForm({ timepointId }: Props) {
  const [painScore, setPainScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const saveMutation = trpc.patients.saveEvaToTimepoint.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("EVA salvo com sucesso.");
    },
    onError: (e) => {
      toast.error(e.message ?? "Erro ao salvar.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (painScore === null) {
      toast.error("Selecione um nível de dor (0-10).");
      return;
    }
    saveMutation.mutate({ timepointId, painScore });
  };

  if (saved) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-muted-foreground">
          EVA registrado: <strong className="text-foreground">{painScore}/10</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base">
          Nível de dor no joelho (0 = sem dor, 10 = pior dor imaginável)
        </Label>
        <div className="mt-2 flex flex-wrap gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setPainScore(score)}
              className={`h-10 w-10 rounded-lg text-sm font-bold transition-all ${
                painScore === score
                  ? `${getPainColor(score)} text-white`
                  : "bg-muted hover:bg-muted/80 text-foreground"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" disabled={painScore === null || saveMutation.isPending}>
        {saveMutation.isPending ? "Salvando..." : "Salvar EVA"}
      </Button>
    </form>
  );
}
