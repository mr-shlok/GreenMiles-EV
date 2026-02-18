from pydantic import BaseModel
from typing import List, Optional

class BatteryInput(BaseModel):
    # original fields
    Internal_Resistance_Ohm: float
    Total_Charging_Cycles: int
    Battery_Capacity_kWh: float
    Fast_Charge_Ratio: float
    Avg_Temperature_C: float
    Vehicle_Age_Months: int
    
    # new fields from user request
    Avg_Discharge_Rate_C: float
    SoH_Percent: Optional[float] = None
    Car_Model_Ford_Mustang_Mach_E: int = 0
    Car_Model_Hyundai_Ioniq_5: int = 0
    Car_Model_Tesla_Model_3: int = 0
    Car_Model_Wuling_Air_EV: int = 0
    Battery_Type_NMC: int = 0
    Driving_Style_Conservative: int = 0
    Driving_Style_Moderate: int = 0
    Battery_Status_Replace_Required: int = 0
    
    # Vehicle physical params
    Vehicle_Weight_kg: float
    Drag_Coefficient: float
    Frontal_Area_m2: float
    Rolling_Resistance_Coeff: float
    Motor_Efficiency: float
    
    # Dynamic/Trip params (some might be derived or passed)
    Trip_Distance_km: float
    Elevation_Gain_m: float
    Traffic_Index: float
    Avg_Speed_kmph: float
    Humidity_Percent: float
    Wind_Speed_mps: float
    
    # Target variables (optional in input, but user listed them in the index)
    Energy_Consumed_kWh: Optional[float] = None
    Estimated_Range_km: Optional[float] = None
    Consumption_kWh_per_km: Optional[float] = None

class RouteRequest(BatteryInput):
    start_location: str  # "lat,lon" or "Address"
    end_location: str    # "lat,lon" or "Address"
