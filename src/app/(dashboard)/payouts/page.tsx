/*
 * Payouts Page - Manage vendor payouts
 * Displays payout history and management options
 */

'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Filter, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface Payout {
  id: string
  vendor: string
  amount: number
  period: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  date: string
}

interface PayoutStats {
  total: number
  pending: number
  processing: number
  completed: number
}

const statusColors = {
  completed: 'success' as const,
  processing: 'info' as const,
  pending: 'warning' as const,
  failed: 'destructive' as const,
}

const statusIcons = {
  completed: <CheckCircle className="h-3 w-3" />,
  processing: <Clock className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3" />,
  failed: <AlertCircle className="h-3 w-3" />,
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [stats, setStats] = useState<PayoutStats>({ total: 0, pending: 0, processing: 0, completed: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/payouts', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch payouts')
        }
        
        const data = await response.json()
        const payoutList = Array.isArray(data) ? data : data.data || []
        setPayouts(payoutList)
        
        // Calculate stats
        const pending = payoutList.filter((p: Payout) => p.status === 'pending').length
        const processing = payoutList.filter((p: Payout) => p.status === 'processing').length
        const completed = payoutList.filter((p: Payout) => p.status === 'completed').length
        const total = payoutList.reduce((sum: number, p: Payout) => sum + p.amount, 0)

        setStats({
          total,
          pending,
          processing,
          completed,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payouts')
        setPayouts([])
        setStats({ total: 0, pending: 0, processing: 0, completed: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayouts()
  }, [])

  const handleProcessPayouts = async () => {
    try {
      const response = await fetch('/api/payouts/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to process payouts')
      }

      // Refresh payouts after processing
      const refreshResponse = await fetch('/api/payouts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        const payoutList = Array.isArray(data) ? data : data.data || []
        setPayouts(payoutList)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payouts')
    }
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Payouts</h1>
          <p className="text-sm text-muted-foreground">Manage vendor payouts and settlements</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={handleProcessPayouts}><DollarSign className="mr-2 h-4 w-4" />Process Payouts</Button>
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
            <p className="text-center text-muted-foreground">Loading payouts...</p>
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
                  <p className="text-sm text-muted-foreground">Total Payouts</p>
                  <p className="text-2xl font-bold">Ksh {stats.total.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                  <DollarSign className="h-5 w-5" />
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payouts Table */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
          </CardHeader>
          <CardContent>
            {payouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payouts found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Payout ID</th>
                      <th className="px-4 py-3 text-left font-medium">Vendor</th>
                      <th className="px-4 py-3 text-left font-medium">Period</th>
                      <th className="px-4 py-3 text-left font-medium">Amount</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 font-mono text-sm">{payout.id}</td>
                        <td className="px-4 py-3">{payout.vendor}</td>
                        <td className="px-4 py-3">{payout.period}</td>
                        <td className="px-4 py-3">Ksh {payout.amount.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusColors[payout.status as keyof typeof statusColors]} className="gap-1">
                            {statusIcons[payout.status as keyof typeof statusIcons]}
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{payout.date}</td>
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
