/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, FormCardSkeleton, LoadingStatus } from '@/components/shared/skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function CreateProductLoading() {
  return (
    <AppShellSkeleton>
      <LoadingStatus label="Loading product form…">
        <Skeleton className="mb-8 h-9 w-40" />
        <FormCardSkeleton fields={6} />
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
