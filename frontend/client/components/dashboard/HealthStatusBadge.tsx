import { cn } from "@/lib/utils";
import type { HealthStatusDescriptor } from "@/lib/health";

interface HealthStatusBadgeProps {
  status: HealthStatusDescriptor | null;
  className?: string;
}

const HealthStatusBadge = ({ status, className }: HealthStatusBadgeProps) => {
  if (!status) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] transition",
        status.badgeClass,
        className,
      )}
    >
      <span className="size-2 rounded-full bg-current" aria-hidden />
      {status.label}
    </span>
  );
};

export default HealthStatusBadge;
