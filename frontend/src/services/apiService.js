import axios from 'axios';
import { supabase } from './supabaseClient';

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

export const apiFetch = async (endpoint, options = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) return null;
  
  try {
    return await response.json();
  } catch (e) {
    return null; // Return null if response is empty or invalid JSON
  }
};

export default api;
