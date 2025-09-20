import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number | null | undefined;
  max?: number;
  className?: string;
}

export function ProgressBar({ value, max = 100, className }: ProgressBarProps) {
  const clamped = typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(value, max))
    : null;

  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full bg-primary transition-all"
        style={{ width: clamped === null ? "0%" : `${(clamped / max) * 100}%` }}
      />
    </div>
  );
}
