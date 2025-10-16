export interface PredictionPayload {
  [key: string]: number;
}

export interface PredictionResponse {
  predicted_rul: number;
  [key: string]: unknown;
}

const REQUEST_TIMEOUT_MS = 15000;

export async function fetchPrediction<T extends PredictionResponse = PredictionResponse>(
  endpoint: string,
  payload: PredictionPayload,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
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
      throw new Error("Response is missing numeric predicted_rul");
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
