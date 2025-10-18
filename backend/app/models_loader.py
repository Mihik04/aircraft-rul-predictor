from pathlib import Path
import joblib, requests, io, gc

_cached = {}
HF_ENGINE_MODEL_URL = "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001_compressed.joblib"

def stream_load_joblib(url: str):
    """Stream model directly from Hugging Face without saving to disk."""
    print(f"[STREAM] Downloading model from {url} ...")
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        file_obj = io.BytesIO()
        for chunk in r.iter_content(chunk_size=8192):
            file_obj.write(chunk)
        file_obj.seek(0)
        model = joblib.load(file_obj)
    del file_obj
    gc.collect()
    print("[STREAM] Model loaded into memory")
    return model

def load_model(name: str, models_dir: Path):
    mapping = {
        "engine": "best_model_fd001_compressed.joblib",
        "scaler_engine": "scaler_fd001.joblib",
        "hydraulics": "agg_best_model.joblib",
        "landing_gear": "best_rul_model_top3.joblib",
    }

    if name not in mapping:
        raise ValueError(f"Unknown model name: {name}")

    if name == "engine":
        return stream_load_joblib(HF_ENGINE_MODEL_URL)

    model_path = models_dir / mapping[name]
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")

    if name not in _cached:
        loaded = joblib.load(model_path)
        _cached[name] = loaded.get("model", loaded) if isinstance(loaded, dict) else loaded
    return _cached[name]

def unload_model(model):
    del model
    gc.collect()
