'use client';

import * as React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Clock, Eye } from 'lucide-react';

// Placeholder — wire to a real clients KYC endpoint when available
export default function KYCClientsPage() {
  return (
    <ProtectedRoute requiredPermissions={['can_verify_clients']}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Client Verification</h1>
              <p className="text-sm text-muted-foreground">
                Verify client identities and documents
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              Pending: 12
            </Badge>
          </div>

          <div className="grid gap-4">
            {[
              { name: 'John Doe', email: 'john.doe@example.com', submitted: '2 hours ago' },
              { name: 'Jane Smith', email: 'jane.smith@example.com', submitted: '5 hours ago' },
            ].map((client) => (
              <Card key={client.email}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <CardDescription>{client.email}</CardDescription>
                    </div>
                    <Badge variant="warning">Pending Review</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Submitted Documents</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">ID Card</Badge>
                        <Badge variant="outline">Selfie</Badge>
                        <Badge variant="outline">Utility Bill</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {client.submitted}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                        <UserCheck className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button variant="destructive" size="sm">
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
