'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeekView } from '@/components/meal-planner/week-view';
import { MealType, Recipe, MealPlan } from '@/lib/supabase/types';
import { getWeekStart, formatISODate } from '@/lib/utils/date';
import { addWeeks } from 'date-fns';
import { ChefHat, BookOpen, Calendar, TrendingUp, Utensils, CheckCircle2, X, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/lib/brand';
import { UserButton } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);
  const [viewRecipeId, setViewRecipeId] = useState<string | null>(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');

  const queryClient = useQueryClient();
  const weekStartISO = formatISODate(currentWeek);

  // Fetch recipes
  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });

  // Fetch meal plans for current week
  const { data: mealPlans = [] } = useQuery<MealPlan[]>({
    queryKey: ['meal-plans', weekStartISO],
    queryFn: async () => {
      const res = await fetch(`/api/meal-plans?week_start=${weekStartISO}`);
      if (!res.ok) throw new Error('Failed to fetch meal plans');
      return res.json();
    },
  });

  // Add meal plan mutation
  const addMealPlan = useMutation({
    mutationFn: async (data: {
      week_start_date: string;
      day_index: number;
      meal_type: MealType;
      recipe_id: string;
    }) => {
      const res = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add meal plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', weekStartISO] });
      setSelectedRecipeModal(null);
    },
  });

  // Remove meal plan mutation
  const removeMealPlan = useMutation({
    mutationFn: async (mealPlanId: string) => {
      const res = await fetch(`/api/meal-plans/${mealPlanId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove meal plan');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', weekStartISO] });
    },
  });

  const handlePreviousWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const handleAddMeal = (dayIndex: number, mealType: MealType) => {
    setSelectedRecipeModal({ dayIndex, mealType });
  };

  const handleSelectRecipe = (recipeId: string) => {
    if (selectedRecipeModal) {
      addMealPlan.mutate({
        week_start_date: weekStartISO,
        day_index: selectedRecipeModal.dayIndex,
        meal_type: selectedRecipeModal.mealType,
        recipe_id: recipeId,
      });
    }
  };

  const handleRemoveMeal = (mealPlanId: string) => {
    removeMealPlan.mutate(mealPlanId);
  };

  const handleViewRecipe = (recipeId: string) => {
    setViewRecipeId(recipeId);
  };

  const viewedRecipe = viewRecipeId ? recipes.find((r) => r.id === viewRecipeId) : null;

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    if (!recipeSearchQuery.trim()) return true;

    const searchLower = recipeSearchQuery.toLowerCase();
    const matchesTitle = recipe.title.toLowerCase().includes(searchLower);
    const matchesDescription = recipe.description?.toLowerCase().includes(searchLower);
    const matchesTags = recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    return matchesTitle || matchesDescription || matchesTags;
  });

  // Calculate stats
  const totalRecipes = recipes.length;
  const mealsPlannedThisWeek = mealPlans.length;
  const totalMealSlots = 14; // 7 days * 2 meals (lunch + dinner)
  const completionPercentage = totalMealSlots > 0
    ? Math.round((mealsPlannedThisWeek / totalMealSlots) * 100)
    : 0;

  return (
    <div className="space-y-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Total Recipes
              </CardTitle>
              <BookOpen className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{totalRecipes}</div>
              <p className="text-xs text-gray-600 mt-1 mb-3">
                {totalRecipes === 0 ? 'Create your first recipe!' : 'Ready to plan'}
              </p>
              <Button asChild size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/home/recipes/new">
                  <ChefHat className="h-4 w-4 mr-1" />
                  New Recipe
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-white to-amber-50/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                This Week
              </CardTitle>
              <Utensils className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-700">
                {mealsPlannedThisWeek}/{totalMealSlots}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Meals planned
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                Completion
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-700">{completionPercentage}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week View */}
        <WeekView
          weekStartDate={currentWeek}
          mealPlans={mealPlans}
          recipes={recipes}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          onViewRecipe={handleViewRecipe}
        />

      {/* Recipe Selection Modal */}
      <Dialog open={!!selectedRecipeModal} onOpenChange={(open) => {
        if (!open) {
          setSelectedRecipeModal(null);
          setRecipeSearchQuery('');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-3">
            <DialogTitle className="text-2xl font-bold">Select a Recipe</DialogTitle>
            <DialogDescription>
              Choose a recipe to add to your meal plan
            </DialogDescription>
            {recipes.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes by name, description, or tags..."
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-6">
            {recipes.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-6 text-lg">You don't have any recipes yet.</p>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/home/recipes/new">
                    Create Your First Recipe
                  </Link>
                </Button>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 text-lg font-semibold">No recipes found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid gap-3 py-4">
                {filteredRecipes.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe.id)}
                    className="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                  >
                    <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-700 transition-colors">
                      {recipe.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-amber-700 mt-2">
                      <Users className="h-4 w-4" />
                      <span>Serves {recipe.servings}</span>
                    </div>
                    {recipe.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {recipe.description.substring(0, 120)}...
                      </p>
                    )}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="px-6 py-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRecipeModal(null);
                setRecipeSearchQuery('');
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe View Modal */}
      <Dialog open={!!viewedRecipe} onOpenChange={(open) => !open && setViewRecipeId(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">{viewedRecipe?.title}</DialogTitle>
                {viewedRecipe?.tags && viewedRecipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewedRecipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Button asChild variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                <Link href={`/home/recipes/${viewedRecipe?.id}`}>
                  Edit Recipe
                </Link>
              </Button>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] px-6 py-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {viewedRecipe?.description}
              </div>
            </div>
          </ScrollArea>
          <div className="px-6 py-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={() => setViewRecipeId(null)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
