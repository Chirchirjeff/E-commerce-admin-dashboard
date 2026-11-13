/*
 * Route loading UI. (dashboard)/layout.tsx is a passthrough and each page renders
 * its own MainLayout, so this renders the full shell (sidebar + header) skeleton.
 */
import { AppShellSkeleton, QueuePageSkeleton } from '@/components/shared/skeletons'

export default function KYCClientsLoading() {
  return (
    <AppShellSkeleton>
      <QueuePageSkeleton label="Loading client verification…" />
    </AppShellSkeleton>
  )
}
