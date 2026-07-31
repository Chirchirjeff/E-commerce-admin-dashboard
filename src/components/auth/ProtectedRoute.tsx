'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [],
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { admin, loading, hasAllPermissions } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!admin) {
        router.replace(redirectTo);
        return;
      }

      // Check if user has required permissions
      if (requiredPermissions.length > 0 && !hasAllPermissions(requiredPermissions)) {
        router.replace('/unauthorized');
        return;
      }
    }
  }, [admin, loading, router, redirectTo, requiredPermissions, hasAllPermissions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}