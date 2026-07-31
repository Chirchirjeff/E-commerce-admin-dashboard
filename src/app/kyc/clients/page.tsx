'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, Clock, Eye } from 'lucide-react';

export default function KYCClientPage() {
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Pending: 12
              </Badge>
            </div>
          </div>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>John Doe</CardTitle>
                    <CardDescription>john.doe@example.com</CardDescription>
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
                      Submitted: 2 hours ago
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
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

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Jane Smith</CardTitle>
                    <CardDescription>jane.smith@example.com</CardDescription>
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
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Submitted: 5 hours ago
                    </p>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="default" size="sm" className="bg-green-500 hover:bg-green-600">
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
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}