from fastapi import APIRouter
from app.models.profile_schema import EVProfileCreate, EVProfileUpdate
from app.services.profile_service import ProfileService

router = APIRouter()
profile_service = ProfileService()

@router.post("/ev-profile")
async def create_profile(profile: EVProfileCreate):
    return await profile_service.create(profile.user_id, profile.dict())

@router.get("/ev-profile/{user_id}")
async def get_profile(user_id: str):
    return await profile_service.get(user_id)

@router.put("/ev-profile/{user_id}")
async def update_profile(user_id: str, profile: EVProfileUpdate):
    return await profile_service.update(user_id, profile.dict())
