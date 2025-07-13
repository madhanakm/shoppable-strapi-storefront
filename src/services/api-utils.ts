/**
 * Utility to check if the API is reachable
 */
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'https://api.dharaniherbbals.com/api';
    
    // Try to fetch a small amount of data to check connection
    const response = await fetch(`${API_URL}/healthcheck`, {
      method: 'HEAD',
      // Set a short timeout to avoid long waits
      signal: AbortSignal.timeout(5000)
    });
    
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
};

/**
 * Utility to get API base URL
 */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'https://api.dharaniherbbals.com/api';
};