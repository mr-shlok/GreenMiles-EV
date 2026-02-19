from fastapi import APIRouter, HTTPException
from app.models.schema import RouteRequest
from app.services.route_service import RouteService
from app.services.mapbox_service import MapboxService
from app.core.config import settings

router = APIRouter()
mapbox_service = MapboxService(settings.MAPBOX_ACCESS_TOKEN)
route_service = RouteService(mapbox_service)

@router.post("/optimize-route")
async def optimize_route(data: RouteRequest):
    result = await route_service.optimize(data)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid location or route not found")
    return result
