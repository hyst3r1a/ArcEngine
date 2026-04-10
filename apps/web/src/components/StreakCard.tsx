import { Card } from "@arc/ui";
import { Flame, Trophy } from "lucide-react";

type Props = {
  current: number;
  best: number;
};

export function StreakCard({ current, best }: Props) {
  return (
    <Card variant="glass" className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Flame size={20} className="text-orange-400" />
        <div>
          <div className="text-xs text-arc-muted">Current</div>
          <div className="text-xl font-bold text-arc-text">{current}d</div>
        </div>
      </div>
      <div className="h-8 w-px bg-white/10" />
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-yellow-400" />
        <div>
          <div className="text-xs text-arc-muted">Best</div>
          <div className="text-xl font-bold text-arc-text">{best}d</div>
        </div>
      </div>
    </Card>
  );
}
