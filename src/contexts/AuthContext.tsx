'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface AuthContextType {
  user: any | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = React.useState<any | null>(null)
  const [token, setToken] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    // Check for existing token
    const storedToken = localStorage.getItem('access_token')
    if (storedToken) {
      setToken(storedToken)
      // Optionally fetch user data
      fetchUser(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('access_token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      const authToken = response.data.access_token || response.data.token
      
      if (authToken) {
        localStorage.setItem('access_token', authToken)
        setToken(authToken)
        await fetchUser(authToken)
        router.push('/')
      } else {
        throw new Error('No token received')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setToken(null)
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}