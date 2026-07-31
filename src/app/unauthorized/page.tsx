import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <Shield className="h-10 w-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don't have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Sign Out
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}