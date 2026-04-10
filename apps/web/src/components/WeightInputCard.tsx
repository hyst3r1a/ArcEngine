import { useState, useRef, useEffect } from "react";
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
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const holdRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);

  function clamp(v: number) {
    return Math.round(Math.min(max, Math.max(min, v)) * 10) / 10;
  }

  function commit(raw: string) {
    const v = parseFloat(raw);
    if (!isNaN(v)) onChange(clamp(v));
    setEditing(false);
  }

  const currentRef = useRef(value);
  currentRef.current = value;

  function startHold(delta: number) {
    onChange(clamp(value + delta));
    holdRef.current = setInterval(() => {
      const next = clamp(currentRef.current + delta);
      onChange(next);
    }, 120);
  }

  function stopHold() {
    clearInterval(holdRef.current);
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-white/5 p-4">
      <div className="mb-2 text-xs font-medium text-arc-muted">{label}</div>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onPointerDown={() => startHold(-step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20 active:bg-white/30"
        >
          <Minus size={18} />
        </button>

        <div className="relative text-center">
          <input
            ref={inputRef}
            inputMode="decimal"
            type="text"
            value={editing ? draft : value}
            onFocus={() => {
              setEditing(true);
              setDraft(String(value));
              requestAnimationFrame(() => inputRef.current?.select());
            }}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => commit(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                commit(draft);
                inputRef.current?.blur();
              }
            }}
            className="w-28 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 text-center text-2xl font-bold text-arc-text outline-none focus:border-arc-accent"
          />
          <span className="ml-1 text-sm text-arc-muted">{unit}</span>
        </div>

        <button
          type="button"
          onPointerDown={() => startHold(step)}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          className="rounded-lg bg-white/10 p-2.5 transition-colors hover:bg-white/20 active:bg-white/30"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
