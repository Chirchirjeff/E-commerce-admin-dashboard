/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, StatsTablePageSkeleton } from '@/components/shared/skeletons'

export default function ReviewsLoading() {
  return (
    <AppShellSkeleton>
      <StatsTablePageSkeleton label="Loading reviews…" columns={9} stats={4} actions={2} />
    </AppShellSkeleton>
  )
}
