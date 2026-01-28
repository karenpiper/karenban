import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    const body = await request.json()
    const { name, title, description, targetDate, milestones } = body

    // Validation
    if (!name || !title) {
      return createErrorResponse('Missing required fields: name, title', 400)
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

    // Create new goal
    const newGoal = {
      id: `goal-${Date.now()}-${Math.random()}`,
      title: title,
      description: description || null,
      status: 'not-started',
      createdAt: new Date().toISOString(),
      targetDate: targetDate ? new Date(targetDate).toISOString() : null,
      completedAt: null,
      milestones: milestones || [],
      notes: []
    }

    // Append to goals array
    const updatedGoals = [...existingGoals, newGoal]

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
      return createErrorResponse(`Failed to add goal: ${updateError.message}`, 500)
    }

    return createSuccessResponse({
      goal: newGoal,
      totalGoals: updatedGoals.length
    })
  } catch (error: any) {
    return createErrorResponse(`Failed to add goal: ${error.message}`, 500)
  }
}
