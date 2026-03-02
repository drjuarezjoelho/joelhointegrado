import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { koosSubscales, koosResponseOptions } from "@/lib/questionnaire-data/koosData";

type Props = { timepointId: number };

function buildResponses(answers: Record<string, number>) {
  const out: Record<string, number> = {};
  for (const sub of koosSubscales) {
    for (const q of sub.questions) {
      if (answers[q.id] !== undefined) out[q.id] = answers[q.id];
    }
  }
  return out;
}

export default function KoosForm({ timepointId }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const saveMutation = trpc.patients.saveKoosToTimepoint.useMutation({
    onSuccess: () => {
      setSaved(true);
      toast.success("KOOS salvo com sucesso.");
    },
    onError: (e) => {
      toast.error(e.message ?? "Erro ao salvar.");
    },
  });

  const allAnswered = koosSubscales.every((s) =>
    s.questions.every((q) => answers[q.id] !== undefined)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      toast.error("Responda todas as perguntas.");
      return;
    }
    saveMutation.mutate({
      timepointId,
      responses: buildResponses(answers),
    });
  };

  if (saved) {
    return (
      <div className="rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-muted-foreground">
          KOOS registrado para este marco temporal.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue={koosSubscales[0].name} className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          {koosSubscales.map((s) => (
            <TabsTrigger key={s.name} value={s.name}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {koosSubscales.map((sub) => (
          <TabsContent key={sub.name} value={sub.name} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">{sub.description}</p>
            <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-2">
              {sub.questions.map((q) => (
                <div key={q.id} className="rounded-lg border p-4">
                  <Label className="text-sm font-medium">{q.question}</Label>
                  <RadioGroup
                    value={
                      answers[q.id] !== undefined ? String(answers[q.id]) : undefined
                    }
                    onValueChange={(v) =>
                      setAnswers((prev) => ({ ...prev, [q.id]: parseInt(v, 10) }))
                    }
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {koosResponseOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center">
                        <RadioGroupItem value={String(opt.value)} id={`koos-${q.id}-${opt.value}`} className="sr-only" />
                        <Label
                          htmlFor={`koos-${q.id}-${opt.value}`}
                          className={`cursor-pointer px-3 py-2 rounded-lg text-sm ${
                            answers[q.id] === opt.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Button type="submit" disabled={!allAnswered || saveMutation.isPending}>
        {saveMutation.isPending ? "Salvando..." : "Salvar KOOS"}
      </Button>
    </form>
  );
}
