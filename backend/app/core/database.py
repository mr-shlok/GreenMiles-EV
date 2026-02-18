import aiosqlite
import json
import os
from typing import Dict, Any, Optional

# SQLite database path (stored next to the backend root)
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "ev_ml.db")

# Module-level connection reference
_db: Optional[aiosqlite.Connection] = None


async def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    global _db
    _db = await aiosqlite.connect(DB_PATH)
    _db.row_factory = aiosqlite.Row
    await _db.execute("""
        CREATE TABLE IF NOT EXISTS ev_profiles (
            user_id TEXT PRIMARY KEY,
            ev_model TEXT NOT NULL,
            battery_capacity REAL NOT NULL,
            current_battery INTEGER NOT NULL,
            battery_health INTEGER NOT NULL,
            vehicle_load REAL,
            ambient_temperature REAL
        )
    """)
    await _db.commit()
    print(f"SQLite database initialized at {DB_PATH}")


async def close_db():
    """Close the SQLite connection."""
    global _db
    if _db:
        await _db.close()
        _db = None
        print("SQLite connection closed")


async def get_ev_profile(user_id: str) -> Optional[Dict[str, Any]]:
    """Get EV profile for a user."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    cursor = await _db.execute(
        "SELECT * FROM ev_profiles WHERE user_id = ?", (user_id,)
    )
    row = await cursor.fetchone()
    if row is None:
        return None

    # Convert Row to dict
    return {
        "user_id": row["user_id"],
        "ev_model": row["ev_model"],
        "battery_capacity": row["battery_capacity"],
        "current_battery": row["current_battery"],
        "battery_health": row["battery_health"],
        "vehicle_load": row["vehicle_load"],
        "ambient_temperature": row["ambient_temperature"],
    }


async def save_ev_profile(user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """Save or update EV profile for a user (upsert).

    Returns a dict with 'success' and 'is_new' keys.
    """
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")

    # Check if profile already exists
    cursor = await _db.execute(
        "SELECT 1 FROM ev_profiles WHERE user_id = ?", (user_id,)
    )
    existing = await cursor.fetchone()
    is_new = existing is None

    await _db.execute(
        """
        INSERT OR REPLACE INTO ev_profiles
            (user_id, ev_model, battery_capacity, current_battery, battery_health, vehicle_load, ambient_temperature)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            profile_data.get("ev_model"),
            profile_data.get("battery_capacity"),
            profile_data.get("current_battery"),
            profile_data.get("battery_health"),
            profile_data.get("vehicle_load"),
            profile_data.get("ambient_temperature"),
        ),
    )
    await _db.commit()
    return {"success": True, "is_new": is_new}