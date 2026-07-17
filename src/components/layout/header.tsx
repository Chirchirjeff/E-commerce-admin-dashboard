'use client'

import * as React from 'react'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Button } from '@/components/ui/button'
import { Bell, Search, User, Menu, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function Header({ onMenuClick, className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6",
      className
    )}>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search - hidden on mobile, visible on larger screens */}
      <div className="hidden flex-1 max-w-md md:flex relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search vendors, products, orders..."
          className="h-9 w-full rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      {/* Right side */}
      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        {/* Search - mobile only */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* User */}
        <div className="flex items-center gap-3 border-l pl-3 md:pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">admin@store.com</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </div>
      </div>
    </header>
  )
}