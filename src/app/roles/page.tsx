'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Plus, Trash2, Edit } from 'lucide-react';

export default function RolesPage() {
  return (
    <ProtectedRoute requiredPermissions={['can_manage_roles']}>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage system roles and permissions
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Super Admin */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    <CardTitle className="text-base">Super Admin</CardTitle>
                  </div>
                  <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full">
                    System
                  </span>
                </div>
                <CardDescription>Full system access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Permissions:</span> 13
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">All permissions</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">1 admin assigned</span>
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance HOD */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-base">Compliance HOD</CardTitle>
                  </div>
                  <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">
                    System
                  </span>
                </div>
                <CardDescription>Risk and compliance management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Permissions:</span> 6
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">View Dashboard</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">View All</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Approve Sellers</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">1 admin assigned</span>
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KYC Officer */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">KYC Officer</CardTitle>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full">
                    System
                  </span>
                </div>
                <CardDescription>Frontline verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Permissions:</span> 3
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Verify Clients</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Verify Vendors</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">View Profiles</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">1 admin assigned</span>
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Admin */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    <CardTitle className="text-base">Support Admin</CardTitle>
                  </div>
                  <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
                    System
                  </span>
                </div>
                <CardDescription>Customer support access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Permissions:</span> 3
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">View Dashboard</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">View Profiles</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Reply Tickets</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">1 admin assigned</span>
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
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