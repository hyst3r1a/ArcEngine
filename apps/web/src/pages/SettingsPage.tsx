import { useState, useEffect, useRef, useCallback } from "react";
import { Loader2, LogOut, MessageCircle, Check, X, ExternalLink } from "lucide-react";
import type { MeResponse } from "@arc/shared";
import { Card, ChapterTitle } from "@arc/ui";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth-context.js";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [polling, setPolling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    api
      .me()
      .then(setMe)
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
    return () => clearInterval(pollRef.current);
  }, []);

  const stopPolling = useCallback(() => {
    clearInterval(pollRef.current);
    pollRef.current = undefined;
    setPolling(false);
  }, []);

  async function handleConnect() {
    setLinking(true);
    setStatus(null);
    try {
      const { url } = await api.telegramLink();
      window.open(url, "_blank");
      setPolling(true);
      let elapsed = 0;
      pollRef.current = setInterval(async () => {
        elapsed += 2000;
        if (elapsed > 60_000) {
          stopPolling();
          setStatus({ type: "err", msg: "Timed out — try again" });
          return;
        }
        try {
          const data = await api.me();
          if (data.telegramConnected) {
            setMe(data);
            stopPolling();
            setStatus({ type: "ok", msg: "Telegram connected!" });
          }
        } catch {
          // keep polling
        }
      }, 2000);
    } catch {
      setStatus({ type: "err", msg: "Failed to generate link" });
    } finally {
      setLinking(false);
    }
  }

  async function handleDisconnect() {
    setSaving(true);
    setStatus(null);
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

          <p className="text-xs text-arc-muted">
            Get nudge notifications on Telegram when your partner pokes you.
          </p>

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
          ) : polling ? (
            <div className="flex items-center gap-3 rounded-lg bg-slate-800/60 p-3">
              <Loader2 size={18} className="animate-spin text-arc-accent" />
              <div className="text-sm text-arc-muted">
                Waiting for you to tap <strong>Start</strong> in Telegram...
              </div>
              <button
                onClick={stopPolling}
                className="ml-auto text-xs text-arc-muted hover:text-arc-text"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={linking}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2AABEE] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {linking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ExternalLink size={16} />
              )}
              Connect Telegram
            </button>
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
