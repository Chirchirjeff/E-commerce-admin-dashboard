'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bell, FileCheck, UserPlus, FileEdit, RefreshCw, AlertCircle, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import type { AdminNotification, NotificationType } from '@/types';

// ── Helpers ─────────────────────────────────────────────────────────────────

function typeIcon(type: NotificationType) {
  switch (type) {
    case 'kyc_pending':
      return <FileCheck className="h-4 w-4 text-blue-500" />;
    case 'profile_change_pending':
      return <FileEdit className="h-4 w-4 text-orange-500" />;
    case 'new_vendor':
      return <UserPlus className="h-4 w-4 text-green-500" />;
  }
}

function typeBadgeClass(type: NotificationType) {
  switch (type) {
    case 'kyc_pending':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'profile_change_pending':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'new_vendor':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Single item ──────────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onNavigate,
}: {
  notification: AdminNotification;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={notification.href}
      onClick={onNavigate}
      className="flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Icon bubble */}
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full',
          typeBadgeClass(notification.type),
        )}
      >
        {typeIcon(notification.type)}
      </span>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {relativeTime(notification.createdAt)}
        </p>
      </div>
    </Link>
  );
}

// ── Dropdown panel ───────────────────────────────────────────────────────────

export function NotificationDropdown() {
  const { notifications, unreadCount, isLoading, isError, refresh } =
    useNotifications();

  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const badgeCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div ref={containerRef} className="relative">
      {/* Bell trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} pending)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute right-1 top-1 flex items-center justify-center rounded-full bg-red-500 text-white leading-none',
              unreadCount > 9
                ? 'h-4 w-4 text-[9px]'
                : 'h-2 w-2',
            )}
          >
            {unreadCount > 9 ? badgeCount : null}
          </span>
        )}
      </Button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className={cn(
            'absolute right-0 top-full z-50 mt-2',
            'w-80 sm:w-96',
            'rounded-lg border bg-card shadow-lg',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {unreadCount > 0 && (
                <span className="flex h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label="Refresh notifications"
              onClick={refresh}
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
            </Button>
          </div>

          {/* Body */}
          <div className="max-h-[420px] overflow-y-auto overscroll-contain p-1">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="text-xs">Loading…</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-xs">Could not load notifications</p>
                <Button variant="outline" size="sm" onClick={refresh}>
                  Retry
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <CheckCheck className="h-5 w-5" />
                <p className="text-xs">All caught up</p>
              </div>
            ) : (
              <ul className="space-y-0.5">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      notification={n}
                      onNavigate={() => setOpen(false)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5">
              <p className="text-center text-xs text-muted-foreground">
                {unreadCount} item{unreadCount !== 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
