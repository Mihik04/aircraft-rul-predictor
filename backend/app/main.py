from pathlib import Path
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    EngineInput, EngineBatch,
    HydraulicsInput, HydraulicsBatch,
    LandingGearInput, LandingGearBatch,
    RULResponse, RULBatchResponse
)
from .models_loader import load_model
from .inference import engine_to_array, hyd_to_array, lg_to_array

APP_DIR = Path(__file__).parent
MODELS_DIR = APP_DIR.parent / "models"

app = FastAPI(title="Aircraft Subsystem RUL API", version="1.0.0")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok", "version": app.version}


# ---------- ENGINE ----------
@app.post("/predict/engine", response_model=RULResponse)
def predict_engine(payload: EngineInput):
    try:
        model = load_model("engine", MODELS_DIR)
        x = engine_to_array(payload).reshape(1, -1)

        # 🧠 Debug block
        print("\n--- ENGINE DEBUG ---")
        print("Payload keys:", list(payload.model_dump().keys())[:10])
        print("Input array shape:", x.shape)
        print("First 5 scaled values:", x[0][:5])
        y = float(model.predict(x)[0])
        print("Predicted RUL:", y)
        print("---------------------\n")

        return RULResponse(predicted_rul=y, model_version="best_model_fd001")

    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


# ---------- HYDRAULICS ----------
@app.post("/predict/hydraulics", response_model=RULResponse)
def predict_hydraulics(payload: HydraulicsInput):
    try:
        model = load_model("hydraulics", MODELS_DIR)
        x = hyd_to_array(payload).reshape(1, -1)

        # 🧠 Debug block
        print("\n--- HYD DEBUG ---")
        print("Input shape:", x.shape)
        print("First 5 values:", x[0][:5])
        y = float(model.predict(x)[0])
        print("Predicted RUL (raw):", y)
        print("-----------------\n")

        # --- SMART HYDRAULIC RUL AUTO-NORMALIZATION ---
        import numpy as np

        # Keep short history of recent hydraulics predictions
        if not hasattr(predict_hydraulics, "rul_history"):
            predict_hydraulics.rul_history = []

        predict_hydraulics.rul_history.append(y)

        # Keep only the last 100 predictions
        if len(predict_hydraulics.rul_history) > 100:
            predict_hydraulics.rul_history.pop(0)

        # Compute dynamic range (mean ± std)
        mean_rul = np.mean(predict_hydraulics.rul_history)
        std_rul = np.std(predict_hydraulics.rul_history)

        # Dynamic scaling bounds
        low_bound = max(80, mean_rul - 2 * std_rul)
        high_bound = min(120, mean_rul + 2 * std_rul)

        # Rescale RUL into [60, 120] range for visualization
        y_scaled = np.interp(y, [low_bound, high_bound], [60, 120])
        y_scaled = round(float(np.clip(y_scaled, 60, 120)), 2)

        print(f"[HYD SMART SCALE] raw={y:.2f}, mean={mean_rul:.2f}, std={std_rul:.2f}, scaled={y_scaled:.2f}")
        # -------------------------------------------------------------

        return RULResponse(predicted_rul=y_scaled, model_version="agg_best_model")

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))


# ---------- LANDING GEAR ----------
@app.post("/predict/landing-gear", response_model=RULResponse)
def predict_landing_gear(payload: LandingGearInput):
    try:
        model = load_model("landing_gear", MODELS_DIR)
        x = lg_to_array(payload).reshape(1, -1)

        # 🧠 Debug block
        print("\n--- LG DEBUG ---")
        print("Input:", x)
        y = float(model.predict(x)[0])
        print("Predicted RUL:", y)
        print("----------------\n")

        return RULResponse(predicted_rul=y, model_version="best_rul_model_top3")

    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))
