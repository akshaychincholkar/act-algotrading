// API Configuration for different environments
const API_CONFIG = {
  development: {
    BASE_URL: 'http://localhost:8000',
    FRONTEND_URL: 'http://localhost:5173'
  },
  production: {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://algotrading-backend.onrender.com',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://algotrading-frontend.onrender.com'
  },
  staging: {
    BASE_URL: import.meta.env.VITE_API_URL || 'https://algotrading-backend-staging.onrender.com',
    FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://algotrading-frontend-staging.onrender.com'
  }
};

const currentEnv = import.meta.env.VITE_NODE_ENV || import.meta.env.MODE || 'development';
const config = API_CONFIG[currentEnv] || API_CONFIG.development;

export const API_BASE_URL = config.BASE_URL;
export const FRONTEND_BASE_URL = config.FRONTEND_URL;
export const REDIRECT_URL = `${config.FRONTEND_URL}/trade`;

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  FRONTEND_BASE_URL,
  REDIRECT_URL,
  getApiUrl
};
