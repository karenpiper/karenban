# Data Migration Guide

## Automatic Migration

The app now automatically migrates data from localStorage to Supabase when:
1. Supabase is configured (environment variables are set)
2. Supabase database is empty (no tasks, projects, or columns)
3. localStorage has data

## How It Works

1. **On App Load**: The app tries to load from Supabase
2. **If Supabase is Empty**: It checks localStorage for data
3. **If localStorage has data**: It automatically migrates to Supabase
4. **After Migration**: The app loads from Supabase going forward

## Manual Migration

If you want to manually trigger a migration, you can:

1. Open browser console (F12)
2. Run this command:
```javascript
import('@/lib/supabase/migrate').then(m => m.migrateLocalStorageToSupabase())
```

## Verify Migration

After migration, check:

1. **Browser Console**: Look for "✅ Migration successful!" message
2. **Supabase Dashboard**: 
   - Go to Table Editor
   - Check `tasks`, `projects`, `columns` tables
   - You should see your data there
3. **App Behavior**: 
   - Refresh the page
   - Your data should still be there (now from Supabase)

## Troubleshooting

### Migration doesn't happen automatically
- Check browser console for errors
- Verify environment variables are set correctly
- Make sure Supabase tables exist
- Check that localStorage has data

### Data appears in both places
- This is normal! localStorage is kept as a backup
- Supabase is the primary source now
- You can clear localStorage after verifying Supabase works

### Migration fails
- Check Supabase dashboard for errors
- Verify your anon key has write permissions
- Check browser console for specific error messages
