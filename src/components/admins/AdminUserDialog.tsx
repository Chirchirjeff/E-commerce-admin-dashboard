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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PASSWORD_MIN_LENGTH = 8;

interface AdminUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AdminFormData) => Promise<void>;
  isEditing?: boolean;
  initialData?: AdminFormData;
  roles: Role[];
  isLoading?: boolean;
}

export interface AdminFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  roleId: string;
  isActive?: boolean;
}

interface Role {
  id: string;
  name: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  roleId?: string;
  submit?: string;
}

export function AdminUserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isEditing = false,
  initialData,
  roles,
  isLoading = false,
}: AdminUserDialogProps) {
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        roleId: '',
      });
    }
    setErrors({});
  }, [isOpen, isEditing, initialData]);

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    if (!formData.roleId) errs.roleId = 'Role is required';
    if (!isEditing) {
      if (!formData.password) {
        errs.password = 'Password is required';
      } else if (formData.password.length < PASSWORD_MIN_LENGTH) {
        errs.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
      }
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setErrors({ submit: message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Admin User' : 'Create Admin User'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the admin user details'
              : 'Create a new administrative user with a specific role'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Submit-level error (e.g. API error) */}
          {errors.submit && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Admin Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              disabled={isLoading}
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              disabled={isLoading}
              className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
                value={formData.password || ''}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                disabled={isLoading}
                minLength={PASSWORD_MIN_LENGTH}
                className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => {
                setFormData({ ...formData, roleId: value });
                if (errors.roleId) setErrors({ ...errors, roleId: undefined });
              }}
              disabled={isLoading}
            >
              <SelectTrigger className={errors.roleId ? 'border-red-500 focus-visible:ring-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && <p className="text-xs text-red-600">{errors.roleId}</p>}
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
              {isLoading ? 'Saving...' : isEditing ? 'Update Admin' : 'Create Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
