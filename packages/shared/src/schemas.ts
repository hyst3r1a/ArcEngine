import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1).max(50),
  avatarSeed: z.string(),
  createdAt: z.string(),
});

export const pairSchema = z.object({
  id: z.string(),
  userAId: z.string(),
  userBId: z.string(),
  createdAt: z.string(),
});

export const dailyEntrySchema = z.object({
  id: z.string(),
  userId: z.string(),
  arcId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  payloadJson: z.string(),
  score: z.number().int().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const arcSchemaFieldSchema: z.ZodType = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("boolean"), key: z.string(), label: z.string() }),
  z.object({
    kind: z.literal("number"),
    key: z.string(),
    label: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
    unit: z.string().optional(),
  }),
  z.object({
    kind: z.literal("enum"),
    key: z.string(),
    label: z.string(),
    options: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("multiselect"),
    key: z.string(),
    label: z.string(),
    options: z.array(z.string()),
  }),
]);

export const arcScoringRuleSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("booleanEquals"),
    field: z.string(),
    expected: z.boolean(),
    points: z.number(),
  }),
  z.object({
    type: z.literal("numberRange"),
    field: z.string(),
    min: z.number().optional(),
    max: z.number().optional(),
    points: z.number(),
  }),
  z.object({
    type: z.literal("enumEquals"),
    field: z.string(),
    value: z.string(),
    points: z.number(),
  }),
]);

export const completionRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("streakAtLeast"), days: z.number().int().positive() }),
  z.object({ type: z.literal("scoreAtLeast"), points: z.number().int().positive() }),
  z.object({ type: z.literal("manualUnlock") }),
]);

export const arcThemeSchema = z.object({
  titleFontClass: z.string(),
  accentColor: z.string(),
  surfaceClass: z.string(),
  overlayGradient: z.string(),
  backgroundImage: z.string(),
  emblemImage: z.string().optional(),
  cardVariant: z.enum(["glass", "ink", "clean"]),
});

export const arcDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  order: z.number().int(),
  schemaVersion: z.number().int(),
  theme: arcThemeSchema,
  schema: z.object({ dailyFields: z.array(arcSchemaFieldSchema) }),
  scoring: z.array(arcScoringRuleSchema),
  completionRule: completionRuleSchema,
});

export const loginRequestSchema = z.object({
  inviteCode: z.string().min(1),
});

export const todayPutSchema = z.object({
  arcId: z.string(),
  payload: z.record(z.unknown()),
});
