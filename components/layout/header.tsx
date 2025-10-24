'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat } from 'lucide-react';
import { Brand } from '@/lib/brand';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ChefHat className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-900">{Brand.name}</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant={isActive('/home') ? 'default' : 'ghost'}
              asChild
              className={isActive('/home') ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Link href="/home">Weekly Planner</Link>
            </Button>
            <Button
              variant={isActive('/home/recipes') ? 'default' : 'ghost'}
              asChild
              className={isActive('/home/recipes') ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Link href="/home/recipes">Recipes</Link>
            </Button>
            <Button
              variant={isActive('/home/calendar') ? 'default' : 'ghost'}
              asChild
              className={isActive('/home/calendar') ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              <Link href="/home/calendar">Calendar</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </header>
  );
}
