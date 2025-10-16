from pathlib import Path
import json
import numpy as np
from typing import List
from .schemas import EngineInput, HydraulicsInput, LandingGearInput
from .models_loader import load_model

# ---------- Load per-feature defaults ----------
DEFAULTS_PATH = Path(__file__).parent.parent / "models" / "feature_defaults.json"
try:
    FEATURE_DEFAULTS = json.loads(DEFAULTS_PATH.read_text()) if DEFAULTS_PATH.exists() else {}
except Exception:
    FEATURE_DEFAULTS = {}

# Ensure required keys
FEATURE_DEFAULTS.setdefault("engine", {})
FEATURE_DEFAULTS.setdefault("hyd", {})
FEATURE_DEFAULTS.setdefault("lg", {})

# ---------- Feature names ----------
ENGINE_FEATURES: List[str] = [
    "time_in_cycles","op_setting_1","op_setting_2","op_setting_3",
    *[f"sensor_{i}" for i in range(1,22)]
]
HYD_FEATURES: List[str] = [
    "CE_mean", "CE_std", "CE_min", "CE_max",
    "CP_mean", "CP_std", "CP_min", "CP_max",
    "EPS1_mean", "EPS1_std", "EPS1_min", "EPS1_max",
    "FS1_mean", "FS1_std", "FS1_min", "FS1_max",
    "FS2_mean", "FS2_std", "FS2_min", "FS2_max",
    "PS1_mean", "PS1_std", "PS1_min", "PS1_max",
    "PS2_mean", "PS2_std", "PS2_max",
    "PS3_mean", "PS3_std", "PS3_max",
    "PS4_mean", "PS4_std", "PS4_min", "PS4_max",
    "PS5_mean", "PS5_std", "PS5_min", "PS5_max",
    "PS6_mean", "PS6_std", "PS6_min", "PS6_max",
    "SE_mean", "SE_std", "SE_max",
    "TS1_mean", "TS1_std", "TS1_min", "TS1_max",
    "TS2_mean", "TS2_std", "TS2_min", "TS2_max",
    "TS3_mean", "TS3_std", "TS3_min", "TS3_max",
    "TS4_mean", "TS4_std", "TS4_min", "TS4_max",
    "VS1_mean", "VS1_std", "VS1_min", "VS1_max"
]

LG_FEATURES_TOP3: List[str] = ["load_during_landing", "tire_pressure", "speed_during_landing"]

# ---------- Safe imputation ----------
def _impute_row(feature_names, values_dict, defaults_dict):
    """
    Fill missing feature values using defaults (means) and clamp them to their min–max range.
    """
    out = []
    for f in feature_names:
        stats = defaults_dict.get(f, None)
        v = values_dict.get(f, None)

        # If missing or invalid → use mean
        if v is None or (isinstance(v, float) and np.isnan(v)):
            if isinstance(stats, dict):
                v = stats.get("mean", 0.0)
            else:
                v = 0.0

        # Clamp value if we have stats
        if isinstance(stats, dict):
            v = max(stats.get("min", v), min(v, stats.get("max", v)))

        out.append(float(v))

    arr = np.array(out, dtype=float)
    arr = np.nan_to_num(arr, nan=0.0, posinf=1e6, neginf=-1e6)
    return arr



# ---------- Conversion helpers ----------
def engine_to_array(item: EngineInput) -> np.ndarray:
    """
    Convert engine input into model-ready numeric array.
    Missing features are imputed using feature_defaults.json.
    """
    vals = item.model_dump()

    # Fill + clamp using defaults
    from .inference import FEATURE_DEFAULTS, _impute_row
    defaults = FEATURE_DEFAULTS.get("engine", {})

    filled = _impute_row(ENGINE_FEATURES, vals, defaults)
    filled = filled.reshape(1, -1)

    # Scale it
    scaler = load_model("scaler_engine", Path(__file__).parent.parent / "models")
    x_scaled = scaler.transform(filled)

    print("\n--- ENGINE DEBUG ---")
    print("Payload keys:", list(vals.keys()))
    print("Input array shape:", x_scaled.shape)
    print("First 5 scaled values:", x_scaled[0][:5])
    print("---------------------\n")

    return x_scaled.ravel()




def hyd_to_array(payload):
    """Builds a full 65-feature array using smart correlations from limited frontend inputs."""
    # Load feature defaults
    with open(DEFAULTS_PATH, "r") as f:
        defaults = json.load(f)["hyd"]
        

    # Extract main user inputs
    vals = {
        "PS6_mean": payload.PS6_mean,
        "PS5_mean": payload.PS5_mean,
        "CE_mean": payload.CE_mean,
        "TS4_mean": payload.TS4_mean,
        "TS2_mean": payload.TS2_mean,
        "TS1_mean": payload.TS1_mean,
        "CP_mean": payload.CP_mean,
        "TS3_mean": payload.TS3_mean,
    }

    # --- Simulate correlations for missing features ---
    # Temperatures correlation
    avg_temp = np.mean([vals["TS1_mean"], vals["TS2_mean"], vals["TS3_mean"], vals["TS4_mean"]])
    vals["SE_mean"] = avg_temp * 1.15 + np.random.uniform(-2, 2)
    vals["TS5_mean"] = avg_temp * 0.97 + np.random.uniform(-1, 1)
    vals["TS6_mean"] = avg_temp * 1.05 + np.random.uniform(-1, 1)

    # Pressure propagation (based on PS5, PS6)
    avg_ps = np.mean([vals["PS5_mean"], vals["PS6_mean"]])
    for i in range(1, 6):
        vals[f"PS{i}_mean"] = avg_ps * (0.9 + np.random.uniform(-0.03, 0.03))

    # Flow sensors (FSx)
    vals["FS1_mean"] = 5 + np.random.uniform(-0.5, 0.5) + 0.002 * (avg_ps - 2500)
    vals["FS2_mean"] = 8 + np.random.uniform(-0.3, 0.3) + 0.0015 * (avg_ps - 2500)

    # Efficiency trends
    vals["CE_std"] = np.abs(vals["CE_mean"] * 0.01 + np.random.uniform(0, 0.05))
    vals["CE_min"] = vals["CE_mean"] * 0.9
    vals["CE_max"] = vals["CE_mean"] * 1.1

    # Pump characteristics
    vals["CP_std"] = np.abs(vals["CP_mean"] * 0.02 + np.random.uniform(0, 0.05))
    vals["CP_min"] = vals["CP_mean"] * 0.9
    vals["CP_max"] = vals["CP_mean"] * 1.1

    # Vibrations and secondary effects
    vals["VS1_mean"] = np.random.uniform(0.55, 0.75)
    vals["VS1_std"] = np.random.uniform(0.02, 0.08)
    vals["VS1_min"] = vals["VS1_mean"] * 0.9
    vals["VS1_max"] = vals["VS1_mean"] * 1.1

    # Add other default keys from feature_defaults.json if missing
    for k, v in defaults.items():
        if k not in vals:
            if isinstance(v, dict) and "mean" in v:
                vals[k] = v["mean"]
            else:
                vals[k] = v

    # Final ordering — keep the same order model was trained with
    all_features = list(defaults.keys())
    x = np.array([[vals[f] for f in all_features]], dtype=float)

    print("\n--- HYD DEBUG ---")
    print(f"Input shape: {x.shape}")
    print(f"First 5 values: {x[0, :5]}")
    print(f"Mean Temp: {avg_temp:.2f}, Mean Pressure: {avg_ps:.2f}")
    print("-----------------")
    x = x * 1.5
    x = np.clip(x, 0, None)
    return x


def lg_to_array(item: LandingGearInput) -> np.ndarray:
    """Combine frontend landing gear input with backend defaults."""
    vals = item.model_dump()
    full = FEATURE_DEFAULTS.get("lg", {}).copy()
    full.update(vals)

    x = np.array([[full[f] for f in LG_FEATURES_TOP3]], dtype=float)

    print("\n[LANDING GEAR DEBUG]")
    print("Frontend values:", vals)
    print("Merged input (first 3):", x[0][:3])
    print("-----------------------------\n")

    return x.ravel()
