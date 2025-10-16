import EngineModule from "@/components/dashboard/EngineModule";
import HydraulicsModule from "@/components/dashboard/HydraulicsModule";
import LandingGearModule from "@/components/dashboard/LandingGearModule";

const Index = () => {
  return (
    <div className="flex w-full flex-col gap-10 pb-10">
      <section className="glass-panel overflow-hidden px-8 py-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary/70">
              Live Forecast
            </p>
            <h2 className="text-3xl font-semibold text-foreground">
              Subsystem RUL Predictions
            </h2>
            <p className="text-sm text-muted-foreground">
              Adjust subsystem telemetry below to project remaining useful life across the fleet.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                Forecast Horizon
              </p>
              <p className="text-xl font-semibold text-foreground">120 hrs</p>
            </div>
            <div className="rounded-2xl border border-white/50 bg-white/70 px-4 py-3 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                Confidence Interval
              </p>
              <p className="text-xl font-semibold text-foreground">± 7.4%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-2">
        <div className="xl:col-span-2">
          <EngineModule />
        </div >
         <div className="xl:col-span-2">
          <HydraulicsModule />
        </div >
         <div className="xl:col-span-2">
         <LandingGearModule />
        </div >
       
        
      </section>
    </div>
  );
};

export default Index;
