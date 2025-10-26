import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabase/server';
import { z } from 'zod';

export const maxDuration = 30;

// Schema for grocery list structure
const groceryListSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().describe('Category name like Produce, Meat/Protein, Dairy, etc.'),
      items: z.array(
        z.object({
          text: z.string().describe('The grocery item with quantity'),
          checked: z.boolean().describe('Whether the item is checked off').default(false),
        })
      ),
    })
  ),
});

interface RecipeInput {
  id: string;
  servings: number;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipes: recipeInputs } = await req.json() as { recipes: RecipeInput[] };

    if (!recipeInputs || !Array.isArray(recipeInputs) || recipeInputs.length === 0) {
      return NextResponse.json(
        { error: 'Recipes array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Fetch full recipe details from database
    const { data: recipes, error: fetchError } = await supabaseServer
      .from('recipes')
      .select('*')
      .in('id', recipeInputs.map(r => r.id));

    if (fetchError) {
      console.error('Error fetching recipes:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch recipes' },
        { status: 500 }
      );
    }

    if (!recipes || recipes.length === 0) {
      return NextResponse.json(
        { error: 'No recipes found' },
        { status: 404 }
      );
    }

    // Build the prompt with all recipe information
    const recipeDetails = recipes.map((recipe) => {
      const input = recipeInputs.find(r => r.id === recipe.id);
      const servingsMultiplier = input ? input.servings / recipe.servings : 1;

      return `
Recipe: ${recipe.title}
Original Servings: ${recipe.servings}
Requested Servings: ${input?.servings || recipe.servings}
Servings Multiplier: ${servingsMultiplier}x

Full Recipe Details:
${recipe.description}

---`;
    }).join('\n\n');

    // Generate grocery list using AI
    const { object: groceryListData } = await generateObject({
      model: openai('gpt-4o'),
      schema: groceryListSchema,
      prompt: `You are a helpful cooking assistant. Based on the following recipes and their requested servings, generate a consolidated grocery list.

${recipeDetails}

Instructions:
- Combine ingredients from all recipes
- Adjust quantities based on the servings multiplier for each recipe
- If the same ingredient appears in multiple recipes, sum the quantities and combine them into one item
- Group items by category (Produce, Meat/Protein, Dairy, Pantry, Spices, etc.)
- Use clear, standard measurements (cups, tablespoons, grams, etc.)
- Be specific with quantities (e.g., "3 medium tomatoes" or "500g ground beef")
- Order categories logically (Produce, Meat/Protein, Dairy, Pantry, Spices)
- Each item should have "checked" set to false by default
- Make it practical for shopping

Example structure:
{
  "categories": [
    {
      "name": "Produce",
      "items": [
        { "text": "3 medium tomatoes", "checked": false },
        { "text": "2 onions", "checked": false }
      ]
    },
    {
      "name": "Dairy",
      "items": [
        { "text": "500ml milk", "checked": false }
      ]
    }
  ]
}

Generate a comprehensive grocery list now:`,
    });

    return NextResponse.json({ categories: groceryListData.categories });
  } catch (error) {
    console.error('Grocery list generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate grocery list. Please try again.' },
      { status: 500 }
    );
  }
}
