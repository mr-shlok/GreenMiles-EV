from fastapi import APIRouter, Query
from app.services.charging_service import ChargingService

router = APIRouter()
charging_service = ChargingService()

@router.get("/charging-stations")
def get_stations():
    return charging_service.get_charging_stations()

@router.get("/best-station")
def get_best_station(
    vehicle_lat: float = Query(...),
    vehicle_lon: float = Query(...),
    battery_percent: float = Query(...),
    battery_capacity_kwh: float = Query(60.0),
    efficiency_km_per_kwh: float = Query(6.0),
):
    return charging_service.get_best_station(
        vehicle_lat, vehicle_lon, battery_percent, battery_capacity_kwh, efficiency_km_per_kwh
    )
