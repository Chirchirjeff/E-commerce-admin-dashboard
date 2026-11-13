/*
 * Analytics Page — platform analytics
 *
 * One range picker scopes everything on the page. Stat tiles compare the
 * selected period with the one immediately before it; the revenue series is
 * fetched for twice the range so both periods come from the same data.
 */

'use client'

import * as React from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { LazyTrendChart } from '@/components/charts/lazy'
import {
  ChartCard, RankedBars, Segmented, StatTile, StatusBreakdown,
  formatCount, formatKsh, percentChange,
} from '@/components/charts/chart-kit'
import {
  ChartBodySkeleton, ListRowsSkeleton, LoadingStatus, StatCardsSkeleton,
} from '@/components/shared/skeletons'
import { useDashboardStats, useRevenueData, useTopVendors } from '@/hooks/use-dashboard'
import { Download, ShoppingBag, Store, TrendingUp, Users, Wallet, AlertCircle } from 'lucide-react'

type Range = 7 | 30 | 90
type Day = { date: string; revenue: number; orders: number }
type Vendor = { name: string; revenue: number; orders: number; rating?: number }

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

function totals(days: Day[]) {
  const revenue = days.reduce((t, d) => t + (d.revenue || 0), 0)
  const orders = days.reduce((t, d) => t + (d.orders || 0), 0)
  return { revenue, orders, aov: orders ? revenue / orders : 0 }
}

function downloadCsv(rows: Day[], range: Range) {
  const lines = ['date,revenue_ksh,orders', ...rows.map((r) => `${r.date},${r.revenue.toFixed(2)},${r.orders}`)]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `quza-platform-revenue-last-${range}-days.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<Range>(30)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: series, isLoading: seriesLoading, isFetching, error } = useRevenueData(`${range * 2}d`)
  const { data: vendors, isLoading: vendorsLoading } = useTopVendors(10)

  const all: Day[] = Array.isArray(series) ? series : []
  const current = all.slice(-range)
  const previous = all.slice(-range * 2, -range)
  const now = totals(current)
  const before = totals(previous)

  // Weekly buckets keep the 90-day sparkline readable; daily for shorter ranges.
  const spark = (key: 'revenue' | 'orders') => {
    const vals = current.map((d) => d[key] || 0)
    if (range <= 30) return vals
    const out: number[] = []
    for (let i = 0; i < vals.length; i += 7) out.push(vals.slice(i, i + 7).reduce((a, b) => a + b, 0))
    return out
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">How the marketplace is performing, compared with the previous period.</p>
        </div>
        {/* One filter row scopes every chart on the page */}
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="Date range" value={range} onChange={setRange} options={RANGES} />
          <Button variant="outline" size="sm" disabled={!current.length} onClick={() => downloadCsv(current, range)}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" /> Could not load revenue data. Check your connection and permissions, then refresh.
        </div>
      )}

      {/* Stat tiles */}
      {seriesLoading || statsLoading ? (
        <LoadingStatus label="Loading analytics…"><StatCardsSkeleton className="mb-6" /></LoadingStatus>
      ) : (
        <div className={`mb-6 grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4 transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
          <StatTile label="Revenue" icon={Wallet} value={formatKsh(now.revenue, true)}
            change={percentChange(now.revenue, before.revenue)} changeLabel={`vs previous ${range} days`} trend={spark('revenue')} />
          <StatTile label="Orders" icon={ShoppingBag} value={formatCount(now.orders)}
            change={percentChange(now.orders, before.orders)} changeLabel={`vs previous ${range} days`} trend={spark('orders')} />
          <StatTile label="Average order value" icon={TrendingUp} value={formatKsh(now.aov, true)}
            change={percentChange(now.aov, before.aov)} changeLabel={`vs previous ${range} days`} />
          <StatTile label="Vendors · customers" icon={Store}
            value={`${formatCount(stats?.activeVendors ?? 0)} · ${formatCount(stats?.totalCustomers ?? 0, true)}`}
            hint="All-time totals" />
        </div>
      )}

      {/* Charts — min-w-0 lets every grid cell shrink, so charts fit any screen */}
      <div className={`grid min-w-0 gap-6 xl:grid-cols-3 transition-opacity ${isFetching && !seriesLoading ? 'opacity-60' : ''}`}>
        <ChartCard title="Revenue and orders" subtitle={`Daily, last ${range} days · cancelled orders excluded`} className="xl:col-span-2">
          {seriesLoading ? (
            <LoadingStatus label="Loading chart…" className="h-[300px]"><ChartBodySkeleton variant="line" /></LoadingStatus>
          ) : (
            <LazyTrendChart
              data={current}
              metrics={[
                { key: 'revenue', label: 'Revenue', money: true, format: (v) => formatKsh(v) },
                { key: 'orders', label: 'Orders', format: (v) => formatCount(v) },
              ]}
              summary={{
                revenue: { value: now.revenue, change: percentChange(now.revenue, before.revenue) },
                orders: { value: now.orders, change: percentChange(now.orders, before.orders) },
              }}
            />
          )}
        </ChartCard>

        <ChartCard title="Order status" subtitle="All orders on the platform">
          {statsLoading ? (
            <LoadingStatus label="Loading order status…"><ChartBodySkeleton variant="bar" /></LoadingStatus>
          ) : (
            <StatusBreakdown data={stats?.orderStatus ?? []} />
          )}
        </ChartCard>

        <ChartCard
          title="Top vendors"
          subtitle={<span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> All-time revenue, cancelled orders excluded</span>}
          className="xl:col-span-3"
        >
          {vendorsLoading ? (
            <ListRowsSkeleton rows={6} />
          ) : (
            <RankedBars
              className="lg:columns-2 lg:gap-12"
              max={10}
              items={((vendors ?? []) as Vendor[]).map((v) => ({
                key: v.name,
                label: v.name,
                value: v.revenue,
                detail: `${formatCount(v.orders)} order${v.orders === 1 ? '' : 's'} · avg ${formatKsh(v.orders ? v.revenue / v.orders : 0, true)}${v.rating ? ` · ${v.rating.toFixed(1)}★` : ''}`,
              }))}
              format={(v) => formatKsh(v, true)}
              emptyText="No vendor sales yet."
            />
          )}
        </ChartCard>
      </div>
    </MainLayout>
  )
}
