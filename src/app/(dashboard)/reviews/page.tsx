/*
 * Reviews Page - Manage product reviews
 * Displays all reviews with moderation options
 */

'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Filter, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface Review {
  id: string | number
  product: string
  customer: string
  vendor: string
  rating: number
  comment: string
  status: 'approved' | 'pending' | 'rejected'
  date: string
}

interface ReviewStats {
  total: number
  averageRating: number
  pending: number
  approved: number
}

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
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewStats>({ total: 0, averageRating: 0, pending: 0, approved: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/reviews', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch reviews')
        }
        
        const data = await response.json()
        const reviewList = Array.isArray(data) ? data : data.data || []
        setReviews(reviewList)
        
        // Calculate stats
        const total = reviewList.length
        const approved = reviewList.filter((r: Review) => r.status === 'approved').length
        const pending = reviewList.filter((r: Review) => r.status === 'pending').length
        const averageRating = total > 0 
          ? (reviewList.reduce((sum: number, r: Review) => sum + r.rating, 0) / total).toFixed(1)
          : 0

        setStats({
          total,
          averageRating: Number(averageRating),
          pending,
          approved,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews')
        setReviews([])
        setStats({ total: 0, averageRating: 0, pending: 0, approved: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const handleApproveReview = async (id: string | number) => {
    try {
      const response = await fetch(`/api/reviews/${id}/approve`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to approve review')
      }

      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'approved' as const } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve review')
    }
  }

  const handleRejectReview = async (id: string | number) => {
    try {
      const response = await fetch(`/api/reviews/${id}/reject`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reject review')
      }

      setReviews(reviews.map(r => r.id === id ? { ...r, status: 'rejected' as const } : r))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject review')
    }
  }

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
            <p className="text-center text-muted-foreground">Loading reviews...</p>
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
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                  <Star className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-green-500">{stats.averageRating} ★</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Pending Moderation</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reviews Table */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>All Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Product</th>
                      <th className="px-4 py-3 text-left font-medium">Customer</th>
                      <th className="px-4 py-3 text-left font-medium">Vendor</th>
                      <th className="px-4 py-3 text-left font-medium">Rating</th>
                      <th className="px-4 py-3 text-left font-medium">Comment</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {reviews.map((review) => (
                      <tr key={review.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{review.id}</td>
                        <td className="px-4 py-3">{review.product}</td>
                        <td className="px-4 py-3">{review.customer}</td>
                        <td className="px-4 py-3">{review.vendor}</td>
                        <td className="px-4 py-3">{review.rating} ★</td>
                        <td className="px-4 py-3 max-w-xs truncate">{review.comment}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[review.status as keyof typeof statusColors]} className="gap-1">
                            {statusIcons[review.status as keyof typeof statusIcons]}
                            {review.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{review.date}</td>
                        <td className="px-4 py-3">
                          {review.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-500/10"
                                onClick={() => handleApproveReview(review.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:bg-red-500/10"
                                onClick={() => handleRejectReview(review.id)}
                              >
                                Reject
                              </Button>
                            </div>
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
    </MainLayout>
  )
}
