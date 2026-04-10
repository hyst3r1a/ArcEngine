type Props = {
  label: string;
  value: string | number;
  accentColor?: string;
};

export function Badge({ label, value, accentColor }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
      <span className="text-xs text-arc-muted">{label}</span>
      <span
        className="text-sm font-bold"
        style={{ color: accentColor ?? "var(--arc-accent)" }}
      >
        {value}
      </span>
    </div>
  );
}
