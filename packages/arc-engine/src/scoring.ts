import type { ArcScoringRule } from "@arc/shared";

export function computeScore(
  payload: Record<string, unknown>,
  rules: ArcScoringRule[],
): number {
  let total = 0;
  for (const rule of rules) {
    switch (rule.type) {
      case "booleanEquals":
        if (payload[rule.field] === rule.expected) total += rule.points;
        break;
      case "numberRange": {
        const val = payload[rule.field];
        if (typeof val === "number") {
          const aboveMin = rule.min === undefined || val >= rule.min;
          const belowMax = rule.max === undefined || val <= rule.max;
          if (aboveMin && belowMax) total += rule.points;
        }
        break;
      }
      case "enumEquals":
        if (payload[rule.field] === rule.value) total += rule.points;
        break;
    }
  }
  return total;
}
