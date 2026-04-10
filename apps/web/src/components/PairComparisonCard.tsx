import { Card } from "@arc/ui";
import type { TodayResponse } from "@arc/shared";

type Props = {
  partner: NonNullable<TodayResponse["partner"]>;
};

export function PairComparisonCard({ partner }: Props) {
  const hasLogged = partner.today !== null;

  return (
    <Card variant="ink">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-arc-muted">Partner</div>
          <div className="font-semibold text-arc-text">
            {partner.user.displayName}
          </div>
        </div>
        <div className="text-right">
          {hasLogged ? (
            <>
              <div className="text-xs text-arc-muted">Today</div>
              <div className="text-lg font-bold text-emerald-400">
                {partner.today!.score} pts
              </div>
            </>
          ) : (
            <span className="text-xs text-arc-muted">Not logged yet</span>
          )}
        </div>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-arc-muted">
        <span>Streak: {partner.arcState.currentStreak}d</span>
        <span>Total: {partner.arcState.totalScore}</span>
      </div>
    </Card>
  );
}
