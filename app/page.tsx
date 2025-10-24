'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Brand } from '@/lib/brand';
import { ChefHat, ArrowRight, Sparkles } from 'lucide-react';
import { AIDemoAnimation } from '@/components/landing/ai-demo-animation';

// Example meal data for the visual preview
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DATES = ['Jan 20', 'Jan 21', 'Jan 22', 'Jan 23', 'Jan 24', 'Jan 25', 'Jan 26'];

const exampleMeals = {
  lunch: ['Chicken Caesar', 'Quinoa Bowl', 'Turkey Sandwich', 'Greek Salad', 'Veggie Wrap', 'Pasta Salad', 'Sushi Bowl'],
  dinner: ['Carbonara', 'Grilled Salmon', 'Beef Tacos', 'Chicken Curry', 'Homemade Pizza', 'Stir Fry', 'BBQ Ribs'],
};

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Redirect authenticated users to /home
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't show landing page if user is signed in (will redirect)
  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl shadow-md">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900">{Brand.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section with Visual Preview */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-4 md:mb-6 leading-tight">
              {Brand.tagline}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              See your week at a glance. Plan meals visually. Eat better.
            </p>
          </div>

          {/* Visual Meal Planner Preview */}
          <div className="bg-white rounded-3xl shadow-2xl p-4 md:p-8 mb-8 border-4 border-emerald-100">
            {/* Week Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-4 md:p-6 mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <h2 className="text-xl md:text-2xl font-black text-white text-center drop-shadow-md relative z-10">
                Your Week — January 20-26, 2025
              </h2>
            </div>

            {/* Calendar Grid - Desktop */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100 to-amber-100 border-b-2 border-gray-300">
                    <th className="w-20 p-3 font-bold text-gray-900 border-r-2 border-gray-300 text-center text-sm">
                      Meal
                    </th>
                    {DAYS.map((day, index) => (
                      <th key={day} className="p-2 text-center font-bold text-gray-900 border-r-2 last:border-r-0 border-gray-300">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold">{day}</span>
                          <span className="text-xs font-normal text-gray-600">{DATES[index]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['lunch', 'dinner'].map((mealType) => (
                    <tr key={mealType} className="hover:bg-gray-50/50 border-b-2 last:border-b-0 border-gray-200">
                      <td className="font-bold text-gray-700 capitalize bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-300 text-center p-0 text-sm">
                        {mealType}
                      </td>
                      {DAYS.map((day, dayIndex) => (
                        <td key={`${mealType}-${day}`} className="p-2 border-r-2 last:border-r-0 border-gray-300">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-2.5 shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer">
                            <div className="font-semibold text-xs drop-shadow line-clamp-2">
                              {exampleMeals[mealType as 'lunch' | 'dinner'][dayIndex]}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calendar Grid - Tablet */}
            <div className="hidden md:block lg:hidden overflow-x-auto overflow-hidden rounded-2xl border-2 border-gray-200 shadow-lg">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-100 to-amber-100 border-b-2 border-gray-300">
                    <th className="w-16 p-2 font-bold text-gray-900 border-r-2 border-gray-300 text-center text-xs">
                      Meal
                    </th>
                    {DAYS.slice(0, 5).map((day, index) => (
                      <th key={day} className="p-2 text-center font-bold text-gray-900 border-r-2 last:border-r-0 border-gray-300">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold">{day.slice(0, 3)}</span>
                          <span className="text-[10px] font-normal text-gray-600">{DATES[index]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {['lunch', 'dinner'].map((mealType) => (
                    <tr key={mealType} className="border-b-2 last:border-b-0 border-gray-200">
                      <td className="font-bold text-gray-700 capitalize bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-300 text-center p-0 text-xs">
                        {mealType}
                      </td>
                      {DAYS.slice(0, 5).map((day, dayIndex) => (
                        <td key={`${mealType}-${day}`} className="p-1.5 border-r-2 last:border-r-0 border-gray-300">
                          <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-2 shadow-md">
                            <div className="font-semibold text-[10px] drop-shadow line-clamp-2">
                              {exampleMeals[mealType as 'lunch' | 'dinner'][dayIndex]}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile - Simplified View */}
            <div className="md:hidden space-y-3">
              {DAYS.slice(0, 5).map((day, index) => (
                <div key={day} className="bg-gray-50 rounded-xl p-3 border-2 border-gray-100">
                  <div className="font-bold text-sm text-gray-900 mb-2">{day} - {DATES[index]}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Lunch</div>
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-2 shadow-md">
                        <div className="font-semibold text-xs drop-shadow">{exampleMeals.lunch[index]}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Dinner</div>
                      <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-2 shadow-md">
                        <div className="font-semibold text-xs drop-shadow">{exampleMeals.dinner[index]}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg md:text-xl font-bold rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95"
            >
              Start Planning Your Week
              <ArrowRight className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Feature Highlight */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-bold">AI-Powered</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg">
                Generate Recipes with AI
              </h2>
              <p className="text-lg md:text-xl opacity-95 mb-8 max-w-2xl mx-auto">
                Just type what you want to eat. Our AI instantly creates detailed recipes with ingredients, steps, and cooking tips.
              </p>
              <div className="max-w-2xl mx-auto">
                <AIDemoAnimation />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Feature Cards */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="text-center p-8">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Visual Planning</h3>
            <p className="text-gray-600">See your entire week in one beautiful view</p>
          </div>
          <div className="text-center p-8">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Recipes</h3>
            <p className="text-gray-600">Generate any recipe instantly with AI</p>
          </div>
          <div className="text-center p-8">
            <div className="text-5xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mobile First</h3>
            <p className="text-gray-600">Beautiful on every device</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">
            Stop Wondering.<br />Start Planning.
          </h2>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg md:text-xl font-bold rounded-full hover:from-emerald-700 hover:to-teal-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95"
          >
            Get Started Free
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; 2025 {Brand.name}</p>
        </div>
      </footer>
    </div>
  );
}
