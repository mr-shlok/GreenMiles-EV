from fastapi import APIRouter
from app.api.v1.endpoints import battery, route, charging, profile

router = APIRouter()

router.include_router(battery.router, tags=["Battery"])
router.include_router(route.router, tags=["Route"])
router.include_router(charging.router, tags=["Charging"])
router.include_router(profile.router, tags=["Profile"])
