import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET /api/meal-plans?week_start=YYYY-MM-DD - Get meal plans for a specific week
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const weekStart = searchParams.get('week_start');

    let query = supabaseServer
      .from('meal_plans')
      .select('*')
      .eq('user_id', userId);

    if (weekStart) {
      query = query.eq('week_start_date', weekStart);
    }

    const { data: mealPlans, error } = await query.order('day_index', { ascending: true });

    if (error) {
      console.error('Error fetching meal plans:', error);
      return NextResponse.json({ error: 'Failed to fetch meal plans' }, { status: 500 });
    }

    return NextResponse.json(mealPlans);
  } catch (error) {
    console.error('Error in GET /api/meal-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/meal-plans - Create a new meal plan
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { week_start_date, day_index, meal_type, recipe_id, event_id } = body;

    if (
      week_start_date === undefined ||
      day_index === undefined ||
      !meal_type
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Must have either recipe_id OR event_id
    if (!recipe_id && !event_id) {
      return NextResponse.json(
        { error: 'Either recipe_id or event_id is required' },
        { status: 400 }
      );
    }

    // Cannot have both
    if (recipe_id && event_id) {
      return NextResponse.json(
        { error: 'Cannot specify both recipe_id and event_id' },
        { status: 400 }
      );
    }

    // Insert: allow multiple recipes/events per meal slot
    const { data: mealPlan, error } = await (supabaseServer as any)
      .from('meal_plans')
      .insert({
        user_id: userId,
        week_start_date,
        day_index,
        meal_type,
        recipe_id: recipe_id || null,
        event_id: event_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meal plan:', error);
      return NextResponse.json({ error: 'Failed to create meal plan' }, { status: 500 });
    }

    return NextResponse.json(mealPlan, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/meal-plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
