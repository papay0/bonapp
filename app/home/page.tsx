'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WeekView } from '@/components/meal-planner/week-view';
import { MealType, Recipe, MealPlan, Event } from '@/lib/supabase/types';
import { getWeekStart, formatISODate } from '@/lib/utils/date';
import { addWeeks } from 'date-fns';
import { ChefHat, Calendar, X, Search, Users, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
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
import { Skeleton } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function HomePage() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<{
    dayIndex: number;
    mealType: MealType;
  } | null>(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState<'recipe' | 'event'>('recipe');
  const [eventSearchQuery, setEventSearchQuery] = useState('');
  const [newEventName, setNewEventName] = useState('');

  const queryClient = useQueryClient();
  const weekStartISO = formatISODate(currentWeek);

  // Fetch recipes
  const { data: recipes = [], isLoading: isLoadingRecipes } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });

  // Fetch events
  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
  });

  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery<{
    id: string;
    user_id: string;
    breakfast_enabled: boolean;
    created_at: string;
    updated_at: string;
  }>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  // Fetch meal plans for current week
  const { data: mealPlans = [], isLoading: isLoadingMealPlans } = useQuery<MealPlan[]>({
    queryKey: ['meal-plans', weekStartISO],
    queryFn: async () => {
      const res = await fetch(`/api/meal-plans?week_start=${weekStartISO}`);
      if (!res.ok) throw new Error('Failed to fetch meal plans');
      return res.json();
    },
  });

  const isLoading = isLoadingRecipes || isLoadingEvents || isLoadingMealPlans || isLoadingSettings;

  // Add meal plan mutation
  const addMealPlan = useMutation({
    mutationFn: async (data: {
      week_start_date: string;
      day_index: number;
      meal_type: MealType;
      recipe_id?: string;
      event_id?: string;
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
      setSelectionMode('recipe');
      setRecipeSearchQuery('');
      setEventSearchQuery('');
      setNewEventName('');
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

  // Create event mutation
  const createEvent = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to create event');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
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

  const handleSelectEvent = (eventId: string) => {
    if (selectedRecipeModal) {
      addMealPlan.mutate({
        week_start_date: weekStartISO,
        day_index: selectedRecipeModal.dayIndex,
        meal_type: selectedRecipeModal.mealType,
        event_id: eventId,
      });
    }
  };

  const handleCreateAndSelectEvent = async () => {
    if (!newEventName.trim() || !selectedRecipeModal) return;

    try {
      const event = await createEvent.mutateAsync(newEventName.trim());
      // After creating the event, add it to the meal plan
      addMealPlan.mutate({
        week_start_date: weekStartISO,
        day_index: selectedRecipeModal.dayIndex,
        meal_type: selectedRecipeModal.mealType,
        event_id: event.id,
      });
    } catch (error) {
      console.error('Failed to create and select event:', error);
    }
  };

  const handleRemoveMeal = (mealPlanId: string) => {
    removeMealPlan.mutate(mealPlanId);
  };

  const handleViewRecipe = (recipeId: string) => {
    router.push(`/home/recipes/${recipeId}`);
  };

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter((recipe) => {
    if (!recipeSearchQuery.trim()) return true;

    const searchLower = recipeSearchQuery.toLowerCase();
    const matchesTitle = recipe.title.toLowerCase().includes(searchLower);
    const matchesDescription = recipe.description?.toLowerCase().includes(searchLower);
    const matchesTags = recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower));

    return matchesTitle || matchesDescription || matchesTags;
  });

  // Filter events based on search query
  const filteredEvents = events.filter((event) => {
    if (!eventSearchQuery.trim()) return true;
    return event.name.toLowerCase().includes(eventSearchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <>
        {/* Floating Action Button (Mobile Only) */}
        <Link
          href="/home/recipes/new"
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        >
          <ChefHat className="h-6 w-6 group-hover:rotate-12 transition-transform" />
        </Link>

        <div className="px-4 space-y-3 md:space-y-4">
          {/* Week Navigator - Loading */}
          <Card className="p-2 md:p-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-0 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="flex items-center justify-between gap-2 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 md:h-10 md:w-10 text-white"
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Skeleton className="h-4 md:h-5 w-48 md:w-64 bg-white/20" />
              <Button
                variant="ghost"
                size="icon"
                disabled
                className="h-8 w-8 md:h-10 md:w-10 text-white"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </Card>

          {/* Meal Planner Table - Loading */}
          <Card className="overflow-hidden shadow-md md:shadow-lg border border-gray-200 md:border-2 p-0">
            <div className="overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-emerald-100 to-amber-100 hover:from-emerald-100 hover:to-amber-100 border-b-2 border-gray-300">
                    <TableHead className="w-[60px] h-10 md:h-12 font-bold text-gray-900 border-r-2 border-gray-300 text-center align-middle text-[11px]">
                      Meal
                    </TableHead>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <TableHead key={day} className="h-10 md:h-12 text-center font-bold text-gray-900 border-r-2 last:border-r-0 border-gray-300 align-middle p-0.5">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-[11px] font-bold">{day}</span>
                          <Skeleton className="h-2 w-10 mt-0.5 bg-gray-300" />
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['lunch', 'dinner'].map((mealType) => (
                    <TableRow
                      key={mealType}
                      className="hover:bg-gray-50/50 border-b-2 last:border-b-0 border-gray-200"
                    >
                      <TableCell className="font-bold text-gray-700 capitalize bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-300 text-center align-middle p-0 text-[11px]">
                        {mealType}
                      </TableCell>
                      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                        <TableCell
                          key={`${mealType}-${dayIndex}`}
                          className="p-1 border-r-2 last:border-r-0 border-gray-300 align-middle"
                        >
                          <div className="w-full min-h-[80px] flex items-center justify-center">
                            <Skeleton className="h-[60px] w-full rounded-md" />
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Floating Action Button (Mobile Only) */}
      <Link
        href="/home/recipes/new"
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center group"
      >
        <ChefHat className="h-6 w-6 group-hover:rotate-12 transition-transform" />
      </Link>

      <div className="px-4 space-y-3 md:space-y-4">
        {/* Week View */}
        <WeekView
          weekStartDate={currentWeek}
          mealPlans={mealPlans}
          recipes={recipes}
          events={events}
          breakfastEnabled={settings?.breakfast_enabled ?? false}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onAddMeal={handleAddMeal}
          onRemoveMeal={handleRemoveMeal}
          onViewRecipe={handleViewRecipe}
        />

      {/* Recipe/Event Selection Modal */}
      <Dialog open={!!selectedRecipeModal} onOpenChange={(open) => {
        if (!open) {
          setSelectedRecipeModal(null);
          setSelectionMode('recipe');
          setRecipeSearchQuery('');
          setEventSearchQuery('');
          setNewEventName('');
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <DialogTitle className="text-xl md:text-2xl font-bold">
                  {selectionMode === 'recipe' ? 'Select a Recipe' : 'Select an Event'}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  {selectionMode === 'recipe'
                    ? 'Choose a recipe to add to your meal plan'
                    : 'Choose or create an event to add to your meal plan'}
                </DialogDescription>
              </div>
              <SegmentedControl
                options={[
                  { value: 'recipe', label: 'Recipe', icon: <ChefHat className="h-4 w-4" /> },
                  { value: 'event', label: 'Event', icon: <Calendar className="h-4 w-4" /> },
                ]}
                value={selectionMode}
                onValueChange={(value) => setSelectionMode(value as 'recipe' | 'event')}
                className="flex-shrink-0"
              />
            </div>
            {selectionMode === 'recipe' && recipes.length > 0 && (
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
            {selectionMode === 'event' && events.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={eventSearchQuery}
                  onChange={(e) => setEventSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto px-6">
            {selectionMode === 'recipe' ? (
              // Recipe list
              recipes.length === 0 ? (
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
                <div className="grid gap-2.5 py-3">
                  {filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe.id)}
                      className="text-left p-3 border-2 border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                    >
                      <h3 className="font-semibold text-gray-900 text-base group-hover:text-emerald-700 transition-colors">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 mt-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>Serves {recipe.servings}</span>
                      </div>
                      {recipe.description && (
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">
                          {recipe.description.substring(0, 100)}...
                        </p>
                      )}
                      {recipe.tags && recipe.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {recipe.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {recipe.tags.length > 3 && (
                            <span className="text-xs px-2 py-0.5 text-gray-500">
                              +{recipe.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )
            ) : (
              // Event list
              <div className="py-3 space-y-3">
                {/* Quick-add new event */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-gray-50/50">
                  <label htmlFor="new-event" className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Create a new event
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="new-event"
                      placeholder="e.g., Running club dinner, Lizzie's party..."
                      value={newEventName}
                      onChange={(e) => setNewEventName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleCreateAndSelectEvent();
                        }
                      }}
                      className="flex-1 text-sm"
                    />
                    <Button
                      onClick={handleCreateAndSelectEvent}
                      disabled={!newEventName.trim() || createEvent.isPending}
                      className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {/* Existing events */}
                {events.length === 0 ? (
                  <div className="text-center py-6">
                    <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-xs">No events yet. Create your first event above!</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-6">
                    <Search className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-xs font-semibold">No events found</p>
                    <p className="text-gray-500 text-xs mt-0.5">Try adjusting your search</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Select an existing event</h4>
                    <div className="grid gap-2">
                      {filteredEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleSelectEvent(event.id)}
                          className="text-left p-2.5 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                              {event.name}
                            </h3>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <div className="px-6 py-4 border-t bg-gray-50 flex-shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRecipeModal(null);
                setSelectionMode('recipe');
                setRecipeSearchQuery('');
                setEventSearchQuery('');
                setNewEventName('');
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
