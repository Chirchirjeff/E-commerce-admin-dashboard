/*
 * Orders Page - Manage all orders
 * Displays order list with tracking and management options
 */

'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Filter, Download, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'

interface Order {
  id: string
  customer: string
  vendor: string
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled'
  date: string
  items: number
}

interface OrderStats {
  total: number
  pending: number
  processing: number
  delivered: number
}

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({ total: 0, pending: 0, processing: 0, delivered: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/orders', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }
        
        const data = await response.json()
        const orderList = Array.isArray(data) ? data : data.data || []
        setOrders(orderList)
        
        // Calculate stats
        setStats({
          total: orderList.length,
          pending: orderList.filter((o: Order) => o.status === 'pending').length,
          processing: orderList.filter((o: Order) => o.status === 'processing').length,
          delivered: orderList.filter((o: Order) => o.status === 'delivered').length,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders')
        setOrders([])
        setStats({ total: 0, pending: 0, processing: 0, delivered: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [])

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
            <p className="text-center text-muted-foreground">Loading orders...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-2xl font-bold text-blue-500">{stats.processing}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold text-green-500">{stats.delivered}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Vendor</th>
                      <th className="px-4 py-3 text-left font-medium">Items</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{order.id}</td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3">{order.vendor}</td>
                        <td className="px-4 py-3">{order.items}</td>
                        <td className="px-4 py-3">${order.amount.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[order.status as keyof typeof statusColors]} className="gap-1">
                            {statusIcons[order.status as keyof typeof statusIcons]}
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{order.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  )
}
