-- Add last_connected_at field to users table

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_connected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Update existing users to have the current timestamp
UPDATE public.users SET last_connected_at = created_at WHERE last_connected_at IS NULL;

-- Add comment
COMMENT ON COLUMN public.users.last_connected_at IS 'Timestamp of user last connection/activity';
