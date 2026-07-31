'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
}

interface AuthContextType {
  admin: Admin | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export function getDefaultRoute(permissions: string[]): string {
  if (permissions.includes('can_view_all') || permissions.includes('can_view_dashboard')) {
    return '/';
  }
  if (permissions.includes('can_verify_clients')) {
    return '/kyc/clients';
  }
  if (permissions.includes('can_verify_vendors')) {
    return '/kyc/vendors';
  }
  if (permissions.includes('can_manage_roles')) {
    return '/roles';
  }
  if (permissions.includes('can_manage_admins')) {
    return '/admins';
  }
  if (permissions.includes('can_view_reports')) {
    return '/reports';
  }
  return '/unauthorized';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    try {
      console.log('📤 Fetching admin profile...');
      const response = await apiClient.get('/auth/admin/profile');
      console.log('📥 Profile response:', response.data);
      
      setAdmin(response.data.admin);
      setPermissions(response.data.permissions || []);
      
      console.log('✅ Profile loaded successfully');
      console.log('👤 Admin:', response.data.admin?.email);
      console.log('🔑 Permissions count:', response.data.permissions?.length || 0);
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      // Clear invalid token
      sessionStorage.removeItem('access_token');
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
      setAdmin(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = sessionStorage.getItem('access_token');
    console.log('🔐 AuthProvider mounted. Token:', token ? 'Found' : 'Not found');
    
    if (token) {
      // Synchronize session cookie with sessionStorage on mount so middleware works on page refresh
      // Session cookie (no max-age) is cleared automatically when the browser is closed
      document.cookie = `access_token=${token}; path=/; SameSite=Lax;`;
      console.log('📤 Token found, fetching profile...');
      fetchProfile();
    } else {
      console.log('🔐 No token found, setting loading to false');
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    try {
      console.log('📤 Attempting login with:', email);
      
      const response = await apiClient.post('/auth/admin/login', { 
        email: email.trim().toLowerCase(), 
        password 
      });
      
      console.log('📥 Login response received');
      console.log('📥 Status:', response.status);
      
      const { access_token, admin, permissions } = response.data;
      
      console.log('📥 Access token:', access_token ? 'Received' : 'Missing');
      console.log('📥 Admin:', admin?.email);
      console.log('📥 Permissions count:', permissions?.length || 0);
      
      if (!access_token) {
        console.error('❌ No access_token in response');
        return { 
          success: false, 
          error: 'Invalid server response' 
        };
      }
      
      // Store token first
      sessionStorage.setItem('access_token', access_token);
      
      // Store token in a session cookie for Next.js middleware / server requests
      // No max-age means the cookie is cleared when the browser is closed
      document.cookie = `access_token=${access_token}; path=/; SameSite=Lax;`;
      
      // Update state
      setAdmin(admin);
      setPermissions(permissions || []);
      setLoading(false);
      
      console.log('✅ Login successful!');
      console.log('👤 Admin set:', admin?.email);
      console.log('🔑 Permissions set:', permissions?.length || 0);
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    console.log('🔐 Logging out...');
    sessionStorage.removeItem('access_token');
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax;';
    setAdmin(null);
    setPermissions([]);
    setLoading(false);
    router.push('/login');
  };

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (requiredPermissions: string[]) => {
    return requiredPermissions.some(p => permissions.includes(p));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    return requiredPermissions.every(p => permissions.includes(p));
  };

  return (
    <AuthContext.Provider value={{
      admin,
      permissions,
      loading,
      login,
      logout,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}