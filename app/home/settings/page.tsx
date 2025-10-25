'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings as SettingsIcon, Coffee } from 'lucide-react';

type Settings = {
  id: string;
  user_id: string;
  breakfast_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleBreakfastToggle = (enabled: boolean) => {
    updateSettings.mutate({ breakfast_enabled: enabled });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 space-y-4 md:space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600">Customize your meal planning experience</p>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 space-y-4 md:space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
          <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600">Customize your meal planning experience</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-amber-600" />
            Meal Planning
          </CardTitle>
          <CardDescription>
            Configure which meals appear in your weekly planner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="breakfast-toggle" className="text-base font-medium">
                Show breakfast
              </Label>
              <p className="text-sm text-gray-500">
                Enable this to include breakfast in your weekly meal planner alongside lunch and dinner
              </p>
            </div>
            <Switch
              id="breakfast-toggle"
              checked={settings?.breakfast_enabled ?? false}
              onCheckedChange={handleBreakfastToggle}
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
