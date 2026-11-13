/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, StatsTablePageSkeleton } from '@/components/shared/skeletons'

export default function VendorsLoading() {
  return (
    <AppShellSkeleton>
      <StatsTablePageSkeleton label="Loading vendors…" columns={7} stats={1} actions={3} />
    </AppShellSkeleton>
  )
}
