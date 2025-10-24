'use client';

import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Recipe } from '@/lib/supabase/types';
import { MarkdownEditor } from '@/components/recipes/markdown-editor';
import { Save, Trash2, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [servings, setServings] = useState<number>(0);

  // Fetch recipe
  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: ['recipe', id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${id}`);
      if (!res.ok) throw new Error('Failed to fetch recipe');
      return res.json();
    },
    enabled: !!id,
  });

  // Initialize form when recipe loads
  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setDescription(recipe.description);
      const linksArray = recipe.links as Array<{ url: string }> | null;
      setLinks(
        Array.isArray(linksArray)
          ? linksArray.map((l) => l.url).join('\n')
          : ''
      );
      setTags(recipe.tags ? recipe.tags.join(', ') : '');
      setServings(recipe.servings);
    }
  }, [recipe]);

  // Update recipe mutation
  const updateRecipe = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      links: { url: string }[];
      tags: string[];
      servings: number;
    }) => {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setActiveTab('view');
    },
  });

  // Delete recipe mutation
  const deleteRecipe = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete recipe');
      return res.json();
    },
    onSuccess: async () => {
      // Invalidate recipes list before redirecting
      await queryClient.invalidateQueries({ queryKey: ['recipes'] });
      router.push('/home/recipes');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Parse links
    const parsedLinks = links
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .map((url) => ({ url }));

    // Parse tags
    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    updateRecipe.mutate({
      title,
      description,
      links: parsedLinks,
      tags: parsedTags,
      servings,
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      deleteRecipe.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header Section - Loading */}
        <div className="mb-8">
          {/* Title and Delete Button */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-24" />
          </div>

          {/* Metadata */}
          <div className="space-y-3 mb-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8 justify-center md:justify-start">
              <Skeleton className="h-12 w-16" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </div>

        {/* Content Section - Loading */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="pt-4">
              <Skeleton className="h-6 w-40 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="pt-4">
              <Skeleton className="h-6 w-32 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Recipe not found</h2>
          <Link
            href="/home/recipes"
            className="text-emerald-600 hover:text-emerald-700"
          >
            Back to Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        {/* Title and Delete Button */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">{recipe.title}</h1>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteRecipe.isPending}
            className="shrink-0"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        {/* Metadata */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-amber-300 bg-amber-50 text-amber-700">
              <Users className="h-4 w-4" />
              Serves {recipe.servings} {recipe.servings === 1 ? 'person' : 'people'}
            </Badge>
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} className="bg-emerald-100 text-emerald-700 border-emerald-300 px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8 justify-center md:justify-start">
            <button
              onClick={() => setActiveTab('view')}
              className={`pb-4 px-4 font-semibold text-base transition-all border-b-2 ${
                activeTab === 'view'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-emerald-600 hover:border-gray-300'
              }`}
            >
              View
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`pb-4 px-4 font-semibold text-base transition-all border-b-2 ${
                activeTab === 'edit'
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-500 border-transparent hover:text-emerald-600 hover:border-gray-300'
              }`}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === 'view' ? (
          <div className="space-y-6">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-emerald-600">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-5 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  h4: ({node, ...props}) => <h4 className="text-lg font-bold mt-3 mb-2" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="ml-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                  em: ({node, ...props}) => <em className="italic" {...props} />,
                  code: ({node, inline, ...props}: any) =>
                    inline
                      ? <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                      : <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />,
                }}
              >
                {recipe.description}
              </ReactMarkdown>
            </div>

            {(() => {
              const linksArray = recipe.links as Array<{ url: string }> | null;
              return Array.isArray(linksArray) && linksArray.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-900">Source Links</h3>
                    <div className="space-y-2">
                      {linksArray.map((link, index: number) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {link.url}
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Recipe Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter recipe title"
              />
            </div>

            {/* Servings */}
            <div className="space-y-2">
              <Label htmlFor="servings">Number of Servings *</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="20"
                value={servings || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setServings(isNaN(val) ? 0 : val);
                }}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description *</Label>
              <MarkdownEditor value={description} onChange={setDescription} />
            </div>

            {/* Links */}
            <div className="space-y-2">
              <Label htmlFor="links">Source Links (one per line)</Label>
              <Textarea
                id="links"
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                rows={3}
                placeholder="https://example.com/recipe&#10;https://another-source.com"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="vegetarian, quick, healthy"
              />
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updateRecipe.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateRecipe.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('view')}
              >
                Cancel
              </Button>
            </div>

            {updateRecipe.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to update recipe. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
