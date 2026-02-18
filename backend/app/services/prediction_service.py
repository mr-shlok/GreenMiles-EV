import numpy as np
from app.utils.model_loader import model, features

def predict_battery_health(data):
    input_dict = data.dict()
    
    input_array = [input_dict.get(col, 0) for col in features]
    
    prediction = model.predict([input_array])
    
    return round(float(prediction[0]), 2)
