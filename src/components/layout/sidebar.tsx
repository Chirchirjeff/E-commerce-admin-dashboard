'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Star,
  Settings,
  LogOut,
  TrendingUp,
  Store,
  ClipboardList,
  X,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Menu definitions
// ---------------------------------------------------------------------------

const ALL_MENU_ITEMS = [
  { label: 'Dashboard',      icon: LayoutDashboard, href: '/',             permission: 'can_view_dashboard'   },
  { label: 'Vendors',        icon: Store,           href: '/vendors',      permission: 'can_view_all'         },
  { label: 'Products',       icon: Package,         href: '/products',     permission: 'can_view_all'         },
  { label: 'Orders',         icon: ShoppingCart,    href: '/orders',       permission: 'can_view_orders'      },
  { label: 'Payouts',        icon: DollarSign,      href: '/payouts',      permission: 'can_view_reports'     },
  { label: 'Analytics',      icon: TrendingUp,      href: '/analytics',    permission: 'can_view_reports'     },
  { label: 'Reviews',        icon: Star,            href: '/reviews',      permission: 'can_view_all'         },
  { label: 'Reports',        icon: ClipboardList,   href: '/reports',      permission: 'can_view_reports'     },
  // KYC
  { label: 'Verify Clients', icon: UserCheck,       href: '/kyc/clients',  permission: 'can_verify_clients'   },
  { label: 'Verify Vendors', icon: Building2,       href: '/kyc/vendors',  permission: 'can_verify_vendors'   },
  // Admin
  { label: 'Role Management',icon: ShieldCheck,     href: '/roles',        permission: 'can_manage_roles'     },
  { label: 'Admin Users',    icon: Users,           href: '/admins',       permission: 'can_manage_admins'    },
  { label: 'Settings',       icon: Settings,        href: '/settings',     permission: 'can_manage_settings'  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SidebarProps {
  /** Called when a nav link is clicked on mobile — closes the off-canvas panel */
  onMobileClose: () => void;
  /** Whether the desktop sidebar is in collapsed (icon-only) mode */
  desktopCollapsed: boolean;
  /** Called when the user clicks the desktop collapse toggle button */
  onDesktopCollapseToggle: () => void;
}

// ---------------------------------------------------------------------------
// NavLink helper
// ---------------------------------------------------------------------------

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  collapsed: boolean;
  /** Only passed for mobile links so clicking closes the panel */
  onMobileClose: () => void;
}

function NavLink({ href, icon: Icon, label, isActive, collapsed, onMobileClose }: NavLinkProps) {
  return (
    <Link
      href={href}
      // Auto-close only on mobile (lg:hidden anchor trick via CSS isn't available in
      // React, so we use a window-width check at runtime inside the handler)
      onClick={() => {
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          onMobileClose()
        }
      }}
      title={collapsed ? label : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-accent text-accent-foreground font-medium',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Section helper
// ---------------------------------------------------------------------------

function NavSection({
  title,
  items,
  pathname,
  collapsed,
  onMobileClose,
}: {
  title: string;
  items: typeof ALL_MENU_ITEMS;
  pathname: string;
  collapsed: boolean;
  onMobileClose: () => void;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mb-4">
      {!collapsed && (
        <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </p>
      )}
      {collapsed && <div className="my-2 border-t" />}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
              collapsed={collapsed}
              onMobileClose={onMobileClose}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export function Sidebar({ onMobileClose, desktopCollapsed, onDesktopCollapseToggle }: SidebarProps) {
  const pathname = usePathname();
  const { admin, permissions, logout } = useAuth();

  const visible = ALL_MENU_ITEMS.filter(item =>
    !item.permission || permissions.includes(item.permission)
  );

  const mainItems  = visible.filter(i => !i.href.includes('/kyc/') && !i.href.includes('/roles') && !i.href.includes('/admins'));
  const kycItems   = visible.filter(i => i.href.includes('/kyc/'));
  const adminItems = visible.filter(i => i.href.includes('/roles') || i.href.includes('/admins'));

  return (
    <div className="flex h-full flex-col">

      {/* ── Mobile top bar (close button) ── */}
      <div className="flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-4 w-4" />
          </div>
          <span>AdminPanel</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={onMobileClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Desktop top bar (logo + collapse toggle) ── */}
      <div className="hidden h-16 items-center justify-between border-b px-3 lg:flex">
        {!desktopCollapsed && (
          <Link href="/" className="flex items-center gap-2 font-semibold overflow-hidden">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
            <span className="truncate">AdminPanel</span>
          </Link>
        )}
        {desktopCollapsed && (
          <div className="flex w-full justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-4 w-4" />
            </div>
          </div>
        )}
        {/* Collapse toggle — desktop only */}
        <Button
          variant="ghost"
          size="icon"
          className={cn('hidden lg:flex flex-shrink-0', desktopCollapsed && 'mx-auto')}
          onClick={onDesktopCollapseToggle}
          title={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {desktopCollapsed
            ? <ChevronRight className="h-4 w-4" />
            : <ChevronLeft className="h-4 w-4" />
          }
        </Button>
      </div>

      {/* ── User info ── */}
      {!desktopCollapsed && (
        <div className="border-b px-4 py-3 lg:block hidden">
          <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
          <p className="text-xs text-muted-foreground truncate">{admin?.role || 'User'}</p>
        </div>
      )}
      {/* Mobile user info always visible */}
      <div className="border-b px-4 py-3 lg:hidden">
        <p className="text-sm font-medium truncate">{admin?.name || 'Admin'}</p>
        <p className="text-xs text-muted-foreground truncate">{admin?.role || 'User'}</p>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        <NavSection
          title="Main"
          items={mainItems}
          pathname={pathname}
          collapsed={desktopCollapsed}
          onMobileClose={onMobileClose}
        />
        <NavSection
          title="KYC Verification"
          items={kycItems}
          pathname={pathname}
          collapsed={desktopCollapsed}
          onMobileClose={onMobileClose}
        />
        <NavSection
          title="Administration"
          items={adminItems}
          pathname={pathname}
          collapsed={desktopCollapsed}
          onMobileClose={onMobileClose}
        />
      </nav>

      {/* ── Logout ── */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600',
            desktopCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          title={desktopCollapsed ? 'Logout' : undefined}
          onClick={logout}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!desktopCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
