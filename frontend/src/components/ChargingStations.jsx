import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGlobalState } from '../App';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Set the access token globally
mapboxgl.accessToken = MAPBOX_TOKEN;

const ChargingStations = ({ routeData }) => {
  const { globalState, updateGlobalState } = useGlobalState();
  const [chargingStations, setChargingStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  
  // Mock charging stations data
  const mockChargingStations = [
    {
      id: 1,
      name: "ElectroCharge Hub",
      type: "Fast Charging",
      distance: 2.5,
      waitingTime: 15,
      detourImpact: 3.2,
      coordinates: [77.22, 28.71],
      chargingSpeed: "50kW DC",
      fullChargeTime: "45 mins"
    },
    {
      id: 2,
      name: "PowerPoint Station",
      type: "Fast Charging",
      distance: 4.8,
      waitingTime: 10,
      detourImpact: 2.1,
      coordinates: [77.25, 28.73],
      chargingSpeed: "150kW DC",
      fullChargeTime: "20 mins"
    },
    {
      id: 3,
      name: "City Charge Point",
      type: "Normal Charging",
      distance: 1.2,
      waitingTime: 45,
      detourImpact: 1.8,
      coordinates: [77.20, 28.69],
      chargingSpeed: "7kW AC",
      fullChargeTime: "3 hours"
    },
    {
      id: 4,
      name: "QuickCharge Plaza",
      type: "Fast Charging",
      distance: 6.3,
      waitingTime: 20,
      detourImpact: 4.5,
      coordinates: [77.28, 28.75],
      chargingSpeed: "100kW DC",
      fullChargeTime: "30 mins"
    }
  ];
  
  useEffect(() => {
    // In a real app, this would fetch from the backend
    setChargingStations(mockChargingStations);
    
    // Update global state with charging stations
    updateGlobalState({ chargingStations: mockChargingStations });
  }, [updateGlobalState]);
  
  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent multiple maps
    if (mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [77.22, 28.71], // Delhi/NCR region
      zoom: 11
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;

    // Cleanup
    return () => {
      // Remove all markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);
  
  // Update charging station markers when stations change
  useEffect(() => {
    if (!mapRef.current || chargingStations.length === 0) return;

    // Remove existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for charging stations
    chargingStations.forEach(station => {
      const [lng, lat] = station.coordinates;
      
      // Create custom marker element based on charging type
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = station.type === 'Fast Charging' ? '#3B82F6' : '#9CA3AF';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.cursor = 'pointer';
      
      // Add charging icon
      const icon = document.createElement('div');
      icon.innerHTML = station.type === 'Fast Charging' ? '⚡' : '🔌';
      icon.style.color = 'white';
      icon.style.fontSize = '14px';
      icon.style.fontWeight = 'bold';
      el.appendChild(icon);
      
      // Create marker and add to map
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${station.name}</strong><br/>${station.type}<br/>${station.distance} km away`))
        .addTo(mapRef.current);
        
      // Add click event to marker
      el.addEventListener('click', () => {
        setSelectedStation(station);
        setShowModal(true);
      });
      
      markersRef.current.push(marker);
    });
    
    // Fit bounds to show all charging stations
    if (chargingStations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      chargingStations.forEach(station => {
        bounds.extend(station.coordinates);
      });
      mapRef.current.fitBounds(bounds, { padding: 50, duration: 1000 });
    }
  }, [chargingStations]);
  
  const handleStationClick = (station) => {
    setSelectedStation(station);
    setShowModal(true);
  };
  
  const handleAddToRoute = () => {
    // Logic to add charging stop to route
    console.log('Adding to route:', selectedStation);
    setShowModal(false);
  };
  
  // Calculate if battery is insufficient
  const insufficientBattery = routeData && routeData.routes && 
    routeData.routes.some(route => {
      const endBattery = (route.start_battery || 85) - (route.battery_percentage_usage || 0);
      return endBattery < 15;
    });
  
  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 relative overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-28 font-bold font-poppins mb-6">Charging Intelligence</h1>
        
        {/* Warning for insufficient battery */}
        {insufficientBattery && (
          <div className="bg-orange-900 border-l-4 border-orange-500 text-orange-100 p-4 mb-6 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Battery may not be sufficient for this trip.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Battery Health Impact Indicator */}
        <div className="bg-orange-900 border-l-4 border-orange-500 text-orange-100 p-4 mb-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Battery Health Impact Indicator</p>
              <p className="text-xs mt-1">If you frequently drive high-elevation routes, battery degradation may increase by 12% annually.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 bg-[#1E293B] rounded-xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Nearest Charging Stations</h2>
            
            {/* Real map with charging stations */}
            <div 
              ref={mapContainerRef}
              className="w-full h-96 rounded-lg overflow-hidden bg-[#0F172A]"
              style={{ minHeight: '384px' }}
            />
          </div>
          
          {/* Charging Station List */}
          <div className="bg-[#1E293B] rounded-xl p-4 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Available Stations</h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {chargingStations.map((station) => (
                <div 
                  key={station.id} 
                  className="bg-[#0F172A] p-4 rounded-lg border border-gray-600 hover:border-[#22C55E] transition-colors cursor-pointer"
                  onClick={() => handleStationClick(station)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{station.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${station.type === 'Fast Charging' ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-200'}`}>
                          {station.type === 'Fast Charging' ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                              </svg>
                              Fast
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12.55a11 11 0 0114.08 0M12 18.5V10m-6 4a6 6 0 1112 0"></path>
                              </svg>
                              Normal
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Distance</div>
                      <div className="text-white font-bold">{station.distance} km</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Wait</div>
                      <div className="text-white font-bold">{station.waitingTime} min</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-gray-400">Detour</div>
                      <div className="text-white font-bold">+{station.detourImpact}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Station Detail Modal */}
        {showModal && selectedStation && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] rounded-xl p-6 max-w-md w-full border border-gray-600">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-20 font-bold font-poppins text-[#22C55E]">Charging Station Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedStation.name}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedStation.type === 'Fast Charging' ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-200'}`}>
                      {selectedStation.type === 'Fast Charging' ? (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          </svg>
                          Fast Charger
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12.55a11 11 0 0114.08 0M12 18.5V10m-6 4a6 6 0 1112 0"></path>
                          </svg>
                          Normal Charger
                        </>
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0F172A] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Charging Speed</div>
                    <div className="text-white font-bold">{selectedStation.chargingSpeed}</div>
                  </div>
                  <div className="bg-[#0F172A] p-3 rounded-lg">
                    <div className="text-gray-400 text-sm">Full Charge Time</div>
                    <div className="text-white font-bold">{selectedStation.fullChargeTime}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-gray-400 text-xs">Distance</div>
                    <div className="text-white font-bold">{selectedStation.distance} km</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-gray-400 text-xs">Wait Time</div>
                    <div className="text-white font-bold">{selectedStation.waitingTime} min</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="text-gray-400 text-xs">Detour Impact</div>
                    <div className="text-white font-bold">+{selectedStation.detourImpact}%</div>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleAddToRoute}
                className="w-full mt-6 bg-[#22C55E] text-[#0F172A] font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/20"
              >
                Add to Route
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChargingStations;