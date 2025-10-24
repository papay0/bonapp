'use client';

import { useQuery } from '@tanstack/react-query';
import { Recipe } from '@/lib/supabase/types';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Plus, ChefHat } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/lib/brand';
import { UserButton } from '@clerk/nextjs';

export default function RecipesPage() {
  const { data: recipes = [], isLoading } = useQuery<Recipe[]>({
    queryKey: ['recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes');
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Recipes</h1>
          <p className="text-gray-600">
            Create and manage your recipe collection
          </p>
        </div>
        <Link
          href="/home/recipes/new"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Recipe
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="text-gray-600">Loading recipes...</div>
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-4">
            <ChefHat className="h-16 w-16 text-gray-300 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No recipes yet
          </h2>
          <p className="text-gray-600 mb-6">
            Create your first recipe to start planning your meals
          </p>
          <Link
            href="/home/recipes/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Your First Recipe
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </>
  );
}
