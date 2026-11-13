import * as React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/*
 * Composed loading skeletons that mirror the dashboard's real layouts.
 * No hooks / no 'use client' so they can be used from route `loading.tsx`
 * server components as well as from client pages.
 *
 * Accessibility: every top-level placeholder is wrapped in <LoadingStatus>
 * (role="status" + sr-only label). The shapes themselves are aria-hidden.
 */

// Deterministic widths so rows look organic without random values (avoids hydration mismatch).
const CELL_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-5/6', 'w-2/5', 'w-3/5']

// ---------------------------------------------------------------------------
// Status wrapper
// ---------------------------------------------------------------------------

interface LoadingStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
}

export function LoadingStatus({ label = 'Loading…', className, children, ...props }: LoadingStatusProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className} {...props}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page header (title + subtitle + action buttons)
// ---------------------------------------------------------------------------

export function PageHeaderSkeleton({ actions = 2, className }: { actions?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 sm:h-9" />
        <Skeleton className="h-4 w-64 max-w-full sm:w-80" />
      </div>
      {actions > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className={cn('h-9', i === actions - 1 ? 'w-32' : 'w-24')} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat / KPI cards
// ---------------------------------------------------------------------------

/** Compact stat card used across orders/payouts/reviews/reports/admins pages. */
export function StatCardSkeleton({ withIcon = true }: { withIcon?: boolean }) {
  return (
    <Card aria-hidden="true">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {withIcon && <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Mirrors <KPICard /> (title + icon chip, value, trend line). */
export function KPICardSkeleton() {
  return (
    <Card aria-hidden="true" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-3 h-3 w-24" />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

type ChartVariant = 'line' | 'bar' | 'pie'

const BAR_WIDTHS = ['w-11/12', 'w-4/5', 'w-2/3', 'w-3/5', 'w-1/2', 'w-2/5', 'w-1/3', 'w-1/4']
const COLUMN_HEIGHTS = ['h-1/3', 'h-1/2', 'h-2/5', 'h-3/5', 'h-1/2', 'h-3/4', 'h-2/3', 'h-4/5']

/** Chart plot-area placeholder (fills its parent's height). Decorative only. */
export function ChartBodySkeleton({ variant }: { variant: ChartVariant }) {
  if (variant === 'pie') {
    return (
      <div aria-hidden="true" className="flex h-full flex-col items-center justify-center gap-6">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="flex flex-wrap justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-14" />
          ))}
        </div>
      </div>
    )
  }
  if (variant === 'bar') {
    return (
      <div aria-hidden="true" className="flex h-full flex-col justify-around gap-2 py-2">
        {BAR_WIDTHS.slice(0, 6).map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-16 shrink-0" />
            <Skeleton className={cn('h-5', w)} />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div aria-hidden="true" className="flex h-full items-end gap-2 border-b border-l border-muted pb-1 pl-1">
      {COLUMN_HEIGHTS.map((h, i) => (
        <Skeleton key={i} className={cn('flex-1 rounded-b-none', h)} />
      ))}
    </div>
  )
}

/** Mirrors the recharts cards in src/components/charts (title, subtitle, fixed-height body). */
export function ChartCardSkeleton({
  variant = 'line',
  height = 300,
  className,
  label = 'Loading chart…',
  announce = true,
}: {
  variant?: ChartVariant
  height?: number
  className?: string
  label?: string
  /** Set false when nested inside another <LoadingStatus> to avoid duplicate announcements. */
  announce?: boolean
}) {
  const card = (
      <Card aria-hidden="true" className={cn('h-full', !announce && className)}>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </CardHeader>
        <CardContent>
          <div style={{ height }}>
            <ChartBodySkeleton variant={variant} />
          </div>
        </CardContent>
      </Card>
  )
  if (!announce) return card
  return (
    <LoadingStatus label={label} className={className}>
      {card}
    </LoadingStatus>
  )
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/**
 * Skeleton <tr> rows for use inside an existing <tbody>.
 * Pass `label` to embed a screen-reader status message in the first cell
 * (a <div role="status"> is not valid directly inside <tbody>).
 */
export function TableRowsSkeleton({
  columns,
  rows = 5,
  label,
}: {
  columns: number
  rows?: number
  label?: string
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b last:border-b-0">
          {Array.from({ length: columns }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              {r === 0 && c === 0 && label && (
                <span role="status" aria-live="polite" className="sr-only">
                  {label}
                </span>
              )}
              <Skeleton className={cn('h-4', CELL_WIDTHS[(r + c) % CELL_WIDTHS.length])} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/** A card containing a table header + skeleton rows (orders/payouts/reviews/products/admins tables). */
export function TableCardSkeleton({
  columns,
  rows = 5,
  withDescription = false,
  className,
}: {
  columns: number
  rows?: number
  withDescription?: boolean
  className?: string
}) {
  return (
    <Card aria-hidden="true" className={cn('overflow-hidden', className)}>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        {withDescription && <Skeleton className="h-4 w-64 max-w-full" />}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-3 w-16 bg-muted-foreground/15" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <TableRowsSkeleton columns={columns} rows={rows} />
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Lists / cards
// ---------------------------------------------------------------------------

/** Stacked bordered rows (reports list, collections list, category tree). */
export function ListRowsSkeleton({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className={cn('h-4', CELL_WIDTHS[i % CELL_WIDTHS.length], 'max-w-xs')} />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </div>
      ))}
    </div>
  )
}

/** Record cards (KYC queues, detail-change requests): title/subtitle + badge, meta line + action. */
export function RecordCardsSkeleton({
  rows = 4,
  detailed = false,
  className,
}: {
  rows?: number
  detailed?: boolean
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('grid gap-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-56 max-w-full" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {detailed && <Skeleton className="mb-3 h-16 w-full rounded-lg" />}
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-8 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Grid of cards (roles page). */
export function CardGridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-5 w-20 rounded-full" />
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-8 w-10" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Form card (settings, email composer, create product). */
export function FormCardSkeleton({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <Card aria-hidden="true" className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </CardHeader>
      <CardContent className="space-y-5">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Composite page skeletons (shared by pages and route loading.tsx files)
// ---------------------------------------------------------------------------

/** Dashboard home: header, 4 KPI cards, 4 secondary stats, 3 charts, recent-orders table. */
export function DashboardContentSkeleton() {
  return (
    <LoadingStatus label="Loading dashboard…">
      <PageHeaderSkeleton actions={2} />
      <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
      <StatCardsSkeleton className="mt-4" />
      <div aria-hidden="true" className="mt-6 grid gap-6 lg:grid-cols-6">
        <div className="lg:col-span-3">
          <ChartCardSkeleton variant="line" height={350} announce={false} />
        </div>
        <div className="lg:col-span-2">
          <ChartCardSkeleton variant="bar" announce={false} />
        </div>
        <div className="lg:col-span-1">
          <ChartCardSkeleton variant="pie" announce={false} />
        </div>
      </div>
      <TableCardSkeleton columns={7} withDescription className="mt-6" />
    </LoadingStatus>
  )
}

/** Header + stat cards + table: orders, payouts, reviews, products (table view), admins, vendors. */
export function StatsTablePageSkeleton({
  label,
  columns,
  stats = 4,
  actions = 2,
}: {
  label: string
  columns: number
  stats?: number
  actions?: number
}) {
  return (
    <LoadingStatus label={label}>
      <PageHeaderSkeleton actions={actions} />
      {stats > 0 && <StatCardsSkeleton count={stats} className="mb-6" />}
      <TableCardSkeleton columns={columns} />
    </LoadingStatus>
  )
}

/** Header + filter chips + record cards: KYC queues and detail-change requests. */
export function QueuePageSkeleton({ label, detailed = false }: { label: string; detailed?: boolean }) {
  return (
    <LoadingStatus label={label} className="space-y-6">
      <PageHeaderSkeleton actions={1} className="mb-0" />
      <div aria-hidden="true" className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20" />
        ))}
      </div>
      <RecordCardsSkeleton detailed={detailed} />
    </LoadingStatus>
  )
}

// ---------------------------------------------------------------------------
// App shell (sidebar + header) — mirrors <MainLayout /> without needing auth
// ---------------------------------------------------------------------------

export function AppShellSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop only, like MainLayout) */}
      <aside aria-hidden="true" className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b px-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="space-y-2 p-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className={cn('h-4', i % 3 === 0 ? 'w-28' : i % 3 === 1 ? 'w-20' : 'w-24')} />
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div aria-hidden="true" className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-9 w-9 lg:hidden" />
          <Skeleton className="hidden h-9 max-w-md flex-1 md:block" />
          <div className="flex flex-1 items-center justify-end gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="hidden h-8 w-28 md:block" />
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
