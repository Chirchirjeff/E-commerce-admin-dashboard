'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface RoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoleFormData) => Promise<void>;
  isEditing?: boolean;
  initialData?: RoleFormData;
  permissions: Permission[];
  permissionsError?: string | null;
  isLoading?: boolean;
}

export interface RoleFormData {
  id?: string;
  name: string;
  description: string;
  permissionIds: string[];
}

interface Permission {
  id: string;
  name: string;
  category?: string;
}

// Map permissions to the sidebar menu items they unlock
const PERMISSION_TO_SIDEBAR_ITEMS: Record<string, string[]> = {
  'can_view_dashboard': ['Dashboard'],
  'can_view_all': ['Vendors', 'Products', 'Reviews'],
  'can_view_orders': ['Orders'],
  'can_view_reports': ['Payouts', 'Analytics', 'Reports'],
  'can_verify_clients': ['Verify Clients'],
  'can_verify_vendors': ['Verify Vendors'],
  'can_manage_roles': ['Role Management'],
  'can_manage_admins': ['Admin Users'],
  'can_manage_settings': ['Settings'],
};

function formatPermissionName(name: string) {
  return name
    .replace(/^can_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function RoleDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isEditing = false,
  initialData,
  permissions,
  permissionsError = null,
  isLoading = false,
}: RoleDialogProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissionIds: [],
  });

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🔓 RoleDialog opened');
      console.log('📋 Permissions received:', permissions);
      console.log('📋 Permissions count:', permissions.length);
    }
  }, [isOpen, permissions]);

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        description: '',
        permissionIds: [],
      });
    }
  }, [isOpen, isEditing, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || formData.permissionIds.length === 0) {
      alert('Please fill in name and select at least one permission');
      return;
    }

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissionIds: [...formData.permissionIds, permissionId],
      });
    } else {
      setFormData({
        ...formData,
        permissionIds: formData.permissionIds.filter((id) => id !== permissionId),
      });
    }
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      const category = perm.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  // Get sidebar items that will be visible with currently selected permissions
  const visibleSidebarItems = new Set<string>();
  formData.permissionIds.forEach((permId) => {
    const permission = permissions.find(p => p.id === permId);
    if (permission) {
      const sidebarItems = PERMISSION_TO_SIDEBAR_ITEMS[permission.name] || [];
      sidebarItems.forEach(item => visibleSidebarItems.add(item));
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the role details and permissions'
              : 'Create a new role and assign permissions. Each permission unlocks specific sidebar menu items.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Role Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Content Manager"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Describe this role's purpose"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>Select Permissions *</Label>
            <div className="space-y-2 text-sm">
              {permissionsError ? (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                  <p className="font-semibold">Permissions could not be loaded.</p>
                  <p className="mt-1">{permissionsError}</p>
                </div>
              ) : permissions.length === 0 ? (
                <div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-900">
                  <p className="font-semibold">No permissions are available yet.</p>
                  <p className="mt-1">Seed the backend roles and permissions, then refresh this page.</p>
                </div>
              ) : (
                <>
                  {Object.entries(
                    permissions.reduce(
                      (acc, perm) => {
                        const category = perm.category || 'Other';
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(perm);
                        return acc;
                      },
                      {} as Record<string, Permission[]>
                    )
                  ).map(([category, perms]) => (
                    <div key={category} className="border rounded-lg p-3">
                      <h3 className="font-semibold text-sm mb-3">{category}</h3>
                      <div className="space-y-2">
                        {perms.map((permission) => {
                          const sidebarItems = PERMISSION_TO_SIDEBAR_ITEMS[permission.name] || [];
                          const isSelected = formData.permissionIds.includes(permission.id);
                          
                          return (
                            <div key={permission.id} className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={isSelected}
                                  onCheckedChange={(checked) =>
                                    handlePermissionToggle(permission.id, checked as boolean)
                                  }
                                  disabled={isLoading}
                                />
                                <label
                                  htmlFor={permission.id}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {formatPermissionName(permission.name)}
                                </label>
                              </div>
                              {sidebarItems.length > 0 && (
                                <div className="ml-6 text-xs text-muted-foreground">
                                  Unlocks: <span className="font-semibold">{sidebarItems.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {formData.permissionIds.length > 0 && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                <strong>Sidebar access:</strong> {Array.from(visibleSidebarItems).join(', ')}
              </div>
            )}

            {formData.permissionIds.length === 0 && permissions.length > 0 && (
              <p className="text-sm text-red-500">At least one permission must be selected</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Role' : 'Create Role'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
