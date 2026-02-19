"""
MongoDB async database layer using Motor.
Replaces the previous SQLite / aiosqlite implementation.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "ev_ml_db")

# Module-level Motor client / db references
_client: Optional[AsyncIOMotorClient] = None
_db = None


async def init_db():
    """Connect to MongoDB and verify the connection."""
    global _client, _db
    _client = AsyncIOMotorClient(MONGODB_URL)
    _db = _client[DB_NAME]

    # Ping to verify connection
    await _client.admin.command("ping")
    print(f"Connected to MongoDB: database '{DB_NAME}'")


async def close_db():
    """Close the MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("MongoDB connection closed")


def _get_collection():
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db["ev_profiles"]


async def get_ev_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve an EV profile document by user_id."""
    col = _get_collection()
    doc = await col.find_one({"user_id": user_id}, {"_id": 0})
    return doc  # None if not found


async def save_ev_profile(user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Upsert an EV profile document for the given user_id.

    Returns a dict with 'success' and 'is_new' keys.
    """
    col = _get_collection()

    # Determine if document already exists (for is_new flag)
    existing = await col.find_one({"user_id": user_id}, {"_id": 1})
    is_new = existing is None

    # Always store user_id inside the document
    profile_data["user_id"] = user_id

    await col.update_one(
        {"user_id": user_id},
        {"$set": profile_data},
        upsert=True,
    )

    return {"success": True, "is_new": is_new}