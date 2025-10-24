'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Trash2, AlertTriangle, Database, RefreshCw, Shield, Lock, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Brand } from '@/lib/brand';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState('');

  // Password protection state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check if already authenticated on mount
  useEffect(() => {
    const authenticated = sessionStorage.getItem('admin_authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setError('Incorrect password. Access denied.');
        setPassword('');
      }
    } catch (error) {
      console.error('Password verification error:', error);
      setError('Failed to verify password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Password protection screen
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-10 text-center">
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
              <p className="text-white/90 text-sm">Enter password to continue</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-base"
                    autoFocus
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {isLoading ? 'Verifying...' : 'Unlock Admin Panel'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin panel (authenticated)
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">
            Database management and maintenance tools
          </p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
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
    </div>
  );
}
