export type ArcSchemaField =
  | { kind: "boolean"; key: string; label: string }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; unit?: string }
  | { kind: "enum"; key: string; label: string; options: string[] }
  | { kind: "multiselect"; key: string; label: string; options: string[] };

export type ArcSchema = {
  dailyFields: ArcSchemaField[];
};

export type ArcScoringRule =
  | { type: "booleanEquals"; field: string; expected: boolean; points: number }
  | { type: "numberRange"; field: string; min?: number; max?: number; points: number }
  | { type: "enumEquals"; field: string; value: string; points: number };

export type CompletionRule =
  | { type: "streakAtLeast"; days: number }
  | { type: "scoreAtLeast"; points: number }
  | { type: "manualUnlock" };

export type ArcTheme = {
  titleFontClass: string;
  accentColor: string;
  surfaceClass: string;
  overlayGradient: string;
  backgroundImage: string;
  emblemImage?: string;
  cardVariant: "glass" | "ink" | "clean";
};

export type ArcDefinition = {
  id: string;
  name: string;
  description: string;
  order: number;
  schemaVersion: number;
  theme: ArcTheme;
  schema: ArcSchema;
  scoring: ArcScoringRule[];
  completionRule: CompletionRule;
};
