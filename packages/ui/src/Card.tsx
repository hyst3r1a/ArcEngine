import type { ReactNode } from "react";

type Variant = "glass" | "ink" | "clean";

type Props = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  glass: "bg-white/10 backdrop-blur-md border border-white/10",
  ink: "bg-slate-900/80 border border-slate-700/50",
  clean: "bg-white/95 text-slate-900 border border-slate-200",
};

export function Card({ variant = "glass", className = "", children }: Props) {
  return (
    <div className={`rounded-2xl p-4 ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}
