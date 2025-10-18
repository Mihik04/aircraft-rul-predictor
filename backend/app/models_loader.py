from pathlib import Path
import joblib
import requests

_cached = {}

# ✅ Hugging Face direct download link for the big engine model
HF_ENGINE_MODEL_URL = "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001.joblib"


def _download_from_hf(url: str, target_path: Path):
    """Download file from Hugging Face only if missing locally."""
    print(f"[MODEL] Downloading from {url} ...")
    response = requests.get(url, stream=True)
    response.raise_for_status()
    with open(target_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)
    print(f"[MODEL] ✅ Download complete → {target_path}")


def load_model(name: str, models_dir: Path):
    """Load model, downloading from HF only for the engine model."""
    mapping = {
        "engine": "best_model_fd001.joblib",
        "scaler_engine": "scaler_fd001.joblib",
        "hydraulics": "agg_best_model.joblib",
        "landing_gear": "best_rul_model_top3.joblib",
    }

    if name not in mapping:
        raise ValueError(f"Unknown model name: {name}")

    model_path = models_dir / mapping[name]

    # 💾 Download engine model if missing
    if name == "engine" and not model_path.exists():
        _download_from_hf(HF_ENGINE_MODEL_URL, model_path)

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    if name not in _cached:
        print(f"[MODEL] Loading {name} from {model_path}")
        loaded = joblib.load(model_path)
        _cached[name] = loaded.get("model", loaded) if isinstance(loaded, dict) else loaded

    return _cached[name]
