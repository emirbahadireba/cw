// API Configuration
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
};

// Check if API URL is configured
if (!import.meta.env.VITE_API_URL && import.meta.env.MODE === 'production') {
  console.warn('VITE_API_URL is not set. API calls will fail in production.');
}


