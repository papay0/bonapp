'use client';

import { Recipe } from '@/lib/supabase/types';
import { ExternalLink, Tag, Users } from 'lucide-react';
import Link from 'next/link';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const links = Array.isArray(recipe.links) ? recipe.links : [];

  return (
    <Link
      href={`/home/recipes/${recipe.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg hover:border-emerald-300 transition-all group"
    >
      <div className="flex flex-col gap-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>

        {/* Description Preview */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {recipe.description.split('\n')[0].replace(/^#+ /, '')}
        </p>

        {/* Servings */}
        <div className="flex items-center gap-1.5 text-sm text-amber-700">
          <Users className="h-4 w-4" />
          <span>Serves {recipe.servings}</span>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {links.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ExternalLink className="h-3 w-3" />
            <span>{links.length} source link{links.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-400">
          Created {new Date(recipe.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}
