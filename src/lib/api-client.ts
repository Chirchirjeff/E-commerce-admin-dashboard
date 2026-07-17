import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized and not on login page, redirect to login
    if (error.response?.status === 401) {
      const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/login'
      if (!isLoginPage) {
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)