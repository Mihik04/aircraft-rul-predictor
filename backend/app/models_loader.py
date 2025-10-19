from pathlib import Path
import joblib
import requests
import gc

# 🔒 In-memory cache for light models (hydraulics & landing gear)
_cached = {}

# ✅ URLs and local paths
HF_ENGINE_MODEL_URL = (
    "https://huggingface.co/mihik12/aircraft-rul-models/resolve/main/best_model_fd001_compressed.joblib"
)
LOCAL_ENGINE_MODEL = Path("/app/backend/models/best_model_fd001_compressed.joblib")


# ------------------- ENGINE MODEL -------------------
def download_if_missing():
    """Download compressed engine model from Hugging Face if missing."""
    if LOCAL_ENGINE_MODEL.exists():
        print("[ENGINE] Using cached engine model.")
        return

    print(f"[ENGINE] Downloading model from {HF_ENGINE_MODEL_URL} ...")
    response = requests.get(HF_ENGINE_MODEL_URL, stream=True)
    response.raise_for_status()
    LOCAL_ENGINE_MODEL.parent.mkdir(parents=True, exist_ok=True)

    with open(LOCAL_ENGINE_MODEL, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    print(f"[ENGINE] ✅ Download complete → {LOCAL_ENGINE_MODEL}")


def load_model(name: str, models_dir: Path):
    """Load model dynamically, keeping only hydraulics & gear cached."""
    mapping = {
        "engine": LOCAL_ENGINE_MODEL,
        "scaler_engine": models_dir / "scaler_fd001.joblib",
        "hydraulics": models_dir / "agg_best_model.joblib",
        "landing_gear": models_dir / "best_rul_model_top3.joblib",
    }

    if name not in mapping:
        raise ValueError(f"Unknown model name: {name}")

    # ------------------- ENGINE MODEL -------------------
    if name == "engine":
        download_if_missing()
        print("[ENGINE] Loading compressed engine model (no mmap)...")
        model = joblib.load(LOCAL_ENGINE_MODEL)  # ✅ no mmap for compressed files
        return model

    # ------------------- OTHER MODELS -------------------
    path = mapping[name]
    if not path.exists():
        raise FileNotFoundError(f"Model not found: {path}")

    if name not in _cached:
        print(f"[MODEL] Loading {name} from {path}")
        loaded = joblib.load(path)
        _cached[name] = loaded.get("model", loaded) if isinstance(loaded, dict) else loaded

    return _cached[name]


def unload_model(model):
    """Free up memory after engine prediction."""
    del model
    gc.collect()
    print("[ENGINE] Model unloaded from memory.")
