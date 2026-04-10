type Props = {
  label: string;
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
};

export function MultiselectField({ label, options, value, onChange }: Props) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  }

  return (
    <div className="rounded-xl border border-slate-700/50 bg-white/5 p-4">
      <div className="mb-2 text-xs font-medium text-arc-muted">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
              value.includes(opt)
                ? "bg-arc-accent/20 text-arc-accent border border-arc-accent/40"
                : "bg-white/5 text-arc-muted border border-transparent hover:bg-white/10"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
