import { Check, X } from "lucide-react";

type Props = {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
};

export function DailyToggleField({ label, value, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 transition-all ${
        value
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700/50 bg-white/5 text-arc-muted"
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {value ? <Check size={18} /> : <X size={18} className="opacity-30" />}
    </button>
  );
}
