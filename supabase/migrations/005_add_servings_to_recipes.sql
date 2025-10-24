-- Add servings column to recipes table
-- This allows tracking how many people each recipe serves

-- Add servings column with default value of 4
ALTER TABLE public.recipes
ADD COLUMN servings INTEGER DEFAULT 4 NOT NULL;

-- Add a check constraint to ensure servings is positive
ALTER TABLE public.recipes
ADD CONSTRAINT recipes_servings_positive CHECK (servings > 0);

COMMENT ON COLUMN public.recipes.servings IS 'Number of people this recipe serves';
