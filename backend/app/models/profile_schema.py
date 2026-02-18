from pydantic import BaseModel
from typing import Optional


class EVProfileBase(BaseModel):
    ev_model: str
    battery_capacity: float
    current_battery: int
    battery_health: int
    vehicle_load: Optional[float] = None
    ambient_temperature: Optional[float] = None


class EVProfileCreate(EVProfileBase):
    user_id: str


class EVProfileUpdate(EVProfileBase):
    pass


class EVProfileInDB(EVProfileBase):
    user_id: str
    id: str