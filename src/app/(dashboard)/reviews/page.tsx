/*
 * Reviews Page - Manage product reviews
 * Displays all reviews with moderation options
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { Star, Filter, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const reviews = [
  { id: 1, product: 'Wireless Headphones Pro', customer: 'John Doe', vendor: 'TechHub Store', rating: 5, comment: 'Excellent product! Great sound quality.', status: 'approved' as const, date: '2024-01-15' },
  { id: 2, product: 'Premium Cotton T-Shirt', customer: 'Jane Smith', vendor: 'Fashion World', rating: 4, comment: 'Good quality but runs a bit small.', status: 'approved' as const, date: '2024-01-14' },
  { id: 3, product: 'Smart Home Hub', customer: 'Bob Johnson', vendor: 'Gadget Paradise', rating: 2, comment: 'Did not work as expected. Returned.', status: 'pending' as const, date: '2024-01-14' },
  { id: 4, product: 'Organic Coffee Beans', customer: 'Alice Brown', vendor: 'Home Essentials', rating: 5, comment: 'Best coffee I have ever had!', status: 'approved' as const, date: '2024-01-13' },
]

const statusColors = {
  approved: 'success' as const,
  pending: 'warning' as const,
  rejected: 'destructive' as const,
}

const statusIcons = {
  approved: <CheckCircle className="h-3 w-3" />,
  pending: <AlertCircle className="h-3 w-3" />,
  rejected: <XCircle className="h-3 w-3" />,
}

export default function ReviewsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reviews</h1>
          <p className="text-sm text-muted-foreground">Manage product reviews and ratings</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Reviews</p><p className="text-2xl font-bold">12,847</p></div><div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500"><Star className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Average Rating</p><p className="text-2xl font-bold text-green-500">4.8 ★</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Pending Moderation</p><p className="text-2xl font-bold text-yellow-500">23</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Approved</p><p className="text-2xl font-bold text-green-500">12,824</p></div></CardContent></Card>
      </div>

      <DataTable
        title="All Reviews"
        description="Complete list of product reviews"
        data={reviews}
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'product', label: 'Product' },
          { key: 'customer', label: 'Customer' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'rating', label: 'Rating', render: (value) => `${value} ★` },
          { key: 'comment', label: 'Comment' },
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