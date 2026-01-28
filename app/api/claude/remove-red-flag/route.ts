import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function POST(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    const body = await request.json()
    const { name, flag } = body

    // Validation
    if (!name || !flag) {
      return createErrorResponse('Missing required fields: name, flag', 400)
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

    // Parse existing red flags
    const existingRedFlags = typeof member.redFlags === 'string'
      ? JSON.parse(member.redFlags)
      : (member.redFlags || [])

    // Handle both old format (string array) and new format (object array)
    let updatedRedFlags: any[]
    
    if (Array.isArray(existingRedFlags) && existingRedFlags.length > 0 && typeof existingRedFlags[0] === 'string') {
      // Old format: remove by text match
      updatedRedFlags = existingRedFlags.filter((f: string) => f !== flag)
    } else {
      // New format: remove by id or text match
      updatedRedFlags = existingRedFlags.filter((f: any) => {
        if (typeof f === 'string') {
          return f !== flag
        }
        // Try to match by id first, then by text
        return f.id !== flag && f.text !== flag
      })
    }

    // Save to database
    const { data: updated, error: updateError } = await supabaseService
      .from('team_member_details')
      .update({
        redFlags: JSON.stringify(updatedRedFlags),
        updatedAt: new Date().toISOString()
      })
      .eq('name', name)
      .select()
      .single()

    if (updateError) {
      return createErrorResponse(`Failed to remove red flag: ${updateError.message}`, 500)
    }

    return createSuccessResponse({
      removed: flag,
      totalRedFlags: updatedRedFlags.length,
      openRedFlags: Array.isArray(updatedRedFlags) && updatedRedFlags.length > 0 && typeof updatedRedFlags[0] === 'object'
        ? updatedRedFlags.filter((f: any) => f.status === 'open').length
        : updatedRedFlags.length
    })
  } catch (error: any) {
    return createErrorResponse(`Failed to remove red flag: ${error.message}`, 500)
  }
}
