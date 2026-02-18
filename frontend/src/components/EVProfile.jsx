import React, { useState, useEffect } from 'react';
import { saveEVProfile, getEVProfile } from '../services/profileService';
import { useGlobalState } from '../App';

const EVProfile = () => {
  const { globalState, updateGlobalState } = useGlobalState();
  const [profile, setProfile] = useState({
    evModel: '',
    batteryCapacity: '',
    currentBattery: 50,
    batteryHealth: 85,
    vehicleLoad: '',
    ambientTemperature: ''
  });

  // Load profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedProfile = await getEVProfile('demo-user');
        if (savedProfile) {
          setProfile(savedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, []);

  const evModels = [
    'Tata Nexon EV',
    'Ola S1 Pro',
    'Ather 450X',
    'Custom Model'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!profile.evModel || !profile.batteryCapacity || profile.batteryCapacity <= 0) {
        alert('Please fill in required fields: EV Model and Battery Capacity');
        return;
      }
      
      // Show a temporary saving animation
      const saveBtn = document.getElementById('saveProfileBtn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saving...';
      saveBtn.disabled = true;
      
      // Prepare profile data in the format expected by the backend
      const profileData = {
        ev_model: profile.evModel,
        battery_capacity: parseFloat(profile.batteryCapacity) || 0,
        current_battery: parseInt(profile.currentBattery) || 85, // Default to 85 if not set
        battery_health: parseInt(profile.batteryHealth) || 100, // Default to 100 if not set
        vehicle_load: profile.vehicleLoad ? parseFloat(profile.vehicleLoad) : 0,
        ambient_temperature: profile.ambientTemperature ? parseFloat(profile.ambientTemperature) : 25,
        userId: 'demo-user'
      };
      
      // Save profile using the service
      await saveEVProfile(profileData);
      
      // Update global state with the new profile
      updateGlobalState({ evProfile: profileData });
      
      // Animation for battery icon
      const batteryIcon = document.querySelector('.battery-icon');
      if (batteryIcon) {
        batteryIcon.classList.add('animate-pulse');
        setTimeout(() => {
          batteryIcon.classList.remove('animate-pulse');
        }, 1000);
      }
      
      saveBtn.textContent = 'Saved!';
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile: ' + error.message);
      
      // Reset button state on error
      const saveBtn = document.getElementById('saveProfileBtn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-28 font-bold font-poppins mb-8 text-center">EV Profile Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-20 font-bold font-poppins mb-6 text-[#22C55E]">Vehicle Configuration</h2>
            
            <div className="space-y-6">
              {/* EV Model Dropdown */}
              <div className="space-y-2">
                <label className="block font-medium font-inter">EV Model</label>
                <select
                  name="evModel"
                  value={profile.evModel}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select EV Model</option>
                  {evModels.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Battery Capacity */}
              <div className="space-y-2">
                <label className="block font-medium font-inter">Battery Capacity (kWh)</label>
                <input
                  type="number"
                  name="batteryCapacity"
                  value={profile.batteryCapacity}
                  onChange={handleInputChange}
                  placeholder="e.g., 75"
                  className="w-full p-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Current Battery Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium font-inter">Current Battery (%)</label>
                  <span className="text-[#22C55E] font-bold">{profile.currentBattery}%</span>
                </div>
                <input
                  type="range"
                  name="currentBattery"
                  min="0"
                  max="100"
                  value={profile.currentBattery}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Battery Health Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-medium font-inter">Battery Health (SOH %)</label>
                  <span className="text-[#22C55E] font-bold">{profile.batteryHealth}%</span>
                  <div className="group relative inline-block ml-2">
                    <span className="text-blue-400 text-sm cursor-help">ⓘ</span>
                    <div className="absolute left-0 z-10 hidden group-hover:block w-48 p-2 mt-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                      Battery Health affects energy efficiency
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  name="batteryHealth"
                  min="50"
                  max="100"
                  value={profile.batteryHealth}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Vehicle Load */}
              <div className="space-y-2">
                <label className="block font-medium font-inter">Vehicle Load (kg)</label>
                <input
                  type="number"
                  name="vehicleLoad"
                  value={profile.vehicleLoad}
                  onChange={handleInputChange}
                  placeholder="Optional"
                  className="w-full p-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all"
                />
                <div className="group relative inline-block">
                  <span className="text-blue-400 text-sm cursor-help">ⓘ</span>
                  <div className="absolute left-0 z-10 hidden group-hover:block w-48 p-2 mt-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                    Higher load increases energy consumption
                  </div>
                </div>
              </div>

              {/* Ambient Temperature */}
              <div className="space-y-2">
                <label className="block font-medium font-inter">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  name="ambientTemperature"
                  value={profile.ambientTemperature}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                  className="w-full p-3 bg-[#0F172A] border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Save Button */}
              <button
                id="saveProfileBtn"
                onClick={handleSaveProfile}
                className="w-full bg-[#22C55E] text-[#0F172A] font-bold py-3 px-4 rounded-lg hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
              >
                Save Profile
              </button>
            </div>
          </div>

          {/* Right Panel - Visual Elements */}
          <div className="space-y-6">
            {/* EV Dashboard Illustration */}
            <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">EV Dashboard</h2>
              
              {/* EV Side View Illustration */}
              <div className="flex justify-center mb-6">
                <svg width="200" height="120" viewBox="0 0 200 120" className="filter brightness-110">
                  {/* Car Body */}
                  <rect x="40" y="60" width="120" height="30" rx="5" fill="#3B82F6" opacity="0.8"/>
                  <rect x="50" y="40" width="100" height="25" rx="3" fill="#1E293B"/>
                  
                  {/* Wheels */}
                  <circle cx="65" cy="90" r="10" fill="#1E293B" stroke="#475569" strokeWidth="2"/>
                  <circle cx="135" cy="90" r="10" fill="#1E293B" stroke="#475569" strokeWidth="2"/>
                  
                  {/* Windows */}
                  <rect x="55" y="45" width="35" height="15" rx="2" fill="#7DD3FC" opacity="0.6"/>
                  <rect x="95" y="45" width="50" height="15" rx="2" fill="#7DD3FC" opacity="0.6"/>
                  
                  {/* Lights */}
                  <circle cx="40" cy="70" r="3" fill="#FBBF24"/>
                  <circle cx="160" cy="70" r="3" fill="#FBBF24"/>
                </svg>
              </div>
              
              <p className="text-center text-gray-300 font-inter">Premium EV Dashboard Visualization</p>
            </div>

            {/* Battery Indicator Graphic */}
            <div className="bg-[#1E293B] rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-20 font-bold font-poppins mb-4 text-[#22C55E]">Battery Status</h2>
              
              <div className="flex flex-col items-center">
                <div className="relative">
                  {/* Battery Outline */}
                  <div className="w-32 h-16 bg-gray-700 border-2 border-gray-500 rounded-md relative">
                    {/* Battery Cap */}
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-4 bg-gray-500 rounded-r"></div>
                    
                    {/* Animated Fill */}
                    <div 
                      className="absolute top-1 left-1 h-14 bg-gradient-to-r from-[#22C55E] to-[#3B82F6] rounded-sm transition-all duration-500 ease-out battery-fill"
                      style={{ width: `${profile.currentBattery}%` }}
                    ></div>
                  </div>
                  
                  {/* Battery Icon with Animation */}
                  <div className="battery-icon text-2xl mt-2 text-[#22C55E] font-bold">
                    {profile.currentBattery}% Charged
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-400">SOH: {profile.batteryHealth}%</p>
                  <p className="text-sm text-gray-400">Capacity: {profile.batteryCapacity || 'N/A'} kWh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22C55E;
          cursor: pointer;
          box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
        }
        
        .slider-green::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22C55E;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 5px rgba(34, 197, 94, 0.5);
        }
        
        .battery-fill {
          animation: fillAnimation 1s ease-out;
        }
        
        @keyframes fillAnimation {
          from {
            width: 0;
          }
          to {
            width: ${profile.currentBattery}%;
          }
        }
      `}</style>
    </div>
  );
};

export default EVProfile;