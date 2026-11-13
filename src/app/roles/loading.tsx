/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, CardGridSkeleton, LoadingStatus, PageHeaderSkeleton } from '@/components/shared/skeletons'

export default function RolesLoading() {
  return (
    <AppShellSkeleton>
      <LoadingStatus label="Loading roles…">
        <PageHeaderSkeleton actions={1} />
        <CardGridSkeleton />
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
