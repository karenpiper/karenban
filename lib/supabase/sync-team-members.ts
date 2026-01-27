import { supabase } from './client'
import { saveAppState } from './db'
import type { AppState } from '@/types'

/**
 * Sync team members from categories to team_member_details table
 * This ensures all team member categories have corresponding entries in team_member_details
 */
export async function syncTeamMembersFromCategories(state: AppState): Promise<boolean> {
  if (!supabase) {
    return false
  }

  try {
    const followUpColumn = state.columns.find(col => col.id === 'col-followup')
    if (!followUpColumn) {
      return false
    }

    let hasChanges = false
    const updatedTeamMemberDetails = { ...state.teamMemberDetails }

    // Find all team member categories
    for (const category of followUpColumn.categories) {
      if (category.isPerson && category.isTeamMember && category.personName) {
        const personName = category.personName || category.name
        
        // If team member details don't exist, create them
        if (!updatedTeamMemberDetails[personName]) {
          updatedTeamMemberDetails[personName] = {
            name: personName,
            goals: [],
            morale: null,
            performance: null,
            moraleCheckIns: [],
            performanceCheckIns: [],
            clients: [],
            clientDetails: {},
            redFlags: [],
            reviewCycles: [],
            oneOnOnes: [],
            growthGoals: [],
            updatedAt: new Date(),
          }
          hasChanges = true
        }
      }
    }

    // If we made changes, save the updated state
    if (hasChanges) {
      const updatedState = {
        ...state,
        teamMemberDetails: updatedTeamMemberDetails
      }
      return await saveAppState(updatedState)
    }

    return true
  } catch (error) {
    console.error('Error syncing team members:', error)
    return false
  }
}
