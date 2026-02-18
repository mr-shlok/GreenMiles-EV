#!/usr/bin/env python3
"""
Test script to verify that the backend is working correctly
"""

import requests
import json

# Test the backend API
BASE_URL = "http://localhost:8000"

def test_api_connection():
    """Test basic API connection"""
    try:
        response = requests.get(f"{BASE_URL}")
        print(f"API Root Response: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return False

def test_prediction_endpoint():
    """Test the prediction endpoint with sample data"""
    try:
        # Sample data based on the BatteryInput schema
        sample_data = {
            "Internal_Resistance_Ohm": 0.05,
            "Total_Charging_Cycles": 100,
            "Battery_Capacity_kWh": 75.0,
            "Fast_Charge_Ratio": 0.3,
            "Avg_Temperature_C": 25.0,
            "Vehicle_Age_Months": 12,
            "Avg_Discharge_Rate_C": 1.0,
            "SoH_Percent": 95.0,
            "Car_Model_Ford_Mustang_Mach_E": 0,
            "Car_Model_Hyundai_Ioniq_5": 0,
            "Car_Model_Tesla_Model_3": 1,
            "Car_Model_Wuling_Air_EV": 0,
            "Battery_Type_NMC": 1,
            "Driving_Style_Conservative": 1,
            "Driving_Style_Moderate": 0,
            "Battery_Status_Replace_Required": 0,
            "Vehicle_Weight_kg": 1800.0,
            "Drag_Coefficient": 0.25,
            "Frontal_Area_m2": 2.4,
            "Rolling_Resistance_Coeff": 0.01,
            "Motor_Efficiency": 0.95,
            "Trip_Distance_km": 100.0,
            "Elevation_Gain_m": 50.0,
            "Traffic_Index": 5.0,
            "Avg_Speed_kmph": 60.0,
            "Humidity_Percent": 60.0,
            "Wind_Speed_mps": 5.0,
            "start_location": "Delhi, India",
            "end_location": "Noida, India"
        }
        
        response = requests.post(f"{BASE_URL}/api/v1/optimize-route", json=sample_data)
        print(f"Optimization Response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Number of routes returned: {len(data.get('routes', []))}")
            if data.get('routes'):
                print(f"Best route distance: {data['routes'][0]['distance_km']} km")
                print(f"Best route energy: {data['routes'][0]['energy_consumed_kWh']} kWh")
        else:
            print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing prediction endpoint: {e}")
        return False

if __name__ == "__main__":
    print("Testing Backend API...")
    print("="*50)
    
    print("\n1. Testing API Connection...")
    api_ok = test_api_connection()
    print(f"   API Connection: {'OK' if api_ok else 'FAILED'}")
    
    print("\n2. Testing Route Optimization Endpoint...")
    pred_ok = test_prediction_endpoint()
    print(f"   Route Optimization: {'OK' if pred_ok else 'FAILED'}")
    
    print("\n" + "="*50)
    print(f"Overall Status: {'PASS' if api_ok and pred_ok else 'FAIL'}")