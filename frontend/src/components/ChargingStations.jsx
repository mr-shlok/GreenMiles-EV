import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGlobalState } from '../App';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

mapboxgl.accessToken = MAPBOX_TOKEN;

const ChargingStations = ({ routeData }) => {
  const { globalState } = useGlobalState();

  // Form state for nearest-station lookup
  const [vehicleLat, setVehicleLat] = useState('');
  const [vehicleLon, setVehicleLon] = useState('');
  const [batteryPercent, setBatteryPercent] = useState('');
  const [batteryCapacity, setBatteryCapacity] = useState('60');
  const [efficiency, setEfficiency] = useState('6');

  // Results
  const [bestStation, setBestStation] = useState(null);
  const [stationError, setStationError] = useState('');
  const [loadingBest, setLoadingBest] = useState(false);
  const [loadingStations, setLoadingStations] = useState(true);
  const [stationCount, setStationCount] = useState(0);

  // Low-battery warning (auto-suggest)
  const [lowBatteryWarning, setLowBatteryWarning] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const bestMarkerRef = useRef(null);

  // ── Auto-populate form when routeData indicates low battery ──
  useEffect(() => {
    if (!routeData?.routes?.length) return;
    const route = routeData.routes[0];
    const endBattery = (route.start_battery || 85) - (route.battery_percentage_usage || 0);
    if (endBattery < 20) {
      setLowBatteryWarning(true);
      setBatteryPercent(String(Math.max(0, Math.round(endBattery))));
      // Try to pre-fill coords from route start
      if (route.geometry?.coordinates?.length) {
        const [lon, lat] = route.geometry.coordinates[0];
        setVehicleLat(String(lat));
        setVehicleLon(String(lon));
      }
    }
  }, [routeData]);

  // ── Initialise Mapbox map ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [78.9629, 20.5937], // India centre
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    // ── Load all stations as a GeoJSON layer once the style is ready ──
    map.on('load', () => {
      fetch(`${API_URL}/charging-stations`)
        .then((res) => res.json())
        .then((geojson) => {
          setStationCount(geojson.features?.length || 0);
          setLoadingStations(false);

          map.addSource('stations', { type: 'geojson', data: geojson });

          // Glow halo
          map.addLayer({
            id: 'stations-halo',
            type: 'circle',
            source: 'stations',
            paint: {
              'circle-radius': 10,
              'circle-color': '#69E300',
              'circle-opacity': 0.15,
              'circle-blur': 1,
            },
          });

          // Main dot
          map.addLayer({
            id: 'stations-layer',
            type: 'circle',
            source: 'stations',
            paint: {
              'circle-radius': 5,
              'circle-color': '#69E300',
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#fff',
            },
          });

          // Popup on click
          map.on('click', 'stations-layer', (e) => {
            const { station_id, rating, cost } = e.features[0].properties;
            const [lng, lat] = e.features[0].geometry.coordinates;
            new mapboxgl.Popup({ offset: 10 })
              .setLngLat([lng, lat])
              .setHTML(
                `<div style="color:#0f172a;font-family:sans-serif;font-size:13px">
                  <strong>Station ${station_id}</strong><br/>
                  ⭐ Rating: ${rating.toFixed(1)}<br/>
                  💲 Cost: $${cost.toFixed(2)}/kWh
                </div>`
              )
              .addTo(map);
          });

          map.on('mouseenter', 'stations-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          map.on('mouseleave', 'stations-layer', () => {
            map.getCanvas().style.cursor = '';
          });
        })
        .catch(() => setLoadingStations(false));
    });

    return () => {
      if (bestMarkerRef.current) bestMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Find nearest reachable station ──
  const handleFindNearest = async (e) => {
    e.preventDefault();
    setStationError('');
    setBestStation(null);
    setLoadingBest(true);

    const params = new URLSearchParams({
      vehicle_lat: vehicleLat,
      vehicle_lon: vehicleLon,
      battery_percent: batteryPercent,
      battery_capacity_kwh: batteryCapacity,
      efficiency_km_per_kwh: efficiency,
    });

    try {
      const res = await fetch(`${API_URL}/best-station?${params}`);
      if (!res.ok) {
        const err = await res.json();
        setStationError(err.detail || 'No reachable station found.');
        setLoadingBest(false);
        return;
      }
      const data = await res.json();
      setBestStation(data);

      const map = mapRef.current;
      if (map) {
        // Remove previous best marker
        if (bestMarkerRef.current) bestMarkerRef.current.remove();

        // Add red marker for best station
        bestMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat([data.longitude, data.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 10 }).setHTML(
              `<div style="color:#0f172a;font-family:sans-serif;font-size:13px">
                <strong>🏆 Nearest Station</strong><br/>
                Station ${data.station_id}<br/>
                📍 ${data.distance_km} km away<br/>
                ⭐ ${data.rating.toFixed(1)} &nbsp;💲$${data.cost.toFixed(2)}/kWh
              </div>`
            )
          )
          .addTo(map);

        bestMarkerRef.current.getPopup().addTo(map);

        map.flyTo({
          center: [data.longitude, data.latitude],
          zoom: 12,
          duration: 1800,
        });
      }
    } catch {
      setStationError('Failed to connect to the backend. Is the server running?');
    }
    setLoadingBest(false);
  };

  // ── Insufficient battery from routeData ──
  const insufficientBattery =
    routeData?.routes?.some((r) => {
      const end = (r.start_battery || 85) - (r.battery_percentage_usage || 0);
      return end < 15;
    }) || false;

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-bold font-poppins mb-2 text-white">
          ⚡ Charging Intelligence
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          {loadingStations
            ? 'Loading stations…'
            : `${stationCount.toLocaleString()} charging stations loaded from dataset`}
        </p>

        {/* Low-battery / insufficient battery banners */}
        {(insufficientBattery || lowBatteryWarning) && (
          <div className="bg-orange-900/60 border-l-4 border-orange-500 text-orange-100 p-4 mb-6 rounded-lg flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-sm">Low battery detected!</p>
              <p className="text-xs mt-1 text-orange-200">
                Your battery may not be sufficient for the planned trip. Use the finder below to
                locate the nearest charging station.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Map ── */}
          <div className="lg:col-span-2 bg-[#1E293B] rounded-xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-lg font-bold font-poppins mb-3 text-[#22C55E]">
              Charging Stations Map
            </h2>
            <div
              ref={mapContainerRef}
              className="w-full rounded-lg overflow-hidden"
              style={{ height: '480px' }}
            />
            {/* Legend */}
            <div className="flex items-center gap-6 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-[#69E300]" /> All stations
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500" /> Nearest (suggested)
              </span>
            </div>
          </div>

          {/* ── Sidebar: Finder + Result ── */}
          <div className="flex flex-col gap-4">
            {/* Finder form */}
            <div className="bg-[#1E293B] rounded-xl p-5 shadow-lg border border-gray-700">
              <h2 className="text-lg font-bold font-poppins mb-4 text-[#22C55E]">
                Find Nearest Station
              </h2>
              <form onSubmit={handleFindNearest} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={vehicleLat}
                      onChange={(e) => setVehicleLat(e.target.value)}
                      placeholder="e.g. 19.07"
                      className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={vehicleLon}
                      onChange={(e) => setVehicleLon(e.target.value)}
                      placeholder="e.g. 72.87"
                      className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">
                    Battery Level (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={batteryPercent}
                    onChange={(e) => setBatteryPercent(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#22C55E]"
                  />
                  {batteryPercent && (
                    <div className="mt-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          Number(batteryPercent) < 20
                            ? 'bg-red-500'
                            : Number(batteryPercent) < 50
                            ? 'bg-yellow-400'
                            : 'bg-[#22C55E]'
                        }`}
                        style={{ width: `${batteryPercent}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Capacity (kWh)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={batteryCapacity}
                      onChange={(e) => setBatteryCapacity(e.target.value)}
                      className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Efficiency (km/kWh)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={efficiency}
                      onChange={(e) => setEfficiency(e.target.value)}
                      className="w-full bg-[#0F172A] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                </div>

                {batteryPercent && batteryCapacity && efficiency && (
                  <p className="text-xs text-gray-400">
                    Estimated range:{' '}
                    <span className="text-white font-semibold">
                      {(
                        (Number(batteryPercent) / 100) *
                        Number(batteryCapacity) *
                        Number(efficiency)
                      ).toFixed(1)}{' '}
                      km
                    </span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loadingBest}
                  className="w-full bg-[#22C55E] hover:bg-green-400 disabled:opacity-50 text-[#0F172A] font-bold py-2.5 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 text-sm"
                >
                  {loadingBest ? 'Searching…' : '🔍 Find Nearest Station'}
                </button>
              </form>

              {stationError && (
                <div className="mt-3 bg-red-900/50 border border-red-700 text-red-200 text-xs p-3 rounded-lg">
                  {stationError}
                </div>
              )}
            </div>

            {/* Best station result card */}
            {bestStation && (
              <div className="bg-[#1E293B] rounded-xl p-5 shadow-lg border border-[#22C55E]/50 animate-pulse-once">
                <h3 className="text-base font-bold text-[#22C55E] mb-3 flex items-center gap-2">
                  <span>🏆</span> Nearest Reachable Station
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Station ID</span>
                    <span className="text-white font-semibold">{bestStation.station_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance</span>
                    <span className="text-white font-semibold">{bestStation.distance_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating</span>
                    <span className="text-yellow-400 font-semibold">
                      ⭐ {bestStation.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost</span>
                    <span className="text-white font-semibold">
                      ${bestStation.cost.toFixed(2)}/kWh
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Your range</span>
                    <span className="text-green-400 font-semibold">
                      {bestStation.remaining_range_km} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Coordinates</span>
                    <span className="text-gray-300 text-xs">
                      {bestStation.latitude.toFixed(4)}, {bestStation.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [bestStation.longitude, bestStation.latitude],
                        zoom: 14,
                        duration: 1200,
                      });
                    }
                  }}
                  className="mt-4 w-full bg-[#0F172A] hover:bg-gray-800 border border-[#22C55E]/40 text-[#22C55E] text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  📍 Zoom to Station
                </button>
              </div>
            )}

            {/* Battery health tip */}
            <div className="bg-[#1E293B] rounded-xl p-4 border border-gray-700 text-xs text-gray-400">
              <p className="font-semibold text-gray-300 mb-1">💡 Battery Health Tip</p>
              <p>
                Frequent fast-charging above 80% can increase battery degradation by up to 12%
                annually. Prefer charging to 80% for daily use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargingStations;