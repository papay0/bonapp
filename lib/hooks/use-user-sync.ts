'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to automatically sync the logged-in user to Supabase
 * Runs on every page load/refresh to update last_connected_at
 */
export function useUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user to Supabase
      fetch('/api/sync-user', {
        method: 'POST',
      }).catch((error) => {
        console.error('Failed to sync user:', error);
      });
    }
  }, [isLoaded, user]);
}
