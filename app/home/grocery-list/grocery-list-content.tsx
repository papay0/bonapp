'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Recipe, MealPlan, GroceryList, GroceryListCategory } from '@/lib/supabase/types';
import { startOfWeek, addWeeks, format } from 'date-fns';
import { formatISODate } from '@/lib/utils/date';
import { ShoppingCart, Minus, Plus, Loader2, Trash2, ChevronLeft, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface RecipeSelection {
  recipe: Recipe;
  servings: number;
  selected: boolean;
}

export default function GroceryListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const currentWeekStart = useMemo(() => startOfWeek(today, { weekStartsOn: 1 }), [today]);

  // Get list ID from URL (if viewing existing list)
  const listIdParam = searchParams.get('id');
  const [activeListId, setActiveListId] = useState<string | null>(listIdParam);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate weeks for selector
  const weeks = useMemo(() => {
    const weeksArray = [];
    for (let i = -2; i <= 8; i++) {
      const weekStart = addWeeks(currentWeekStart, i);
      weeksArray.push(weekStart);
    }
    return weeksArray;
  }, [currentWeekStart]);

  const [selectedWeek, setSelectedWeek] = useState<string>(() => {
    const weekParam = searchParams.get('week');
    return weekParam || formatISODate(currentWeekStart);
  });

  const [recipeSelections, setRecipeSelections] = useState<RecipeSelection[]>([]);

  // Fetch all grocery lists
  const { data: groceryLists = [], isLoading: isLoadingLists } = useQuery<GroceryList[]>({
    queryKey: ['grocery-lists'],
    queryFn: async () => {
      const res = await fetch('/api/grocery-lists');
      if (!res.ok) throw new Error('Failed to fetch grocery lists');
      return res.json();
    },
  });

  // Fetch active grocery list
  const { data: activeList, isLoading: isLoadingActiveList } = useQuery<GroceryList | null>({
    queryKey: ['grocery-list', activeListId],
    queryFn: async () => {
      if (!activeListId) return null;
      const res = await fetch(`/api/grocery-lists/${activeListId}`);
      if (!res.ok) throw new Error('Failed to fetch grocery list');
      return res.json();
    },
    enabled: !!activeListId,
  });

  // Fetch recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });

  // Fetch meal plans
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery<MealPlan[]>({
    queryKey: ['all-meal-plans'],
    queryFn: async () => {
      const res = await fetch('/api/meal-plans');
      if (!res.ok) throw new Error('Failed to fetch meal plans');
      return res.json();
    },
  });

  const isLoading = isLoadingRecipes || isLoadingMealPlans;

  // Update recipe selections when week changes
  useEffect(() => {
    if (!recipes.length || !mealPlans.length) return;

    const weekMealPlans = mealPlans.filter(plan => plan.week_start_date === selectedWeek);
    const recipeIds = [...new Set(
      weekMealPlans
        .map(plan => plan.recipe_id)
        .filter((id): id is string => id !== null)
    )];

    const selections = recipeIds
      .map(recipeId => {
        const recipe = recipes.find(r => r.id === recipeId);
        if (!recipe) return null;
        return {
          recipe,
          servings: recipe.servings,
          selected: true,
        };
      })
      .filter((s): s is RecipeSelection => s !== null);

    setRecipeSelections(selections);
  }, [selectedWeek, recipes, mealPlans]);

  // Create grocery list mutation
  const createList = useMutation({
    mutationFn: async (data: { name: string; items: GroceryListCategory[]; week_start_date?: string }) => {
      const res = await fetch('/api/grocery-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create grocery list');
      return res.json();
    },
    onSuccess: (newList) => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists'] });
      setActiveListId(newList.id);
      router.push(`/home/grocery-list?id=${newList.id}`);
    },
  });

  // Update grocery list mutation
  const updateList = useMutation({
    mutationFn: async ({ id, items }: { id: string; items: GroceryListCategory[] }) => {
      const res = await fetch(`/api/grocery-lists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error('Failed to update grocery list');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-list', activeListId] });
      queryClient.invalidateQueries({ queryKey: ['grocery-lists'] });
    },
  });

  // Delete grocery list mutation
  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/grocery-lists/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete grocery list');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grocery-lists'] });
      setActiveListId(null);
      router.push('/home/grocery-list');
    },
  });

  const handleToggleRecipe = (recipeId: string) => {
    setRecipeSelections(prev =>
      prev.map(sel =>
        sel.recipe.id === recipeId ? { ...sel, selected: !sel.selected } : sel
      )
    );
  };

  const handleUpdateServings = (recipeId: string, delta: number) => {
    setRecipeSelections(prev =>
      prev.map(sel => {
        if (sel.recipe.id === recipeId) {
          const newServings = Math.max(1, sel.servings + delta);
          return { ...sel, servings: newServings };
        }
        return sel;
      })
    );
  };

  const handleGenerate = async () => {
    const selectedRecipes = recipeSelections
      .filter(sel => sel.selected)
      .map(sel => ({
        id: sel.recipe.id,
        servings: sel.servings,
      }));

    if (selectedRecipes.length === 0) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/grocery-list/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipes: selectedRecipes }),
      });

      if (!res.ok) throw new Error('Failed to generate grocery list');

      const { categories } = await res.json();

      // Create a new grocery list
      const weekDate = new Date(selectedWeek);
      const listName = `Groceries - ${format(weekDate, 'MMM d, yyyy')}`;

      await createList.mutateAsync({
        name: listName,
        items: categories,
        week_start_date: selectedWeek,
      });
    } catch (error) {
      console.error('Failed to generate list:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleItem = (categoryIndex: number, itemIndex: number) => {
    if (!activeList) return;

    const categories = activeList.items as unknown as GroceryListCategory[];
    const updatedCategories = categories.map((cat, cIdx) => {
      if (cIdx === categoryIndex) {
        return {
          ...cat,
          items: cat.items.map((item, iIdx) => {
            if (iIdx === itemIndex) {
              return { ...item, checked: !item.checked };
            }
            return item;
          }),
        };
      }
      return cat;
    });

    updateList.mutate({ id: activeList.id, items: updatedCategories });
  };

  const handleDeleteList = () => {
    if (!activeListId || !confirm('Are you sure you want to delete this grocery list?')) return;
    deleteList.mutate(activeListId);
  };

  const selectedCount = recipeSelections.filter(s => s.selected).length;
  const categories = (activeList?.items as unknown as GroceryListCategory[]) || [];
  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce((sum, cat) =>
    sum + cat.items.filter(item => item.checked).length, 0
  );

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Mobile History Sheet */}
      <div className="md:hidden p-4 border-b bg-white sticky top-0 z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {activeList ? activeList.name : 'View History'}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Grocery Lists</SheetTitle>
            </SheetHeader>
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              {isLoadingLists ? (
                <div className="p-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : groceryLists.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No grocery lists yet
                </div>
              ) : (
                <div className="p-2">
                  {groceryLists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => {
                        setActiveListId(list.id);
                        router.push(`/home/grocery-list?id=${list.id}`);
                      }}
                      className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                        activeListId === list.id
                          ? 'bg-emerald-100 border-2 border-emerald-500'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-semibold text-sm">{list.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(list.created_at), 'MMM d, yyyy')}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 border-r bg-gray-50 overflow-y-auto">
        <div className="p-4 border-b bg-white sticky top-0 z-10">
          <h2 className="font-bold text-lg">Grocery Lists</h2>
        </div>
        {isLoadingLists ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : groceryLists.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No grocery lists yet
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {groceryLists.map((list) => (
              <button
                key={list.id}
                onClick={() => {
                  setActiveListId(list.id);
                  router.push(`/home/grocery-list?id=${list.id}`);
                }}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  activeListId === list.id
                    ? 'bg-white border-2 border-emerald-500 shadow-sm'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="font-semibold text-sm mb-1">{list.name}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(list.created_at), 'MMM d, yyyy h:mm a')}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeList ? (
          // Show active grocery list
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveListId(null);
                    router.push('/home/grocery-list');
                  }}
                  className="mb-2 -ml-2"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back to Generator
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {activeList.name}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {checkedItems} of {totalItems} items checked
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteList}
                disabled={deleteList.isPending}
              >
                <Trash2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Delete</span>
              </Button>
            </div>

            {/* Grocery List */}
            <div className="space-y-6">
              {categories.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg md:text-xl border-b-2 border-emerald-500 pb-2">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        <Checkbox
                          id={`item-${categoryIndex}-${itemIndex}`}
                          checked={item.checked}
                          onCheckedChange={() => handleToggleItem(categoryIndex, itemIndex)}
                          className="mt-0.5 h-5 w-5 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`item-${categoryIndex}-${itemIndex}`}
                          className={`flex-1 cursor-pointer text-sm md:text-base ${
                            item.checked ? 'line-through text-gray-400' : ''
                          }`}
                        >
                          {item.text}
                        </Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Show generator
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Generate Grocery List
              </h1>
              <p className="text-gray-600">
                Select recipes and create your shopping list
              </p>
            </div>

            {/* Week Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Select Week</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weeks.map((weekStart) => {
                      const weekStartISO = formatISODate(weekStart);
                      const weekEnd = addWeeks(weekStart, 1);
                      const isCurrentWeek = weekStartISO === formatISODate(currentWeekStart);

                      return (
                        <SelectItem key={weekStartISO} value={weekStartISO}>
                          {format(weekStart, 'MMM d')} – {format(weekEnd, 'MMM d, yyyy')}
                          {isCurrentWeek && ' (Current)'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Recipe Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base md:text-lg">Recipes</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {recipeSelections.length === 0
                        ? 'No recipes planned'
                        : `${selectedCount} selected`}
                    </p>
                  </div>
                  {recipeSelections.length > 0 && (
                    <Button
                      onClick={handleGenerate}
                      disabled={selectedCount === 0 || isGenerating}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span className="hidden md:inline">Generating...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Generate</span>
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : recipeSelections.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No recipes planned for this week</p>
                    <p className="text-sm text-gray-500">
                      Go to Weekly Planner to add recipes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipeSelections.map((selection) => (
                      <div
                        key={selection.recipe.id}
                        className={`flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-3 md:p-4 border-2 rounded-lg transition-all ${
                          selection.selected
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-gray-200 bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Checkbox
                            id={selection.recipe.id}
                            checked={selection.selected}
                            onCheckedChange={() => handleToggleRecipe(selection.recipe.id)}
                            className="h-5 w-5 mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={selection.recipe.id}
                              className="text-sm md:text-base font-semibold text-gray-900 cursor-pointer block"
                            >
                              {selection.recipe.title}
                            </Label>
                            <p className="text-xs md:text-sm text-gray-600 mt-0.5">
                              Original: {selection.recipe.servings} servings
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-2 py-1.5 md:px-3 md:py-2 self-start md:self-auto">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateServings(selection.recipe.id, -1)}
                            disabled={selection.servings <= 1}
                            className="h-6 w-6 md:h-7 md:w-7"
                          >
                            <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <span className="text-xs md:text-sm font-semibold min-w-[50px] md:min-w-[60px] text-center">
                            {selection.servings} servings
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateServings(selection.recipe.id, 1)}
                            className="h-6 w-6 md:h-7 md:w-7"
                          >
                            <Plus className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
