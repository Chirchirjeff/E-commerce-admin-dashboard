/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, ListRowsSkeleton, LoadingStatus, PageHeaderSkeleton, StatCardsSkeleton } from '@/components/shared/skeletons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsLoading() {
  return (
    <AppShellSkeleton>
      <LoadingStatus label="Loading reports…">
        <PageHeaderSkeleton actions={1} />
        <StatCardsSkeleton className="mb-6" />
        <Card aria-hidden="true">
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <ListRowsSkeleton />
          </CardContent>
        </Card>
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
