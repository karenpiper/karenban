import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    const body = await request.json()
    const { name, date, discussionNotes, followUps, decisions, morale, performance } = body

    // Validation
    if (!name || !discussionNotes) {
      return createErrorResponse('Missing required fields: name, discussionNotes', 400)
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

    // Parse existing one-on-ones
    const existingOneOnOnes = typeof member.oneOnOnes === 'string'
      ? JSON.parse(member.oneOnOnes)
      : (member.oneOnOnes || [])

    // Create new 1:1 entry
    const newOneOnOne = {
      id: `oneonone-${Date.now()}-${Math.random()}`,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      discussionNotes: discussionNotes,
      followUps: followUps || [],
      decisions: decisions || [],
      morale: morale || null,
      performance: performance || null,
      createdAt: new Date().toISOString()
    }

    // Append to one-on-ones array
    const updatedOneOnOnes = [...existingOneOnOnes, newOneOnOne]

    // Prepare update data
    const updateData: any = {
      oneOnOnes: JSON.stringify(updatedOneOnOnes),
      updatedAt: new Date().toISOString()
    }

    // If morale/performance provided, also log those check-ins
    if (morale) {
      const existingMoraleCheckIns = typeof member.moraleCheckIns === 'string'
        ? JSON.parse(member.moraleCheckIns)
        : (member.moraleCheckIns || [])
      
      const moraleCheckIn = {
        id: `checkin-${Date.now()}-${Math.random()}`,
        date: newOneOnOne.date,
        morale: morale,
        notes: `From 1:1 on ${new Date(newOneOnOne.date).toLocaleDateString()}`,
        createdAt: new Date().toISOString()
      }

      updateData.moraleCheckIns = JSON.stringify([...existingMoraleCheckIns, moraleCheckIn])
      updateData.morale = morale
    }

    if (performance) {
      const existingPerformanceCheckIns = typeof member.performanceCheckIns === 'string'
        ? JSON.parse(member.performanceCheckIns)
        : (member.performanceCheckIns || [])
      
      const performanceCheckIn = {
        id: `checkin-${Date.now()}-${Math.random()}`,
        date: newOneOnOne.date,
        performance: performance,
        notes: `From 1:1 on ${new Date(newOneOnOne.date).toLocaleDateString()}`,
        createdAt: new Date().toISOString()
      }

      updateData.performanceCheckIns = JSON.stringify([...existingPerformanceCheckIns, performanceCheckIn])
      updateData.performance = performance
    }

    // Save to database
    const { data: updated, error: updateError } = await supabaseService
      .from('team_member_details')
      .update(updateData)
      .eq('name', name)
      .select()
      .single()

    if (updateError) {
      return createErrorResponse(`Failed to log 1:1: ${updateError.message}`, 500)
    }

    return createSuccessResponse({
      oneOnOne: newOneOnOne,
      totalOneOnOnes: updatedOneOnOnes.length
    })
  } catch (error: any) {
    return createErrorResponse(`Failed to log 1:1: ${error.message}`, 500)
  }
}
