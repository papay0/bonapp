-- Fix user_id type to TEXT instead of UUID for Clerk compatibility
-- Clerk user IDs are strings like "user_34UPKCGKI5sMjE5yHKGF121d6Gg", not UUIDs

-- Step 1: Drop all RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can view their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can insert their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can view their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can insert their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON public.meal_plans;

-- Step 2: Drop foreign key constraints
ALTER TABLE public.recipes DROP CONSTRAINT IF EXISTS recipes_user_id_fkey;
ALTER TABLE public.meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_fkey;

-- Step 3: Change column types to TEXT
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.recipes ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE public.meal_plans ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Re-add foreign key constraints
ALTER TABLE public.recipes
  ADD CONSTRAINT recipes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.meal_plans
  ADD CONSTRAINT meal_plans_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Step 5: Recreate RLS policies with TEXT-compatible auth checks
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = id);

CREATE POLICY "Users can view their own recipes"
  ON public.recipes FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can view their own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.jwt() ->> 'sub' = user_id);
