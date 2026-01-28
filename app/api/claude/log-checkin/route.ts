import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    const body = await request.json()
    const { name, type, rating, notes, date } = body

    // Validation
    if (!name || !type || !rating) {
      return createErrorResponse('Missing required fields: name, type, rating', 400)
    }

    if (type !== 'morale' && type !== 'performance') {
      return createErrorResponse('Type must be "morale" or "performance"', 400)
    }

    const validRatings = ['excellent', 'good', 'fair', 'poor']
    if (!validRatings.includes(rating)) {
      return createErrorResponse(`Rating must be one of: ${validRatings.join(', ')}`, 400)
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

    // Parse existing check-ins
    const checkInField = type === 'morale' ? 'moraleCheckIns' : 'performanceCheckIns'
    const existingCheckIns = typeof member[checkInField] === 'string'
      ? JSON.parse(member[checkInField])
      : (member[checkInField] || [])

    // Create new check-in
    const newCheckIn = {
      id: `checkin-${Date.now()}-${Math.random()}`,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      [type === 'morale' ? 'morale' : 'performance']: rating,
      notes: notes || null,
      createdAt: new Date().toISOString()
    }

    // Append to check-ins array
    const updatedCheckIns = [...existingCheckIns, newCheckIn]

    // Update the current morale/performance field
    const updateData: any = {
      [checkInField]: JSON.stringify(updatedCheckIns),
      updatedAt: new Date().toISOString()
    }

    if (type === 'morale') {
      updateData.morale = rating
    } else {
      updateData.performance = rating
    }

    // Save to database
    const { data: updated, error: updateError } = await supabaseService
      .from('team_member_details')
      .update(updateData)
      .eq('name', name)
      .select()
      .single()

    if (updateError) {
      return createErrorResponse(`Failed to update check-in: ${updateError.message}`, 500)
    }

    return createSuccessResponse({
      checkIn: newCheckIn,
      currentRating: rating,
      totalCheckIns: updatedCheckIns.length
    })
  } catch (error: any) {
    return createErrorResponse(`Failed to log check-in: ${error.message}`, 500)
  }
}
