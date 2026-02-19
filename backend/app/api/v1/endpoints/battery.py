from fastapi import APIRouter
from app.models.schema import BatteryInput
from app.services.model_service import run_prediction

router = APIRouter()

@router.post("/predict")
def predict(data: BatteryInput):
    prediction = run_prediction(data)
    return {"prediction": prediction}
