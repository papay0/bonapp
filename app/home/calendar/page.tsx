'use client';

import { useQuery } from '@tanstack/react-query';
import { MealPlan, Recipe } from '@/lib/supabase/types';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { format, startOfWeek, addDays, addWeeks } from 'date-fns';
import { useState, useMemo, useRef, useEffect } from 'react';
import { formatISODate } from '@/lib/utils/date';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [numberOfWeeks] = useState(12); // Show 12 weeks total
  const currentWeekRef = useRef<HTMLDivElement>(null);

  // Calculate weeks to display (6 past + current + 5 future)
  const weeks = useMemo(() => {
    const weeksArray = [];
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });

    for (let i = -6; i <= 5; i++) {
      const weekStart = addWeeks(currentWeekStart, i);
      weeksArray.push(weekStart);
    }

    return weeksArray;
  }, [today]);

  // Fetch all recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });

  // Fetch all meal plans (for all weeks)
  const { data: allMealPlans = [], isLoading } = useQuery<MealPlan[]>({
    queryKey: ['all-meal-plans'],
    queryFn: async () => {
      const res = await fetch('/api/meal-plans');
      if (!res.ok) throw new Error('Failed to fetch meal plans');
      return res.json();
    },
  });

  const getRecipe = (recipeId: string) => {
    return recipes.find((recipe) => recipe.id === recipeId);
  };

  const getMealPlansForWeek = (weekStart: Date) => {
    const weekStartISO = formatISODate(weekStart);
    return allMealPlans.filter((plan) => plan.week_start_date === weekStartISO);
  };

  const getMealPlanForDay = (weekPlans: MealPlan[], dayIndex: number, mealType: string) => {
    return weekPlans.find(
      (plan) => plan.day_index === dayIndex && plan.meal_type === mealType
    );
  };

  // Scroll to current week on mount
  useEffect(() => {
    if (currentWeekRef.current && !isLoading) {
      currentWeekRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isLoading]);

  return (
    <>
      <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calendar Timeline</h1>
          </div>
          <p className="text-gray-600">
            View your meal planning history and upcoming weeks
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="text-gray-600">Loading calendar...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {weeks.map((weekStart, weekIndex) => {
              const weekEnd = addDays(weekStart, 6);
              const weekPlans = getMealPlansForWeek(weekStart);
              const isCurrentWeek = format(weekStart, 'yyyy-MM-dd') === formatISODate(startOfWeek(today, { weekStartsOn: 1 }));

              return (
                <div
                  key={weekIndex}
                  ref={isCurrentWeek ? currentWeekRef : null}
                  className={`bg-white rounded-lg shadow-sm overflow-hidden border-2 ${
                    isCurrentWeek ? 'border-emerald-400' : 'border-transparent'
                  }`}
                >
                  {/* Week Header */}
                  <div className={`px-6 py-4 ${isCurrentWeek ? 'bg-emerald-50' : 'bg-gray-50'} border-b border-gray-200`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {format(weekStart, 'MMMM d')} – {format(weekEnd, 'MMMM d, yyyy')}
                        {isCurrentWeek && (
                          <span className="ml-3 text-sm font-medium text-emerald-600">
                            Current Week
                          </span>
                        )}
                      </h3>
                      <Link
                        href={`/home?week_start=${formatISODate(weekStart)}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View Week →
                      </Link>
                    </div>
                  </div>

                  {/* Week Grid */}
                  <div className="p-6">
                    {weekPlans.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No meals planned for this week</p>
                    ) : (
                      <div className="grid grid-cols-7 gap-3">
                        {DAYS.map((day, dayIndex) => {
                          const lunchPlan = getMealPlanForDay(weekPlans, dayIndex, 'lunch');
                          const dinnerPlan = getMealPlanForDay(weekPlans, dayIndex, 'dinner');
                          const lunchRecipe = lunchPlan && lunchPlan.recipe_id ? getRecipe(lunchPlan.recipe_id) : null;
                          const dinnerRecipe = dinnerPlan && dinnerPlan.recipe_id ? getRecipe(dinnerPlan.recipe_id) : null;

                          return (
                            <div key={day} className="min-h-[120px]">
                              <div className="text-sm font-medium text-gray-700 mb-2 text-center">
                                {day}
                                <div className="text-xs text-gray-500">
                                  {format(addDays(weekStart, dayIndex), 'MMM d')}
                                </div>
                              </div>
                              <div className="space-y-2">
                                {lunchRecipe && (
                                  <div className="text-xs p-2 bg-amber-50 border border-amber-200 rounded">
                                    <div className="font-medium text-amber-900">L</div>
                                    <div className="text-amber-700 line-clamp-2">{lunchRecipe.title}</div>
                                  </div>
                                )}
                                {dinnerRecipe && (
                                  <div className="text-xs p-2 bg-emerald-50 border border-emerald-200 rounded">
                                    <div className="font-medium text-emerald-900">D</div>
                                    <div className="text-emerald-700 line-clamp-2">{dinnerRecipe.title}</div>
                                  </div>
                                )}
                                {!lunchRecipe && !dinnerRecipe && (
                                  <div className="text-xs text-gray-400 text-center py-2">-</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </>
  );
}
