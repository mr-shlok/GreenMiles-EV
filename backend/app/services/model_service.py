"""
ModelService — wraps the ML model for input preparation and prediction.
Extracted from prediction.py.
"""
import pandas as pd
from app.utils.model_loader import model
from app.models.schema import BatteryInput
from fastapi import HTTPException


def data_to_dataframe(data: BatteryInput) -> pd.DataFrame:
    """Convert a BatteryInput (or RouteRequest) into a DataFrame the model expects."""
    input_dict = {
        'Battery_Capacity_kWh': data.Battery_Capacity_kWh,
        'Vehicle_Age_Months': data.Vehicle_Age_Months,
        'Total_Charging_Cycles': data.Total_Charging_Cycles,
        'Avg_Temperature_C': data.Avg_Temperature_C,
        'Fast_Charge_Ratio': data.Fast_Charge_Ratio,
        'Avg_Discharge_Rate_C': data.Avg_Discharge_Rate_C,
        'Internal_Resistance_Ohm': data.Internal_Resistance_Ohm,
        'SoH_Percent': data.SoH_Percent if data.SoH_Percent is not None else 0,

        'Car_Model_Ford Mustang Mach-E': data.Car_Model_Ford_Mustang_Mach_E,
        'Car_Model_Hyundai Ioniq 5': data.Car_Model_Hyundai_Ioniq_5,
        'Car_Model_Tesla Model 3': data.Car_Model_Tesla_Model_3,
        'Car_Model_Wuling Air EV': data.Car_Model_Wuling_Air_EV,

        'Battery_Type_NMC': data.Battery_Type_NMC,
        'Driving_Style_Conservative': data.Driving_Style_Conservative,
        'Driving_Style_Moderate': data.Driving_Style_Moderate,
        'Battery_Status_Replace Required': data.Battery_Status_Replace_Required,

        'Vehicle_Weight_kg': data.Vehicle_Weight_kg,
        'Drag_Coefficient': data.Drag_Coefficient,
        'Frontal_Area_m2': data.Frontal_Area_m2,
        'Rolling_Resistance_Coeff': data.Rolling_Resistance_Coeff,
        'Motor_Efficiency': data.Motor_Efficiency,

        'Trip_Distance_km': data.Trip_Distance_km,
        'Elevation_Gain_m': data.Elevation_Gain_m,
        'Traffic_Index': data.Traffic_Index,
        'Avg_Speed_kmph': data.Avg_Speed_kmph,
        'Humidity_Percent': data.Humidity_Percent,
        'Wind_Speed_mps': data.Wind_Speed_mps,

        'Energy_Consumed_kWh': 0,
        'Estimated_Range_km': 0,
        'Consumption_kWh_per_km': 0,
    }

    cols = [
        'Battery_Capacity_kWh', 'Vehicle_Age_Months', 'Total_Charging_Cycles',
        'Avg_Temperature_C', 'Fast_Charge_Ratio', 'Avg_Discharge_Rate_C',
        'Internal_Resistance_Ohm', 'SoH_Percent',
        'Car_Model_Ford Mustang Mach-E', 'Car_Model_Hyundai Ioniq 5',
        'Car_Model_Tesla Model 3', 'Car_Model_Wuling Air EV',
        'Battery_Type_NMC', 'Driving_Style_Conservative',
        'Driving_Style_Moderate', 'Battery_Status_Replace Required',
        'Vehicle_Weight_kg', 'Drag_Coefficient', 'Frontal_Area_m2',
        'Rolling_Resistance_Coeff', 'Motor_Efficiency', 'Trip_Distance_km',
        'Elevation_Gain_m', 'Traffic_Index', 'Avg_Speed_kmph',
        'Humidity_Percent', 'Wind_Speed_mps', 'Energy_Consumed_kWh',
        'Estimated_Range_km', 'Consumption_kWh_per_km',
    ]

    return pd.DataFrame([input_dict])[cols]


def run_prediction(data: BatteryInput) -> list:
    """Run the ML model and return raw prediction list."""
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        df = data_to_dataframe(data)
        return model.predict(df).tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
