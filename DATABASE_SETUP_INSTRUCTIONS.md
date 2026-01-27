# Database Setup Instructions

## Quick Start

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/lwkctkpqtzctvxfydmxu
   - Make sure your project is active (not paused)

2. **Open SQL Editor**
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

3. **Copy and Paste the Schema**
   - Open the file: `lib/supabase/schema.sql`
   - Copy ALL the contents (Ctrl+A, Ctrl+C / Cmd+A, Cmd+C)
   - Paste into the SQL Editor

4. **Run the Schema**
   - Click **Run** button (or press Cmd/Ctrl + Enter)
   - Wait for it to complete (should take a few seconds)

5. **Verify Tables Were Created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - ✅ tasks
     - ✅ projects
     - ✅ columns
     - ✅ categories
     - ✅ achievements
     - ✅ daily_stats
     - ✅ user_stats
     - ✅ settings
     - ✅ role_growth_goals
     - ✅ team_member_details

## What the Schema Creates

The schema creates 10 tables with all the necessary fields for your application:

- **tasks** - All your tasks with priorities, status, dates, etc.
- **projects** - Project information with progress tracking
- **columns** - Kanban board columns
- **categories** - Task categories within columns
- **achievements** - User achievements and progress
- **daily_stats** - Daily productivity statistics
- **user_stats** - Overall user statistics
- **settings** - Application settings
- **role_growth_goals** - Role-based growth goals
- **team_member_details** - Team member information and tracking

## After Running the Schema

Once the tables are created:

1. Your app will automatically start using Supabase (if environment variables are set)
2. Existing localStorage data will be migrated on first save
3. All new data will be stored in Supabase

## Troubleshooting

**Error: "relation already exists"**
- Some tables might already exist. The schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to run again
- If you want to start fresh, you can drop tables first (be careful - this deletes data!)

**Error: "permission denied"**
- Make sure you're running this in the SQL Editor, not in a restricted query
- Check that your Supabase project is active

**Tables not showing up**
- Refresh the Table Editor page
- Check the SQL Editor for any error messages
- Verify the query completed successfully (green checkmark)
