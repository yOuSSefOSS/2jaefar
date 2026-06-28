import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Global interceptor to catch API errors and redirect to our custom screens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 403) {
        window.location.href = '/error/403';
      } else if (error.response.status >= 500) {
        window.location.href = '/error/500';
      }
    }
    return Promise.reject(error);
  }
);

export const checkBackendStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error("Backend connection failed:", error);
    throw error;
  }
};

export default api;
