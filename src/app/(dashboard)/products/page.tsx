'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CategoriesPanel } from '@/components/categories/CategoriesPanel'
import { Package, Plus, Filter, Download, LayoutGrid, List } from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: 'active' | 'inactive'
  collections?: string[]
  tags?: string[]
}

interface ProductStats {
  total: number
  active: number
  lowStock: number
  outOfStock: number
}

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'categories'>('categories')
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<ProductStats>({ total: 0, active: 0, lowStock: 0, outOfStock: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/products', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        
        const data = await response.json()
        const productList = Array.isArray(data) ? data : data.data || []
        setProducts(productList)
        
        // Calculate stats
        const total = productList.length
        const active = productList.filter((p: Product) => p.status === 'active').length
        const lowStock = productList.filter((p: Product) => p.stock > 0 && p.stock <= 100).length
        const outOfStock = productList.filter((p: Product) => p.stock === 0).length

        setStats({
          total,
          active,
          lowStock,
          outOfStock,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products')
        setProducts([])
        setStats({ total: 0, active: 0, lowStock: 0, outOfStock: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch products when in table view
    if (viewMode === 'table') {
      fetchProducts()
    }
  }, [viewMode])

  return (
    <MainLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products & Categories</h1>
          <p className="text-muted-foreground">
            Manage products using marketplace categories, collections, and tags
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('categories')}
              className={`px-3 py-2 rounded transition-colors ${
                viewMode === 'categories'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              title="View by Categories"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
              title="View as Table"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
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

      {/* View Mode Content */}
      {viewMode === 'categories' ? (
        <CategoriesPanel />
      ) : (
        <>
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
                <p className="text-center text-muted-foreground">Loading products...</p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          {!isLoading && (
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
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
                      <p className="text-2xl font-bold text-green-500">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Low Stock</p>
                      <p className="text-2xl font-bold text-yellow-500">{stats.lowStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-500">{stats.outOfStock}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Products Table */}
          {!isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {products.length === 0 ? (
                  <div className="p-4">
                    <p className="text-center text-muted-foreground py-8">No products found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left font-medium">Product Name</th>
                          <th className="px-6 py-3 text-left font-medium">Category</th>
                          <th className="px-6 py-3 text-left font-medium">Price</th>
                          <th className="px-6 py-3 text-left font-medium">Stock</th>
                          <th className="px-6 py-3 text-left font-medium">Status</th>
                          <th className="px-6 py-3 text-left font-medium">Collections</th>
                          <th className="px-6 py-3 text-left font-medium">Tags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-6 py-3">{product.name}</td>
                            <td className="px-6 py-3">
                              <Badge variant="outline">{product.category}</Badge>
                            </td>
                            <td className="px-6 py-3">${product.price.toFixed(2)}</td>
                            <td className="px-6 py-3">
                              <Badge variant={product.stock > 100 ? 'secondary' : product.stock > 0 ? 'warning' : 'destructive'}>
                                {product.stock}
                              </Badge>
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-3">
                              {product.collections && product.collections.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {product.collections.slice(0, 2).map((collection, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {collection}
                                    </Badge>
                                  ))}
                                  {product.collections.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{product.collections.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="px-6 py-3">
                              {product.tags && product.tags.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {product.tags.slice(0, 2).map((tag, idx) => (
                                    <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      +{product.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </MainLayout>
  )
}
