'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Recipe } from '@/lib/supabase/types';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to listen to real-time recipe changes from Supabase
 * Automatically updates React Query cache when recipes are created, updated, or deleted
 */
export function useRecipesRealtime() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to all recipe changes for this user
    const channel = supabase
      .channel('recipes-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'recipes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Recipe change detected:', payload);

          // Update the recipes query cache
          queryClient.invalidateQueries({ queryKey: ['recipes'] });

          // If a specific recipe changed, update that cache too
          if (payload.new && 'id' in payload.new) {
            queryClient.invalidateQueries({
              queryKey: ['recipe', (payload.new as Recipe).id]
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);
}
