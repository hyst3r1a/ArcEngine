import { Card } from "@arc/ui";
import type { ArcDefinition, ArcStateSummary } from "@arc/shared";

type Props = {
  arc: ArcDefinition;
  state: ArcStateSummary | null;
};

export function ArcProgressCard({ arc, state }: Props) {
  let progress = 0;
  let target = "";

  if (arc.completionRule.type === "streakAtLeast") {
    const current = state?.bestStreak ?? 0;
    progress = Math.min(100, Math.round((current / arc.completionRule.days) * 100));
    target = `${current} / ${arc.completionRule.days} day streak`;
  } else if (arc.completionRule.type === "scoreAtLeast") {
    const current = state?.totalScore ?? 0;
    progress = Math.min(100, Math.round((current / arc.completionRule.points) * 100));
    target = `${current} / ${arc.completionRule.points} points`;
  } else {
    target = "Manual unlock required";
  }

  const isComplete = state?.completedAt !== null && state?.completedAt !== undefined;

  return (
    <Card variant="glass">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-arc-muted">
          Completion Progress
        </span>
        {isComplete && (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-400">
            Complete
          </span>
        )}
      </div>
      <div className="mb-1 text-sm font-medium text-arc-text">{target}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            backgroundColor: arc.theme.accentColor,
          }}
        />
      </div>
      <div className="mt-1 text-right text-xs text-arc-muted">{progress}%</div>
    </Card>
  );
}
