import { Card } from "@arc/ui";
import { Zap } from "lucide-react";

type Props = {
  score: number;
  maxScore: number;
  accentColor?: string;
};

export function ScoreCard({ score, maxScore, accentColor }: Props) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return (
    <Card variant="glass" className="flex items-center gap-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accentColor ?? "#3B82F6"}20` }}
      >
        <Zap size={24} style={{ color: accentColor }} />
      </div>
      <div className="flex-1">
        <div className="text-xs text-arc-muted">Today's Score</div>
        <div className="text-2xl font-bold text-arc-text">
          {score}
          <span className="text-sm text-arc-muted">/{maxScore}</span>
        </div>
      </div>
      <div className="text-right">
        <div
          className="text-2xl font-bold"
          style={{ color: accentColor }}
        >
          {pct}%
        </div>
      </div>
    </Card>
  );
}
