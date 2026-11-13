'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getDefaultRoute } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/main-layout';
import { KPICard } from '@/components/shared/kpi-card';
import { LazyTrendChart } from '@/components/charts/lazy';
import { ChartCard, RankedBars, StatusBreakdown, formatCount, formatKsh } from '@/components/charts/chart-kit';
import {
  AppShellSkeleton,
  ChartBodySkeleton,
  DashboardContentSkeleton,
  ListRowsSkeleton,
  LoadingStatus,
} from '@/components/shared/skeletons';
import { DataTable } from '@/components/shared/data-table';
import {
  useDashboardStats,
  useRevenueData,
  useTopVendors,
  useRecentOrders,
} from '@/hooks/use-dashboard';
import {
  DollarSign,
  Users,
  ShoppingBag,
  Package,
  Store,
  TrendingUp,
  Clock,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const router = useRouter();
  const { permissions, loading: authLoading } = useAuth();

  // Redirect if user doesn't have dashboard view permissions
  useEffect(() => {
    if (!authLoading && permissions && !permissions.includes('can_view_dashboard')) {
      const defaultRoute = getDefaultRoute(permissions);
      router.replace(defaultRoute);
    }
  }, [permissions, authLoading, router]);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData('30d');
  const { data: vendors, isLoading: vendorsLoading } = useTopVendors(8);
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders(5);

  // Loading or redirecting state
  if (authLoading || (permissions && !permissions.includes('can_view_dashboard'))) {
    return (
      <AppShellSkeleton>
        <DashboardContentSkeleton />
      </AppShellSkeleton>
    );
  }

  // Stats Loading state
  if (statsLoading) {
    return (
      <MainLayout>
        <DashboardContentSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your marketplace today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="gap-1">
            <Clock className="h-3 w-3" />
            Live
          </Badge>
          <Badge variant="info" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Last 30 days
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={`Ksh ${stats?.totalRevenue?.toLocaleString() || '0'}`}
          icon={DollarSign}
          trend={stats?.revenueGrowth}
          trendLabel="vs last month"
          isLoading={statsLoading}
        />
        <KPICard
          title="Active Vendors"
          value={stats?.activeVendors?.toLocaleString() || '0'}
          icon={Store}
          trend={stats?.vendorGrowth}
          trendLabel="vs last month"
          isLoading={statsLoading}
        />
        <KPICard
          title="Total Orders"
          value={stats?.totalOrders?.toLocaleString() || '0'}
          icon={ShoppingBag}
          trend={stats?.orderGrowth}
          trendLabel="vs last month"
          isLoading={statsLoading}
        />
        <KPICard
          title="Platform Commission"
          value={`Ksh ${stats?.platformCommission?.toLocaleString() || '0'}`}
          icon={Package}
          trend={stats?.commissionGrowth}
          trendLabel="vs last month"
          isLoading={statsLoading}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-xl font-bold">{stats?.totalCustomers?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-xl font-bold">{stats?.averageRating || '0'} ★</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
                <p className="text-xl font-bold">{stats?.pendingOrders?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-xl font-bold text-green-500">+{stats?.growthRate || '0'}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts — the grid cells are min-w-0 so charts can shrink on any screen */}
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-3">
        <ChartCard title="Platform revenue" subtitle="Last 30 days, excluding cancelled orders" className="xl:col-span-2">
          {revenueLoading ? (
            <LoadingStatus label="Loading revenue…" className="h-[300px]">
              <ChartBodySkeleton variant="line" />
            </LoadingStatus>
          ) : (
            <LazyTrendChart
              data={revenueData ?? []}
              metrics={[
                { key: 'revenue', label: 'Revenue', money: true, format: (v) => formatKsh(v) },
                { key: 'orders', label: 'Orders', format: (v) => formatCount(v) },
              ]}
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

        <ChartCard title="Top vendors" subtitle="Ranked by revenue (excluding cancelled orders)" className="xl:col-span-3">
          {vendorsLoading ? (
            <ListRowsSkeleton rows={6} />
          ) : (
            <RankedBars
              className="lg:columns-2 lg:gap-12"
              items={(vendors ?? []).map((v: { name: string; revenue: number; orders: number; rating?: number }) => ({
                key: v.name,
                label: v.name,
                value: v.revenue,
                detail: `${formatCount(v.orders)} order${v.orders === 1 ? '' : 's'}${v.rating ? ` · ${v.rating.toFixed(1)}★` : ''}`,
              }))}
              format={(v) => formatKsh(v, true)}
              emptyText="No vendor sales yet."
            />
          )}
        </ChartCard>
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <DataTable
          title="Recent Orders"
          description="Latest orders placed on the platform"
          data={recentOrders || []}
          isLoading={ordersLoading}
          columns={[
            { key: 'id', label: 'Order ID', className: 'font-mono text-sm' },
            { key: 'customer', label: 'Customer' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'amount', label: 'Amount', render: (value) => `Ksh ${value?.toFixed(2)}` },
            {
              key: 'status',
              label: 'Status',
              render: (value) => {
                const colors: Record<string, any> = {
                  pending: 'warning',
                  processing: 'info',
                  shipped: 'info',
                  delivered: 'success',
                  returned: 'destructive',
                  cancelled: 'destructive',
                };
                return <Badge variant={colors[value] || 'secondary'}>{value}</Badge>;
              },
            },
            { key: 'date', label: 'Date' },
          ]}
        />
      </div>
    </MainLayout>
  );
}