import type { CompletionRule, UserArcState } from "@arc/shared";

export function checkCompletion(
  rule: CompletionRule,
  state: Pick<UserArcState, "currentStreak" | "bestStreak" | "totalScore">,
): boolean {
  switch (rule.type) {
    case "streakAtLeast":
      return state.bestStreak >= rule.days;
    case "scoreAtLeast":
      return state.totalScore >= rule.points;
    case "manualUnlock":
      return false;
  }
}
