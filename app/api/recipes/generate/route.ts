import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Schema for the AI-generated recipe
const recipeSchema = z.object({
  title: z.string().describe('The title of the recipe'),
  description: z.string().describe('Detailed recipe instructions in markdown format, including ingredients list, preparation steps, cooking instructions, and tips'),
  tags: z.array(z.string()).describe('Relevant tags for the recipe (e.g., italian, quick, healthy, vegetarian)'),
  servings: z.number().describe('Number of people this recipe serves'),
});

export async function POST(req: Request) {
  try {
    const { prompt, servings } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!servings || typeof servings !== 'number' || servings < 1) {
      return NextResponse.json(
        { error: 'Servings is required and must be a positive number' },
        { status: 400 }
      );
    }

    const servingsCount = servings;

    // Generate structured recipe using AI SDK
    const { object: recipe } = await generateObject({
      model: openai('gpt-4o'),
      schema: recipeSchema,
      prompt: `Generate a detailed recipe for: ${prompt}

The recipe should serve ${servingsCount} people.

Important instructions:
- Write the description in markdown format
- Include a clear ingredients list with quantities for ${servingsCount} people
- Provide step-by-step cooking instructions
- Add helpful tips or variations if relevant
- Use proper markdown formatting (headers with #, lists with -, bold with **)
- Be specific with measurements and cooking times
- Make it easy to follow for home cooks`,
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe. Please try again.' },
      { status: 500 }
    );
  }
}
