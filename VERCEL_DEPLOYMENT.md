# Vercel Deployment Guide

## The Issue

The build error `"Error: supabaseUrl is required"` occurs because Vercel doesn't have access to your environment variables during the build process.

## Solution: Add Environment Variables to Vercel

### Step 1: Go to Your Vercel Project Settings

1. Open your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**

### Step 2: Add All Required Environment Variables

Add the following environment variables (get the actual values from your `.env.local` file):

#### Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### Clerk URLs (these can be the same for all environments)
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

#### OpenAI (for AI Recipe Generation)
```
OPENAI_API_KEY=sk-...
```

### Step 3: Select Environment Scope

For each variable, you can choose which environments it applies to:
- ✅ **Production** - Required for production deployments
- ✅ **Preview** - Required for preview deployments (PR previews)
- ✅ **Development** - Optional (local development uses `.env.local`)

**Recommendation**: Select all three (Production, Preview, Development) for simplicity.

### Step 4: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**
4. Your build should now succeed!

## How to Get Your Values

### Clerk Keys
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys**
4. Copy the Publishable Key and Secret Key

### Supabase Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - `anon` `public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - `service_role` `secret` key (SUPABASE_SERVICE_ROLE_KEY)

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Create a new secret key or use existing one
4. Copy the key (starts with `sk-`)

## Important Security Notes

- ⚠️ Never commit `.env.local` to Git
- ⚠️ The `service_role` key has admin access - keep it secret
- ⚠️ Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- ⚠️ Keep your OpenAI API key private to avoid unauthorized usage

## Troubleshooting

### Build still fails after adding variables
1. Make sure all variables are spelled correctly (case-sensitive)
2. Ensure there are no spaces before or after the values
3. Try clearing Vercel's cache: **Settings** → **General** → **Clear Cache**

### Variables not taking effect
1. After adding/updating variables, you MUST redeploy
2. Simply pushing new code won't pick up new environment variables

### Different values for different environments
- Use the environment scope selector when adding variables
- You can have different values for Production vs Preview if needed
