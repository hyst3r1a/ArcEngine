import { describe, it, expect } from "vitest";
import { computeScore } from "../scoring.js";
import type { ArcScoringRule } from "@arc/shared";

const rules: ArcScoringRule[] = [
  { type: "booleanEquals", field: "noFastFood", expected: true, points: 1 },
  { type: "booleanEquals", field: "noSugar", expected: true, points: 1 },
  { type: "booleanEquals", field: "movedToday", expected: true, points: 1 },
  { type: "numberRange", field: "calories", min: 1500, max: 2200, points: 2 },
  { type: "enumEquals", field: "mood", value: "good", points: 1 },
];

describe("computeScore", () => {
  it("returns 0 for empty payload", () => {
    expect(computeScore({}, rules)).toBe(0);
  });

  it("scores boolean fields correctly", () => {
    const payload = { noFastFood: true, noSugar: false, movedToday: true };
    expect(computeScore(payload, rules)).toBe(2);
  });

  it("scores number range correctly", () => {
    expect(computeScore({ calories: 1800 }, rules)).toBe(2);
    expect(computeScore({ calories: 3000 }, rules)).toBe(0);
    expect(computeScore({ calories: 1000 }, rules)).toBe(0);
  });

  it("scores enum field correctly", () => {
    expect(computeScore({ mood: "good" }, rules)).toBe(1);
    expect(computeScore({ mood: "bad" }, rules)).toBe(0);
  });

  it("scores all fields combined", () => {
    const payload = {
      noFastFood: true,
      noSugar: true,
      movedToday: true,
      calories: 2000,
      mood: "good",
    };
    expect(computeScore(payload, rules)).toBe(6);
  });
});
