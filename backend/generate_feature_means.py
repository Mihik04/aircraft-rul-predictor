import pandas as pd
import json
from pathlib import Path

# ========================
# Paths
# ========================
ENGINE_PATH = Path("train_FD001.txt")
HYD_PATH = Path("datasets/combined_agg.csv")
LG_PATH = Path("datasets/landing_gear_rul_clean.csv")
OUT_PATH = Path("models/feature_defaults.json")

# ========================
# ENGINE DEFAULTS (NASA FD001)
# ========================
engine_cols = [
    "unit_number", "time_in_cycles",
    "op_setting_1", "op_setting_2", "op_setting_3",
] + [f"sensor_{i}" for i in range(1, 22)]

df_engine = pd.read_csv(ENGINE_PATH, sep=r"\s+", header=None, names=engine_cols)
df_engine = df_engine.drop(columns=["unit_number"])

engine_stats = {}
for col in df_engine.columns:
    engine_stats[col] = {
        "min": float(df_engine[col].min()),
        "mean": float(df_engine[col].mean()),
        "max": float(df_engine[col].max()),
    }

# ========================
# HYDRAULICS DEFAULTS
# ========================
try:
    df_hyd = pd.read_csv(HYD_PATH)
    hyd_stats = {}
    for col in df_hyd.select_dtypes(include="number").columns:
        hyd_stats[col] = {
            "min": float(df_hyd[col].min()),
            "mean": float(df_hyd[col].mean()),
            "max": float(df_hyd[col].max()),
        }
except Exception as e:
    print(f"[WARN] Could not load hydraulics dataset: {e}")
    hyd_stats = {}

# ========================
# LANDING GEAR DEFAULTS
# ========================
try:
    df_lg = pd.read_csv(LG_PATH)
    lg_stats = {}
    for col in df_lg.select_dtypes(include="number").columns:
        lg_stats[col] = {
            "min": float(df_lg[col].min()),
            "mean": float(df_lg[col].mean()),
            "max": float(df_lg[col].max()),
        }
except Exception as e:
    print(f"[WARN] Could not load landing gear dataset: {e}")
    lg_stats = {}

# ========================
# COMBINE ALL
# ========================
feature_defaults = {
    "engine": engine_stats,
    "hyd": hyd_stats,
    "lg": lg_stats,
}

OUT_PATH.parent.mkdir(exist_ok=True, parents=True)
with open(OUT_PATH, "w") as f:
    json.dump(feature_defaults, f, indent=2)

print(f"✅ Feature stats saved to {OUT_PATH}")
print(f"🔹 Engine features: {len(engine_stats)}")
print(f"🔹 Hydraulics features: {len(hyd_stats)}")
print(f"🔹 Landing gear features: {len(lg_stats)}")

print("\n🧾 Example engine:", list(engine_stats.items())[:3])
