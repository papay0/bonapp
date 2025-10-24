-- Allow multiple recipes per meal slot
-- This migration removes the unique constraint on (user_id, week_start_date, day_index, meal_type)
-- to allow users to add multiple recipes to a single meal slot

-- Drop the unique constraint
ALTER TABLE public.meal_plans
DROP CONSTRAINT IF EXISTS meal_plans_user_id_week_start_date_day_index_meal_type_key;

-- Add an index to maintain query performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_day_meal
  ON public.meal_plans(user_id, week_start_date, day_index, meal_type);

COMMENT ON TABLE public.meal_plans IS 'Weekly meal planning assignments - supports multiple recipes per meal slot';
