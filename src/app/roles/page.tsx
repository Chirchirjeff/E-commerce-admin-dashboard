'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus, Trash2, Edit } from 'lucide-react';
import { RoleDialog, RoleFormData } from '@/components/roles/RoleDialog';
import { apiClient } from '@/lib/api-client';
import { AxiosError } from 'axios';

interface Permission {
  id: string;
  name: string;
  category?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  _count?: {
    admins: number;
  };
}

const systemRoleColors: Record<string, string> = {
  'Super Admin': 'text-purple-500',
  'Compliance HOD': 'text-blue-500',
  'KYC Officer': 'text-green-500',
  'Support Admin': 'text-orange-500',
};

function formatPermissionName(name: string) {
  return name
    .replace(/^can_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleFormData | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/users/roles');
      setRoles(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      setPermissionsError(null);
      const response = await apiClient.get('/users/permissions');
      setPermissions(Array.isArray(response.data) ? response.data : response.data.data || []);
    } catch (err) {
      const apiError = err as AxiosError<{ message?: string | string[] }>;
      const message = Array.isArray(apiError.response?.data?.message)
        ? apiError.response.data.message[0]
        : apiError.response?.data?.message || apiError.message || 'Failed to load permissions';
      setPermissions([]);
      setPermissionsError(message);
      setError(`Failed to load permissions: ${message}`);
    }
  };

  const handleCreateRole = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({
      id: role.id,
      name: role.name,
      description: role.description || '',
      permissionIds: role.permissions.map((p) => p.id),
    });
    setDialogOpen(true);
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) {
      return;
    }

    try {
      await apiClient.delete(`/users/roles/${id}`);

      await fetchRoles();
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete role';
      setError(errorMsg);
    }
  };

  const handleSubmitRole = async (formData: RoleFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const isCreating = !formData.id;
      const payload = {
        name: formData.name,
        description: formData.description,
        permissionIds: formData.permissionIds,
      };
      if (isCreating) {
        await apiClient.post('/users/roles', payload);
      } else {
        await apiClient.put(`/users/roles/${formData.id}`, payload);
      }

      await fetchRoles();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredPermissions={['can_manage_roles']}>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Role Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage system roles and permissions
              </p>
            </div>
            <Button onClick={handleCreateRole}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </div>

          {/* Dialog */}
          <RoleDialog
            isOpen={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleSubmitRole}
            isEditing={!!editingRole}
            initialData={editingRole || undefined}
            permissions={permissions}
            permissionsError={permissionsError}
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
                <p className="text-center text-muted-foreground">Loading roles...</p>
              </CardContent>
            </Card>
          )}

          {/* Roles Grid */}
          {!isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className={`h-5 w-5 ${systemRoleColors[role.name] || 'text-gray-500'}`} />
                        <CardTitle className="text-base">{role.name}</CardTitle>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        role.isSystem 
                          ? 'bg-purple-500/10 text-purple-500' 
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {role.isSystem ? 'System' : 'Custom'}
                      </span>
                    </div>
                    <CardDescription>
                      {role.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Permissions:</span> {role.permissions.length}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((perm) => (
                          <span key={perm.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            {formatPermissionName(perm.name)}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          {role._count?.admins || 0} admin{(role._count?.admins || 0) !== 1 ? 's' : ''} assigned
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit role"
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:bg-red-500/10"
                            title={role.name === 'Super Admin' ? 'The Super Admin role cannot be deleted' : 'Delete role'}
                            disabled={role.name === 'Super Admin'}
                            onClick={() => handleDeleteRole(role.id, role.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && roles.length === 0 && (
            <Card>
              <CardContent className="p-8">
                <p className="text-center text-muted-foreground">No roles found. Create one to get started.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
