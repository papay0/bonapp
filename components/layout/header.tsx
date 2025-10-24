'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, Plus, Menu, Calendar, BookOpen, Utensils, X } from 'lucide-react';
import { Brand } from '@/lib/brand';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/home') {
      return pathname === '/home';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { href: '/home', label: 'Weekly Planner', icon: Utensils },
    { href: '/home/recipes', label: 'Recipes', icon: BookOpen },
    { href: '/home/calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/home" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
              <ChefHat className="h-6 w-6 md:h-7 md:w-7 text-white drop-shadow-lg" />
            </div>
            <span className="text-xl md:text-2xl font-black text-white drop-shadow-md">{Brand.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={isActive(item.href)
                  ? 'bg-white/25 backdrop-blur-sm text-white hover:bg-white/30 font-semibold'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
            <div className="h-6 w-px bg-white/30 mx-1" />
            <Button
              variant="outline"
              asChild
              className="bg-white text-emerald-600 border-white hover:bg-white/90 font-semibold shadow-md"
            >
              <Link href="/home/recipes/new">
                <Plus className="h-4 w-4 mr-1" />
                New Recipe
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <SheetHeader className="mb-6 pb-4 border-b">
                  <SheetTitle className="flex items-center gap-2.5 text-left">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                      <ChefHat className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-900">{Brand.name}</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive(item.href)
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                      </SheetClose>
                    );
                  })}

                  <div className="h-px bg-gray-200 my-3" />

                  <SheetClose asChild>
                    <Link
                      href="/home/recipes/new"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="font-bold text-sm">New Recipe</span>
                    </Link>
                  </SheetClose>

                  <div className="mt-6 flex justify-center">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
