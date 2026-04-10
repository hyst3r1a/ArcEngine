type Props = {
  subtitle?: string;
  title: string;
  accentColor?: string;
};

export function ChapterTitle({ subtitle, title, accentColor }: Props) {
  return (
    <div className="relative mb-4">
      {subtitle && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-arc-muted">
          {subtitle}
        </span>
      )}
      <h1 className="font-title text-4xl leading-none tracking-tight text-arc-text">
        {title}
      </h1>
      <div
        className="mt-2 h-1 w-16 rounded-full"
        style={{ backgroundColor: accentColor ?? "var(--arc-accent)" }}
      />
    </div>
  );
}
