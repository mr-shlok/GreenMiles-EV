import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Set the access token globally
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapComponent = ({ routeGeometry, startCoords, endCoords }) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const startMarkerRef = useRef(null);
    const endMarkerRef = useRef(null);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // Prevent multiple maps
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-74.006, 40.7128], // New York
            zoom: 9
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        mapRef.current = map;

        // Cleanup
        return () => {
            if (startMarkerRef.current) startMarkerRef.current.remove();
            if (endMarkerRef.current) endMarkerRef.current.remove();
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove old markers
        if (startMarkerRef.current) {
            startMarkerRef.current.remove();
            startMarkerRef.current = null;
        }
        if (endMarkerRef.current) {
            endMarkerRef.current.remove();
            endMarkerRef.current = null;
        }

        // Add start marker (green)
        if (startCoords) {
            const [lon, lat] = startCoords.split(',').map(Number);
            if (!isNaN(lon) && !isNaN(lat)) {
                startMarkerRef.current = new mapboxgl.Marker({ color: '#10b981' })
                    .setLngLat([lon, lat])
                    .setPopup(new mapboxgl.Popup().setHTML('<strong>Start</strong>'))
                    .addTo(mapRef.current);
            }
        }

        // Add end marker (red)
        if (endCoords) {
            const [lon, lat] = endCoords.split(',').map(Number);
            if (!isNaN(lon) && !isNaN(lat)) {
                endMarkerRef.current = new mapboxgl.Marker({ color: '#ef4444' })
                    .setLngLat([lon, lat])
                    .setPopup(new mapboxgl.Popup().setHTML('<strong>Destination</strong>'))
                    .addTo(mapRef.current);
            }
        }

    }, [startCoords, endCoords]);

    // Update Route
    useEffect(() => {
        if (!mapRef.current || !routeGeometry) return;

        const map = mapRef.current;

        // Wait for style to load before adding sources
        if (map.isStyleLoaded()) {
            addOrUpdateRoute(map, routeGeometry);
        } else {
            map.once('style.load', () => {
                addOrUpdateRoute(map, routeGeometry);
            });
        }

    }, [routeGeometry]);

    const addOrUpdateRoute = (map, geometry) => {
        const sourceId = 'route-source';
        const layerId = 'route-layer';

        if (map.getSource(sourceId)) {
            map.getSource(sourceId).setData({
                type: 'Feature',
                properties: {},
                geometry: geometry
            });
        } else {
            map.addSource(sourceId, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: geometry
                }
            });

            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#007cbf',
                    'line-width': 5
                }
            });
        }

        // Fit bounds
        const coordinates = geometry.coordinates;
        if (coordinates && coordinates.length > 0) {
            const bounds = coordinates.reduce((bounds, coord) => {
                return bounds.extend(coord);
            }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

            map.fitBounds(bounds, {
                padding: 40,
                duration: 1000
            });
        }
    };

    return (
        <div
            ref={mapContainerRef}
            className="w-full h-full rounded-xl overflow-hidden"
            style={{ minHeight: '400px' }} // Ensure visibility
        />
    );
};

export default MapComponent;
