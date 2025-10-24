'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownEditor } from '@/components/recipes/markdown-editor';
import { Save } from 'lucide-react';
import Link from 'next/link';

export default function NewRecipePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const createRecipe = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      links: { url: string }[];
      tags: string[];
    }) => {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create recipe');
      return res.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch recipes list
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
      router.push('/home/recipes');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse links (newline separated URLs)
    const parsedLinks = links
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .map((url) => ({ url }));

    // Parse tags (comma separated)
    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    createRecipe.mutate({
      title,
      description,
      links: parsedLinks,
      tags: parsedTags,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Recipe</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Classic Spaghetti Carbonara"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Description (Markdown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder="Write your recipe in Markdown format..."
              />
            </div>

            {/* Links */}
            <div>
              <label htmlFor="links" className="block text-sm font-medium text-gray-700 mb-2">
                Source Links (optional)
              </label>
              <textarea
                id="links"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="https://example.com/recipe&#10;https://another-source.com"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                One URL per line
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="italian, pasta, quick, dinner"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Comma-separated tags
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createRecipe.isPending || !title || !description}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-5 w-5" />
                {createRecipe.isPending ? 'Creating...' : 'Create Recipe'}
              </button>
              <Link
                href="/home/recipes"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {createRecipe.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                Failed to create recipe. Please try again.
              </div>
            )}
          </form>
    </div>
  );
}
