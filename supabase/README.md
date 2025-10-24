# Supabase Setup for BonApp

This directory contains the database schema and migrations for BonApp.

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

3. **Run Migrations**
   - Option A: Use the Supabase SQL Editor
     - Go to your Supabase project dashboard
     - Navigate to SQL Editor
     - Run the contents of `migrations/001_initial_schema.sql`

   - Option B: Use Supabase CLI
     ```bash
     npx supabase db reset
     npx supabase db push
     ```

4. **Configure Clerk Integration**
   - In your Supabase project, configure JWT verification for Clerk
   - Set up the JWT secret in Supabase settings

## Database Schema

### Tables

1. **users**
   - `id` (UUID, Primary Key) - Synced with Clerk user ID
   - `created_at` (Timestamp)

2. **recipes**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users.id)
   - `title` (Text)
   - `description` (Text) - Markdown formatted
   - `links` (JSONB) - Array of recipe source URLs
   - `tags` (Text Array) - Optional tags
   - `created_at` (Timestamp)

3. **meal_plans**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key → users.id)
   - `week_start_date` (Date) - ISO Monday
   - `day_index` (Integer) - 0-6 (Mon-Sun)
   - `meal_type` (Text) - 'lunch' | 'dinner' | 'breakfast'
   - `recipe_id` (UUID, Foreign Key → recipes.id)
   - `created_at` (Timestamp)

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- View their own data
- Insert their own data
- Update their own data
- Delete their own data

## Indexes

Optimized indexes are created for:
- User lookups
- Week-based queries
- Recipe searches
