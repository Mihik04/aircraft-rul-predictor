from pathlib import Path
import joblib, requests, io, gc

# 🔒 Cache for small models
_cached = {}

# ✅ Hugging Face model links
HF_MODELS = {
    "engine": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001_compressed.joblib",
    "scaler_engine": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/scaler_fd001.joblib",
    "hydraulics": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/agg_best_model.joblib",
    "landing_gear": "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_rul_model_top3.joblib",
}


# ------------------- STREAM LOAD HELPER -------------------
def stream_load_joblib(url: str):
    """Stream and load .joblib model directly from Hugging Face."""
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


# ------------------- LOAD MODEL -------------------
def load_model(name: str, models_dir: Path = None):
    """Load models dynamically; cache only smaller ones."""
    if name not in HF_MODELS:
        raise ValueError(f"Unknown model name: {name}")

    # ENGINE: streamed fresh each time to save memory
    if name == "engine":
        print("[ENGINE] Loading model from Hugging Face stream...")
        return stream_load_joblib(HF_MODELS[name])

    # SCALER + HYDRAULICS: cached and unwrap if dict
    if name in ["scaler_engine", "hydraulics"]:
        if name not in _cached:
            print(f"[CACHE] Loading {name} model into memory (one-time load)...")
            loaded = stream_load_joblib(HF_MODELS[name])
            # 🧩 Fix for dict-wrapped models
            if isinstance(loaded, dict) and "model" in loaded:
                loaded = loaded["model"]
            _cached[name] = loaded
        return _cached[name]

    # LANDING GEAR: cached directly
    if name == "landing_gear":
        if "landing_gear" not in _cached:
            print(f"[CACHE] Loading landing gear model into memory (one-time load)...")
            _cached["landing_gear"] = stream_load_joblib(HF_MODELS["landing_gear"])
        return _cached["landing_gear"]

    raise ValueError(f"Invalid model name: {name}")


# ------------------- UNLOAD MODEL -------------------
def unload_model(model):
    """Free up memory for large model (engine)."""
    del model
    gc.collect()
    print("[ENGINE] Model unloaded from memory.")
