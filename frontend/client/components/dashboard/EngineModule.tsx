import { useMemo, useState } from "react";

import ModuleCard from "@/components/dashboard/ModuleCard";
import NumericInputField from "@/components/dashboard/NumericInputField";
import RadialGauge from "@/components/dashboard/RadialGauge";
import HealthStatusBadge from "@/components/dashboard/HealthStatusBadge";
import { Button } from "@/components/ui/button";
import { fetchPrediction } from "@/lib/api";
import { deriveHealthStatus, normaliseRul } from "@/lib/health";
import { GaugeCircle } from "lucide-react";

interface EngineFieldConfig {
  name: keyof EnginePayload;
  label: string;
  unit: string;
  placeholder: string;
}

interface EnginePayload {
  op_setting_1: number;
  op_setting_2: number;
  op_setting_3: number;
  sensor_11: number;
  sensor_4: number;
  sensor_12: number;
}

const engineFields: EngineFieldConfig[] = [
  {
    name: "op_setting_1",
    label: "Op. Setting 1",
    unit: "%",
    placeholder: "0.0005",
  },
  {
    name: "op_setting_2",
    label: "Op. Setting 2",
    unit: "%",
    placeholder: "0.0008",
  },
  {
    name: "op_setting_3",
    label: "Op. Setting 3",
    unit: "%",
    placeholder: "100",
  },
  {
    name: "sensor_11",
    label: "Sensor 11",
    unit: "°C",
    placeholder: "1200",
  },
  {
    name: "sensor_4",
    label: "Sensor 4",
    unit: "psi",
    placeholder: "48.5",
  },
  {
    name: "sensor_12",
    label: "Sensor 12",
    unit: "°C",
    placeholder: "540",
  },
];

const ENGINE_ENDPOINT = "http://127.0.0.1:5000/predict/engine";

const EngineModule = () => {
  const [formState, setFormState] = useState<Record<keyof EnginePayload, string>>({
    op_setting_1: "",
    op_setting_2: "",
    op_setting_3: "",
    sensor_11: "",
    sensor_4: "",
    sensor_12: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictedRul, setPredictedRul] = useState<number | null>(null);

  const status = useMemo(() => deriveHealthStatus(predictedRul), [predictedRul]);
  const gaugeColor = status?.accentColor;
  const normalised = useMemo(() => normaliseRul(predictedRul, 120), [predictedRul]);

  const handleChange = (key: keyof EnginePayload, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const invalidField = engineFields.find((field) => {
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
      engineFields.map((field) => [field.name, parseFloat(formState[field.name])]),
    ) as EnginePayload;

    try {
      const response = await fetchPrediction(ENGINE_ENDPOINT, payload);
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
      icon={GaugeCircle}
      title="Engine Remaining Useful Life (RUL)"
      subtitle="Predict turbine degradation trajectory from operational inputs."
      accent="Engine"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {engineFields.map((field) => (
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
              Input current sensor readings to estimate remaining engine flight hours.
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
                Engine Health
              </p>
              <h3 className="text-2xl font-semibold text-foreground">
                {predictedRul !== null ? `${predictedRul.toFixed(1)} hrs` : "Awaiting data"}
              </h3>
            </div>
            <HealthStatusBadge status={status} />
          </div>
          <RadialGauge
            value={predictedRul}
            max={120}
            color={gaugeColor}
            units="hrs"
          />
          <div className="space-y-2 rounded-2xl bg-primary/5 p-4 text-sm">
            <p className="font-semibold text-primary">
              Normalised Remaining Life: {Math.round(normalised)}%
            </p>
            <p className="text-muted-foreground">
              {status?.message ?? "Run a prediction to visualise projected engine lifecycle."}
            </p>
          </div>
        </div>
      </div>
    </ModuleCard>
  );
};

export default EngineModule;
