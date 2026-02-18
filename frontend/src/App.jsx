import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MapView from "./components/MapView";
import MapComponent from './components/MapComponent'
import RouteForm from './components/RouteForm'
import Sidebar from './components/Sidebar';
import EVProfile from './components/EVProfile';
import RouteAnalysis from './components/RouteAnalysis';
import ChargingStations from './components/ChargingStations';
import SustainabilityReport from './components/SustainabilityReport';
import './index.css'

// Global State Context
const GlobalStateContext = createContext();

// Theme Context
const ThemeContext = createContext();

// Global State Provider Component
export const GlobalStateProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState({
    evProfile: null,
    routeData: null,
    chargingStations: [],
    sustainabilityMetrics: {}
  });
  
  const updateGlobalState = (updates) => {
    setGlobalState(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  return (
    <GlobalStateContext.Provider value={{ globalState, updateGlobalState }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use global state
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

function AppContent() {
  const { globalState, updateGlobalState } = useGlobalState();
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [showChargingNotification, setShowChargingNotification] = useState(false);

  const handleRouteOptimized = (data) => {
    // Update global state with route data
    updateGlobalState({ routeData: data });

    // Extract start/end coordinates from the first route if available
    if (data?.routes?.[0]?.geometry?.coordinates) {
      const coords = data.routes[0].geometry.coordinates;
      if (coords.length >= 2) {
        // First coordinate is start, last is end
        setStartCoords(`${coords[0][0]},${coords[0][1]}`);
        setEndCoords(`${coords[coords.length - 1][0]},${coords[coords.length - 1][1]}`);
      }
    }
    
    // Check if any route has insufficient battery (less than 15% after trip)
    const hasInsufficientBattery = data?.routes?.some(route => {
      const endBattery = (route.start_battery || 85) - (route.battery_percentage_usage || 0);
      return endBattery < 15;
    });
    
    // Show charging notification if battery is insufficient
    if (hasInsufficientBattery) {
      setShowChargingNotification(true);
      // Hide notification after 10 seconds
      setTimeout(() => {
        setShowChargingNotification(false);
      }, 10000);
    }
  };

  const bestRoute = globalState.routeData?.routes?.[0];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0F172A]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col md:flex-row overflow-auto">
        {/* Charging Notification */}
        {showChargingNotification && (
          <div className="fixed top-4 right-4 z-50 bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded-lg shadow-lg max-w-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Battery may not be sufficient for this trip.</p>
                <p className="text-xs mt-1 text-red-200">Consider visiting charging stations.</p>
                <button 
                  onClick={() => setShowChargingNotification(false)}
                  className="mt-2 text-xs text-red-300 hover:text-red-100 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="flex flex-col md:flex-row h-full w-full">
                {/* Form Area */}
                <div className="w-full md:w-1/3 h-1/2 md:h-full overflow-y-auto border-r border-gray-700 z-10 p-4 bg-[#1E293B]">
                  <RouteForm onRouteOptimized={handleRouteOptimized} />

                  {/* Results Check */}
                  {globalState.routeData?.routes && globalState.routeData.routes.map((route, index) => (
                    <div 
                      key={index}
                      className={`mt-4 p-4 rounded-lg shadow border ${route.is_optimal ? 'border-green-500 bg-[#164e63] animate-pulse shadow-lg shadow-green-500/20' : 'border-gray-700 bg-[#0F172A]'}`}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-2 text-white">Route #{index + 1}</h3>
                        {route.is_optimal && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <span className="mr-1">🌱</span> AI Recommended
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-300">
                          <span className="font-semibold block">Distance:</span>
                          <span className="text-white">{route.distance_km} km</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Time:</span>
                          <span className="text-white">{route.duration_min} min</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Energy:</span>
                          <span className="text-white">{route.energy_consumed_kWh} kWh</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Battery Used:</span>
                          <span className="text-white">{route.battery_percentage_usage}%</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Elevation Gain:</span>
                          <span className="text-white">{route.elevation_gain_m} m</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Traffic Level:</span>
                          <span className="text-white">{route.traffic_level}/10</span>
                        </div>
                        <div className="text-gray-300">
                          <span className="font-semibold block">Green Score:</span>
                          <span className="text-white">{route.green_score}/100</span>
                        </div>
                        <div>
                          <span className="font-semibold block text-gray-300">Status:</span>
                          <span className={`font-bold ${route.feasible ? "text-green-400" : "text-red-400"}`}>
                            {route.feasible ? "Feasible" : "Insufficient Battery"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Route Explanation Tooltip */}
                      <div className="group relative mt-3 inline-block w-full">
                        <div className="text-xs text-blue-400 cursor-help group-hover:text-blue-300">
                          {route.route_explanation}
                        </div>
                        <div className="absolute left-0 z-10 hidden group-hover:block w-64 p-2 mt-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                          {route.route_explanation}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Area */}
                <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-[#0F172A]">
                  <MapComponent
                    routeGeometry={bestRoute?.geometry}
                    startCoords={startCoords}
                    endCoords={endCoords}
                  />
                </div>
              </div>
            } 
          />
          <Route path="/ev-profile" element={<EVProfile />} />
          <Route path="/route-analysis" element={<RouteAnalysis routeData={globalState.routeData} />} />
          <Route path="/charging-stations" element={<ChargingStations routeData={globalState.routeData} />} />
          <Route path="/sustainability-report" element={<SustainabilityReport />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <GlobalStateProvider>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </GlobalStateProvider>
  );
}

export default App
