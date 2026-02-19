"""
MapboxService — async wrapper around the Mapbox Directions & Geocoding APIs.
Extracted from prediction.py (RouteOptimizer class).
"""
import httpx
from fastapi import HTTPException
from urllib.parse import quote


class MapboxService:
    def __init__(self, token: str):
        self.token = token
        self._client = httpx.AsyncClient(timeout=30.0)

    async def get_directions(self, start: str, end: str) -> dict:
        """Call Mapbox Directions API.
        start/end must be 'lon,lat' strings (Mapbox format).
        Returns the raw Mapbox directions JSON.
        """
        if not self.token:
            raise HTTPException(status_code=500, detail="Mapbox token not configured")

        url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{start};{end}"
        params = {
            "access_token": self.token,
            "geometries": "geojson",
            "steps": "true",
            "alternatives": "true",
            "overview": "full",
        }
        try:
            resp = await self._client.get(url, params=params)
            if resp.status_code != 200:
                raise HTTPException(status_code=resp.status_code, detail="Mapbox Directions API error")
            return resp.json()
        except httpx.TimeoutException:
            raise HTTPException(status_code=408, detail="Mapbox API request timed out")
        except httpx.RequestError as e:
            raise HTTPException(status_code=500, detail=f"Mapbox request error: {e}")

    async def geocode(self, location: str) -> str | None:
        """Geocode a place name and return 'lon,lat' string, or None on failure."""
        if not self.token:
            raise HTTPException(status_code=500, detail="Mapbox token not configured")

        encoded = quote(location)
        url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{encoded}.json"
        params = {"access_token": self.token, "limit": 1}
        try:
            resp = await self._client.get(url, params=params)
            if resp.status_code == 200:
                features = resp.json().get("features")
                if features:
                    center = features[0]["center"]
                    return f"{center[0]},{center[1]}"
        except Exception as e:
            print(f"Geocode error: {e}")
        return None

    async def close(self):
        await self._client.aclose()
