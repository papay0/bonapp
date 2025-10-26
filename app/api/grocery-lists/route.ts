import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET all grocery lists for the current user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: groceryLists, error } = await supabaseServer
      .from('grocery_lists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching grocery lists:', error);
      return NextResponse.json({ error: 'Failed to fetch grocery lists' }, { status: 500 });
    }

    return NextResponse.json(groceryLists);
  } catch (error) {
    console.error('Error in GET /api/grocery-lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new grocery list
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, items, week_start_date } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data: groceryList, error } = await supabaseServer
      .from('grocery_lists')
      .insert({
        user_id: userId,
        name,
        items: items || [],
        week_start_date: week_start_date || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating grocery list:', error);
      return NextResponse.json({ error: 'Failed to create grocery list' }, { status: 500 });
    }

    return NextResponse.json(groceryList);
  } catch (error) {
    console.error('Error in POST /api/grocery-lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
