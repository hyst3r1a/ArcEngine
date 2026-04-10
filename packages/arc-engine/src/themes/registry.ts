import type { ArcTheme } from "@arc/shared";

const themeRegistry: Record<string, ArcTheme> = {
  consistency: {
    titleFontClass: "font-title",
    accentColor: "#3B82F6",
    surfaceClass: "bg-slate-900/70",
    overlayGradient: "from-slate-900/80 via-slate-900/40 to-transparent",
    backgroundImage: "/assets/arcs/consistency/bg-main.webp",
    emblemImage: "/assets/arcs/consistency/emblem.webp",
    cardVariant: "glass",
  },
};

const fallbackTheme: ArcTheme = {
  titleFontClass: "font-title",
  accentColor: "#6366F1",
  surfaceClass: "bg-slate-900/70",
  overlayGradient: "from-slate-900/80 via-slate-900/60 to-transparent",
  backgroundImage: "/assets/fallback/bg-default.svg",
  cardVariant: "clean",
};

export function getArcTheme(arcId: string): ArcTheme {
  return themeRegistry[arcId] ?? fallbackTheme;
}

export function registerTheme(arcId: string, theme: ArcTheme) {
  themeRegistry[arcId] = theme;
}
