import { z } from "zod";
import type { ArcSchema, ArcSchemaField } from "@arc/shared";

function fieldToZod(field: ArcSchemaField): z.ZodTypeAny {
  switch (field.kind) {
    case "boolean":
      return z.boolean();
    case "number": {
      let schema = z.number();
      if (field.min !== undefined) schema = schema.min(field.min);
      if (field.max !== undefined) schema = schema.max(field.max);
      return schema;
    }
    case "enum":
      return z.enum(field.options as [string, ...string[]]);
    case "multiselect":
      return z.array(z.enum(field.options as [string, ...string[]]));
  }
}

export function buildPayloadSchema(
  arcSchema: ArcSchema,
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of arcSchema.dailyFields) {
    shape[field.key] = fieldToZod(field);
  }
  return z.object(shape);
}
