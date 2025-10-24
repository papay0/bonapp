'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Trash2, AlertTriangle, Database, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/lib/brand';
import { useUser } from '@clerk/nextjs';

export default function AdminPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState('');

  // Flush all recipes
  const flushRecipes = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/flush-recipes', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to flush recipes');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      alert('All recipes deleted successfully');
      setConfirmDelete('');
    },
  });

  // Flush all meal plans
  const flushMealPlans = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/flush-meal-plans', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to flush meal plans');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      alert('All meal plans deleted successfully');
      setConfirmDelete('');
    },
  });

  // Flush everything
  const flushAll = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/flush-all', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to flush database');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      alert('Database flushed successfully');
      setConfirmDelete('');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-gray-900">{Brand.name}</span>
            </Link>
            <Link
              href="/home"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Database management and maintenance tools
          </p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current User</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">User ID:</span>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{user?.id}</code>
            </p>
            <p className="text-sm">
              <span className="font-medium">Email:</span> {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>

        {/* Database Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Database className="h-6 w-6 text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Database Actions</h2>
          </div>

          <div className="space-y-4">
            {/* Flush Recipes */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Delete All Recipes</h3>
                  <p className="text-sm text-gray-600">
                    Permanently delete all your recipes. Meal plans using these recipes will also be deleted.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all recipes? This cannot be undone.')) {
                      flushRecipes.mutate();
                    }
                  }}
                  disabled={flushRecipes.isPending}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {flushRecipes.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {/* Flush Meal Plans */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Delete All Meal Plans</h3>
                  <p className="text-sm text-gray-600">
                    Permanently delete all your meal plans. Your recipes will not be affected.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all meal plans? This cannot be undone.')) {
                      flushMealPlans.mutate();
                    }
                  }}
                  disabled={flushMealPlans.isPending}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {flushMealPlans.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {/* Flush Everything */}
            <div className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">⚠️ Flush Entire Database</h3>
                  <p className="text-sm text-red-700 mb-3">
                    <strong>DANGER:</strong> This will delete ALL your data including recipes and meal plans. This action cannot be undone!
                  </p>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Type "DELETE EVERYTHING" to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.value)}
                      placeholder="DELETE EVERYTHING"
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => flushAll.mutate()}
                disabled={confirmDelete !== 'DELETE EVERYTHING' || flushAll.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                <Trash2 className="h-5 w-5" />
                {flushAll.isPending ? 'Flushing Database...' : 'Flush Entire Database'}
              </button>
            </div>

            {/* Refresh Cache */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Refresh Cache</h3>
                  <p className="text-sm text-gray-600">
                    Clear React Query cache and refetch all data
                  </p>
                </div>
                <button
                  onClick={() => {
                    queryClient.invalidateQueries();
                    alert('Cache refreshed');
                  }}
                  className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
