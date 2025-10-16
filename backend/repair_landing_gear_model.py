import joblib
import numpy as np
from pathlib import Path

models_dir = Path("models")
old_model_path = models_dir / "best_rul_model_top3.joblib"
new_model_path = models_dir / "best_rul_model_top3_fixed.joblib"

print(f"🔍 Loading old model from {old_model_path}...")
model = joblib.load(old_model_path)
print(f"✅ Loaded type: {type(model)}")

print("💾 Re-saving model in current NumPy/sklearn format...")
joblib.dump(model, new_model_path)
print(f"✅ Fixed model saved as: {new_model_path}")
