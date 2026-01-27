import { supabase } from './client'
import { saveAppState } from './db'
import { loadAppStateSync, STORAGE_KEY } from '@/data/seed'
import type { AppState } from '@/types'

/**
 * Check if Supabase has any data
 */
export async function hasSupabaseData(): Promise<boolean> {
  if (!supabase) return false

  try {
    const [tasksResult, projectsResult] = await Promise.all([
      supabase.from('tasks').select('id').limit(1),
      supabase.from('projects').select('id').limit(1),
    ])

    return (tasksResult.data && tasksResult.data.length > 0) || 
           (projectsResult.data && projectsResult.data.length > 0)
  } catch (error) {
    console.error('Error checking Supabase data:', error)
    return false
  }
}

/**
 * Migrate data from localStorage to Supabase
 */
export async function migrateLocalStorageToSupabase(): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot migrate')
    return false
  }

  try {
    // Check if Supabase already has data
    const hasData = await hasSupabaseData()
    if (hasData) {
      console.log('Supabase already has data, skipping migration')
      return false
    }

    // Load from localStorage
    const localData = loadAppStateSync()
    
    // Check if localStorage has meaningful data
    const hasLocalData = localData.tasks.length > 0 || 
                        localData.projects.length > 0 ||
                        localData.columns.length > 0

    if (!hasLocalData) {
      console.log('No localStorage data to migrate')
      return false
    }

    console.log('Migrating localStorage data to Supabase...')
    console.log(`- ${localData.tasks.length} tasks`)
    console.log(`- ${localData.projects.length} projects`)
    console.log(`- ${localData.columns.length} columns`)
    console.log(`- ${Object.keys(localData.teamMemberDetails).length} team members`)

    // Save to Supabase
    const success = await saveAppState(localData)
    
    if (success) {
      console.log('✅ Migration successful! Data has been copied to Supabase.')
      return true
    } else {
      console.error('❌ Migration failed: Could not save to Supabase')
      return false
    }
  } catch (error) {
    console.error('Error during migration:', error)
    return false
  }
}

/**
 * Check if migration is needed and perform it
 */
export async function checkAndMigrate(): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    const hasData = await hasSupabaseData()
    if (hasData) {
      return false // Already migrated or has data
    }

    // Check localStorage
    if (typeof window === 'undefined') {
      return false
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return false // No localStorage data
    }

    // Perform migration
    return await migrateLocalStorageToSupabase()
  } catch (error) {
    console.error('Error checking migration status:', error)
    return false
  }
}
