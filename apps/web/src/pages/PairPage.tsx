import { useEffect, useState, useRef } from "react";
import { Loader2, Bell, Check } from "lucide-react";
import type { PairResponse, TodayResponse } from "@arc/shared";
import { PageFrame, Card, ChapterTitle } from "@arc/ui";
import { api } from "../lib/api.js";

export function PairPage() {
  const [pair, setPair] = useState<PairResponse | null>(null);
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [nudging, setNudging] = useState(false);
  const [nudgeMsg, setNudgeMsg] = useState("");
  const cooldownRef = useRef(false);

  useEffect(() => {
    Promise.all([api.pair(), api.today()])
      .then(([p, t]) => {
        setPair(p);
        setTodayData(t);
      })
      .catch((err) => console.error("Failed to load pair data:", err))
      .finally(() => setLoading(false));
  }, []);

  async function handleNudge() {
    if (cooldownRef.current) return;
    setNudging(true);
    setNudgeMsg("");
    try {
      const res = await api.nudge();
      setNudgeMsg(res.message ?? "Nudge sent!");
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
        setNudgeMsg("");
      }, 30_000);
    } catch {
      setNudgeMsg("Failed to nudge");
    } finally {
      setNudging(false);
    }
  }

  if (loading || !pair || !todayData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-arc-muted" size={32} />
      </div>
    );
  }

  const [me, partner] = pair.users;
  const scoreDelta = me.totalScore - partner.totalScore;
  const theme = todayData.arc.theme;

  function statusMessage(): string {
    if (scoreDelta > 20) return "You're pulling ahead — keep it up!";
    if (scoreDelta > 0) return "Neck and neck. Stay sharp.";
    if (scoreDelta === 0) return "Dead even. Who blinks first?";
    if (scoreDelta > -20) return "You're close behind. Push harder.";
    return "Time to rally. Close the gap.";
  }

  return (
    <PageFrame theme={theme}>
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-12 pb-8">
        <ChapterTitle
          subtitle="Pair Battle"
          title="Side by Side"
          accentColor={theme.accentColor}
        />

        <div className="grid grid-cols-2 gap-3">
          {[me, partner].map((row, i) => (
            <Card key={row.user.id} variant={i === 0 ? "glass" : "ink"}>
              <div className="text-center">
                <div className="mb-1 text-2xl">
                  {i === 0 ? "🔵" : "🔴"}
                </div>
                <div className="text-sm font-semibold text-arc-text">
                  {row.user.displayName}
                </div>
                <div className="mt-2 space-y-1 text-xs text-arc-muted">
                  <div>
                    Score:{" "}
                    <span className="font-bold text-arc-text">
                      {row.totalScore}
                    </span>
                  </div>
                  <div>
                    Streak:{" "}
                    <span className="font-bold text-arc-text">
                      {row.currentStreak}d
                    </span>
                  </div>
                  <div>
                    Best:{" "}
                    <span className="font-bold text-arc-text">
                      {row.bestStreak}d
                    </span>
                  </div>
                  <div>
                    Weekly:{" "}
                    <span className="font-bold text-arc-text">
                      {row.weeklyScore}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card variant="glass">
          <div className="text-center text-sm text-arc-text/80">
            {statusMessage()}
          </div>
        </Card>

        <Card variant="ink" className="flex items-center justify-between">
          <div>
            <div className="text-xs text-arc-muted">Score Gap</div>
            <div className="text-xl font-bold text-arc-text">
              {scoreDelta > 0 ? "+" : ""}
              {scoreDelta}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-arc-muted">Weekly Diff</div>
            <div className="text-xl font-bold text-arc-text">
              {me.weeklyScore - partner.weeklyScore > 0 ? "+" : ""}
              {me.weeklyScore - partner.weeklyScore}
            </div>
          </div>
        </Card>

        <button
          onClick={handleNudge}
          disabled={nudging || !!nudgeMsg}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-arc-text transition-colors hover:bg-white/10 disabled:opacity-50"
        >
          {nudgeMsg ? (
            <>
              <Check size={16} className="text-green-400" />
              <span className="text-green-400">{nudgeMsg}</span>
            </>
          ) : (
            <>
              {nudging ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Bell size={16} />
              )}
              {nudging ? "Sending..." : "Nudge Partner"}
            </>
          )}
        </button>
      </div>
    </PageFrame>
  );
}
