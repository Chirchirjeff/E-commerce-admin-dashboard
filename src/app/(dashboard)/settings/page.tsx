/*
 * Settings Page - Platform settings * Configure platform settings and preferences
 */

'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Settings, Globe, DollarSign, Mail, Shield, Bell, Palette, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your platform settings and preferences</p>
        </div>
        <Button><Settings className="mr-2 h-4 w-4" />Save Changes</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> General</CardTitle>
            <CardDescription>Basic platform settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Platform Name</p>
                <p className="text-sm text-muted-foreground">AdminPanel</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Currency</p>
                <p className="text-sm text-muted-foreground">USD ($)</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Time Zone</p>
                <p className="text-sm text-muted-foreground">UTC - 4:00</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>

        {/* Commission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Commission</CardTitle>
            <CardDescription>Platform commission settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Default Commission Rate</p>
                <p className="text-sm text-muted-foreground">10%</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Minimum Payout Amount</p>
                <p className="text-sm text-muted-foreground">$50</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Payout Schedule</p>
                <p className="text-sm text-muted-foreground">Monthly</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email</CardTitle>
            <CardDescription>Email notification settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMTP Server</p>
                <p className="text-sm text-muted-foreground">smtp.gmail.com</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">From Email</p>
                <p className="text-sm text-muted-foreground">admin@store.com</p>
              </div>
              <Button variant="outline" size="sm">Edit</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Email Notifications</span>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Protect your account</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Session Timeout</p>
                <p className="text-sm text-muted-foreground">60 minutes</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <Button variant="outline" className="w-full">Change Password</Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
            <CardDescription>Customize the admin dashboard appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Color Scheme</p>
                <p className="text-sm text-muted-foreground">Default</p>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compact Mode</p>
                <p className="text-sm text-muted-foreground">Tighter spacing</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> System</CardTitle>
            <CardDescription>System configuration and maintenance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Put platform in maintenance</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Backup Schedule</p>
                <p className="text-sm text-muted-foreground">Daily</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <Button variant="outline" className="w-full text-red-500 hover:bg-red-500/10 hover:text-red-600">Clear Cache</Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}