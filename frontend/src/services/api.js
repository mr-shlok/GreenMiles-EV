import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const optimizeRoute = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/optimize-route`, data);
        return response.data;
    } catch (error) {
        console.error("Error optimizing route:", error);
        throw error;
    }
};

export const predictBattery = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error("Error predicting battery:", error);
        throw error;
    }
};
