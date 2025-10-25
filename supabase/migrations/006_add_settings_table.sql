-- Add user settings table
-- Stores user preferences and configuration options

-- Create settings table
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  breakfast_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add index for faster lookups
CREATE INDEX settings_user_id_idx ON settings(user_id);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings
CREATE POLICY "Users can view their own settings"
  ON settings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own settings"
  ON settings FOR UPDATE
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own settings"
  ON settings FOR DELETE
  USING (auth.uid()::text = user_id);

-- Add function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER settings_updated_at_trigger
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Add comment for clarity
COMMENT ON TABLE settings IS 'User preferences and settings for the application';
COMMENT ON COLUMN settings.breakfast_enabled IS 'Whether to show breakfast in the meal planner (default: false)';
