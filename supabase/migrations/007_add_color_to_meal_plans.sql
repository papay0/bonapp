-- Add color column to meal_plans table for color-coding recipes and events
ALTER TABLE meal_plans
ADD COLUMN color VARCHAR(20);

-- Add comment
COMMENT ON COLUMN meal_plans.color IS 'Optional color for visual grouping (e.g., red, orange, yellow, green, blue, purple, brown)';
