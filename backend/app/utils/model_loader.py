import joblib
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "ml_models" / "ev_battery_model.pkl"


model = joblib.load(MODEL_PATH)

