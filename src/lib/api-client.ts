import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle server responses and token expiration
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📡 API Response: ${response.status} from ${response.config.url}`);
    
    // Backend wraps responses with: { statusCode, timestamp, path, message: [] }
    // Extract the actual data from the message field if it's an array with one item
    if (response.data && Array.isArray(response.data.message)) {
      // If message is an array with single item that's an object, return it
      if (response.data.message.length === 1 && typeof response.data.message[0] === 'object') {
        response.data = response.data.message[0];
      } else if (response.data.message.length === 1) {
        // If message is an array with a single string, keep the original structure
        response.data = response.data.message[0];
      }
    }
    
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect for login endpoint — let it handle the error
      if (error.config?.url?.includes('/auth/admin/login')) {
        console.log('🔐 Login failed (401) - returning error to login form');
        return Promise.reject(error);
      }
      
      // For other endpoints, clear token and redirect to login
      console.log('🔐 Unauthorized (401) - clearing token and redirecting to login');
      sessionStorage.removeItem('access_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);