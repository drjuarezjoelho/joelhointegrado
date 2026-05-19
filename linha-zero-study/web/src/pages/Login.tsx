import { useState } from "react";
import { COLORS } from "@/lib/case-model";
import { useAuth } from "@/contexts/AuthContext";
export function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
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
        <h1 className="text-xl font-bold text-slate-800 mb-1">
          Projeto Linha Zero
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Acesso restrito aos investigadores do estudo
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2 mb-4">
            {error}
          </p>
        )}
        <label className="block text-xs font-medium text-slate-600 mb-1">
          E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-4"
        />
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm mb-6"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded text-white font-medium disabled:opacity-60"
          style={{ backgroundColor: COLORS.blue }}
        >
          {submitting ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

