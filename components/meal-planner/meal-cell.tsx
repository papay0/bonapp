'use client';

import { Recipe, MealPlan, Event } from '@/lib/supabase/types';
import { Plus, Trash2 } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';

interface MealCellProps {
  recipes: Recipe[];
  events: Event[];
  mealPlans: MealPlan[];
  dayName: string;
  mealType: 'lunch' | 'dinner' | 'breakfast';
  onAdd: () => void;
  onRemove: (mealPlanId: string) => void;
  onViewRecipe: (recipeId: string) => void;
  onUpdateColor: (mealPlanId: string, color: string | null) => void;
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
  onUpdateColor,
}: MealCellProps) {
  const hasItems = recipes.length > 0 || events.length > 0;

  if (!hasItems) {
    return (
      <button
        onClick={onAdd}
        className="w-full h-[80px] bg-gray-50/50 hover:bg-emerald-50 rounded-md transition-all group flex flex-col items-center justify-center gap-0.5 border border-gray-200/40 hover:border-emerald-300"
      >
        <div className="bg-gray-100 group-hover:bg-emerald-500 rounded-full p-1 transition-all">
          <Plus className="h-3 w-3 text-gray-400 group-hover:text-white transition-colors" />
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
            className="relative bg-gradient-to-br from-emerald-500 to-teal-500 rounded-md p-2 hover:shadow-lg transition-all cursor-pointer group w-full"
            onClick={() => onViewRecipe(recipe.id)}
          >
            <div className="flex items-center gap-1.5 w-full">
              {mealPlan && (
                <ColorPicker
                  value={mealPlan.color}
                  onChange={(color) => onUpdateColor(mealPlan.id, color)}
                />
              )}
              <h4
                className="font-semibold text-white text-xs pr-6 drop-shadow flex-1 min-w-0"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: '1.3',
                  whiteSpace: 'normal'
                }}
              >
                {recipe.title}
              </h4>
            </div>
            {mealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(mealPlan.id);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-1 p-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all flex items-center justify-center"
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
        const isCooking = event.name === 'Cooking';

        return (
          <div
            key={event.id}
            className={`relative rounded-md p-2 hover:shadow-lg transition-all group w-full ${
              isCooking
                ? 'bg-gradient-to-br from-red-500 to-rose-500'
                : 'bg-gradient-to-br from-blue-500 to-cyan-500'
            }`}
          >
            <div className="flex items-center gap-1.5 w-full">
              {mealPlan && (
                <ColorPicker
                  value={mealPlan.color}
                  onChange={(color) => onUpdateColor(mealPlan.id, color)}
                />
              )}
              <h4
                className="font-semibold text-white text-xs pr-6 drop-shadow flex-1 min-w-0"
                style={{
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                  wordBreak: 'break-word',
                  lineHeight: '1.3',
                  whiteSpace: 'normal'
                }}
              >
                {event.name}
              </h4>
            </div>
            {mealPlan && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(mealPlan.id);
                }}
                className="absolute top-1/2 -translate-y-1/2 right-1 p-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full transition-all flex items-center justify-center"
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
        className="w-full bg-gray-50/50 hover:bg-emerald-50 rounded-md transition-all group flex items-center justify-center gap-1 py-1.5 border border-gray-200/40 hover:border-emerald-300"
      >
        <div className="bg-gray-100 group-hover:bg-emerald-500 rounded-full p-0.5 transition-all">
          <Plus className="h-2.5 w-2.5 text-gray-400 group-hover:text-white transition-colors" />
        </div>
        <span className="text-xs font-medium text-gray-400 group-hover:text-emerald-700 transition-all">
          Add more
        </span>
      </button>
    </div>
  );
}
