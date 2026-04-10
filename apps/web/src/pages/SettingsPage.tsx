import { useState, useEffect } from "react";
import { Loader2, LogOut, MessageCircle, Check, X, ExternalLink } from "lucide-react";
import type { MeResponse } from "@arc/shared";
import { Card, ChapterTitle } from "@arc/ui";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth-context.js";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [chatId, setChatId] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    api
      .me()
      .then((data) => {
        setMe(data);
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    const trimmed = chatId.trim();
    if (!trimmed) return;
    setSaving(true);
    setStatus(null);
    try {
      await api.setTelegramChatId(trimmed);
      setMe((prev) => (prev ? { ...prev, telegramConnected: true } : prev));
      setChatId("");
      setStatus({ type: "ok", msg: "Telegram connected!" });
    } catch {
      setStatus({ type: "err", msg: "Failed to save — make sure it's a valid numeric chat ID" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect() {
    setSaving(true);
    try {
      await api.removeTelegram();
      setMe((prev) => (prev ? { ...prev, telegramConnected: false } : prev));
      setStatus({ type: "ok", msg: "Telegram disconnected" });
    } catch {
      setStatus({ type: "err", msg: "Failed to disconnect" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-arc-muted" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-12 pb-8">
      <ChapterTitle subtitle="Settings" title={user?.displayName ?? "Profile"} />

      <Card variant="ink">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <MessageCircle size={20} className="text-arc-accent" />
            <h3 className="font-semibold text-arc-text">Telegram Notifications</h3>
            {me?.telegramConnected && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                <Check size={12} /> Connected
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs text-arc-muted">
            <p>Get nudge notifications on Telegram when your partner pokes you.</p>
            <div className="rounded-lg bg-slate-800/60 p-3 space-y-1.5">
              <p className="font-medium text-arc-text text-sm">Setup steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>
                  Message{" "}
                  <a
                    href="https://t.me/userinfobot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-arc-accent underline inline-flex items-center gap-0.5"
                  >
                    @userinfobot <ExternalLink size={10} />
                  </a>{" "}
                  on Telegram — it replies with your <strong>chat ID</strong> (a number)
                </li>
                <li>Paste that number below</li>
                <li>
                  Start a chat with the Arc bot so it can message you
                </li>
              </ol>
            </div>
          </div>

          {me?.telegramConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-arc-muted">Telegram is connected.</span>
              <button
                onClick={handleDisconnect}
                disabled={saving}
                className="ml-auto flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10"
              >
                <X size={14} />
                Disconnect
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Your Telegram chat ID"
                className="flex-1 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-sm text-arc-text placeholder:text-arc-muted focus:border-arc-accent focus:outline-none"
              />
              <button
                onClick={handleSave}
                disabled={saving || !chatId.trim()}
                className="rounded-lg bg-arc-accent px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Save"}
              </button>
            </div>
          )}

          {status && (
            <p className={`text-xs ${status.type === "ok" ? "text-green-400" : "text-red-400"}`}>
              {status.msg}
            </p>
          )}
        </div>
      </Card>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-arc-text transition-colors hover:bg-white/10"
      >
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}
