/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, FormCardSkeleton, LoadingStatus, PageHeaderSkeleton } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function EmailLoading() {
  return (
    <AppShellSkeleton>
      <LoadingStatus label="Loading email dispatch…">
        <PageHeaderSkeleton actions={0} />
        <div aria-hidden="true" className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
            <FormCardSkeleton fields={4} />
          </div>
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
