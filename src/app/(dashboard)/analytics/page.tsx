/*
 * Analytics Page - Platform analytics
 * Displays detailed analytics and insights
 */

'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RevenueChart } from '@/components/charts/revenue-chart'
import { VendorPerformanceChart } from '@/components/charts/vendor-performance-chart'
import { TrendingUp, Users, ShoppingBag, DollarSign, Download, Filter } from 'lucide-react'

interface AnalyticsData {
  totalRevenue: number
  revenueChange: number
  activeUsers: number
  activeUsersChange: number
  conversionRate: number
  conversionRateChange: number
  avgOrderValue: number
  avgOrderValueChange: number
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/analytics/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        
        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
        setAnalytics(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(value))
  }

  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0
    return (
      <p className={`text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </p>
    )
  }

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

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-500/50 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      {!isLoading && analytics && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
                    {renderChangeIndicator(analytics.revenueChange)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-xl font-bold">{formatNumber(analytics.activeUsers)}</p>
                    {renderChangeIndicator(analytics.activeUsersChange)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-xl font-bold">{analytics.conversionRate.toFixed(2)}%</p>
                    {renderChangeIndicator(analytics.conversionRateChange)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                    <p className="text-xl font-bold">{formatCurrency(analytics.avgOrderValue)}</p>
                    {renderChangeIndicator(analytics.avgOrderValueChange)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart />
            <VendorPerformanceChart />
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !analytics && !error && (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">No analytics data available</p>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  )
}
