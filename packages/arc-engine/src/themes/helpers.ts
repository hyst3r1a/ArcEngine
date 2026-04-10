import type { ArcTheme } from "@arc/shared";

const FALLBACK_BG = "/assets/fallback/bg-default.svg";

export function resolveBackgroundUrl(assetKey: string | undefined): string {
  return assetKey || FALLBACK_BG;
}

export function preloadThemeAssets(theme: ArcTheme): Promise<void[]> {
  const urls = [theme.backgroundImage, theme.emblemImage].filter(
    (u): u is string => !!u,
  );
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
}
