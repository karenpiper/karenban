# Supabase Setup - Next Steps

## ✅ What's Been Done

1. ✅ Created Supabase client configuration (`lib/supabase/client.ts`)
2. ✅ Created database schema SQL file (`lib/supabase/schema.sql`)
3. ✅ Created database helper functions (`lib/supabase/db.ts`)
4. ✅ Updated `data/seed.ts` to use Supabase with localStorage fallback
5. ✅ Updated `app/page.tsx` to load data asynchronously from Supabase

## 📋 What You Need to Do

### Step 1: Install Supabase Package

Run one of these commands in your project directory:

```bash
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

### Step 2: Create .env.local File

Create a file named `.env.local` in `/Users/karenpiper/karenban/karenban/.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lwkctkpqtzctvxfydmxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Database URL for direct PostgreSQL connection (optional)
DATABASE_URL=postgresql://postgres:wherewereyou03072015?@db.lwkctkpqtzctvxfydmxu.supabase.co:5432/postgres
```

**Important**: Get your `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
1. Go to https://supabase.com/dashboard
2. Select your **karenban** project
3. Go to **Settings** → **API**
4. Copy the **anon public** key (starts with `eyJ`)
5. Paste it in `.env.local` replacing `your_anon_key_here`

### Step 3: Create Database Tables

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/lwkctkpqtzctvxfydmxu
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `lib/supabase/schema.sql` and copy all its contents
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

This creates all the tables your app needs.

### Step 4: Restart Your Development Server

After creating `.env.local`, restart your Next.js dev server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## 🔄 How It Works

- **On Load**: The app tries to load from Supabase first. If Supabase isn't configured or fails, it falls back to localStorage.
- **On Save**: The app saves to Supabase first, then also saves to localStorage as a backup.
- **Migration**: If you have existing data in localStorage, it will continue to work. Once Supabase is set up, new saves will go to Supabase.

## 🧪 Testing

1. After completing the steps above, open your app
2. Make a change (create a task, etc.)
3. Check your Supabase dashboard → **Table Editor** to see if data appears
4. Refresh the page - your data should persist

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Restart your dev server after creating/updating `.env.local`
- Check that the variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Table doesn't exist"
- Make sure you ran the SQL schema in Step 3
- Check Supabase dashboard → **Table Editor** to verify tables exist
- You should see: tasks, projects, columns, categories, achievements, daily_stats, user_stats, settings, role_growth_goals, team_member_details

### "Invalid API key"
- Verify you're using the **anon public** key (not the service_role key)
- The key should start with `eyJ`
- Make sure there are no extra spaces or quotes in `.env.local`

### Data not appearing in Supabase
- Check the browser console for errors
- Verify your Supabase project is active (not paused)
- Check Supabase dashboard → **Logs** → **API** for any errors

## 📚 Files Created

- `lib/supabase/client.ts` - Supabase client initialization
- `lib/supabase/db.ts` - Database helper functions (load/save)
- `lib/supabase/schema.sql` - SQL schema for all tables
- `lib/supabase/README.md` - Detailed setup instructions

## 🎉 Once Complete

Your app will:
- ✅ Store all data in Supabase (cloud database)
- ✅ Sync across devices/browsers
- ✅ Have a backup in localStorage
- ✅ Work offline (falls back to localStorage if Supabase unavailable)
