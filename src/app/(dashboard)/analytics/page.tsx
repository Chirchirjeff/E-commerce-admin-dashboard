/*
 * Analytics Page - Platform analytics
 * Displays detailed analytics and insights
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { VendorPerformanceChart } from '@/components/charts/vendor-performance-chart'
import { TrendingUp, Users, ShoppingBag, DollarSign, Download, Filter } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep insights into your platform performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export Report</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><TrendingUp className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-xl font-bold">$125,430</p><p className="text-xs text-green-500">↑ 12.5%</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-purple-500/10 p-3 text-purple-500"><Users className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Active Users</p><p className="text-xl font-bold">24,891</p><p className="text-xs text-green-500">↑ 8.3%</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-green-500/10 p-3 text-green-500"><ShoppingBag className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-xl font-bold">3.2%</p><p className="text-xs text-green-500">↑ 0.5%</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500"><DollarSign className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Avg. Order Value</p><p className="text-xl font-bold">$85.40</p><p className="text-xs text-green-500">↑ 3.2%</p></div></div></CardContent></Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <VendorPerformanceChart />
      </div>
    </MainLayout>
  )
}