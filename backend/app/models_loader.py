from pathlib import Path
import joblib

_cached = {}

def load_model(name: str, models_dir: Path):
    """Safely load model or scaler based on subsystem name, handle dict-based models."""
    mapping = {
        "engine": "best_model_fd001.joblib",
        "scaler_engine": "scaler_fd001.joblib",
        "hydraulics": "agg_best_model.joblib",
        "landing_gear": "best_rul_model_top3.joblib",
    }

    if name not in mapping:
        raise ValueError(f"Unknown model name: {name}")

    model_path = models_dir / mapping[name]
    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    # cache model so it loads only once
    if name not in _cached:
        loaded = joblib.load(model_path)
        # handle dicts like {'model': LightGBMRegressor(...), 'scaler': MinMaxScaler(...)}
        if isinstance(loaded, dict):
            _cached[name] = loaded.get("model", loaded)
        else:
            _cached[name] = loaded

    return _cached[name]
