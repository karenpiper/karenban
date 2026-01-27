# Update Vercel Environment Variables

Your Vercel environment variables are currently pointing to a paused/non-recoverable Supabase database. You need to update them to point to your active database.

## Steps to Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your **karenban** project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** → **Environment Variables**

3. **Update the Variables**

   You need to update these two variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://lwkctkpqtzctvxfydmxu.supabase.co`
   - Environments: Select all (Production, Preview, Development)

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Get this from your Supabase dashboard:
     1. Go to https://supabase.com/dashboard/project/lwkctkpqtzctvxfydmxu
     2. Click **Settings** → **API**
     3. Copy the **anon public** key (starts with `eyJ`)
   - Environments: Select all (Production, Preview, Development)

4. **Optional - Update DATABASE_URL (if you have it)**
   - Name: `DATABASE_URL`
   - Value: `postgresql://postgres:wherewereyou03072015?@db.lwkctkpqtzctvxfydmxu.supabase.co:5432/postgres`
   - Environments: Select all (Production, Preview, Development)

5. **Redeploy**
   - After updating the variables, you'll need to trigger a new deployment
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment, or push a new commit

## For Local Development

You'll also want to create a `.env.local` file locally with the same values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lwkctkpqtzctvxfydmxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

This ensures your local development environment matches production.

## Verify the Setup

After updating:
1. Check that your Supabase project `lwkctkpqtzctvxfydmxu` is active (not paused)
2. Make sure you've created the database tables (run `lib/supabase/schema.sql` in Supabase SQL Editor)
3. Test by making a change in your app and checking if it persists
