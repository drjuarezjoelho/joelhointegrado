import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ikdcQuestions } from "@/lib/questionnaire-data/ikdcQuestions";

type Props = { timepointId: number };

export default function IkdcForm({ timepointId }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saved, setSaved] = useState(false);

  const saveMutation = trpc.patients.saveIkdcToTimepoint.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("IKDC salvo com sucesso.");
    },
    onError: (e) => {
      toast.error(e.message ?? "Erro ao salvar.");
    },
  });

  const allAnswered = ikdcQuestions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      toast.error("Responda todas as perguntas.");
      return;
    }
    saveMutation.mutate({
      timepointId,
      responses: {
        item1: answers[1],
        item2: answers[2],
        item3: answers[3],
        item4: answers[4],
        item5: answers[5],
        item6: answers[6],
        item7: answers[7],
        item8: answers[8],
        item9: answers[9],
        item10: answers[10],
        item11: answers[11],
        item12: answers[12],
        item13: answers[13],
        item14: answers[14],
        item15: answers[15],
        item16: answers[16],
        item17: answers[17],
        item18: answers[18],
      },
    });
  };

  if (saved) {
    const totalRaw = Object.values(answers).reduce((s, v) => s + v, 0);
    const totalPossible = 81;
    const score = Math.round((totalRaw / totalPossible) * 100);
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-muted-foreground">
          IKDC registrado: <strong className="text-foreground">{score}%</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        {ikdcQuestions.map((q) => (
          <div key={q.id} className="rounded-lg border p-4">
            <Label className="text-sm font-medium">
              {q.id}. {q.question}
            </Label>
            <RadioGroup
              value={
                answers[q.id] !== undefined ? String(answers[q.id]) : undefined
              }
              onValueChange={(v) =>
                setAnswers((prev) => ({ ...prev, [q.id]: parseInt(v, 10) }))
              }
              className="mt-2 space-y-2"
            >
              {q.options.map((opt) => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={String(opt.value)} id={`ikdc-${q.id}-${opt.value}`} />
                  <Label htmlFor={`ikdc-${q.id}-${opt.value}`} className="cursor-pointer text-sm font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={!allAnswered || saveMutation.isPending}>
        {saveMutation.isPending ? "Salvando..." : "Salvar IKDC"}
      </Button>
    </form>
  );
}
