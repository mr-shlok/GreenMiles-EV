import React, { useState, useEffect } from 'react';
import { useGlobalState } from '../App';

const SustainabilityReport = () => {
  const { globalState } = useGlobalState();
  const [stats, setStats] = useState({
    totalEnergySaved: 0,
    chargingSessionsReduced: 0,
    co2Saved: 0,
    greenScore: 0
  });
  
  const [weeklyData, setWeeklyData] = useState([]);
  const [routeTypeData, setRouteTypeData] = useState([]);
  const [ecoLevel, setEcoLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Mock data initialization
  useEffect(() => {
    // Check if this is first visit
    const isFirstVisit = !localStorage.getItem('hasVisitedSustainability');
    if (isFirstVisit) {
      setShowWelcome(true);
      localStorage.setItem('hasVisitedSustainability', 'true');
    }
    
    // Simulate loading data
    setTimeout(() => {
      // Use global state data if available, otherwise use mock data
      const sustainabilityData = globalState.sustainabilityMetrics || {};
      
      const newStats = {
        totalEnergySaved: sustainabilityData.totalEnergySaved || 245.7,
        chargingSessionsReduced: 12,
        co2Saved: sustainabilityData.co2Saved || 18.4,
        greenScore: sustainabilityData.greenScore || 87
      };
      
      setStats(newStats);
      
      // Weekly efficiency data
      setWeeklyData([
        { day: 'Mon', efficiency: 78 },
        { day: 'Tue', efficiency: 85 },
        { day: 'Wed', efficiency: 82 },
        { day: 'Thu', efficiency: 91 },
        { day: 'Fri', efficiency: 88 },
        { day: 'Sat', efficiency: 94 },
        { day: 'Sun', efficiency: 90 }
      ]);
      
      // Route type data
      setRouteTypeData([
        { name: 'Energy Efficient', value: 65 },
        { name: 'Fastest Route', value: 25 },
        { name: 'Scenic Route', value: 10 }
      ]);
      
      // Calculate eco level based on green score
      setEcoLevel(Math.min(5, Math.floor((sustainabilityData.greenScore || 87) / 20) + 1));
      
      setIsLoading(false);
    }, 1000);
  }, [globalState]);
  
  const dismissWelcome = () => {
    setShowWelcome(false);
  };
  
  // Calculate max value for chart scaling
  const maxEfficiency = Math.max(...weeklyData.map(d => d.efficiency), 100);
  
  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative w-16 h-16 mb-4">
        {/* EV Wheel Animation */}
        <div className="absolute inset-0 rounded-full border-4 border-t-[#22C55E] border-r-[#3B82F6] border-b-[#EF4444] border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-[#0F172A] flex items-center justify-center">
          <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
        </div>
      </div>
      <p className="text-gray-400 font-poppins">Analyzing Sustainability Data...</p>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6 relative overflow-auto">
      {/* Welcome Popup */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-xl p-8 max-w-md w-full border border-gray-600 text-center animate-fade-in">
            <div className="text-4xl mb-4">🚗⚡</div>
            <h2 className="text-24 font-bold font-poppins text-[#22C55E] mb-2">Welcome to VoltRoute AI</h2>
            <p className="text-gray-300 mb-6">Smarter EV Navigation</p>
            <button 
              onClick={dismissWelcome}
              className="bg-[#22C55E] text-[#0F172A] font-bold py-2 px-6 rounded-lg hover:bg-green-400 transition-all duration-200"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="h-[calc(100vh-80px)] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto animate-fade-in-up">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-28 font-bold font-poppins">Sustainability Report</h1>
            <div className="flex items-center space-x-2">
              <span className="bg-green-900 text-green-300 text-sm font-bold px-3 py-1 rounded-full flex items-center">
                <span className="mr-1">🌿</span> Eco Driver Level {ecoLevel}
              </span>
            </div>
          </div>
          
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Energy Saved Card */}
            <div className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-xl p-6 shadow-lg border border-green-700 transform transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-300 text-sm font-medium">Total Energy Saved</h3>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalEnergySaved} kWh</p>
                </div>
                <div className="bg-green-800 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-green-300 text-xs mt-3">Compared to conventional routing</p>
            </div>
            
            {/* Charging Sessions Reduced Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-800 rounded-xl p-6 shadow-lg border border-blue-700 transform transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-300 text-sm font-medium">Sessions Reduced</h3>
                  <p className="text-3xl font-bold text-white mt-2">{stats.chargingSessionsReduced}</p>
                </div>
                <div className="bg-blue-800 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12.55a11 11 0 0114.08 0M12 18.5V10m-6 4a6 6 0 1112 0"></path>
                  </svg>
                </div>
              </div>
              <p className="text-blue-300 text-xs mt-3">Fewer stops needed</p>
            </div>
            
            {/* CO2 Saved Card */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-800 rounded-xl p-6 shadow-lg border border-emerald-700 transform transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-300 text-sm font-medium">CO₂ Saved</h3>
                  <p className="text-3xl font-bold text-white mt-2">{stats.co2Saved} kg</p>
                </div>
                <div className="bg-emerald-800 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-emerald-300 text-xs mt-3">Environmentally friendly</p>
            </div>
            
            {/* Green Score Card */}
            <div className="bg-gradient-to-br from-purple-900 to-violet-800 rounded-xl p-6 shadow-lg border border-purple-700 transform transition-transform hover:scale-105">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-300 text-sm font-medium">Green Score</h3>
                  <p className="text-3xl font-bold text-white mt-2">{stats.greenScore}/100</p>
                </div>
                <div className="bg-purple-800 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <p className="text-purple-300 text-xs mt-3">Driving efficiency rating</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Efficiency Chart */}
            <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-20 font-bold font-poppins mb-6 text-[#22C55E]">Weekly Efficiency Trend</h2>
              <div className="h-64 flex items-end space-x-2 justify-between">
                {weeklyData.map((dayData, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-xs text-gray-400 mb-1">{dayData.day}</div>
                    <div 
                      className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 ease-out"
                      style={{ height: `${(dayData.efficiency / maxEfficiency) * 80}%` }}
                    ></div>
                    <div className="text-xs text-gray-300 mt-1">{dayData.efficiency}%</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Route Type Distribution */}
            <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-20 font-bold font-poppins mb-6 text-[#22C55E]">Route Type Distribution</h2>
              <div className="flex items-center justify-center h-64">
                <div className="relative w-48 h-48 rounded-full border-8 border-transparent">
                  {/* Pie chart using CSS */}
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-1/2 w-1/2 h-full"
                      style={{
                        background: `conic-gradient(
                          #22C55E 0% ${(routeTypeData[0]?.value || 0)}%,
                          #3B82F6 ${(routeTypeData[0]?.value || 0)}% ${((routeTypeData[0]?.value || 0) + (routeTypeData[1]?.value || 0))}%,
                          #EF4444 ${((routeTypeData[0]?.value || 0) + (routeTypeData[1]?.value || 0))}% 100%
                        )`
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">100%</div>
                        <div className="text-xs text-gray-400">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-300">Efficient ({routeTypeData[0]?.value || 0}%)</div>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-300">Fastest ({routeTypeData[1]?.value || 0}%)</div>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1"></div>
                  <div className="text-xs text-gray-300">Scenic ({routeTypeData[2]?.value || 0}%)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Insights */}
          <div className="mt-8 bg-[#1E293B] rounded-xl p-6 shadow-lg border border-gray-700">
            <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Sustainability Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0F172A] rounded-lg">
                <h3 className="font-bold text-green-400 mb-2">Energy Efficiency</h3>
                <p className="text-sm text-gray-300">You've improved your energy efficiency by 15% compared to last month.</p>
              </div>
              <div className="p-4 bg-[#0F172A] rounded-lg">
                <h3 className="font-bold text-blue-400 mb-2">Charging Patterns</h3>
                <p className="text-sm text-gray-300">Your smart charging decisions have reduced unnecessary stops by 30%.</p>
              </div>
              <div className="p-4 bg-[#0F172A] rounded-lg">
                <h3 className="font-bold text-purple-400 mb-2">Environmental Impact</h3>
                <p className="text-sm text-gray-300">Your eco-friendly routes have prevented 25kg of CO₂ emissions this week.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityReport;