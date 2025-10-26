'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import GroceryListContent from './grocery-list-content';

export default function GroceryListPage() {
  return (
    <Suspense fallback={<GroceryListLoading />}>
      <GroceryListContent />
    </Suspense>
  );
}

function GroceryListLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
