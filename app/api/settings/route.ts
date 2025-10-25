import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET /api/settings - Get settings for the authenticated user (auto-creates if doesn't exist)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to fetch existing settings
    let { data: settings, error } = await supabaseServer
      .from('settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    // If settings don't exist, create default settings
    if (error && error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await (supabaseServer as any)
        .from('settings')
        .insert({
          user_id: userId,
          breakfast_enabled: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating settings:', createError);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }

      settings = newSettings;
    } else if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in GET /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/settings - Update settings for the authenticated user
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { breakfast_enabled } = body;

    const updates: any = {};
    if (breakfast_enabled !== undefined) updates.breakfast_enabled = breakfast_enabled;

    const { data: settings, error } = await (supabaseServer as any)
      .from('settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error in PATCH /api/settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
