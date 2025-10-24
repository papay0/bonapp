-- Add support for events (non-recipe meals)
-- Examples: "Lizzie's dinner party", "Running club dinner", "Michael's birthday"
-- Events can be reused just like recipes

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX events_user_id_idx ON events(user_id);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Users can view their own events"
  ON events FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own events"
  ON events FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own events"
  ON events FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own events"
  ON events FOR DELETE
  USING (auth.uid()::text = user_id);

-- Add event_id column to meal_plans
ALTER TABLE meal_plans
ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Make recipe_id nullable (it's either a recipe OR an event)
ALTER TABLE meal_plans
ALTER COLUMN recipe_id DROP NOT NULL;

-- Add constraint: must have either recipe_id OR event_id (but not both)
ALTER TABLE meal_plans
ADD CONSTRAINT meal_plans_recipe_or_event_check
CHECK (
  (recipe_id IS NOT NULL AND event_id IS NULL) OR
  (recipe_id IS NULL AND event_id IS NOT NULL)
);

-- Add comment for clarity
COMMENT ON TABLE events IS 'Reusable events for meal planning (e.g., "Running club dinner", "Dinner at Lizzie''s")';
COMMENT ON COLUMN meal_plans.event_id IS 'References an event. Mutually exclusive with recipe_id.';
