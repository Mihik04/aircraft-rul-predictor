import { Activity, Clock3, PlaneTakeoff, Radar } from "lucide-react";

import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="relative z-40 py-6">
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="glass-panel overflow-hidden">
          <div className="card-header-accent bg-nav-radar px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-inner shadow-[0_12px_32px_-20px_rgba(15,23,42,0.55)]">
                  <PlaneTakeoff className="size-6" strokeWidth={1.6} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
                    Predictive Ops Center
                  </p>
                  <h1 className="text-2xl font-semibold sm:text-3xl">
                    Aircraft Predictive Maintenance Dashboard
                  </h1>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-primary/30 bg-white/60 px-6 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-primary shadow-focus-outline transition hover:border-primary hover:bg-white"
              >
                Sync Sensors
              </Button>
            </div>
          </div>
          <div className="grid gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Radar className="size-5 text-primary" strokeWidth={1.6} />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                    Live Telemetry
                  </p>
                  <p className="font-semibold text-foreground">Hydraulics &amp; Engine</p>
                </div>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Streaming
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Clock3 className="size-5 text-primary" strokeWidth={1.6} />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                    Last Sync
                  </p>
                  <p className="font-semibold text-foreground">02 min ago</p>
                </div>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                Auto
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Activity className="size-5 text-primary" strokeWidth={1.6} />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                    Fleet Health Index
                  </p>
                  <p className="font-semibold text-foreground">92.4%</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600">
                Nominal
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
