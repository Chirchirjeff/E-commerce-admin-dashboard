/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, ListRowsSkeleton, LoadingStatus, PageHeaderSkeleton } from '@/components/shared/skeletons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
  return (
    <AppShellSkeleton>
      {/* Products opens on the Categories view: header, tab list, category card */}
      <LoadingStatus label="Loading products…">
        <PageHeaderSkeleton actions={4} className="mb-8" />
        <div aria-hidden="true" className="mb-4 flex gap-2 rounded-md bg-muted/50 p-1 w-fit">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-36" />
          ))}
        </div>
        <Card aria-hidden="true">
          <CardHeader>
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </CardHeader>
          <CardContent>
            <ListRowsSkeleton rows={5} />
          </CardContent>
        </Card>
      </LoadingStatus>
    </AppShellSkeleton>
  )
}
