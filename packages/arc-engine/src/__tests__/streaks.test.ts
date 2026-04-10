import { describe, it, expect } from "vitest";
import { computeStreak } from "../streaks.js";

describe("computeStreak", () => {
  it("returns zeros for no entries", () => {
    expect(computeStreak([])).toEqual({ current: 0, best: 0 });
  });

  it("counts consecutive days with score > 0", () => {
    const entries = [
      { date: "2025-01-01", score: 3 },
      { date: "2025-01-02", score: 5 },
      { date: "2025-01-03", score: 2 },
    ];
    const result = computeStreak(entries, "2025-01-03");
    expect(result.best).toBe(3);
    expect(result.current).toBe(3);
  });

  it("breaks streak on zero-score day", () => {
    const entries = [
      { date: "2025-01-01", score: 3 },
      { date: "2025-01-02", score: 0 },
      { date: "2025-01-03", score: 5 },
    ];
    const result = computeStreak(entries, "2025-01-03");
    expect(result.best).toBe(1);
    expect(result.current).toBe(1);
  });

  it("breaks streak on gap day", () => {
    const entries = [
      { date: "2025-01-01", score: 3 },
      { date: "2025-01-02", score: 5 },
      { date: "2025-01-04", score: 2 },
    ];
    const result = computeStreak(entries, "2025-01-04");
    expect(result.best).toBe(2);
    expect(result.current).toBe(1);
  });

  it("current streak is 0 if last entry is old", () => {
    const entries = [
      { date: "2025-01-01", score: 3 },
      { date: "2025-01-02", score: 5 },
    ];
    const result = computeStreak(entries, "2025-01-10");
    expect(result.best).toBe(2);
    expect(result.current).toBe(0);
  });

  it("current streak counts if last entry is yesterday", () => {
    const entries = [
      { date: "2025-01-01", score: 3 },
      { date: "2025-01-02", score: 5 },
    ];
    const result = computeStreak(entries, "2025-01-03");
    expect(result.best).toBe(2);
    expect(result.current).toBe(2);
  });
});
