/*
 * Products Page - Manage all products
 * Displays product catalog with filtering and management options
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { Package, Plus, Filter, Download } from 'lucide-react'

const products = [
  {
    name: 'Wireless Headphones Pro',
    vendor: 'TechHub Store',
    category: 'Electronics',
    price: 149.99,
    stock: 45,
    status: 'active',
    sales: 234,
    rating: 4.7,
  },
  {
    name: 'Premium Cotton T-Shirt',
    vendor: 'Fashion World',
    category: 'Clothing',
    price: 29.99,
    stock: 120,
    status: 'active',
    sales: 567,
    rating: 4.5,
  },
  {
    name: 'Smart Home Hub',
    vendor: 'Gadget Paradise',
    category: 'Electronics',
    price: 199.99,
    stock: 12,
    status: 'low_stock',
    sales: 89,
    rating: 4.2,
  },
  {
    name: 'Organic Coffee Beans',
    vendor: 'Home Essentials',
    category: 'Food',
    price: 24.99,
    stock: 0,
    status: 'out_of_stock',
    sales: 345,
    rating: 4.8,
  },
]

export default function ProductsPage() {
  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage all products across vendors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">8,543</p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
                <Package className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-500">7,234</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-500">456</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-500">853</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <DataTable
        title="Product Catalog"
        description="Complete list of products with their details"
        data={products}
        columns={[
          { key: 'name', label: 'Product Name' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'category', label: 'Category' },
          {
            key: 'price',
            label: 'Price',
            render: (value) => `$${value.toFixed(2)}`,
          },
          { key: 'stock', label: 'Stock' },
          {
            key: 'status',
            label: 'Status',
            render: (value) => {
              const colors = {
                active: 'success',
                low_stock: 'warning',
                out_of_stock: 'destructive',
                inactive: 'secondary',
              } as const
              return (
                <Badge
                  variant={colors[value as keyof typeof colors] as any}
                >
                  {value.replace('_', ' ')}
                </Badge>
              )
            },
          },
          { key: 'sales', label: 'Sales' },
          {
            key: 'rating',
            label: 'Rating',
            render: (value) => `${value} ★`,
          },
        ]}
      />
    </MainLayout>
  )
}