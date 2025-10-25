'use client';

import { Recipe, MealPlan, Event } from '@/lib/supabase/types';
import { Plus, Trash2, Eye, Calendar } from 'lucide-react';

interface MealCellProps {
  recipes: Recipe[];
  events: Event[];
  mealPlans: MealPlan[];
  dayName: string;
  mealType: 'lunch' | 'dinner' | 'breakfast';
  onAdd: () => void;
  onRemove: (mealPlanId: string) => void;
  onViewRecipe: (recipeId: string) => void;
}

export function MealCell({
  recipes,
  events,
  mealPlans,
  dayName,
  mealType,
  onAdd,
  onRemove,
  onViewRecipe,
}: MealCellProps) {
  const hasItems = recipes.length > 0 || events.length > 0;

  if (!hasItems) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-[80px] bg-gray-50/50 hover:bg-emerald-50 rounded-lg transition-all group flex flex-col items-center justify-center gap-1 border border-gray-200/40 hover:border-emerald-300"
      >
        <div className="bg-gray-100 group-hover:bg-emerald-500 rounded-full p-1.5 transition-all">
          <Plus className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-700 transition-all">
          Add {mealType}
        </span>
      </button>
    );
  }

  return (
    <div className="w-full min-h-[80px] space-y-1.5">
      {/* Render recipes */}
      {recipes.map((recipe) => {
        const mealPlan = mealPlans.find(plan => plan.recipe_id === recipe.id);

        return (
          <div
            key={recipe.id}
            className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg p-2 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => onViewRecipe(recipe.id)}
          >
            <h4 className="font-semibold text-white line-clamp-2 text-xs leading-tight pr-5 drop-shadow">
              {recipe.title}
            </h4>
            {mealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(mealPlan.id);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all flex items-center justify-center"
                aria-label="Remove meal"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* Render events */}
      {events.map((event) => {
        const mealPlan = mealPlans.find(plan => plan.event_id === event.id);

        return (
          <div
            key={event.id}
            className="relative bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-1.5">
              <Calendar className="h-3 w-3 text-white/90 flex-shrink-0 mt-0.5" />
              <h4 className="font-semibold text-white line-clamp-2 text-xs leading-tight pr-5 drop-shadow">
                {event.name}
              </h4>
            </div>
            {mealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(mealPlan.id);
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all flex items-center justify-center"
                aria-label="Remove event"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}

      {/* Add button - subtle but visible */}
      <button
        onClick={onAdd}
        className="w-full bg-gray-50/50 hover:bg-emerald-50 rounded-lg transition-all group flex items-center justify-center gap-1.5 py-2 border border-gray-200/40 hover:border-emerald-300"
      >
        <div className="bg-gray-100 group-hover:bg-emerald-500 rounded-full p-1 transition-all">
          <Plus className="h-3 w-3 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-700 transition-all">
          Add more
        </span>
      </button>
    </div>
  );
}
