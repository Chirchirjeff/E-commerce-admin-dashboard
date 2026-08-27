'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Mail, Shield, Clock, CheckCircle } from 'lucide-react';
import { AdminUserDialog, AdminFormData } from '@/components/admins/AdminUserDialog';
import { triggerWelcomeEmail } from '@/lib/emailTriggers';
import { apiClient } from '@/lib/api-client';

const roleColors: Record<string, string> = {
  'Super Admin': 'bg-purple-500/10 text-purple-700',
  'Compliance HOD': 'bg-blue-500/10 text-blue-700',
  'KYC Officer': 'bg-green-500/10 text-green-700',
  'Support Admin': 'bg-orange-500/10 text-orange-700',
};

interface Admin {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string };
  roleId?: string;
  permissions?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface Role {
  id: string;
  name: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminFormData | null>(null);

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/users/admins');
      setAdmins(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      setAdmins([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/users/roles');
      setRoles(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleCreateAdmin = () => {
    setEditingAdmin(null);
    setDialogOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.role?.id || admin.roleId || '',
      isActive: admin.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmitAdmin = async (formData: AdminFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const isCreating = !formData.id;
      const payload = isCreating
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            roleId: formData.roleId,
          }
        : {
            name: formData.name,
            roleId: formData.roleId,
            isActive: formData.isActive,
          };

      if (isCreating) {
        await apiClient.post('/users/admins', payload);
      } else {
        await apiClient.put(`/users/admins/${formData.id}`, payload);
      }

      // Fire welcome email for newly created admin users
      if (isCreating) {
        triggerWelcomeEmail({
          recipientEmail: formData.email,
          recipientName: formData.name,
          role: 'admin',
          temporaryPassword: formData.password,
        });
      }

      await fetchAdmins();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete admin "${name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/users/admins/${id}`);

      setAdmins(admins.filter(admin => admin.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  };

  return (
    <ProtectedRoute requiredPermissions={['can_manage_admins']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Admin Users</h1>
              <p className="text-sm text-muted-foreground">
                Manage administrative users and their roles
              </p>
            </div>
            <Button onClick={handleCreateAdmin}>
              <Plus className="h-4 w-4 mr-2" />
              Create Admin User
            </Button>
          </div>

          {/* Dialog */}
          <AdminUserDialog
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmitAdmin}
            isEditing={!!editingAdmin}
            initialData={editingAdmin || undefined}
            roles={roles}
            isLoading={isSubmitting}
          />

          {/* Error Message */}
          {error && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <Card>
              <CardContent className="p-4">
                <p className="text-center text-muted-foreground">Loading admin users...</p>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Admins</p>
                      <p className="text-2xl font-bold">{admins.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{admins.filter(a => a.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-orange-500/10 p-3 text-orange-500">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                      <p className="text-2xl font-bold">{admins.filter(a => !a.isActive).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-purple-500/10 p-3 text-purple-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Super Admins</p>
                      <p className="text-2xl font-bold">{admins.filter(a => a.role?.name === 'Super Admin').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin Users Table */}
          {!isLoading && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Users</CardTitle>
                <CardDescription>List of all administrative users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {admins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No admin users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Login</th>
                          <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin.id} className="border-b hover:bg-muted/50">
                            <td className="px-4 py-3 font-medium">{admin.name}</td>
                            <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`${roleColors[admin.role?.name] || 'bg-gray-500/10 text-gray-700'}`}
                              >
                                {admin.role?.name}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={admin.isActive ? 'success' : 'secondary'}>
                                {admin.isActive ? 'active' : 'inactive'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{admin.lastLogin || 'Never'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Edit admin"
                                  onClick={() => handleEditAdmin(admin)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:bg-red-500/10"
                                  title="Delete admin"
                                  onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
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

          {/* Quick Stats */}
          {!isLoading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {['Super Admin', 'Compliance HOD', 'KYC Officer', 'Support Admin'].map((roleName) => {
                    const count = admins.filter(a => a.role?.name === roleName).length;
                    return (
                      <div key={roleName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{roleName}</span>
                        <span className="text-sm font-bold text-muted-foreground">{count} admin{count !== 1 ? 's' : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
