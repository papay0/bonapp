'use client';

import { useUserSync } from '@/lib/hooks/use-user-sync';
import { useRecipesRealtime } from '@/lib/hooks/use-recipes-realtime';
import { useMealPlansRealtime } from '@/lib/hooks/use-meal-plans-realtime';
import { Header } from '@/components/layout/header';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Automatically sync user on every page load in /home
  useUserSync();

  // Listen to real-time database changes
  useRecipesRealtime();
  useMealPlansRealtime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-amber-50/30">
      <Header />
      <main className="py-4 md:py-6">
        {children}
      </main>
    </div>
  );
}
