import { describe, it, expect } from "vitest";
import { checkCompletion } from "../completion.js";

describe("checkCompletion", () => {
  it("streakAtLeast: returns true when bestStreak meets threshold", () => {
    expect(
      checkCompletion(
        { type: "streakAtLeast", days: 21 },
        { currentStreak: 5, bestStreak: 21, totalScore: 100 },
      ),
    ).toBe(true);
  });

  it("streakAtLeast: returns false when bestStreak is below threshold", () => {
    expect(
      checkCompletion(
        { type: "streakAtLeast", days: 21 },
        { currentStreak: 15, bestStreak: 15, totalScore: 100 },
      ),
    ).toBe(false);
  });

  it("scoreAtLeast: returns true when totalScore meets threshold", () => {
    expect(
      checkCompletion(
        { type: "scoreAtLeast", points: 100 },
        { currentStreak: 0, bestStreak: 0, totalScore: 150 },
      ),
    ).toBe(true);
  });

  it("manualUnlock: always returns false", () => {
    expect(
      checkCompletion(
        { type: "manualUnlock" },
        { currentStreak: 100, bestStreak: 100, totalScore: 9999 },
      ),
    ).toBe(false);
  });
});
