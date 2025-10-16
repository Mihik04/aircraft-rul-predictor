import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
  className?: string;
  children: ReactNode;
}

const ModuleCard = ({
  icon: Icon,
  title,
  subtitle,
  accent,
  className,
  children,
}: ModuleCardProps) => {
  return (
    <section className={cn("glass-panel flex flex-col overflow-hidden", className)}>
      <div className="card-header-accent flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="size-6" strokeWidth={1.6} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{title}</h2>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {accent ? (
          <span className="rounded-full border border-primary/25 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
            {accent}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        {children}
      </div>
    </section>
  );
};

export default ModuleCard;
