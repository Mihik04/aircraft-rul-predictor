/**
 * Shared code between client and server
 * Used to define consistent types for prediction API requests/responses
 * for Engine, Hydraulics, and Landing Gear systems.
 */

export type SubsystemId = "engine" | "hydraulics" | "landing-gear";

/**
 * 👇 Represents a single sensor reading
 */
export interface SensorReading {
  sensor: string;
  value: number;
  unit?: string;
}

/**
 * 👇 Request payload for the prediction API
 */
export interface PredictionInput {
  subsystem: SubsystemId;
  readings: Record<string, number>; // key-value pairs for input features
}

/**
 * 👇 Response payload from FastAPI backend
 */
export interface PredictionResponse {
  predicted_rul: number;
  units: string; // usually "cycles"
  model_version: string;
}

/**
 * 👇 Optional structure for displaying a trend chart (UI only)
 */
export interface TrendPoint {
  cycle: number;
  healthScore: number;
}

/**
 * 👇 Example response for Builder.io testing or API demo
 */
export interface DemoResponse {
  message: string;
}
