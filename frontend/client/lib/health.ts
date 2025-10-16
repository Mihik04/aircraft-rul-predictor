export type HealthZone = "optimal" | "caution" | "critical";

export interface HealthStatusDescriptor {
  zone: HealthZone;
  label: string;
  message: string;
  badgeClass: string;
  accentColor: string;
}

// 🔹 Derive color + text feedback based on RUL value
export function deriveHealthStatus(rul: number | null): HealthStatusDescriptor | null {
  if (rul === null || Number.isNaN(rul)) {
    return null;
  }

  // Adjusted ranges for better differentiation
  if (rul >= 100) {
    return {
      zone: "optimal",
      label: "Optimal",
      message: "Subsystem operating within nominal parameters.",
      badgeClass: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30",
      accentColor: "hsl(142 70% 45%)",
    };
  }

  if (rul >= 80) {
    return {
      zone: "caution",
      label: "Monitor",
      message: "Subsystem showing moderate wear. Schedule inspection soon.",
      badgeClass: "bg-amber-400/20 text-amber-600 ring-1 ring-amber-400/30",
      accentColor: "hsl(38 92% 55%)",
    };
  }

  return {
    zone: "critical",
    label: "Critical",
    message: "Immediate maintenance recommended.",
    badgeClass: "bg-rose-500/20 text-rose-600 ring-1 ring-rose-500/30",
    accentColor: "hsl(0 84% 60%)",
  };
}

// 🔹 Normalizes RUL but with a slightly larger scaling buffer
export function normaliseRul(value: number | null, maximum: number): number {
  if (value === null || Number.isNaN(value) || maximum <= 0) {
    return 0;
  }

  // Increase denominator to reduce constant 100% bars
  const adjustedMax = maximum * 1.3;
  return Math.max(0, Math.min(100, (value / adjustedMax) * 100));
}
