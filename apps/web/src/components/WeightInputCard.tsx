import { Minus, Plus } from "lucide-react";

type Props = {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export function WeightInputCard({
  label,
  value,
  onChange,
  min = 30,
  max = 300,
  step = 0.1,
  unit = "kg",
}: Props) {
  function adjust(delta: number) {
    const next = Math.round((value + delta) * 10) / 10;
    if (next >= min && next <= max) onChange(next);
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-white/5 p-4">
      <div className="mb-2 text-xs font-medium text-arc-muted">{label}</div>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => adjust(-step)}
          className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
        >
          <Minus size={16} />
        </button>
        <div className="min-w-[80px] text-center">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            className="w-20 bg-transparent text-center text-2xl font-bold text-arc-text outline-none"
            step={step}
            min={min}
            max={max}
          />
          <span className="text-xs text-arc-muted">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => adjust(step)}
          className="rounded-lg bg-white/10 p-2 transition-colors hover:bg-white/20"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
