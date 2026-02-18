import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../App';

const RouteAnalysis = ({ routeData }) => {
  const { globalState, updateGlobalState } = useGlobalState();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  
  // Use route data from props if available, otherwise use mock data
  useEffect(() => {
    if (routeData && routeData.routes && routeData.routes.length > 0) {
      // Select the first route as the default for analysis
      const firstRoute = { ...routeData.routes[0], start_battery: 85, estimated_cost: 150, co2_equivalent: 8.2 };
      setSelectedRoute(firstRoute);
      
      // Update sustainability metrics in global state
      if (firstRoute) {
        const energySaved = firstRoute.energy_consumed_kWh * 0.15; // Assume 15% savings
        const co2Saved = energySaved * 0.5; // Approximation
        
        updateGlobalState({
          sustainabilityMetrics: {
            totalEnergySaved: energySaved,
            co2Saved: co2Saved,
            greenScore: firstRoute.green_score
          }
        });
      }
    }
  }, [routeData, updateGlobalState]);
  
  // Animation effect for counters
  const [energyUsed, setEnergyUsed] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [co2Equivalent, setCo2Equivalent] = useState(0);
  
  useEffect(() => {
    if (selectedRoute) {
      // Animate energy used counter
      const targetEnergy = (selectedRoute.energy_consumed_kWh || 0) * 1000; // Convert to Wh
      const duration = 2000; // ms
      const increment = targetEnergy / (duration / 16); // ~60fps
      let current = 0;
      
      const energyInterval = setInterval(() => {
        current += increment;
        if (current >= targetEnergy) {
          current = targetEnergy;
          clearInterval(energyInterval);
        }
        setEnergyUsed(Math.floor(current));
      }, 16);
      
      // Animate cost counter
      const targetCost = selectedRoute.estimated_cost || 0;
      const costIncrement = targetCost / (duration / 16);
      let currentCost = 0;
      
      const costInterval = setInterval(() => {
        currentCost += costIncrement;
        if (currentCost >= targetCost) {
          currentCost = targetCost;
          clearInterval(costInterval);
        }
        setEstimatedCost(Math.floor(currentCost));
      }, 16);
      
      // Animate CO2 counter
      const targetCO2 = selectedRoute.co2_equivalent || 0;
      const co2Increment = targetCO2 / (duration / 16);
      let currentCO2 = 0;
      
      const co2Interval = setInterval(() => {
        currentCO2 += co2Increment;
        if (currentCO2 >= targetCO2) {
          currentCO2 = targetCO2;
          clearInterval(co2Interval);
        }
        setCo2Equivalent(parseFloat(currentCO2.toFixed(1)));
      }, 16);
      
      return () => {
        clearInterval(energyInterval);
        clearInterval(costInterval);
        clearInterval(co2Interval);
      };
    }
  }, [selectedRoute]);
  
  // Calculate battery percentage for visualization
  const batteryPercentage = selectedRoute ? (selectedRoute.start_battery || 85) - (selectedRoute.battery_percentage_usage || 0) : 85;
  
  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 relative overflow-auto">
      {/* Subtle EV-themed background */}
      <div className="absolute inset-0 opacity-5 z-0">
        <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="2" fill="#22C55E" />
          <circle cx="150" cy="100" r="1.5" fill="#3B82F6" />
          <circle cx="80" cy="150" r="2.5" fill="#22C55E" />
          <path d="M 20 20 L 30 25 L 25 35 L 15 30 Z" fill="#3B82F6" />
          <path d="M 180 40 L 185 45 L 180 50 L 175 45 Z" fill="#22C55E" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-28 font-bold font-poppins">Route Energy Analysis</h1>
          <button 
            onClick={() => setShowComparison(!showComparison)}
            className="bg-[#22C55E] text-[#0F172A] font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/20"
          >
            {showComparison ? "Hide Comparison" : "Compare with shortest route"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Battery Usage Visualization */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Battery Usage</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{selectedRoute?.start_battery}%</div>
                <div className="text-sm text-gray-400">Start</div>
              </div>
              <div className="flex-1 mx-4 relative">
                <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(selectedRoute?.battery_percentage_usage || 0) > 0 ? 100 - ((batteryPercentage / selectedRoute?.start_battery) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{batteryPercentage}%</div>
                <div className="text-sm text-gray-400">End</div>
              </div>
            </div>
            <div className="text-center mt-2">
              <span className="text-lg font-semibold text-yellow-400">-{selectedRoute?.battery_percentage_usage}%</span> <span className="text-gray-400">used</span>
            </div>
          </div>
          
          {/* Elevation Graph */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Elevation Profile</h2>
            <div className="h-40 relative">
              <svg viewBox="0 0 400 120" className="w-full h-full">
                {/* Elevation path */}
                <defs>
                  <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                
                {/* Simplified elevation profile */}
                <path 
                  d="M 0,100 L 50,80 L 100,60 L 150,70 L 200,50 L 250,65 L 300,40 L 350,50 L 400,30" 
                  stroke="url(#elevationGradient)" 
                  strokeWidth="3" 
                  fill="none" 
                />
                
                {/* Fill under the curve */}
                <path 
                  d="M 0,100 L 50,80 L 100,60 L 150,70 L 200,50 L 250,65 L 300,40 L 350,50 L 400,30 L 400,120 L 0,120 Z" 
                  fill="url(#elevationGradient)" 
                  fillOpacity="0.2" 
                />
                
                {/* Uphill sections (red) */}
                <path 
                  d="M 0,100 L 50,80 L 100,60" 
                  stroke="#EF4444" 
                  strokeWidth="3" 
                  fill="none" 
                />
                <path 
                  d="M 150,70 L 200,50" 
                  stroke="#EF4444" 
                  strokeWidth="3" 
                  fill="none" 
                />
                <path 
                  d="M 250,65 L 300,40" 
                  stroke="#EF4444" 
                  strokeWidth="3" 
                  fill="none" 
                />
                
                {/* Downhill sections (green) */}
                <path 
                  d="M 100,60 L 150,70" 
                  stroke="#22C55E" 
                  strokeWidth="3" 
                  fill="none" 
                />
                <path 
                  d="M 200,50 L 250,65" 
                  stroke="#22C55E" 
                  strokeWidth="3" 
                  fill="none" 
                />
                <path 
                  d="M 300,40 L 350,50 L 400,30" 
                  stroke="#22C55E" 
                  strokeWidth="3" 
                  fill="none" 
                />
              </svg>
              <div className="absolute bottom-0 left-0 text-xs text-gray-400">0 km</div>
              <div className="absolute bottom-0 right-0 text-xs text-gray-400">45 km</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Traffic Impact Gauge */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700 flex flex-col items-center">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Traffic Impact</h2>
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="#334155" 
                  strokeWidth="8" 
                />
                
                {/* Gauge arc */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke={selectedRoute?.traffic_level > 7 ? '#EF4444' : selectedRoute?.traffic_level > 4 ? '#F59E0B' : '#22C55E'}
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * (selectedRoute?.traffic_level || 0) / 10)}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-2xl font-bold">{selectedRoute?.traffic_level}/10</div>
                <div className="text-sm text-gray-400">
                  {selectedRoute?.traffic_level > 7 ? 'Heavy' : selectedRoute?.traffic_level > 4 ? 'Moderate' : 'Light'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Animated Counters */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Energy Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400">Energy Used</div>
                <div className="text-2xl font-bold text-yellow-400">{energyUsed.toLocaleString()} Wh</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Estimated Cost</div>
                <div className="text-2xl font-bold text-blue-400">₹{estimatedCost.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">CO₂ Equivalent</div>
                <div className="text-2xl font-bold text-purple-400">{co2Equivalent} kg</div>
              </div>
            </div>
          </div>
          
          {/* Regenerative Braking Zones */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Regenerative Braking</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Downhill Segment 1</div>
                  <div className="text-xs text-gray-400">km 5-8 • Energy recovery: 1.2 kWh</div>
                </div>
                <span className="text-yellow-400">⚡</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Downhill Segment 2</div>
                  <div className="text-xs text-gray-400">km 22-25 • Energy recovery: 0.8 kWh</div>
                </div>
                <span className="text-yellow-400">⚡</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Deceleration Zone</div>
                  <div className="text-xs text-gray-400">km 35-37 • Energy recovery: 0.5 kWh</div>
                </div>
                <span className="text-yellow-400">⚡</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="text-sm font-medium text-green-400">Total Energy Recovery: 2.5 kWh</div>
              <div className="text-xs text-gray-400 mt-1">~20% of consumed energy</div>
            </div>
          </div>
        </div>
        
        {/* Route Statistics */}
        <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
          <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Route Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#0F172A] rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedRoute?.distance_km} km</div>
              <div className="text-sm text-gray-400">Distance</div>
            </div>
            <div className="text-center p-4 bg-[#0F172A] rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedRoute?.duration_min} min</div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div className="text-center p-4 bg-[#0F172A] rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedRoute?.elevation_gain_m} m</div>
              <div className="text-sm text-gray-400">Elevation Gain</div>
            </div>
            <div className="text-center p-4 bg-[#0F172A] rounded-lg">
              <div className="text-2xl font-bold text-white">{selectedRoute?.green_score}/100</div>
              <div className="text-sm text-gray-400">Green Score</div>
            </div>
          </div>
        </div>
        
        {/* Comparison Modal */}
        {showComparison && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E293B] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto border border-gray-600">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-24 font-bold font-poppins text-[#22C55E]">Route Comparison</h2>
                <button 
                  onClick={() => setShowComparison(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0F172A] p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-[#22C55E]">Energy Efficient Route</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="font-bold">{selectedRoute?.distance_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy Used:</span>
                      <span className="font-bold text-yellow-400">{selectedRoute?.energy_consumed_kWh} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery Used:</span>
                      <span className="font-bold text-red-400">{selectedRoute?.battery_percentage_usage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-bold">{selectedRoute?.duration_min} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Green Score:</span>
                      <span className="font-bold text-green-400">{selectedRoute?.green_score}/100</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-[#0F172A] p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-[#3B82F6]">Shortest Route</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="font-bold">{selectedRoute ? (selectedRoute.distance_km * 0.95).toFixed(1) : '0.0'} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Energy Used:</span>
                      <span className="font-bold text-yellow-400">{selectedRoute ? (selectedRoute.energy_consumed_kWh * 1.15).toFixed(1) : '0.0'} kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Battery Used:</span>
                      <span className="font-bold text-red-400">{selectedRoute ? (selectedRoute.battery_percentage_usage * 1.15).toFixed(1) : '0.0'}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-bold">{selectedRoute ? Math.round(selectedRoute.duration_min * 1.1) : 0} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Green Score:</span>
                      <span className="font-bold text-green-400">{selectedRoute ? Math.max(0, selectedRoute.green_score - 15) : 0}/100</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-[#0F172A] rounded-lg">
                <h4 className="font-bold text-lg mb-2 text-[#22C55E]">Savings with Energy Efficient Route</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">-{selectedRoute ? ((selectedRoute.energy_consumed_kWh * 1.15 - selectedRoute.energy_consumed_kWh)).toFixed(1) : '0.0'} kWh</div>
                    <div className="text-sm text-gray-400">Energy Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">-{selectedRoute ? (selectedRoute.battery_percentage_usage * 0.15).toFixed(1) : '0.0'}%</div>
                    <div className="text-sm text-gray-400">Battery Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">₹{selectedRoute ? (selectedRoute.estimated_cost * 0.12).toFixed(0) : '0'}</div>
                    <div className="text-sm text-gray-400">Cost Saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteAnalysis;