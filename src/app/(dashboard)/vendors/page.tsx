'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { useVendors } from '@/hooks/use-dashboard';
import { Store, Plus, Filter, Download } from 'lucide-react';

export default function VendorsPage() {
  const { data: vendorsData, isLoading } = useVendors(1, 10);
  const vendors = vendorsData?.data || [];

  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Vendors</h1>
          <p className="text-sm text-muted-foreground">Manage all vendors on your platform</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button><Plus className="mr-2 h-4 w-4" />Add Vendor</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendorsData?.meta?.total || 0}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                <Store className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Add more stats cards as needed */}
      </div>

      <DataTable
        title="All Vendors"
        description="Complete list of vendors with their performance metrics"
        data={vendors}
        isLoading={isLoading}
        columns={[
          { key: 'name', label: 'Vendor Name' },
          { key: 'owner', label: 'Owner', render: (value) => value?.name || 'N/A' },
          { key: 'email', label: 'Email', render: (_, row) => row.owner?.email || 'N/A' },
          {
            key: '_count',
            label: 'Products',
            render: (value) => value?.products || 0,
          },
          {
            key: '_count',
            label: 'Orders',
            render: (value) => value?.orders || 0,
          },
          {
            key: 'createdAt',
            label: 'Joined',
            render: (value) => new Date(value).toISOString().split('T')[0],
          },
        ]}
      />
    </MainLayout>
  );
}