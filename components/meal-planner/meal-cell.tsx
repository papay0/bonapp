'use client';

import { Recipe, MealPlan } from '@/lib/supabase/types';
import { Plus, Trash2, Eye } from 'lucide-react';

interface MealCellProps {
  recipes: Recipe[];
  mealPlans: MealPlan[];
  dayName: string;
  mealType: 'lunch' | 'dinner' | 'breakfast';
  onAdd: () => void;
  onRemove: (mealPlanId: string) => void;
  onViewRecipe: (recipeId: string) => void;
}

export function MealCell({
  recipes,
  mealPlans,
  dayName,
  mealType,
  onAdd,
  onRemove,
  onViewRecipe,
}: MealCellProps) {
  if (recipes.length === 0) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-[110px] border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center justify-center gap-2"
      >
        <Plus className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        <span className="text-sm font-medium text-gray-500 group-hover:text-emerald-700 transition-colors">
          Add {mealType}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full min-h-[110px] space-y-2">
      {recipes.map((recipe, index) => {
        const mealPlan = mealPlans.find(plan => plan.recipe_id === recipe.id);

        return (
          <div
            key={recipe.id}
            className="relative border-2 border-emerald-300 rounded-lg p-2 bg-gradient-to-br from-white to-emerald-50 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group"
            onClick={() => onViewRecipe(recipe.id)}
          >
            <h4 className="font-semibold text-gray-900 line-clamp-1 text-xs leading-tight pr-6">
              {recipe.title}
            </h4>
            {mealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(mealPlan.id);
                }}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                aria-label="Remove meal"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add button */}
      <button
        onClick={onAdd}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex items-center justify-center gap-2 py-2"
      >
        <Plus className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        <span className="text-xs font-medium text-gray-500 group-hover:text-emerald-700 transition-colors">
          Add more
        </span>
      </button>
    </div>
  );
}
