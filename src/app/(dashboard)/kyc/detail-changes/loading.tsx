/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, QueuePageSkeleton } from '@/components/shared/skeletons'

export default function DetailChangesLoading() {
  return (
    <AppShellSkeleton>
      <QueuePageSkeleton label="Loading change requests…" detailed />
    </AppShellSkeleton>
  )
}
