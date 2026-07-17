/*
 * Reports Page - Generate and view reports
 * Displays various business reports and analytics
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, ShoppingBag, Clock } from 'lucide-react'

const reports = [
  { id: 'RPT-001', name: 'Monthly Revenue Report', type: 'Revenue', generated: '2024-01-31', status: 'ready' as const, size: '2.4 MB' },
  { id: 'RPT-002', name: 'Vendor Performance Report', type: 'Vendors', generated: '2024-01-30', status: 'processing' as const, size: '-' },
  { id: 'RPT-003', name: 'Product Sales Report', type: 'Products', generated: '2024-01-29', status: 'ready' as const, size: '1.8 MB' },
  { id: 'RPT-004', name: 'Customer Analytics Report', type: 'Customers', generated: '2024-01-28', status: 'ready' as const, size: '3.1 MB' },
]

const statusColors = {
  ready: 'success' as const,
  processing: 'warning' as const,
  failed: 'destructive' as const,
}

export default function ReportsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
          <p className="text-sm text-muted-foreground">Generate and manage business reports</p>
        </div>
        <Button><FileText className="mr-2 h-4 w-4" />Generate Report</Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-blue-500/10 p-3 text-blue-500"><DollarSign className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Revenue Reports</p><p className="text-xl font-bold">12</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-purple-500/10 p-3 text-purple-500"><Users className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Vendor Reports</p><p className="text-xl font-bold">8</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-green-500/10 p-3 text-green-500"><ShoppingBag className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Product Reports</p><p className="text-xl font-bold">15</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-4"><div className="rounded-lg bg-yellow-500/10 p-3 text-yellow-500"><TrendingUp className="h-5 w-5" /></div><div><p className="text-sm text-muted-foreground">Analytics Reports</p><p className="text-xl font-bold">6</p></div></div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
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
                    <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  )
}