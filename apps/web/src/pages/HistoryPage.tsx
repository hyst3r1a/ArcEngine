import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { HistoryResponse, TodayResponse } from "@arc/shared";
import { PageFrame, Card, ChapterTitle } from "@arc/ui";
import { api } from "../lib/api.js";

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [todayData, setTodayData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.history(60), api.today()]).then(([h, t]) => {
      setHistory(h);
      setTodayData(t);
      setLoading(false);
    });
  }, []);

  if (loading || !history || !todayData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-arc-muted" size={32} />
      </div>
    );
  }

  const theme = todayData.arc.theme;
  const entries = history.entries;
  const maxScore = todayData.arc.scoring.reduce((s, r) => s + r.points, 0);

  const totalDays = entries.length;
  const perfectDays = entries.filter((e) => e.score === maxScore).length;
  const avgScore =
    totalDays > 0
      ? Math.round(entries.reduce((s, e) => s + e.score, 0) / totalDays * 10) / 10
      : 0;
  const consistency =
    totalDays > 0 ? Math.round((perfectDays / totalDays) * 100) : 0;

  // Weight trend: extract weight values from payloads
  const weightEntries = entries
    .filter((e) => typeof e.payload.weight === "number" && e.payload.loggedWeight)
    .map((e) => ({ date: e.date, weight: e.payload.weight as number }));

  return (
    <PageFrame theme={theme}>
      <div className="mx-auto w-full max-w-md space-y-4 px-4 pt-12 pb-8">
        <ChapterTitle
          subtitle="Progress"
          title="History"
          accentColor={theme.accentColor}
        />

        <div className="grid grid-cols-3 gap-2">
          <StatBox label="Days Logged" value={totalDays} />
          <StatBox label="Avg Score" value={avgScore} />
          <StatBox label="Consistency" value={`${consistency}%`} />
        </div>

        {/* Calendar Heatmap */}
        <Card variant="glass">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-arc-muted">
            Daily Heatmap
          </h3>
          <div className="flex flex-wrap gap-1">
            {buildHeatmapDays(60, entries, maxScore).map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.score ?? "-"}`}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: day.score !== null
                    ? heatColor(day.score, maxScore, theme.accentColor)
                    : "rgba(255,255,255,0.05)",
                }}
              />
            ))}
          </div>
        </Card>

        {/* Score Trend */}
        <Card variant="ink">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-arc-muted">
            Score Trend
          </h3>
          <MiniChart
            data={entries.map((e) => e.score)}
            max={maxScore}
            color={theme.accentColor}
          />
        </Card>

        {/* Weight Trend */}
        {weightEntries.length > 0 && (
          <Card variant="ink">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-arc-muted">
              Weight Trend
            </h3>
            <MiniChart
              data={weightEntries.map((e) => e.weight)}
              max={Math.max(...weightEntries.map((e) => e.weight)) * 1.05}
              color="#10B981"
            />
            <div className="mt-1 flex justify-between text-xs text-arc-muted">
              <span>{weightEntries[0]?.weight} kg</span>
              <span>{weightEntries[weightEntries.length - 1]?.weight} kg</span>
            </div>
          </Card>
        )}
      </div>
    </PageFrame>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Card variant="glass" className="text-center">
      <div className="text-lg font-bold text-arc-text">{value}</div>
      <div className="text-[10px] text-arc-muted">{label}</div>
    </Card>
  );
}

function buildHeatmapDays(
  days: number,
  entries: { date: string; score: number }[],
  _maxScore: number,
) {
  const map = new Map(entries.map((e) => [e.date, e.score]));
  const result: { date: string; score: number | null }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    result.push({ date: dateStr, score: map.get(dateStr) ?? null });
  }
  return result;
}

function heatColor(score: number, max: number, accent: string): string {
  if (max === 0) return "rgba(255,255,255,0.1)";
  const ratio = score / max;
  const opacity = 0.15 + ratio * 0.85;
  return `${accent}${Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

function MiniChart({
  data,
  max,
  color,
}: {
  data: number[];
  max: number;
  color: string;
}) {
  if (data.length === 0) return null;

  const h = 60;
  const w = 280;
  const step = w / Math.max(data.length - 1, 1);

  const points = data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
