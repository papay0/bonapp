-- Create grocery_lists table
CREATE TABLE IF NOT EXISTS grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  week_start_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON grocery_lists(user_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_grocery_lists_created_at ON grocery_lists(created_at DESC);

-- Add RLS policies
ALTER TABLE grocery_lists ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own grocery lists
CREATE POLICY "Users can read their own grocery lists"
  ON grocery_lists
  FOR SELECT
  USING (user_id = current_setting('app.current_user_id', true));

-- Allow users to insert their own grocery lists
CREATE POLICY "Users can insert their own grocery lists"
  ON grocery_lists
  FOR INSERT
  WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Allow users to update their own grocery lists
CREATE POLICY "Users can update their own grocery lists"
  ON grocery_lists
  FOR UPDATE
  USING (user_id = current_setting('app.current_user_id', true));

-- Allow users to delete their own grocery lists
CREATE POLICY "Users can delete their own grocery lists"
  ON grocery_lists
  FOR DELETE
  USING (user_id = current_setting('app.current_user_id', true));
