import type { ReactNode } from "react";
import type { ArcTheme } from "@arc/shared";

type Props = {
  theme?: ArcTheme;
  children: ReactNode;
};

export function PageFrame({ theme, children }: Props) {
  const bg = theme?.backgroundImage ?? "/assets/fallback/bg-default.webp";
  const overlay = theme?.overlayGradient ?? "from-slate-900/80 via-slate-900/60 to-transparent";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background layer */}
      <img
        src={bg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />

      {/* Overlay gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${overlay}`} />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
