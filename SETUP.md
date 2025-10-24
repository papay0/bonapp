# BonApp Setup Guide

Welcome to BonApp! This guide will help you set up and run the application locally.

## Prerequisites

- Node.js 18+ installed
- A Clerk account (for authentication)
- A Supabase account (for database)

## 1. Clone and Install

```bash
git clone <your-repo-url>
cd bonapp
npm install
```

## 2. Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for your project to be provisioned
3. Note down your project URL and anon key from the API settings

### Run Database Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL from `supabase/migrations/001_initial_schema.sql`
   - This will create the `users`, `recipes`, and `meal_plans` tables
   - It will also set up Row Level Security (RLS) policies

### Configure Clerk Integration with Supabase

To sync Clerk users with Supabase, you need to configure JWT verification:

1. In Supabase dashboard, go to **Authentication > Providers > Custom**
2. You'll need your Clerk JWT template (see Clerk setup below)
3. Configure the JWT secret in Supabase settings

For detailed instructions, see:
- [Clerk + Supabase Integration Guide](https://clerk.com/docs/integrations/databases/supabase)

## 3. Set Up Clerk

### Create a Clerk Application

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Choose your authentication options (Email, Google, etc.)
3. Get your API keys from the dashboard

### Configure JWT Template (for Supabase sync)

1. In Clerk dashboard, go to **JWT Templates**
2. Create a new template named "supabase"
3. Add the following claims:
```json
{
  "aud": "authenticated",
  "exp": "{{user.created_at}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated"
}
```

## 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your environment variables in `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# Supabase (your credentials are already set)
NEXT_PUBLIC_SUPABASE_URL=https://cceyarmmbilkwqhpdirj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Note:** Your Supabase URL and anon key are already configured. You just need to add your Clerk credentials.

## 5. Create Your First User in Supabase

After setting up Clerk, you need to manually create the first user record in Supabase:

1. Sign up through the app using Clerk
2. Get your Clerk user ID from the Clerk dashboard
3. In Supabase SQL Editor, run:

```sql
INSERT INTO public.users (id) VALUES ('your-clerk-user-id');
```

**Future Enhancement:** You can automate this by setting up a Clerk webhook that creates the user in Supabase automatically.

## 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 7. Test the Application

1. **Landing Page** (`/`): Should display the marketing page
2. **Sign Up** (`/sign-up`): Create a new account
3. **Sign In** (`/sign-in`): Log in with your account
4. **Home** (`/home`): View the weekly meal planner
5. **Recipes** (`/home/recipes`): Manage your recipes
6. **Calendar** (`/home/calendar`): View your meal planning timeline

## Project Structure

```
bonapp/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── recipes/          # Recipe CRUD endpoints
│   │   └── meal-plans/       # Meal plan endpoints
│   ├── home/                 # Main app pages (protected)
│   │   ├── recipes/          # Recipe management
│   │   └── page.tsx          # Weekly planner
│   ├── calendar/             # Calendar timeline view
│   ├── sign-in/              # Clerk sign-in
│   ├── sign-up/              # Clerk sign-up
│   └── page.tsx              # Landing page
├── components/               # React components
│   ├── meal-planner/         # Week view, meal cells
│   └── recipes/              # Recipe cards, editor
├── lib/                      # Utilities and configs
│   ├── brand.ts              # Brand constants
│   ├── supabase/             # Supabase client & types
│   ├── utils/                # Helper functions
│   └── providers/            # React Query provider
└── supabase/                 # Database migrations
    └── migrations/           # SQL schema files
```

## Troubleshooting

### "Unauthorized" errors

- Make sure your Clerk API keys are correct in `.env.local`
- Check that you've created a user record in Supabase with your Clerk user ID

### "Failed to fetch recipes"

- Verify your Supabase URL and anon key are correct
- Check that the database tables were created successfully
- Ensure RLS policies are set up correctly

### TypeScript errors

- Run `npm install` to ensure all dependencies are installed
- Try deleting `.next` folder and rebuilding: `rm -rf .next && npm run dev`

## Next Steps

1. **Add Clerk Webhook**: Automate user creation in Supabase
2. **Deploy to Vercel**: Follow Vercel deployment guide
3. **Add Custom Domain**: Configure bonapp.food
4. **Enhance Features**: Add breakfast support, grocery lists, etc.

## Support

For issues or questions:
- Check the [PRD.md](./PRD.md) for feature specifications
- Review [supabase/README.md](./supabase/README.md) for database schema details
