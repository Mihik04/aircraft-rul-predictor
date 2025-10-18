/**
 * Shared API utility for making prediction requests
 * Works with both local FastAPI and deployed backend (Render)
 */

export interface PredictionPayload {
  [key: string]: number;
}

export interface PredictionResponse {
  predicted_rul: number;
  units?: string;
  model_version?: string;
  [key: string]: unknown;
}

// Timeout for API calls (15 seconds)
const REQUEST_TIMEOUT_MS = 30000;

// ✅ Dynamically detect backend URL (Render / Local)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:5000"; // fallback for local dev

/**
 * Universal function for prediction API requests
 */
export async function fetchPrediction<T extends PredictionResponse = PredictionResponse>(
  endpoint: string,
  payload: PredictionPayload,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    // 🧠 Build full URL
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`;

    console.log("🔗 Fetching from:", url); // helpful for debugging

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = await safeReadMessage(response);
      throw new Error(message || `Request failed with status ${response.status}`);
    }

    const data = (await response.json()) as T;

    if (typeof data.predicted_rul !== "number") {
      throw new Error("Response missing numeric predicted_rul");
    }

    return data;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Request timed out. Please retry.");
    }
    throw error instanceof Error
      ? error
      : new Error("Unable to complete prediction request");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/**
 * Safe JSON or text reader for non-200 responses
 */
async function safeReadMessage(response: Response) {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      const json = JSON.parse(text) as { message?: string; error?: string };
      return json.message || json.error || text;
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}
