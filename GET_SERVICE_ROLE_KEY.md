# How to Get Your Supabase Service Role Key

## What is it?

The **Service Role Key** is a special API key that bypasses Row Level Security (RLS) policies in Supabase. It's used in server-side code (like your API routes) to perform administrative operations.

**⚠️ IMPORTANT**: This key has full access to your database. Never expose it to the client-side or commit it to public repositories!

## Where to Find It

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard/project/cceyarmmbilkwqhpdirj
2. Or navigate to your project from: https://supabase.com/dashboard

### Step 2: Navigate to Project Settings
1. Click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **API** under the Settings menu

### Step 3: Find the Service Role Key
1. Scroll down to the **Project API keys** section
2. Look for **`service_role` key (secret)**
3. Click the **eye icon** to reveal the key
4. Click the **copy icon** to copy it

### Step 4: Add it to .env.local
1. Open `/Users/papay0/Dev/bonapp/.env.local`
2. Replace `your_supabase_service_role_key_here` with your actual key
3. Save the file
4. **Restart your dev server** for the changes to take effect

## Example

Your `.env.local` should look like this:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

(The actual key will be much longer)

## Why Do You Need It?

Your API routes are currently failing with RLS policy errors because they're using the `anon` key which enforces Row Level Security. Since you're already handling authentication with Clerk in your API routes, you need the service role key to bypass RLS and perform database operations directly.

## After Adding the Key

1. Restart your dev server: `npm run dev`
2. Try creating a recipe again
3. The RLS errors should be gone!

## Security Notes

- ✅ DO use in server-side code (API routes)
- ✅ DO keep it in `.env.local` (which is gitignored)
- ❌ DON'T expose it to the client
- ❌ DON'T commit it to version control
- ❌ DON'T share it publicly
