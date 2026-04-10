import { ChapterTitle, Badge } from "@arc/ui";
import type { ArcDefinition, ArcStateSummary } from "@arc/shared";

type Props = {
  arc: ArcDefinition;
  state: ArcStateSummary;
};

export function ArcHeader({ arc, state }: Props) {
  return (
    <div className="mb-4 px-1">
      <ChapterTitle
        subtitle={`Arc ${arc.order}`}
        title={arc.name}
        accentColor={arc.theme.accentColor}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge label="Streak" value={`${state.currentStreak}d`} accentColor={arc.theme.accentColor} />
        <Badge label="Best" value={`${state.bestStreak}d`} />
        <Badge label="Score" value={state.totalScore} accentColor={arc.theme.accentColor} />
      </div>
    </div>
  );
}
