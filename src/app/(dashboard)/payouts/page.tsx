/*
 * Payouts Page - Manage vendor payouts
 * Displays payout history and management options
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import { DollarSign, Filter, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const payouts = [
  { id: 'PAY-001', vendor: 'TechHub Store', amount: 45200, period: 'Jan 2024', status: 'completed' as const, date: '2024-02-01' },
  { id: 'PAY-002', vendor: 'Fashion World', amount: 32400, period: 'Jan 2024', status: 'processing' as const, date: '2024-02-01' },
  { id: 'PAY-003', vendor: 'Home Essentials', amount: 28700, period: 'Dec 2023', status: 'completed' as const, date: '2024-01-02' },
  { id: 'PAY-004', vendor: 'Gadget Paradise', amount: 19600, period: 'Dec 2023', status: 'pending' as const, date: '2024-01-02' },
]

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
          <Button><DollarSign className="mr-2 h-4 w-4" />Process Payouts</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Payouts</p><p className="text-2xl font-bold">$125,900</p></div><div className="rounded-lg bg-green-500/10 p-3 text-green-500"><DollarSign className="h-5 w-5" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-yellow-500">$19,600</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Processing</p><p className="text-2xl font-bold text-blue-500">$32,400</p></div></CardContent></Card>
        <Card><CardContent className="p-4"><div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold text-green-500">$73,900</p></div></CardContent></Card>
      </div>

      <DataTable
        title="Payout History"
        description="Complete list of vendor payouts"
        data={payouts}
        columns={[
          { key: 'id', label: 'Payout ID', className: 'font-mono text-sm' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'period', label: 'Period' },
          { key: 'amount', label: 'Amount', render: (value) => `$${value.toLocaleString()}` },
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