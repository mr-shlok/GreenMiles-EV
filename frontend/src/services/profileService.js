const API_URL = 'http://localhost:8000/api/v1';

export const saveEVProfile = async (profileData) => {
  try {
    // Use a default user ID for demo purposes
    const userId = profileData.userId || 'demo-user';
    
    const response = await fetch(`${API_URL}/ev-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...profileData,
        user_id: userId
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error saving EV profile:", error);
    throw error;
  }
};

export const getEVProfile = async (userId = 'demo-user') => {
  try {
    const response = await fetch(`${API_URL}/ev-profile/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // Return null if profile doesn't exist
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error("Error getting EV profile:", error);
    throw error;
  }
};