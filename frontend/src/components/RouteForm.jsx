import React, { useState, useEffect } from 'react';
import { optimizeRoute } from '../services/api';
import { getEVProfile } from '../services/profileService';
import { useGlobalState } from '../App';

const RouteForm = ({ onRouteOptimized }) => {
  const { globalState, updateGlobalState } = useGlobalState();
    const [loading, setLoading] = useState(false);
    const [optimizingText, setOptimizingText] = useState('Optimize Route');
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState({});
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [locationPopupMessage, setLocationPopupMessage] = useState('');
    const [formData, setFormData] = useState({
        // Default values
        start_location: "New York, NY",
        end_location: "Boston, MA",

        Battery_Capacity_kWh: 75.0,
        Vehicle_Age_Months: 12,
        Total_Charging_Cycles: 100,
        Avg_Temperature_C: 25.0,
        Fast_Charge_Ratio: 0.2,
        Avg_Discharge_Rate_C: 1.0,
        Internal_Resistance_Ohm: 0.05,
        SoH_Percent: 95.0,

        Car_Model_Ford_Mustang_Mach_E: 0,
        Car_Model_Hyundai_Ioniq_5: 0,
        Car_Model_Tesla_Model_3: 1, // Default Tesla
        Car_Model_Wuling_Air_EV: 0,

        Battery_Type_NMC: 1,
        Driving_Style_Conservative: 0,
        Driving_Style_Moderate: 1,
        Battery_Status_Replace_Required: 0,

        Vehicle_Weight_kg: 1800,
        Drag_Coefficient: 0.23,
        Frontal_Area_m2: 2.2,
        Rolling_Resistance_Coeff: 0.015,
        Motor_Efficiency: 0.9,

        Trip_Distance_km: 0, // Calculated by backend
        Elevation_Gain_m: 100, // Placeholder
        Traffic_Index: 5, // Medium
        Avg_Speed_kmph: 0, // Calculated
        Humidity_Percent: 50,
        Wind_Speed_mps: 5
    });

    // Load EV profile on component mount and update when global state changes
    useEffect(() => {
        const loadEVProfile = async () => {
            try {
                // First, try to get from global state
                if (globalState.evProfile) {
                    const profile = globalState.evProfile;
                    setFormData(prev => ({
                        ...prev,
                        Battery_Capacity_kWh: profile.battery_capacity,
                        SoH_Percent: profile.battery_health,
                        Avg_Temperature_C: profile.ambient_temperature || prev.Avg_Temperature_C,
                        Vehicle_Weight_kg: profile.vehicle_load ? prev.Vehicle_Weight_kg + profile.vehicle_load : prev.Vehicle_Weight_kg,
                        // Set car model based on EV model
                        Car_Model_Tesla_Model_3: profile.ev_model && profile.ev_model.toLowerCase().includes('tesla') ? 1 : 0,
                        Car_Model_Ford_Mustang_Mach_E: profile.ev_model && profile.ev_model.toLowerCase().includes('ford') ? 1 : 0,
                        Car_Model_Hyundai_Ioniq_5: profile.ev_model && profile.ev_model.toLowerCase().includes('ioniq') ? 1 : 0,
                        Car_Model_Wuling_Air_EV: profile.ev_model && profile.ev_model.toLowerCase().includes('wuling') ? 1 : 0,
                    }));
                } else {
                    // Fallback to direct API call
                    const profile = await getEVProfile('demo-user');
                    if (profile) {
                        setFormData(prev => ({
                            ...prev,
                            Battery_Capacity_kWh: profile.battery_capacity,
                            SoH_Percent: profile.battery_health,
                            Avg_Temperature_C: profile.ambient_temperature || prev.Avg_Temperature_C,
                            Vehicle_Weight_kg: profile.vehicle_load ? prev.Vehicle_Weight_kg + profile.vehicle_load : prev.Vehicle_Weight_kg,
                            // Set car model based on EV model
                            Car_Model_Tesla_Model_3: profile.ev_model.toLowerCase().includes('tesla') ? 1 : 0,
                            Car_Model_Ford_Mustang_Mach_E: profile.ev_model.toLowerCase().includes('ford') ? 1 : 0,
                            Car_Model_Hyundai_Ioniq_5: profile.ev_model.toLowerCase().includes('ioniq') ? 1 : 0,
                            Car_Model_Wuling_Air_EV: profile.ev_model.toLowerCase().includes('wuling') ? 1 : 0,
                        }));
                    }
                }
            } catch (error) {
                console.error('Error loading EV profile:', error);
            }
        };

        loadEVProfile();
    }, [globalState.evProfile]);

    const [previousLocations, setPreviousLocations] = useState({ start_location: '', end_location: '' });
    
    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
        
        // Show success popup for location selection only when location is newly entered
        if (name === 'start_location') {
            if (value.trim() !== '' && previousLocations.start_location === '') {
                // Location is being set for the first time
                setLocationPopupMessage('Start location selected successfully!');
                setShowLocationPopup(true);
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    setShowLocationPopup(false);
                }, 3000);
            }
            // Update previous location
            setPreviousLocations(prev => ({ ...prev, start_location: value }));
        } else if (name === 'end_location') {
            if (value.trim() !== '' && previousLocations.end_location === '') {
                // Location is being set for the first time
                setLocationPopupMessage('End location selected successfully!');
                setShowLocationPopup(true);
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    setShowLocationPopup(false);
                }, 3000);
            }
            // Update previous location
            setPreviousLocations(prev => ({ ...prev, end_location: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if EV Profile is completed using global state
        if (!globalState.evProfile || !globalState.evProfile.ev_model || !globalState.evProfile.battery_capacity) {
            setShowProfileModal(true);
            return;
        }
        
        setLoading(true);
        setOptimizingText('Optimizing...');
        
        try {
            const result = await optimizeRoute(formData);
            
            // Update global state with route data
            updateGlobalState({ currentRoute: result });
            
            // Send to Route Analysis page
            onRouteOptimized(result);
            
            // Show success popup with route summary
            if (result && result.routes && result.routes.length > 0) {
                const bestRoute = result.routes[0];
                setPopupData({
                    distance: bestRoute.distance_km,
                    time: bestRoute.duration_min,
                    batteryUsage: bestRoute.battery_percentage_usage,
                    greenScore: bestRoute.green_score
                });
                setShowPopup(true);
                
                // Also show general route generation success
                setLocationPopupMessage('Best route generated successfully!');
                setShowLocationPopup(true);
                
                // Auto-close popups after 6 seconds
                setTimeout(() => {
                    setShowPopup(false);
                    setShowLocationPopup(false);
                }, 6000);
                
                // Check if battery may be insufficient
                const endBattery = (bestRoute.start_battery || 85) - (bestRoute.battery_percentage_usage || 0);
                if (endBattery < 15) {
                    setTimeout(() => {
                        alert('⚠ Battery may not be sufficient. Charging stop suggested.');
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error optimizing route:', error);
            alert('Error optimizing route: ' + error.message);
        } finally {
            setLoading(false);
            setOptimizingText('Optimize Route');
        }
    };

    return (
        <div className="p-4 bg-[#1E293B] shadow-lg rounded-lg overflow-y-auto h-full">
            <h2 className="text-2xl font-bold mb-4 text-white font-poppins">EV Route Optimizer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="block font-semibold text-gray-300">Start Location</label>
                    <input type="text" name="start_location" value={formData.start_location} onChange={handleChange} className="w-full p-2 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" required />
                </div>
                <div className="space-y-2">
                    <label className="block font-semibold text-gray-300">End Location</label>
                    <input type="text" name="end_location" value={formData.end_location} onChange={handleChange} className="w-full p-2 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" required />
                </div>

                <h3 className="font-semibold text-lg mt-4 text-[#22C55E] font-poppins">Vehicle Settings</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-sm text-gray-300">Battery Capacity (kWh)</label>
                        <input type="number" name="Battery_Capacity_kWh" value={formData.Battery_Capacity_kWh} onChange={handleChange} className="w-full p-1 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Current SoH (%)</label>
                        <input type="number" name="SoH_Percent" value={formData.SoH_Percent} onChange={handleChange} className="w-full p-1 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Vehicle Weight (kg)</label>
                        <input type="number" name="Vehicle_Weight_kg" value={formData.Vehicle_Weight_kg} onChange={handleChange} className="w-full p-1 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" />
                    </div>
                </div>

                <h3 className="font-semibold text-lg mt-4 text-[#22C55E] font-poppins">Battery Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-sm text-gray-300">Internal Res. (Ohm)</label>
                        <input type="number" step="0.001" name="Internal_Resistance_Ohm" value={formData.Internal_Resistance_Ohm} onChange={handleChange} className="w-full p-1 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-300">Avg Temp (°C)</label>
                        <input type="number" name="Avg_Temperature_C" value={formData.Avg_Temperature_C} onChange={handleChange} className="w-full p-1 bg-[#0F172A] border border-gray-600 rounded text-white focus:ring-2 focus:ring-[#22C55E] focus:border-transparent outline-none transition-all" />
                    </div>
                </div>

                <button type="submit" disabled={loading} className={`w-full bg-[#22C55E] text-[#0F172A] font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-400 hover:shadow-green-500/30'} glow-button`}>
                    {optimizingText}
                </button>
            </form>
            
            {/* Success Popup */}
            {showPopup && (
                <div className="fixed top-4 right-4 z-50 bg-green-900 border-l-4 border-green-500 text-green-100 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out animate-slideInRight">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">Route Found Successfully ✅</h3>
                            <div className="mt-2 text-xs space-y-1">
                                <p>Distance: {popupData.distance} km</p>
                                <p>Estimated Time: {popupData.time} min</p>
                                <p>Predicted Battery Usage: {popupData.batteryUsage}%</p>
                                <p>Green Score: {popupData.greenScore}/100</p>
                            </div>
                            {popupData.greenScore > 85 && (
                                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800 text-green-100">
                                    Energy Optimized Route 🌿
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* EV Profile Required Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1E293B] rounded-xl p-6 max-w-md w-full border border-gray-600">
                        <h2 className="text-xl font-bold font-poppins text-[#22C55E] mb-4">Complete EV Profile Required</h2>
                        <p className="text-gray-300 mb-6">Please complete your EV Profile before searching for optimized routes.</p>
                        <div className="flex space-x-3">
                            <button 
                                onClick={() => setShowProfileModal(false)}
                                className="flex-1 bg-gray-700 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    // Redirect to EV Profile page
                                    window.location.href = '/ev-profile';
                                }}
                                className="flex-1 bg-[#22C55E] text-[#0F172A] font-bold py-2 px-4 rounded-lg hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/20"
                            >
                                Go to EV Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Location Selection Success Popup */}
            {showLocationPopup && (
                <div className="fixed top-4 right-4 z-50 bg-green-900 border-l-4 border-green-500 text-green-100 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out animate-slideInRight">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium">{locationPopupMessage}</h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteForm;
