# Supabase Setup Instructions

## Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

## Step 2: Create .env.local File

Create a `.env.local` file in the root of your project (`/Users/karenpiper/karenban/karenban/.env.local`) with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lwkctkpqtzctvxfydmxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database URL for direct PostgreSQL connection (optional, for Prisma)
DATABASE_URL=postgresql://postgres:wherewereyou03072015?@db.lwkctkpqtzctvxfydmxu.supabase.co:5432/postgres
```

**Important**: Get your `NEXT_PUBLIC_SUPABASE_ANON_KEY` from:
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (karenban)
3. Go to **Settings** → **API**
4. Copy the **anon public** key (starts with `eyJ`)

## Step 3: Create Database Tables

1. Go to your Supabase dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `lib/supabase/schema.sql`
5. Click **Run** to execute the SQL

This will create all the necessary tables for your application.

## Step 4: Migrate Existing Data (Optional)

If you have existing data in localStorage, you can migrate it:

1. The app will automatically try to load from Supabase
2. If no data exists in Supabase, it will fall back to localStorage
3. Once data is saved to Supabase, it will use Supabase going forward

## Step 5: Update Your Code

The main page (`app/page.tsx`) has been updated to use Supabase. The app will:
- Try to load from Supabase first
- Fall back to localStorage if Supabase is not configured
- Save to Supabase when changes are made

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has the correct values
- Restart your development server after creating/updating `.env.local`

### "Table doesn't exist"
- Make sure you've run the SQL schema in Step 3
- Check the Supabase dashboard → Table Editor to verify tables exist

### "Invalid API key"
- Verify your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Make sure you're using the **anon public** key, not the service role key
