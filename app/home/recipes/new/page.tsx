'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarkdownEditor } from '@/components/recipes/markdown-editor';
import { Save, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewRecipePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [servings, setServings] = useState<number>(0);

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiServings, setAiServings] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const createRecipe = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      links: { url: string }[];
      tags: string[];
      servings: number;
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

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          servings: aiServings
        }),
      });

      if (!res.ok) throw new Error('Failed to generate recipe');

      const generatedRecipe = await res.json();

      // Auto-fill the form with AI-generated data
      setTitle(generatedRecipe.title);
      setDescription(generatedRecipe.description);
      setTags(generatedRecipe.tags.join(', '));
      setServings(generatedRecipe.servings);

      // Clear AI prompt
      setAiPrompt('');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
      servings,
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Recipe</h1>

      {/* AI Recipe Generator Card */}
      <Card className="mb-8 border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="h-5 w-5" />
            AI Recipe Generator
          </CardTitle>
          <CardDescription>
            Let AI create a recipe for you. Describe what you want and we'll generate the full recipe instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="ai-prompt">What recipe do you want?</Label>
              <Input
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., carbonara pasta, chocolate cake, vegetarian curry..."
                className="mt-1.5"
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="ai-servings">Number of servings</Label>
              <Input
                id="ai-servings"
                type="number"
                min="1"
                max="20"
                value={aiServings}
                onChange={(e) => setAiServings(parseInt(e.target.value))}
                className="mt-1.5"
                disabled={isGenerating}
              />
            </div>
          </div>
          <Button
            onClick={handleAiGenerate}
            disabled={isGenerating || !aiPrompt.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Recipe...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Recipe with AI
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recipe Form */}
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

        {/* Servings */}
        <div>
          <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Servings *
          </label>
          <input
            type="number"
            id="servings"
            min="1"
            max="20"
            value={servings}
            onChange={(e) => setServings(parseInt(e.target.value))}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            How many people does this recipe serve?
          </p>
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
