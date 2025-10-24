import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// POST /api/sync-user - Sync authenticated user to Supabase
export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Upsert user: insert if new, update last_connected_at if exists
    const { data, error } = await (supabaseServer as any)
      .from('users')
      .upsert(
        {
          id: userId,
          last_connected_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error syncing user:', error);
      return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error) {
    console.error('Error in POST /api/sync-user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
