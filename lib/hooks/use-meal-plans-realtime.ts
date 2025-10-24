'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to listen to real-time meal plan changes from Supabase
 * Automatically updates React Query cache when meal plans are created, updated, or deleted
 */
export function useMealPlansRealtime() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to all meal plan changes for this user
    const channel = supabase
      .channel('meal-plans-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'meal_plans',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Meal plan change detected:', payload);

          // Invalidate all meal plan queries to refetch
          queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
          queryClient.invalidateQueries({ queryKey: ['all-meal-plans'] });
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
