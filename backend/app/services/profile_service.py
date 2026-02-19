from app.core.database import get_ev_profile, save_ev_profile
from fastapi import HTTPException

class ProfileService:
    async def get(self, user_id: str):
        profile = await get_ev_profile(user_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile

    async def create(self, user_id: str, profile_data: dict):
        result = await save_ev_profile(user_id, profile_data)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to create profile")
        return {"message": "Profile created", "success": True}

    async def update(self, user_id: str, profile_data: dict):
        existing = await get_ev_profile(user_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        updated = existing.copy()
        updated.update({k: v for k, v in profile_data.items() if v is not None})
        
        result = await save_ev_profile(user_id, updated)
        if not result.get("success"):
            raise HTTPException(status_code=500, detail="Failed to update profile")
        return {"message": "Profile updated", "success": True}