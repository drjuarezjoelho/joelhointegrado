import { useState } from "react";
import { COLORS } from "@/lib/case-model";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function ChangePassword() {
  const { refresh } = useAuth();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirm) {
      setError("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 12) {
      setError("Nova senha: mínimo 12 caracteres");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg border border-slate-200 p-8 shadow-sm"
      >
        <h1 className="text-lg font-bold text-slate-800 mb-2">
          Defina sua nova senha
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Obrigatório no primeiro acesso. Mínimo 12 caracteres.
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Senha temporária
        </label>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm mb-4"
        />
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Nova senha
        </label>
        <input
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm mb-4"
        />
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Confirmar nova senha
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm mb-6"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded text-white font-medium"
          style={{ backgroundColor: COLORS.blue }}
        >
          {submitting ? "Salvando…" : "Salvar e continuar"}
        </button>
      </form>
    </div>
  );
}
