import numpy as np
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
from pathlib import Path
import json

# ========== Generate realistic dataset (scaled down) ==========
np.random.seed(42)
N = 1000  # more samples for smoother behavior

df = pd.DataFrame({
    "load_during_landing": np.random.uniform(200, 500, N),     # smaller, realistic range
    "tire_pressure": np.random.uniform(150, 250, N),
    "speed_during_landing": np.random.uniform(100, 300, N),
})

# Define realistic RUL behavior
# Higher load & speed reduce RUL; tire pressure slightly helps
df["RUL"] = (
    400
    - 0.4 * df["load_during_landing"]     # load penalty
    - 0.3 * df["speed_during_landing"]    # speed penalty
    + 0.5 * df["tire_pressure"]           # pressure benefit
    + np.random.normal(0, 8, N)           # random noise
)
df["RUL"] = df["RUL"].clip(lower=10)

# ========== Train model ==========
X = df[["load_during_landing", "tire_pressure", "speed_during_landing"]]
y = df["RUL"]

model = Pipeline([
    ("scaler", StandardScaler()),
    ("rf", RandomForestRegressor(
        n_estimators=300,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    ))
])

model.fit(X, y)
pred = model.predict(X)
r2 = r2_score(y, pred)
mae = mean_absolute_error(y, pred)

print(f"✅ Landing-Gear model trained: R²={r2:.3f}, MAE={mae:.2f}")

# ========== Save model ==========
models_dir = Path("models")
models_dir.mkdir(exist_ok=True)
out_path = models_dir / "best_rul_model_top3.joblib"
joblib.dump(model, out_path)
print(f"💾 Saved model to {out_path.resolve()}")

# ========== Update feature_defaults.json ==========
feature_defaults = {
    "lg": {
        "load_during_landing": {
            "min": float(df["load_during_landing"].min()),
            "mean": float(df["load_during_landing"].mean()),
            "max": float(df["load_during_landing"].max()),
        },
        "tire_pressure": {
            "min": float(df["tire_pressure"].min()),
            "mean": float(df["tire_pressure"].mean()),
            "max": float(df["tire_pressure"].max()),
        },
        "speed_during_landing": {
            "min": float(df["speed_during_landing"].min()),
            "mean": float(df["speed_during_landing"].mean()),
            "max": float(df["speed_during_landing"].max()),
        }
    }
}

feature_path = models_dir / "feature_defaults.json"
try:
    if feature_path.exists():
        with open(feature_path, "r") as f:
            existing = json.load(f)
    else:
        existing = {}
    existing["lg"] = feature_defaults["lg"]

    with open(feature_path, "w") as f:
        json.dump(existing, f, indent=2)
    print(f"🧾 Updated landing gear defaults in {feature_path.resolve()}")
except Exception as e:
    print(f"⚠️ Could not update defaults: {e}")
