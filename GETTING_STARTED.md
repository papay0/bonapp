# Getting Started with BonApp

Congratulations! BonApp has been successfully built and is ready to run. Here's what you need to do next:

## ✅ What's Already Done

- ✅ Next.js 16 application set up with TypeScript
- ✅ Clerk authentication configured (credentials added)
- ✅ Supabase database client configured (credentials added)
- ✅ Database schema created (SQL migration files ready)
- ✅ All core pages and components built
- ✅ API routes created for recipes and meal plans
- ✅ Build successfully compiles with no errors
- ✅ Supabase MCP server configured for Claude Code

## 🚀 Next Steps

### 1. Run the Database Migrations

You need to apply the database schema to your Supabase project:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project (URL: `https://cceyarmmbilkwqhpdirj.supabase.co`)
3. Go to **SQL Editor**
4. Copy and run the contents of `supabase/migrations/001_initial_schema.sql`

This will create:
- `users` table
- `recipes` table
- `meal_plans` table
- All necessary indexes and Row Level Security policies

### 2. Start the Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

### 3. Create Your First Account

1. Click "Sign Up" on the landing page
2. Create an account using Clerk
3. After signing up, you'll need to manually add your user to Supabase

**Important:** After creating your account through Clerk, you need to add your user to Supabase:

```sql
-- Get your Clerk user ID from the Clerk dashboard
-- Then run this in Supabase SQL Editor:
INSERT INTO public.users (id) VALUES ('your-clerk-user-id-here');
```

### 4. Start Using BonApp!

Once logged in, you can:

1. **Create Recipes** (`/home/recipes/new`)
   - Add recipe title
   - Write description in Markdown format
   - Add source links
   - Tag recipes for easy searching

2. **Plan Your Week** (`/home`)
   - Navigate through weeks
   - Add recipes to lunch and dinner slots
   - Remove or change meal plans

3. **View Calendar** (`/home/calendar`)
   - See your meal history
   - Browse upcoming weeks
   - Quick jump to any week

## 📝 Environment Variables

Your `.env.local` file is already configured with:

```env
✅ Clerk Publishable Key
✅ Clerk Secret Key
✅ Supabase URL
✅ Supabase Anon Key
❌ Supabase Service Role Key (optional, for admin operations)
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🎨 Key Features to Try

### Recipe Management
- Create recipes with rich Markdown formatting
- Add tags for organization (italian, quick, vegetarian, etc.)
- Include source URLs from your favorite recipe sites
- Edit and delete recipes easily

### Weekly Planning
- Visual grid showing Monday-Sunday
- Separate rows for lunch and dinner
- Click empty cells to add meals
- Click meals to view full recipes
- Remove meals with a single click

### Calendar View
- See all your planned weeks in one place
- Current week is highlighted
- Quick navigation to any week
- See at a glance what meals are planned

## 🐛 Troubleshooting

### "Unauthorized" Errors
- Make sure you've created a user record in Supabase (see step 3 above)
- Verify your Clerk credentials are correct

### "Failed to fetch recipes"
- Check that database migrations have been run
- Verify Supabase credentials in `.env.local`
- Make sure Row Level Security policies are in place

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild: `rm -rf .next && npm run dev`

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[PRD.md](./PRD.md)** - Product requirements and specifications
- **[supabase/README.md](./supabase/README.md)** - Database schema details
- **[README.md](./README.md)** - Project overview

## 🚀 Deploy to Production

When you're ready to deploy:

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

Vercel will automatically detect Next.js and configure everything correctly.

## 🎉 You're Ready!

BonApp is fully functional and ready to help you plan your meals. Start by running the database migrations and creating your first account.

Happy meal planning! 🥗

---

Built with Next.js 16, Clerk, and Supabase
