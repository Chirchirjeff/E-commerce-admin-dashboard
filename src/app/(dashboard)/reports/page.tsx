/*
 * Reports Page - Generate and view reports
 * Displays various business reports and analytics
 */

'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, ShoppingBag, Clock } from 'lucide-react'

interface Report {
  id: string
  name: string
  type: 'Revenue' | 'Vendors' | 'Products' | 'Customers'
  generated: string
  status: 'ready' | 'processing' | 'failed'
  size: string
}

interface ReportStats {
  revenue: number
  vendors: number
  products: number
  analytics: number
}

const statusColors = {
  ready: 'success' as const,
  processing: 'warning' as const,
  failed: 'destructive' as const,
}

const typeIcons: Record<string, JSX.Element> = {
  'Revenue': <DollarSign className="h-5 w-5" />,
  'Vendors': <Users className="h-5 w-5" />,
  'Products': <ShoppingBag className="h-5 w-5" />,
  'Customers': <Users className="h-5 w-5" />,
}

const typeColors: Record<string, string> = {
  'Revenue': 'bg-blue-500/10 p-3 text-blue-500',
  'Vendors': 'bg-purple-500/10 p-3 text-purple-500',
  'Products': 'bg-green-500/10 p-3 text-green-500',
  'Customers': 'bg-yellow-500/10 p-3 text-yellow-500',
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportStats>({ revenue: 0, vendors: 0, products: 0, analytics: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/reports', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports')
        }
        
        const data = await response.json()
        const reportList = Array.isArray(data) ? data : data.data || []
        setReports(reportList)
        
        // Calculate stats
        setStats({
          revenue: reportList.filter((r: Report) => r.type === 'Revenue').length,
          vendors: reportList.filter((r: Report) => r.type === 'Vendors').length,
          products: reportList.filter((r: Report) => r.type === 'Products').length,
          analytics: reportList.filter((r: Report) => r.type === 'Customers').length,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reports')
        setReports([])
        setStats({ revenue: 0, vendors: 0, products: 0, analytics: 0 })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [])

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true)
      setError(null)

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Refresh reports after generation
      const refreshResponse = await fetch('/api/reports', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        const reportList = Array.isArray(data) ? data : data.data || []
        setReports(reportList)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to download report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `report-${reportId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report')
    }
  }

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and manage business reports</p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGenerating}>
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
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
            <p className="text-center text-muted-foreground">Loading reports...</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Reports</p>
                  <p className="text-xl font-bold">{stats.revenue}</p>
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
                  <p className="text-sm text-muted-foreground">Vendor Reports</p>
                  <p className="text-xl font-bold">{stats.vendors}</p>
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
                  <p className="text-sm text-muted-foreground">Product Reports</p>
                  <p className="text-xl font-bold">{stats.products}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Analytics Reports</p>
                  <p className="text-xl font-bold">{stats.analytics}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Reports */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reports found</p>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg ${typeColors[report.type]}`}>
                        {typeIcons[report.type]}
                      </div>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{report.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{report.generated}</span>
                          <span>•</span>
                          <span>{report.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusColors[report.status]}>{report.status}</Badge>
                      {report.status === 'ready' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadReport(report.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      {report.status === 'processing' && (
                        <Clock className="h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </MainLayout>
  )
}
