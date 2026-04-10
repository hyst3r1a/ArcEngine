import type { ArcDefinition } from "@arc/shared";

export const consistencyArc: ArcDefinition = {
  id: "consistency",
  name: "Consistency Arc",
  description:
    "Build the foundation. Eliminate junk, move daily, track everything. 21-day streak to unlock the next arc.",
  order: 1,
  schemaVersion: 1,
  theme: {
    titleFontClass: "font-title",
    accentColor: "#3B82F6",
    surfaceClass: "bg-slate-900/70",
    overlayGradient: "from-slate-900/80 via-slate-900/40 to-transparent",
    backgroundImage: "/assets/arcs/consistency/bg-main.svg",
    emblemImage: "/assets/arcs/consistency/emblem.svg",
    cardVariant: "glass",
  },
  schema: {
    dailyFields: [
      { kind: "boolean", key: "noFastFood", label: "No Fast Food" },
      { kind: "boolean", key: "noSugar", label: "No Sugar" },
      { kind: "boolean", key: "noSugaryDrinks", label: "No Sugary Drinks" },
      { kind: "boolean", key: "noExcessOil", label: "No Excess Oil" },
      { kind: "boolean", key: "movedToday", label: "Moved Today" },
      { kind: "boolean", key: "loggedWeight", label: "Logged Weight" },
      { kind: "number", key: "weight", label: "Weight", min: 30, max: 300, unit: "kg" },
      { kind: "boolean", key: "caloriesLogged", label: "Calories Logged" },
      {
        kind: "enum",
        key: "mood",
        label: "Mood",
        options: ["bad", "meh", "ok", "good"],
      },
      {
        kind: "enum",
        key: "stress",
        label: "Stress",
        options: ["high", "medium", "low"],
      },
    ],
  },
  scoring: [
    { type: "booleanEquals", field: "noFastFood", expected: true, points: 1 },
    { type: "booleanEquals", field: "noSugar", expected: true, points: 1 },
    { type: "booleanEquals", field: "noSugaryDrinks", expected: true, points: 1 },
    { type: "booleanEquals", field: "noExcessOil", expected: true, points: 1 },
    { type: "booleanEquals", field: "movedToday", expected: true, points: 1 },
    { type: "booleanEquals", field: "loggedWeight", expected: true, points: 1 },
    { type: "booleanEquals", field: "caloriesLogged", expected: true, points: 1 },
  ],
  completionRule: { type: "streakAtLeast", days: 21 },
};
