import { ChangeEvent } from "react";

import { cn } from "@/lib/utils";

export interface NumericInputFieldProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const NumericInputField = ({
  id,
  label,
  unit,
  value,
  onChange,
  placeholder,
  className,
}: NumericInputFieldProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <label
      htmlFor={id}
      className={cn(
        "space-y-2 rounded-2xl border border-white/40 bg-white/60 p-4 shadow-inner shadow-[inset_0_8px_24px_rgba(15,23,42,0.06)] backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/80">
        <span>{label}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] text-primary">
          {unit}
        </span>
      </div>
      <input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        step="any"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/60 bg-white/80 px-4 py-2.5 text-base font-semibold text-foreground shadow-[0_10px_30px_-20px_rgba(15,23,42,0.55)] outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-white/80"
      />
    </label>
  );
};

export default NumericInputField;
