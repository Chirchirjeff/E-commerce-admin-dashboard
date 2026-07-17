/*
 * Orders Page - Manage all orders
 * Displays order list with tracking and management options
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { ShoppingCart, Filter, Download, Eye, Truck, CheckCircle, XCircle } from 'lucide-react'

const orders = [
  { id: '#ORD-1234', customer: 'John Doe', vendor: 'TechHub Store', amount: 250.00, status: 'delivered' as const, date: '2024-01-15', items: 3 },
  { id: '#ORD-1235', customer: 'Jane Smith', vendor: 'Fashion World', amount: 180.00, status: 'shipped' as const, date: '2024-01-15', items: 2 },
  { id: '#ORD-1236', customer: 'Bob Johnson', vendor: 'Home Essentials', amount: 320.00, status: 'processing' as const, date: '2024-01-14', items: 5 },
  { id: '#ORD-1237', customer: 'Alice Brown', vendor: 'TechHub Store', amount: 450.00, status: 'pending' as const, date: '2024-01-14', items: 4 },
  { id: '#ORD-1238', customer: 'Charlie Wilson', vendor: 'Gadget Paradise', amount: 190.00, status: 'cancelled' as const, date: '2024-01-13', items: 1 },
]

const statusColors = {
  pending: 'warning' as const,
  processing: 'info' as const,
  shipped: 'info' as const,
  delivered: 'success' as const,
  returned: 'destructive' as const,
  cancelled: 'destructive' as const,
}

const statusIcons = {
  pending: <Clock className="h-3 w-3" />,
  processing: <Truck className="h-3 w-3" />,
  shipped: <Truck className="h-3 w-3" />,
  delivered: <CheckCircle className="h-3 w-3" />,
  returned: <XCircle className="h-3 w-3" />,
  cancelled: <XCircle className="h-3 w-3" />,
}

import { Clock } from 'lucide-react'

export default function OrdersPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage all orders across the platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Orders</p><p className="text-2xl font-bold">4,892</p></div><div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><ShoppingCart className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-500">156</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Processing</p><p className="text-2xl font-bold text-blue-500">89</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Delivered</p><p className="text-2xl font-bold text-green-500">4,647</p></div></CardContent></Card>
      </div>

      <DataTable
        title="All Orders"
        description="Complete list of orders with their status"
        data={orders}
        columns={[
          { key: 'id', label: 'Order ID', className: 'font-mono text-sm' },
          { key: 'customer', label: 'Customer' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'items', label: 'Items' },
          { key: 'amount', label: 'Amount', render: (value) => `$${value.toFixed(2)}` },
          { key: 'status', label: 'Status', render: (value) => (
            <Badge variant={statusColors[value as keyof typeof statusColors]} className="gap-1">
              {statusIcons[value as keyof typeof statusIcons]}
              {value}
            </Badge>
          )},
          { key: 'date', label: 'Date' },
        ]}
      />
    </MainLayout>
  )
}