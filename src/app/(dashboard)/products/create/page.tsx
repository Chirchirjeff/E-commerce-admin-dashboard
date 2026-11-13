'use client';

import { MainLayout } from '@/components/layout/main-layout';
import dynamic from 'next/dynamic';
import { LoadingStatus } from '@/components/shared/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Code-split the large product form (+ category selector) so the page shell paints first.
const CreateProductForm = dynamic(
  () => import('@/components/products/CreateProductForm').then((m) => m.CreateProductForm),
  {
    ssr: false,
    loading: () => (
      <LoadingStatus label="Loading product form…" className="space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} aria-hidden="true" className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className={i === 2 ? 'h-24 w-full' : 'h-10 w-full'} />
          </div>
        ))}
        <Skeleton className="h-10 w-36" />
      </LoadingStatus>
    ),
  }
);

export default function CreateProductPage() {
  return (
    <MainLayout>
      <div className="mb-8">
        <Link href="/products">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Add a new product to your store using the marketplace category system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProductForm />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
