"""Load the ML model once at import time."""
import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # → backend/
MODEL_PATH = BASE_DIR / "ML_Models" / "ev_battery_model.pkl"

try:
    model = joblib.load(MODEL_PATH)
    print(f"Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
