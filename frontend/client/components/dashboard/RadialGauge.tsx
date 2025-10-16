import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface RadialGaugeProps {
  value: number | null;
  max?: number;
  units?: string;
  color?: string;
  label?: string;
  className?: string;
}

const RadialGauge = ({
  value,
  max = 100,
  units = "hrs",
  color,
  label = "Predicted RUL",
  className,
}: RadialGaugeProps) => {
  const computed = normalise(value, max);
  const gaugeStyle = {
    "--gauge-color": color ?? "hsl(var(--primary))",
    "--gauge-value": `${(computed / 100) * 360}deg`,
  } as CSSProperties;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="radial-gauge size-44" style={gaugeStyle}>
        <span className="radial-gauge__value text-3xl text-foreground">
          {value !== null ? `${value.toFixed(1)} ${units}` : "--"}
        </span>
      </div>
      <div className="text-center text-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
          {label}
        </p>
        {value !== null ? (
          <p className="text-base font-semibold text-foreground">
            {Math.round(computed)}% of max threshold
          </p>
        ) : (
          <p className="text-base text-muted-foreground">Awaiting prediction</p>
        )}
      </div>
    </div>
  );
};

function normalise(value: number | null, max: number) {
  if (value === null || Number.isNaN(value) || max <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(100, (value / max) * 100));
}

export default RadialGauge;
