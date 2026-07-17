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
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown with toggle */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className={cn("flex-1 p-4 md:p-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
}