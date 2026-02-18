import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = ({ routeGeometry }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  // Initialize map only once
  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [78.9629, 20.5937],
      zoom: 4,
    });
  }, []);

  // Draw route when geometry changes
  useEffect(() => {
    if (!map.current || !routeGeometry) return;

    if (map.current.getSource("route")) {
      map.current.removeLayer("route");
      map.current.removeSource("route");
    }

    map.current.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: routeGeometry,
      },
    });

    map.current.addLayer({
      id: "route",
      type: "line",
      source: "route",
      paint: {
        "line-color": "#69E300",
        "line-width": 6,
      },
    });

    // Auto fit bounds to route
    const coordinates = routeGeometry.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    map.current.fitBounds(bounds, { padding: 60 });

  }, [routeGeometry]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-xl"
    />
  );
};

export default MapView;
