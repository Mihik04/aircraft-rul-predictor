import { useMutation } from "@tanstack/react-query";
import type { PredictionInput, PredictionResponse } from "@shared/api";

/**
 * Base backend URL — defined in your .env as:
 * VITE_API_BASE_URL=http://127.0.0.1:5000
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * 🔧 Utility: Perform a POST request to the FastAPI backend
 */
async function requestPrediction(
  payload: PredictionInput
): Promise<PredictionResponse> {
  const { subsystem, readings } = payload;

  const response = await fetch(`${API_BASE}/predict/${subsystem}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(readings),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Backend error: ${response.status} - ${text}`);
  }

  return await response.json();
}

/**
 * 🧠 React Query mutation hook for predictions
 */
export function usePrediction() {
  const mutation = useMutation({
    mutationFn: requestPrediction,
    onError: (error) => {
      console.error("Prediction failed:", error);
    },
  });

  return {
    predict: mutation.mutate,
    predictAsync: mutation.mutateAsync,
    data: mutation.data,
    error: mutation.error,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
  };
}
