import os
import zipfile
import pandas as pd
from app.utils.geo import haversine
from fastapi import HTTPException

# Relative path from services directory to the data file
STATIONS_ZIP_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "ML_Models", "EV-charging-station.zip")

class ChargingService:
    def _load_stations_df(self) -> pd.DataFrame:
        zip_path = os.path.abspath(STATIONS_ZIP_PATH)
        if not os.path.exists(zip_path):
            raise FileNotFoundError(f"Stations zip not found at: {zip_path}")
        with zipfile.ZipFile(zip_path, "r") as z:
            csv_names = [n for n in z.namelist() if n.endswith(".csv")]
            if not csv_names:
                raise ValueError("No CSV file found inside the zip archive")
            with z.open(csv_names[0]) as f:
                df = pd.read_csv(f)
        df.columns = [c.strip() for c in df.columns]
        return df

    def get_charging_stations(self):
        try:
            df = self._load_stations_df()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stations load error: {e}")

        features = []
        for _, row in df.iterrows():
            try:
                lat = float(row.get("Latitude", row.get("latitude", 0)))
                lon = float(row.get("Longitude", row.get("longitude", 0)))
                if lat == 0 and lon == 0: continue
            except: continue

            features.append({
                "type": "Feature",
                "properties": {
                    "station_id": str(row.get("Station ID", "")),
                    "rating": float(row.get("Reviews (Rating)", 0) or 0),
                    "cost": float(row.get("Cost (USD/kWh)", 0) or 0),
                },
                "geometry": {"type": "Point", "coordinates": [lon, lat]}
            })
        return {"type": "FeatureCollection", "features": features}

    def get_best_station(self, vehicle_lat, vehicle_lon, battery_percent, battery_capacity, efficiency):
        remaining_range = (battery_percent / 100.0) * battery_capacity * efficiency
        try:
            df = self._load_stations_df()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Stations load error: {e}")

        best = None
        best_dist = float("inf")

        for _, row in df.iterrows():
            try:
                lat, lon = float(row["Latitude"]), float(row["Longitude"])
                if lat == 0 and lon == 0: continue
            except: continue

            dist = haversine(vehicle_lat, vehicle_lon, lat, lon)
            if dist <= remaining_range and dist < best_dist:
                best_dist = dist
                best = {
                    "station_id": str(row["Station ID"]),
                    "latitude": lat,
                    "longitude": lon,
                    "distance_km": round(dist, 2),
                    "rating": float(row["Reviews (Rating)"] or 0),
                    "cost": float(row["Cost (USD/kWh)"] or 0),
                    "remaining_range_km": round(remaining_range, 2),
                }

        if not best:
            raise HTTPException(status_code=404, detail="No reachable station found.")
        return best