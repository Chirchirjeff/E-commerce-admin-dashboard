/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, DashboardContentSkeleton } from '@/components/shared/skeletons'

export default function DashboardLoading() {
  return (
    <AppShellSkeleton>
      <DashboardContentSkeleton />
    </AppShellSkeleton>
  )
}
