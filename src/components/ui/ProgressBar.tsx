type ProgressBarProps = {
  value: number;
  tone?: "success" | "warning" | "danger";
};

export function ProgressBar({ value, tone = "success" }: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  const toneClass =
    tone === "danger"
      ? "bg-red-500"
      : tone === "warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${toneClass} transition-all duration-500`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}