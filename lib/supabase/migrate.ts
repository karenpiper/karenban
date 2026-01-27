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
export async function migrateLocalStorageToSupabase(force: boolean = false): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot migrate')
    return false
  }

  try {
    // Check if Supabase already has data (unless forcing)
    if (!force) {
      const hasData = await hasSupabaseData()
      if (hasData) {
        console.log('Supabase already has data, skipping migration. Use force=true to override.')
        return false
      }
    }

    // Load from localStorage
    const localData = loadAppStateSync()
    
    // Check if localStorage has meaningful data
    const hasLocalData = localData.tasks.length > 0 || 
                        localData.projects.length > 0 ||
                        localData.columns.length > 0 ||
                        Object.keys(localData.teamMemberDetails).length > 0

    if (!hasLocalData) {
      console.log('No localStorage data to migrate')
      return false
    }

    console.log('Migrating localStorage data to Supabase...')
    console.log(`- ${localData.tasks.length} tasks`)
    console.log(`- ${localData.projects.length} projects`)
    console.log(`- ${localData.columns.length} columns`)
    console.log(`- ${Object.keys(localData.teamMemberDetails).length} team members with details`)
    
    // Log team member details for debugging
    Object.keys(localData.teamMemberDetails).forEach(name => {
      const details = localData.teamMemberDetails[name]
      console.log(`  Team member "${name}":`, {
        goals: details.goals?.length || 0,
        oneOnOnes: details.oneOnOnes?.length || 0,
        moraleCheckIns: details.moraleCheckIns?.length || 0,
        performanceCheckIns: details.performanceCheckIns?.length || 0,
        clients: details.clients?.length || 0,
        redFlags: details.redFlags?.length || 0,
      })
    })

    // Sync team members from categories to team_member_details before saving
    const { syncTeamMembersFromCategories } = await import('./sync-team-members')
    await syncTeamMembersFromCategories(localData)
    
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
 * Force migrate team member data from localStorage to Supabase
 * This will update team_member_details even if Supabase already has other data
 */
export async function forceMigrateTeamData(): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not configured, cannot migrate')
    return false
  }

  try {
    // Load from localStorage
    const localData = loadAppStateSync()
    
    // Check if localStorage has team member data
    const teamMemberCount = Object.keys(localData.teamMemberDetails).length
    if (teamMemberCount === 0) {
      console.log('No team member data in localStorage to migrate')
      return false
    }

    console.log(`Force migrating ${teamMemberCount} team members from localStorage to Supabase...`)
    
    // Log what we're migrating
    Object.keys(localData.teamMemberDetails).forEach(name => {
      const details = localData.teamMemberDetails[name]
      console.log(`  Migrating "${name}":`, {
        goals: details.goals?.length || 0,
        oneOnOnes: details.oneOnOnes?.length || 0,
        moraleCheckIns: details.moraleCheckIns?.length || 0,
        performanceCheckIns: details.performanceCheckIns?.length || 0,
        clients: details.clients?.length || 0,
        redFlags: details.redFlags?.length || 0,
        reviewCycles: details.reviewCycles?.length || 0,
        growthGoals: details.growthGoals?.length || 0,
      })
    })

    // Sync team members from categories first
    const { syncTeamMembersFromCategories } = await import('./sync-team-members')
    await syncTeamMembersFromCategories(localData)
    
    // Save only team member details to Supabase
    const teamMembers = Object.values(localData.teamMemberDetails)
    
    const { error } = await supabase.from('team_member_details').upsert(
      teamMembers.map(m => ({
        name: m.name,
        discipline: m.discipline || null,
        level: m.level || null,
        morale: m.morale || null,
        performance: m.performance || null,
        clients: m.clients || [],
        redFlags: m.redFlags || [],
        notes: m.notes || null,
        updatedAt: m.updatedAt.toISOString(),
        growthGoals: JSON.stringify(m.growthGoals || []),
        goals: JSON.stringify(m.goals.map(g => ({
          ...g,
          createdAt: g.createdAt.toISOString(),
          targetDate: g.targetDate?.toISOString() || null,
          completedAt: g.completedAt?.toISOString() || null,
          milestones: (g.milestones || []).map(milestone => ({
            ...milestone,
            targetDate: milestone.targetDate?.toISOString() || null,
            completedAt: milestone.completedAt?.toISOString() || null,
          })),
          notes: (g.notes || []).map(note => ({
            ...note,
            date: note.date.toISOString(),
            createdAt: note.createdAt.toISOString(),
          })),
        }))),
        clientDetails: JSON.stringify(m.clientDetails || {}),
        reviewCycles: JSON.stringify(m.reviewCycles.map(c => ({
          ...c,
          startDate: c.startDate.toISOString(),
          endDate: c.endDate.toISOString(),
          createdAt: c.createdAt.toISOString(),
        }))),
        oneOnOnes: JSON.stringify(m.oneOnOnes.map(o => ({
          ...o,
          date: o.date.toISOString(),
          createdAt: o.createdAt.toISOString(),
        }))),
        moraleCheckIns: JSON.stringify(m.moraleCheckIns.map(c => ({
          ...c,
          date: c.date.toISOString(),
          createdAt: c.createdAt.toISOString(),
        }))),
        performanceCheckIns: JSON.stringify(m.performanceCheckIns.map(c => ({
          ...c,
          date: c.date.toISOString(),
          createdAt: c.createdAt.toISOString(),
        }))),
      })),
      { onConflict: 'name' }
    )

    if (error) {
      console.error('❌ Failed to migrate team data:', error)
      return false
    }

    console.log('✅ Team member data migration successful!')
    return true
  } catch (error) {
    console.error('Error during team data migration:', error)
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
