"""
Retrain Engine RUL Model (FD001)

This will generate:
- scaler_fd001.joblib
- best_model_fd001.joblib
in your models/ folder.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import ExtraTreesRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
print("🚀 Retraining script started!")

# ----------------------------
# 1. Define paths
# ----------------------------
BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(exist_ok=True)

# ----------------------------
# 2. Load the dataset
# ----------------------------
# You can download NASA CMAPSS FD001 dataset from:
# https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/
# (Look for CMAPSS FD001 train_FD001.txt and test_FD001.txt)

DATA_PATH = BASE_DIR / "train_FD001.txt"  # put the file here!

# Column definitions for FD001 dataset
cols = [
    "unit_number", "time_in_cycles",
    "op_setting_1", "op_setting_2", "op_setting_3",
    *[f"sensor_{i}" for i in range(1, 22)]
]

df = pd.read_csv(DATA_PATH, sep=" ", header=None)
df.dropna(axis=1, how="all", inplace=True)
df.columns = cols

# ----------------------------
# 3. Generate Remaining Useful Life (RUL)
# ----------------------------
rul = (
    df.groupby("unit_number")["time_in_cycles"].max()
    .reset_index()
    .rename(columns={"time_in_cycles": "max_cycles"})
)
df = df.merge(rul, on="unit_number", how="left")
df["RUL"] = df["max_cycles"] - df["time_in_cycles"]
df.drop(columns=["unit_number", "max_cycles"], inplace=True)

print("✅ Data loaded successfully!")
print("Shape:", df.shape)
print(df.head())

# ----------------------------
# 4. Train/test split
# ----------------------------
X = df.drop(columns=["RUL"])
y = df["RUL"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ----------------------------
# 5. Scale features
# ----------------------------
scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ----------------------------
# 6. Train model
# ----------------------------
model = ExtraTreesRegressor(
    n_estimators=200,
    max_depth=25,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train_scaled, y_train)

# ----------------------------
# 7. Evaluate
# ----------------------------
y_pred = model.predict(X_test_scaled)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"✅ Training complete!")
print(f"Mean Absolute Error: {mae:.2f}")
print(f"R² Score: {r2:.3f}")

# ----------------------------
# 8. Save model + scaler
# ----------------------------
scaler_path = MODELS_DIR / "scaler_fd001.joblib"
model_path = MODELS_DIR / "best_model_fd001.joblib"

joblib.dump(scaler, scaler_path)
joblib.dump(model, model_path)

print(f"💾 Saved scaler to: {scaler_path}")
print(f"💾 Saved model  to: {model_path}")

# ----------------------------
# 9. Feature importance (optional)
# ----------------------------
importances = model.feature_importances_
feat_imp = pd.DataFrame({
    "feature": X.columns,
    "importance": importances
}).sort_values("importance", ascending=False)

print("\n🔍 Top 10 important features:")
print(feat_imp.head(10))
