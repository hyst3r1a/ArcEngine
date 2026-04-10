import { useState } from "react";
import { useAuth } from "../lib/auth-context.js";
import { Card } from "@arc/ui";

export function LoginPage() {
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(code.trim());
    } catch {
      setError("Invalid invite code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-arc-bg p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-title text-5xl tracking-tight text-arc-text">
            ARC TRACKER
          </h1>
          <p className="mt-2 text-sm text-arc-muted">
            Enter your invite code to begin
          </p>
        </div>

        <Card variant="ink">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Invite code"
              className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-arc-text placeholder:text-arc-muted focus:border-arc-accent focus:outline-none"
              autoFocus
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full rounded-xl bg-arc-accent py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entering..." : "Enter Arc"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
