# inspect_model_features.py
import joblib
from pathlib import Path

model_path = Path("models/best_model_fd001.joblib")
scaler_path = Path("models/scaler_fd001.joblib")

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

print("\nModel type:", type(model))
print("Scaler type:", type(scaler))

# For sklearn models
if hasattr(model, "n_features_in_"):
    print("Model expects", model.n_features_in_, "features.")

if hasattr(scaler, "n_features_in_"):
    print("Scaler expects", scaler.n_features_in_, "features.")

if hasattr(scaler, "feature_names_in_"):
    print("\nScaler feature names:", scaler.feature_names_in_)
