'use client'

import * as React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  // mobileSidebarOpen — controlled by the hamburger button in the header (small screens)
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false)

  // desktopCollapsed — controlled only by the collapse toggle inside the sidebar (large screens)
  const [desktopCollapsed, setDesktopCollapsed] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay — tap outside to close */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          // Mobile: off-canvas slide-in/out
          'fixed inset-y-0 left-0 z-50 bg-card transition-all duration-300 ease-in-out',
          // Mobile width always full sidebar
          'w-64',
          // Mobile visibility driven by mobileSidebarOpen
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: always visible, width toggles between full and icon-only
          'lg:relative lg:translate-x-0',
          desktopCollapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        <Sidebar
          onMobileClose={() => setMobileSidebarOpen(false)}
          desktopCollapsed={desktopCollapsed}
          onDesktopCollapseToggle={() => setDesktopCollapsed(prev => !prev)}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className={cn('flex-1 p-4 md:p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}
