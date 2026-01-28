import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    const body = await request.json()
    const { name, goalId, status, notes, milestones } = body

    // Validation
    if (!name || !goalId) {
      return createErrorResponse('Missing required fields: name, goalId', 400)
    }

    if (!supabaseService) {
      return createErrorResponse('Supabase service client not configured', 500)
    }

    // Get current team member data
    const { data: member, error: fetchError } = await supabaseService
      .from('team_member_details')
      .select('*')
      .eq('name', name)
      .single()

    if (fetchError || !member) {
      return createErrorResponse('Team member not found', 404)
    }

    // Parse existing goals
    const existingGoals = typeof member.goals === 'string'
      ? JSON.parse(member.goals)
      : (member.goals || [])

    // Find and update the goal
    const goalIndex = existingGoals.findIndex((g: any) => g.id === goalId)
    if (goalIndex === -1) {
      return createErrorResponse('Goal not found', 404)
    }

    const updatedGoal = {
      ...existingGoals[goalIndex],
      ...(status && { status }),
      ...(milestones !== undefined && { milestones }),
      ...(notes !== undefined && {
        notes: Array.isArray(notes) 
          ? notes 
          : [...(existingGoals[goalIndex].notes || []), {
              id: `note-${Date.now()}`,
              date: new Date().toISOString(),
              text: notes,
              createdAt: new Date().toISOString()
            }]
      }),
      ...(status === 'completed' && !existingGoals[goalIndex].completedAt && {
        completedAt: new Date().toISOString()
      })
    }

    // Update the goal in the array
    const updatedGoals = [...existingGoals]
    updatedGoals[goalIndex] = updatedGoal

    // Save to database
    const { data: updated, error: updateError } = await supabaseService
      .from('team_member_details')
      .update({
        goals: JSON.stringify(updatedGoals),
        updatedAt: new Date().toISOString()
      })
      .eq('name', name)
      .select()
      .single()

    if (updateError) {
      return createErrorResponse(`Failed to update goal: ${updateError.message}`, 500)
    }

    return createSuccessResponse({
      goal: updatedGoal,
      totalGoals: updatedGoals.length
    })
  } catch (error: any) {
    return createErrorResponse(`Failed to update goal: ${error.message}`, 500)
  }
}
