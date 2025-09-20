import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressCircleProps = {
  value: number | null | undefined;
  label: string;
  displayLabel?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentText?: boolean;
};

export function ProgressCircle({
  value,
  label,
  displayLabel,
  size = 44,
  strokeWidth = 4,
  className,
  showPercentText = true,
}: ProgressCircleProps) {
  const gradientId = React.useId();
  const radius = React.useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = React.useMemo(() => 2 * Math.PI * radius, [radius]);

  const clampedValue = typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : null;
  const dashOffset = clampedValue === null ? circumference : circumference - (clampedValue / 100) * circumference;
  const visualLabel = displayLabel ?? label;

  return (
    <div
      className={cn(
        "flex h-full min-w-[76px] flex-col items-center justify-center gap-1 rounded-xl border border-border/60 bg-card/70 px-3 py-2 shadow-sm backdrop-blur",
        className
      )}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${clampedValue === null ? "Not available" : `${clampedValue.toFixed(0)} percent`}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={strokeWidth}
          opacity={0.4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="54%"
          textAnchor="middle"
          fontSize={size * 0.32}
          fontWeight="600"
          fill="hsl(var(--foreground))"
        >
          {clampedValue === null ? "--" : `${Math.round(clampedValue)}`}
        </text>
      </svg>
      <div className="flex flex-col items-center leading-tight">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{visualLabel}</span>
        {showPercentText && (
          <span className="text-[11px] text-foreground">
            {clampedValue === null ? "n/a" : `${clampedValue.toFixed(0)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
