# Admin Dashboard Button Functionality Guide

## Admin Users Panel

### Layout
```
┌─────────────────────────────────────────┐
│          Admin Users Page               │
│                                          │
│ [+ Create Admin User]                  │  ← Main create button
└─────────────────────────────────────────┘

Summary Cards:
├─ Total Admins: X
├─ Active: Y
├─ Inactive: Z
└─ Super Admins: W

Admin Users Table:
┌─────────────────────────────────────────────────────┐
│ Name │ Email │ Role │ Status │ Last Login │ Actions │
├─────────────────────────────────────────────────────┤
│  ...  │  ...  │  ...  │  ...   │    ...     │ ✎ 🗑   │  ← Edit & Delete buttons
└─────────────────────────────────────────────────────┘
```

### Button Actions

#### 1. Create Admin User Button
**Location:** Top-right of page
**Icon:** Plus (+)
**Action:**
```
Click → Opens "Create Admin User" Dialog
         ↓
         Form appears with fields:
         - Name (required)
         - Email (required)
         - Password (required)
         - Role dropdown (required)
         ↓
         Fill form → Click "Create Admin"
         ↓
         Validation checks
         ↓
         API Call: POST /api/users/admins
         ↓
         Success → Dialog closes, list updates
         Error → Error message shown
```

#### 2. Edit Button (Per Admin Row)
**Location:** Actions column, pencil icon
**Action:**
```
Click → Opens "Edit Admin User" Dialog
        ↓
        Form pre-populated with:
        - Current name
        - Current email
        - Current role
        ↓
        Modify fields → Click "Update Admin"
        ↓
        Validation checks (no password on edit)
        ↓
        API Call: PUT /api/users/admins/:id
        ↓
        Success → Dialog closes, list updates
        Error → Error message shown
```

#### 3. Delete Button (Per Admin Row)
**Location:** Actions column, trash icon
**Action:**
```
Click → Confirmation prompt appears
        "Are you sure you want to delete admin [name]?"
        ↓
        User confirms → API Call: DELETE /api/users/admins/:id
        User cancels → Dialog closes, nothing happens
        ↓
        Success → Admin removed from list
        Error → Error message shown
```

---

## Role Management Panel

### Layout
```
┌─────────────────────────────────────────┐
│      Role Management Page               │
│                                          │
│ [+ Create Role]                         │  ← Main create button
└─────────────────────────────────────────┘

Role Cards Grid (3 columns):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Super Admin      │  │ Compliance HOD   │  │ KYC Officer      │
│ System           │  │ System           │  │ System           │
│ Permissions: 13  │  │ Permissions: 6   │  │ Permissions: 3   │
│ [All permissions]│  │ [View Dashboard] │  │ [Verify Clients] │
│ 1 admin assigned │  │ 1 admin assigned │  │ 1 admin assigned │
│ ✎ (disabled)     │  │ ✎ (disabled)     │  │ ✎ (disabled)     │  ← Edit disabled for system roles
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Custom Role 1    │  │ Custom Role 2    │
│ Custom           │  │ Custom           │
│ Permissions: 5   │  │ Permissions: 4   │
│ [Permission A]   │  │ [Permission X]   │
│ 0 admins         │  │ 1 admin          │
│ ✎ 🗑             │  │ ✎ 🗑             │  ← Edit & Delete enabled for custom roles
└──────────────────┘  └──────────────────┘
```

### Button Actions

#### 1. Create Role Button
**Location:** Top-right of page
**Icon:** Plus (+)
**Action:**
```
Click → Opens "Create Role" Dialog
        ↓
        Form appears with fields:
        - Role Name (required)
        - Description (optional)
        - Permissions (required - at least 1)
          ├─ Admin Permissions
          │  ├─ □ View Admin Dashboard
          │  ├─ □ Manage Admins
          │  └─ □ Manage Roles
          ├─ User Permissions
          │  ├─ □ Verify Clients
          │  └─ □ Verify Vendors
          └─ ... (more permissions)
        ↓
        Select name, permissions → Click "Create Role"
        ↓
        Validation checks
        ↓
        API Call: POST /api/users/roles
        ↓
        Success → Dialog closes, new role card appears
        Error → Error message shown
```

#### 2. Edit Button (Custom Roles Only)
**Location:** Role card, pencil icon
**Enabled For:** Custom roles only
**Disabled For:** System roles (Super Admin, Compliance HOD, KYC Officer, Support Admin)
**Action:**
```
Click → Opens "Edit Role" Dialog
        ↓
        Form pre-populated with:
        - Current role name
        - Current description
        - Currently selected permissions
        ↓
        Modify name, description, or permissions
        ↓
        Click "Update Role"
        ↓
        Validation checks
        ↓
        API Call: PUT /api/users/roles/:id
        ↓
        Success → Dialog closes, card updates
        Error → Error message shown
```

#### 3. Delete Button (Custom Roles Only)
**Location:** Role card, trash icon
**Enabled For:** Custom roles only (if no admins assigned)
**Disabled For:** 
- System roles (always)
- Roles with admins assigned
**Action:**
```
Click → Confirmation prompt appears
        "Are you sure you want to delete role [name]?"
        ↓
        User confirms → API Call: DELETE /api/users/roles/:id
        User cancels → Dialog closes, nothing happens
        ↓
        Success → Role card removed
        Error → Error message shown
        
        Common Errors:
        - "Cannot delete role because X admin(s) are 
          currently assigned to it"
        - "System roles cannot be deleted"
```

---

## Form Validation

### Admin User Form Validation
| Field | Required | Rules | Error Message |
|-------|----------|-------|---------------|
| Name | Yes | Min 1 char | "Name is required" |
| Email | Yes | Valid email | "Email is required" |
| Password* | Yes (new only) | Min 6 chars | "Password is required" |
| Role | Yes | Must exist | "Please select a role" |

*Password only shown when creating new admin, not when editing

### Role Form Validation
| Field | Required | Rules | Error Message |
|-------|----------|-------|---------------|
| Name | Yes | Min 1 char | "Role name is required" |
| Description | No | Any text | N/A |
| Permissions | Yes | At least 1 | "Select at least one permission" |

---

## Error Handling

### Common Error Scenarios

#### When Creating Admin
```
❌ "Admin with this email already exists"
   → Solution: Use a different email address

❌ "Invalid role selected"
   → Solution: Ensure the role still exists in the system

❌ "All fields are required"
   → Solution: Fill in all required fields
```

#### When Creating Role
```
❌ "Role with this name already exists"
   → Solution: Use a different role name

❌ "Name and permissions are required"
   → Solution: Enter a role name and select at least one permission

❌ "Cannot delete role because X admin(s) are assigned"
   → Solution: First unassign the admins from this role
```

---

## Success Flow

### Create Admin Success
```
✓ Submit form
  ↓
✓ Data validated
  ↓
✓ Email checked for duplicates
  ↓
✓ Role verified to exist
  ↓
✓ Password hashed
  ↓
✓ Admin created in database
  ↓
✓ Dialog closes
  ↓
✓ Admin list refreshes
  ↓
✓ New admin appears in table
```

### Create Role Success
```
✓ Submit form
  ↓
✓ Role name checked for duplicates
  ↓
✓ Permissions validated
  ↓
✓ Role created in database
  ↓
✓ Permissions linked to role
  ↓
✓ Dialog closes
  ↓
✓ Roles list refreshes
  ↓
✓ New role card appears in grid
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Close Dialog | ESC key |
| Submit Form | Enter (in final field) or Click button |
| Cancel | Click Cancel button or close dialog |

---

## API Endpoints Reference

### Admin Endpoints
- `GET /api/users/admins` - List all admins
- `GET /api/users/admins/:id` - Get specific admin
- `POST /api/users/admins` - Create admin
- `PUT /api/users/admins/:id` - Update admin
- `DELETE /api/users/admins/:id` - Delete admin

### Role Endpoints
- `GET /api/users/roles` - List all roles
- `POST /api/users/roles` - Create role
- `PUT /api/users/roles/:id` - Update role
- `DELETE /api/users/roles/:id` - Delete role

### Permission Endpoints
- `GET /api/users/permissions` - List all permissions

---

## Tips & Best Practices

1. **Backup Important Data** - Before deleting admins or roles, ensure they're not critical
2. **Use Descriptive Names** - When creating roles, use clear names that describe their purpose
3. **Assign Minimal Permissions** - Only assign permissions a role needs (principle of least privilege)
4. **Review Regularly** - Periodically review admin users and roles to maintain security
5. **Update Roles** - If role permissions need to change, edit the role rather than creating a new one
6. **Test Before Deploying** - Test new roles with a test admin account first

---

## Troubleshooting

### Button Not Responding
- Check internet connection
- Verify authentication token is valid
- Check browser console for errors
- Try refreshing the page

### Dialog Not Opening
- Check if you have proper permissions (can_manage_admins or can_manage_roles)
- Verify dialog component is properly imported
- Check browser console for JavaScript errors

### Changes Not Saving
- Check network tab in browser dev tools
- Verify API endpoint is responding
- Look for error message in the UI
- Check server logs for backend errors

### Form Validation Failing
- Ensure all required fields are filled
- Check email format is correct
- Verify passwords meet requirements
- Ensure at least one permission is selected
