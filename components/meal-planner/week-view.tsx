'use client';

import { Recipe, MealPlan, MealType } from '@/lib/supabase/types';
import { MealCell } from './meal-cell';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WeekViewProps {
  weekStartDate: Date;
  mealPlans: MealPlan[];
  recipes: Recipe[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddMeal: (dayIndex: number, mealType: MealType) => void;
  onRemoveMeal: (mealPlanId: string) => void;
  onViewRecipe: (recipeId: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES: MealType[] = ['lunch', 'dinner'];

export function WeekView({
  weekStartDate,
  mealPlans,
  recipes,
  onPreviousWeek,
  onNextWeek,
  onAddMeal,
  onRemoveMeal,
  onViewRecipe,
}: WeekViewProps) {
  const weekStart = startOfWeek(weekStartDate, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const getMealPlans = (dayIndex: number, mealType: MealType) => {
    return mealPlans.filter(
      (plan) => plan.day_index === dayIndex && plan.meal_type === mealType
    );
  };

  const getRecipes = (recipeIds: string[]) => {
    return recipeIds
      .map((id) => recipes.find((recipe) => recipe.id === id))
      .filter((recipe): recipe is Recipe => recipe !== undefined);
  };

  return (
    <div className="w-full space-y-3 md:space-y-4">
      {/* Week Navigator */}
      <Card className="p-3 md:p-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        <div className="flex items-center justify-between gap-2 relative z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPreviousWeek}
            className="hover:bg-white/25 backdrop-blur-sm h-8 w-8 md:h-10 md:w-10 text-white hover:scale-110 transition-all"
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <h2 className="text-sm md:text-xl font-black text-white text-center drop-shadow-md">
            {format(weekStart, 'MMMM d')} – {format(weekEnd, 'MMMM d, yyyy')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            className="hover:bg-white/25 backdrop-blur-sm h-8 w-8 md:h-10 md:w-10 text-white hover:scale-110 transition-all"
          >
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </Card>

      {/* Calendar Table */}
      <Card className="overflow-hidden shadow-md md:shadow-lg border border-gray-200 md:border-2 p-0">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px] md:min-w-[800px]">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-emerald-100 to-amber-100 hover:from-emerald-100 hover:to-amber-100 border-b-2 border-gray-300">
                <TableHead className="w-[70px] md:w-[90px] h-10 md:h-12 font-bold text-gray-900 border-r-2 border-gray-300 text-center align-middle text-xs md:text-sm">
                  Meal
                </TableHead>
                {DAYS.map((day, index) => (
                  <TableHead key={day} className="h-10 md:h-12 text-center font-bold text-gray-900 border-r-2 last:border-r-0 border-gray-300 align-middle p-1 md:p-2">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-xs md:text-sm font-bold">{day}</span>
                      <span className="text-[10px] md:text-xs font-normal text-gray-600">
                        {format(addDays(weekStart, index), 'MMM d')}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MEAL_TYPES.map((mealType, typeIndex) => (
                <TableRow
                  key={mealType}
                  className="hover:bg-gray-50/50 border-b-2 last:border-b-0 border-gray-200"
                >
                  <TableCell className="font-bold text-gray-700 capitalize bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-300 text-center align-middle p-0 text-xs md:text-sm">
                    {mealType}
                  </TableCell>
                  {DAYS.map((day, dayIndex) => {
                    const dayMealPlans = getMealPlans(dayIndex, mealType);
                    const dayRecipes = getRecipes(dayMealPlans.map(plan => plan.recipe_id));

                    return (
                      <TableCell
                        key={`${day}-${mealType}`}
                        className="p-2 md:p-3 border-r-2 last:border-r-0 border-gray-300 align-middle"
                      >
                        <MealCell
                          recipes={dayRecipes}
                          mealPlans={dayMealPlans}
                          dayName={day}
                          mealType={mealType}
                          onAdd={() => onAddMeal(dayIndex, mealType)}
                          onRemove={(mealPlanId) => onRemoveMeal(mealPlanId)}
                          onViewRecipe={(recipeId) => onViewRecipe(recipeId)}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
