/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, ChartCardSkeleton, LoadingStatus, PageHeaderSkeleton, StatCardsSkeleton } from '@/components/shared/skeletons'

export default function AnalyticsLoading() {
  return (
    <AppShellSkeleton>
      <LoadingStatus label="Loading analytics…">
        <PageHeaderSkeleton />
        <StatCardsSkeleton className="mb-6" />
        <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
          <ChartCardSkeleton variant="line" height={350} announce={false} />
          <ChartCardSkeleton variant="bar" announce={false} />
        </div>
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
