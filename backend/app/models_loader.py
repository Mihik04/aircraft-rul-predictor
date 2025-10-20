from pathlib import Path
import joblib, requests, io, gc

# 🔒 Cache small models in memory (hydraulics + landing gear)
_cached = {}

# ✅ Hugging Face URLs for all models
HF_MODELS = {
    "engine": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001_compressed.joblib",
    "scaler_engine": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/scaler_fd001.joblib",
    "hydraulics": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/agg_best_model.joblib",
    "landing_gear": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_rul_model_top3.joblib",
}


# ------------------- STREAMING HELPER -------------------
def stream_load_joblib(url: str):
    """Load a .joblib file from Hugging Face directly into memory (no temp file)."""
    print(f"[MODEL] Streaming from {url} ...")
    with requests.get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        buf = io.BytesIO()
        for chunk in r.iter_content(chunk_size=8192):
            buf.write(chunk)
        buf.seek(0)
        model = joblib.load(buf)
    del buf
    gc.collect()
    print("[MODEL] ✅ Loaded successfully in memory")
    return model


# ------------------- LOADER FUNCTION -------------------
def load_model(name: str, models_dir: Path = None):
    """Load model dynamically, streaming large ones, caching small ones."""
    if name not in HF_MODELS:
        raise ValueError(f"Unknown model name: {name}")

    # 🧠 Engine model (large): Stream fresh each time to save memory
    if name == "engine":
        print("[ENGINE] Loading model from Hugging Face stream...")
        return stream_load_joblib(HF_MODELS[name])

    # 🧠 Scaler (small): Cached globally
    if name == "scaler_engine":
        if "scaler_engine" not in _cached:
            _cached["scaler_engine"] = stream_load_joblib(HF_MODELS["scaler_engine"])
        return _cached["scaler_engine"]

    # 🧠 Hydraulics + Landing Gear: Cached once
    if name not in _cached:
        print(f"[CACHE] Loading {name} model into memory (one-time load)...")
        _cached[name] = stream_load_joblib(HF_MODELS[name])
    return _cached[name]


# ------------------- UNLOAD FUNCTION -------------------
def unload_model(model):
    """Unload large model (engine) from memory after prediction."""
    del model
    gc.collect()
    print("[ENGINE] Model unloaded from memory.")
