import { describe, it, expect } from "vitest";
import { buildPayloadSchema } from "../validation.js";
import type { ArcSchema } from "@arc/shared";

const schema: ArcSchema = {
  dailyFields: [
    { kind: "boolean", key: "noFastFood", label: "No Fast Food" },
    { kind: "number", key: "weight", label: "Weight", min: 30, max: 300 },
    { kind: "enum", key: "mood", label: "Mood", options: ["bad", "ok", "good"] },
    {
      kind: "multiselect",
      key: "exercises",
      label: "Exercises",
      options: ["push", "pull", "legs"],
    },
  ],
};

describe("buildPayloadSchema", () => {
  it("validates a correct payload", () => {
    const zodSchema = buildPayloadSchema(schema);
    const result = zodSchema.safeParse({
      noFastFood: true,
      weight: 75.5,
      mood: "ok",
      exercises: ["push", "legs"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid boolean", () => {
    const zodSchema = buildPayloadSchema(schema);
    const result = zodSchema.safeParse({
      noFastFood: "yes",
      weight: 75,
      mood: "ok",
      exercises: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects out-of-range number", () => {
    const zodSchema = buildPayloadSchema(schema);
    const result = zodSchema.safeParse({
      noFastFood: true,
      weight: 500,
      mood: "ok",
      exercises: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid enum value", () => {
    const zodSchema = buildPayloadSchema(schema);
    const result = zodSchema.safeParse({
      noFastFood: true,
      weight: 75,
      mood: "amazing",
      exercises: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid multiselect values", () => {
    const zodSchema = buildPayloadSchema(schema);
    const result = zodSchema.safeParse({
      noFastFood: true,
      weight: 75,
      mood: "ok",
      exercises: ["swim"],
    });
    expect(result.success).toBe(false);
  });
});
