import { useMemo, useState } from "react";

import ModuleCard from "@/components/dashboard/ModuleCard";
import NumericInputField from "@/components/dashboard/NumericInputField";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import { Button } from "@/components/ui/button";
import { fetchPrediction } from "@/lib/api";
import { deriveHealthStatus, normaliseRul } from "@/lib/health";
import { Cog } from "lucide-react";

interface LandingGearPayload {
  load_during_landing: number;
  tire_pressure: number;
  speed_during_landing: number;
}

interface LandingGearFieldConfig {
  name: keyof LandingGearPayload;
  label: string;
  unit: string;
  placeholder: string;
}

const landingGearFields: LandingGearFieldConfig[] = [
  {
    name: "load_during_landing",
    label: "Load During Landing",
    unit: "kN",
    placeholder: "215",
  },
  {
    name: "tire_pressure",
    label: "Tire Pressure",
    unit: "psi",
    placeholder: "210",
  },
  {
    name: "speed_during_landing",
    label: "Landing Speed",
    unit: "kts",
    placeholder: "145",
  },
];

const LANDING_GEAR_ENDPOINT = "http://127.0.0.1:5000/predict/landing-gear";

const LandingGearModule = () => {
  const [formState, setFormState] = useState<Record<keyof LandingGearPayload, string>>({
    load_during_landing: "",
    tire_pressure: "",
    speed_during_landing: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictedRul, setPredictedRul] = useState<number | null>(null);

  // 🔹 Adjusted scaling just for Landing Gear (since its RUL range is much higher)
// --- Landing Gear health mapping ---
const scaledRul =
  predictedRul !== null ? Math.min(predictedRul, 400) : null;

// 1. Derive health zone using raw cycles (not normalized)
const status = useMemo(() => {
  if (scaledRul === null) return null;
  if (scaledRul >= 350) {
    return {
      zone: "optimal",
      label: "Optimal",
      message: "Subsystem operating within nominal parameters.",
      badgeClass:
        "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30",
      accentColor: "hsl(142 70% 45%)",
    };
  } else if (scaledRul >= 265) {
    return {
      zone: "caution",
      label: "Monitor",
      message: "Subsystem showing moderate wear. Schedule inspection soon.",
      badgeClass:
        "bg-amber-400/20 text-amber-600 ring-1 ring-amber-400/30",
      accentColor: "hsl(38 92% 55%)",
    };
  } else {
    return {
      zone: "critical",
      label: "Critical",
      message: "Immediate maintenance recommended.",
      badgeClass:
        "bg-rose-500/20 text-rose-600 ring-1 ring-rose-500/30",
      accentColor: "hsl(0 84% 60%)",
    };
  }
}, [scaledRul]);

// 2. Normalize progress correctly (so it’s not always 100%)
const progress = useMemo(() => {
  if (scaledRul === null) return 0;
  const pct = (scaledRul / 400) * 100;
  return Math.max(0, Math.min(100, pct));
}, [scaledRul]);


  const handleChange = (key: keyof LandingGearPayload, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const invalidField = landingGearFields.find((field) => {
      const raw = formState[field.name];
      return raw.trim() === "" || Number.isNaN(Number(raw));
    });

    if (invalidField) {
      setError(`Provide a numeric value for ${invalidField.label}.`);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = Object.fromEntries(
      landingGearFields.map((field) => [field.name, parseFloat(formState[field.name])]),
    ) as LandingGearPayload;

    try {
      const response = await fetchPrediction(LANDING_GEAR_ENDPOINT, payload);
      setPredictedRul(response.predicted_rul);
    } catch (predictionError) {
      setError(
        predictionError instanceof Error
          ? predictionError.message
          : "Unable to retrieve prediction.",
      );
      setPredictedRul(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModuleCard
      icon={Cog}
      title="Landing Gear Remaining Useful Life (RUL)"
      subtitle="Project touchdown loads and tyre wear for maintenance planning."
      accent="Landing Gear"
    >
   <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-[1.4fr,1fr] items-stretch">
<div className="flex flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-6 shadow-inner shadow-[inset_0_12px_30px_rgba(15,23,42,0.08)]">
<form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">

            {landingGearFields.map((field) => (
              <NumericInputField
                key={field.name}
                id={field.name}
                label={field.label}
                unit={field.unit}
                value={formState[field.name]}
                onChange={(value) => handleChange(field.name, value)}
                placeholder={field.placeholder}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Predict structural fatigue based on latest landing performance data.
            </p>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-full px-8 py-2 text-sm font-semibold uppercase tracking-[0.35em] shadow-elevated"
            >
              {loading ? "Predicting…" : "Predict RUL"}
            </Button>
          </div>
          {error ? (
            <p className="rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form> </div>
        
        <div className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-inner shadow-[inset_0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                Landing Gear Health
              </p>
              <h3 className="text-2xl font-semibold text-foreground">
                {predictedRul !== null ? `${predictedRul.toFixed(1)} cycles` : "Awaiting data"}
              </h3>
            </div>
            <HealthStatusBadge status={status} />
          </div>
          <div className="space-y-4">
            <div className="three-d-progress">
              <div
                className="three-d-progress__bar"
                style={{
                  transform: `scaleX(${progress / 100})`,
                  background: status?.accentColor ?? "linear-gradient(135deg, hsl(205 85% 52%), hsl(199 82% 58%))",
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Maintenance Threshold</span>
              <span className="font-semibold text-foreground">{Math.round(progress)}% consumed</span>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl bg-primary/5 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                Stress Margin
              </span>
              <span className="font-semibold text-foreground">
                {predictedRul !== null ? `${(100 - Math.round(progress))}% remaining` : "--"}
              </span>
            </div>
            <p className="text-muted-foreground">
              {status?.message ?? "Submit landing metrics to project 3D fatigue indicator."}
            </p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default LandingGearModule;
