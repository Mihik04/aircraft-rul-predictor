from pathlib import Path
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
HUGGINGFACE_ENGINE_API = "https://mihik12-aircraft-engine-rul.hf.space/predict/engine"

from .schemas import (
    EngineInput, EngineBatch,
    HydraulicsInput, HydraulicsBatch,
    LandingGearInput, LandingGearBatch,
    RULResponse, RULBatchResponse
)
from .models_loader import load_model
from .inference import engine_to_array, hyd_to_array, lg_to_array
import pandas as pd
import psutil, os

def log_memory(tag=""):
    """Logs current process memory usage in MB for debugging."""
    process = psutil.Process(os.getpid())
    mem_mb = process.memory_info().rss / (1024 * 1024)
    print(f"[MEMORY] {tag} → {mem_mb:.2f} MB used")
    if mem_mb > 480:
        print("⚠️ [WARNING] Memory usage is near Render free limit (512MB)!")


# Cache models so they load only once (lazy loading)
_model_cache = {}

APP_DIR = Path(__file__).parent
MODELS_DIR = APP_DIR.parent / "models"

app = FastAPI(title="Aircraft Subsystem RUL API", version="1.0.0")

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*", 
        "http://127.0.0.1:4173",  # local frontend
        "https://your-frontend-url.vercel.app",  # if deployed on Vercel
    ],
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
    """
    Forward Engine RUL prediction requests to Hugging Face Space.
    Keeps Render lightweight (no local model loading).
    """
    try:
        print("[FORWARD] Sending Engine RUL request to Hugging Face...")
        response = requests.post(
            HUGGINGFACE_ENGINE_API,
            json=payload.model_dump(),
            timeout=30
        )
        response.raise_for_status()

        data = response.json()
        y = data.get("predicted_rul")
        if y is None:
            raise ValueError(f"Invalid response from Hugging Face: {data}")

        print(f"[FORWARD ✅] Engine RUL received from HF → {y}")
        return RULResponse(predicted_rul=y, model_version="HF_forward_proxy")

    except Exception as e:
        print(f"[FORWARD ❌] Hugging Face request failed: {e}")
        raise HTTPException(status_code=400, detail=f"Hugging Face proxy failed: {e}")

# ---------- HYDRAULICS ----------
@app.post("/predict/hydraulics", response_model=RULResponse)
def predict_hydraulics(payload: HydraulicsInput):
    """
    Stable, deterministic Hydraulics RUL prediction.
    ✅ Same input → exact same output (no floating variance)
    ✅ Includes clean scaling for visualization
    """
    try:
        import numpy as np

        # Load model and prepare data
        model = load_model("hydraulics", MODELS_DIR)
        x = hyd_to_array(payload).reshape(1, -1)

        # Debug info
        print("\n--- HYD DEBUG ---")
        print("Input shape:", x.shape)
        print("First 5 values:", x[0][:5])

        # Predict raw RUL
        y_raw = float(model.predict(x)[0])
        y_raw = round(y_raw, 4)  # 🧭 round to 4 decimals for stable math
        print(f"Predicted RUL (raw): {y_raw}")
        print("-----------------\n")

        # ✅ Fixed scaling range for visualization (deterministic)
        MIN_RUL = 80.0
        MAX_RUL = 120.0

        # Stable interpolation using deterministic float precision
        y_scaled = np.interp(y_raw, [MIN_RUL, MAX_RUL], [60, 120])
        y_scaled = round(float(y_scaled), 2)

        print(f"[HYD STABLE SCALE] raw={y_raw}, scaled={y_scaled}")

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
# ---------- ROOT / HOME ----------
@app.get("/")
def root():
    return {"status": "ok", "message": "Aircraft RUL API running on Render 🚀"}
