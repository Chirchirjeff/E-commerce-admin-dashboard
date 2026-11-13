'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AppShellSkeleton, StatsTablePageSkeleton } from '@/components/shared/skeletons';

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
    // Layout-shaped placeholder (sidebar + header + generic page body) while auth resolves
    return (
      <AppShellSkeleton>
        <StatsTablePageSkeleton label="Loading…" columns={6} actions={1} />
      </AppShellSkeleton>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}