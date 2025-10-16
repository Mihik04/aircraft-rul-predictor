import { useMemo, useState } from "react";

import ModuleCard from "@/components/dashboard/ModuleCard";
import NumericInputField from "@/components/dashboard/NumericInputField";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import { Button } from "@/components/ui/button";
import { fetchPrediction } from "@/lib/api";
import { deriveHealthStatus, normaliseRul } from "@/lib/health";
import { Droplets } from "lucide-react";

interface HydraulicsPayload {
  PS6_mean: number;
  PS5_mean: number;
  CE_mean: number;
  TS4_mean: number;
  TS2_mean: number;
  TS1_mean: number;
  CP_mean: number;
  TS3_mean: number;
}

interface HydraulicsFieldConfig {
  name: keyof HydraulicsPayload;
  label: string;
  unit: string;
  placeholder: string;
}

const hydraulicsFields: HydraulicsFieldConfig[] = [
  { name: "PS6_mean", label: "PS6 Mean", unit: "psi", placeholder: "2950" },
  { name: "PS5_mean", label: "PS5 Mean", unit: "psi", placeholder: "2850" },
  { name: "CE_mean", label: "Coolant Eff.", unit: "%", placeholder: "87" },
  { name: "TS4_mean", label: "TS4 Mean", unit: "°C", placeholder: "140" },
  { name: "TS2_mean", label: "TS2 Mean", unit: "°C", placeholder: "92" },
  { name: "TS1_mean", label: "TS1 Mean", unit: "°C", placeholder: "88" },
  { name: "CP_mean", label: "Charge Pressure", unit: "bar", placeholder: "210" },
  { name: "TS3_mean", label: "TS3 Mean", unit: "°C", placeholder: "118" },
];

const HYDRAULICS_ENDPOINT = "http://127.0.0.1:5000/predict/hydraulics";

const HydraulicsModule = () => {
  const [formState, setFormState] = useState<Record<keyof HydraulicsPayload, string>>({
    PS6_mean: "",
    PS5_mean: "",
    CE_mean: "",
    TS4_mean: "",
    TS2_mean: "",
    TS1_mean: "",
    CP_mean: "",
    TS3_mean: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictedRul, setPredictedRul] = useState<number | null>(null);

  const status = useMemo(() => deriveHealthStatus(predictedRul), [predictedRul]);
  const normalised = useMemo(() => normaliseRul(predictedRul, 110), [predictedRul]);

  const handleChange = (key: keyof HydraulicsPayload, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const invalidField = hydraulicsFields.find((field) => {
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
      hydraulicsFields.map((field) => [field.name, parseFloat(formState[field.name])]),
    ) as HydraulicsPayload;

    try {
      const response = await fetchPrediction(HYDRAULICS_ENDPOINT, payload);
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
      icon={Droplets}
      title="Hydraulics Remaining Useful Life (RUL)"
      subtitle="Assess hydraulic circuit integrity and fluid pressures."
      accent="Hydraulics"
    >
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-[1.4fr,1fr] items-stretch">

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
         <div className="grid grid-cols-3 gap-x-6 gap-y-4">

            {hydraulicsFields.map((field) => (
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
              Inputs represent averaged telemetry features from the hydraulic subsystem.
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
        </form>
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-inner shadow-[inset_0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                  Hydraulic Health
                </p>
                <h3 className="text-2xl font-semibold text-foreground">
                  {predictedRul !== null ? `${predictedRul.toFixed(1)} hrs` : "Awaiting data"}
                </h3>
              </div>
              <HealthStatusBadge status={status} />
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${normalised}%`,
                  background: status?.accentColor ?? "hsl(var(--primary))",
                }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {status?.message ?? "Run a prediction to determine hydraulic maintenance horizon."}
            </p>
          </div>
          {predictedRul !== null ? (
            <dl className="grid gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground/80">
              <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-4 py-2">
                <dt>Stability Margin</dt>
                <dd className="text-foreground">{Math.round(normalised)}%</dd>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/40 bg-white/60 px-4 py-2">
                <dt>Fluid Condition</dt>
                <dd className="text-foreground">{status?.label ?? "--"}</dd>
              </div>
            </dl>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-6 text-center text-sm text-muted-foreground">
              Prediction results and health status will appear here.
            </div>
          )}
        </div>
      </div>
    </ModuleCard>
  );
};

export default HydraulicsModule;
