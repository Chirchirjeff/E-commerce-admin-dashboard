'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { EmailDispatchPanel } from '@/components/email/EmailDispatchPanel';
import { Mail } from 'lucide-react';

export default function EmailPage() {
  return (
    <MainLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <Mail className="h-6 w-6" />
            Email Dispatch
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compose and send Quza notification emails to customers, vendors, and admins.
          </p>
        </div>
      </div>

      <EmailDispatchPanel />
    </MainLayout>
  );
}
