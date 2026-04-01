import axios from 'axios';

// The base URL routes to our Django REST Framework endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS and Session authentication
});

// Request interceptor to inject auth tokens if needed
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('maple-access-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for catching global errors (401s, 500s)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g. redirect to login)
      console.warn("Unauthenticated access detected by API interceptor");
    }
    return Promise.reject(error);
  }
);
