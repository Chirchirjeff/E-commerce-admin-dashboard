import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Skeleton — a decorative placeholder shape shown while content loads.
 * Always aria-hidden; wrap groups of skeletons in <LoadingStatus> (see
 * src/components/shared/skeletons.tsx) so screen readers hear "Loading…" once.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
