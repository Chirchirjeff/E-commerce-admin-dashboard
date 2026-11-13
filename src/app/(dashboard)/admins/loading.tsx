/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, StatsTablePageSkeleton } from '@/components/shared/skeletons'

export default function AdminsLoading() {
  return (
    <AppShellSkeleton>
      <StatsTablePageSkeleton label="Loading admin users…" columns={7} actions={1} />
    </AppShellSkeleton>
  )
}
