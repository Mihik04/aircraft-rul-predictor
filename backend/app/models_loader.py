from pathlib import Path
import joblib
import requests
import io
import gc

_cached = {}

# ✅ Direct Hugging Face model link
HF_ENGINE_MODEL_URL = "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001_compressed.joblib"

def stream_load_joblib(url: str):
    """Stream and load a joblib model directly from Hugging Face — no saving to disk."""
    print(f"[ENGINE] Streaming model from {url} ...")
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        buffer = io.BytesIO()
        for chunk in r.iter_content(chunk_size=8192):
            buffer.write(chunk)
        buffer.seek(0)
        model = joblib.load(buffer)
    del buffer
    gc.collect()
    print("[ENGINE] ✅ Model loaded in-memory (stream mode)")
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

    # ENGINE: Stream directly, don’t keep in cache
    if name == "engine":
        model = stream_load_joblib(HF_ENGINE_MODEL_URL)
        return model

    # Others: cached (they're small)
    path = models_dir / mapping[name]
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}")

    if name not in _cached:
        loaded = joblib.load(path)
        _cached[name] = loaded.get("model", loaded) if isinstance(loaded, dict) else loaded
        print(f"[MODEL] Cached {name}")
    return _cached[name]


def unload_model(model):
    del model
    gc.collect()
    print("[ENGINE] Model unloaded from memory.")
