"""Geospatial utility functions."""
import numpy as np


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance in km between two lat/lon points."""
    R = 6371.0
    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = np.sin(dlat / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon / 2) ** 2
    return R * 2 * np.arcsin(np.sqrt(a))


def parse_coords(loc_str: str) -> str:
    """Parse 'lat,lon' string and return 'lon,lat' (Mapbox format).
    Raises ValueError if the input is not parseable coordinates.
    """
    try:
        lat, lon = map(float, loc_str.split(","))
        return f"{lon},{lat}"
    except Exception:
        raise ValueError("Not coordinates")


def calculate_elevation_changes(geometry: dict) -> float:
    """Estimate elevation gain in metres from a GeoJSON geometry.
    Uses a simple simulation based on route shape complexity.
    In production, replace with real elevation data (e.g. Mapbox Elevation API).
    """
    coordinates = geometry.get("coordinates", [])
    if not coordinates:
        return 0.0
    distance_km = len(coordinates) * 0.1
    elevation_gain = min(200.0, distance_km * 10 + len(coordinates) * 0.01)
    return elevation_gain
