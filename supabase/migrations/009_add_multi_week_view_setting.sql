-- Add multi_week_view column to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS multi_week_view BOOLEAN NOT NULL DEFAULT false;
