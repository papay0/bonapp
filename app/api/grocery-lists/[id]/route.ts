import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET a specific grocery list
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const { data: groceryList, error } = await supabaseServer
      .from('grocery_lists')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching grocery list:', error);
      return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 });
    }

    if (!groceryList) {
      return NextResponse.json({ error: 'Grocery list not found' }, { status: 404 });
    }

    return NextResponse.json(groceryList);
  } catch (error) {
    console.error('Error in GET /api/grocery-lists/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update a grocery list
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { name, items } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (items !== undefined) updateData.items = items;

    const { data: groceryList, error } = await supabaseServer
      .from('grocery_lists')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating grocery list:', error);
      return NextResponse.json({ error: 'Failed to update grocery list' }, { status: 500 });
    }

    return NextResponse.json(groceryList);
  } catch (error) {
    console.error('Error in PATCH /api/grocery-lists/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE a grocery list
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('grocery_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting grocery list:', error);
      return NextResponse.json({ error: 'Failed to delete grocery list' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/grocery-lists/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
