import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    if (!supabaseService) {
      return createErrorResponse('Supabase service client not configured', 500)
    }

    const { data, error } = await supabaseService
      .from('team_member_details')
      .select('*')
      .eq('name', decodeURIComponent(params.name))
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Team member not found', 404)
      }
      return createErrorResponse(`Database error: ${error.message}`, 500)
    }

    if (!data) {
      return createErrorResponse('Team member not found', 404)
    }

    // Parse JSONB fields
    const teamMember = {
      ...data,
      growthGoals: typeof data.growthGoals === 'string' ? JSON.parse(data.growthGoals) : (data.growthGoals || []),
      goals: typeof data.goals === 'string' ? JSON.parse(data.goals) : (data.goals || []),
      oneOnOnes: typeof data.oneOnOnes === 'string' ? JSON.parse(data.oneOnOnes) : (data.oneOnOnes || []),
      moraleCheckIns: typeof data.moraleCheckIns === 'string' ? JSON.parse(data.moraleCheckIns) : (data.moraleCheckIns || []),
      performanceCheckIns: typeof data.performanceCheckIns === 'string' ? JSON.parse(data.performanceCheckIns) : (data.performanceCheckIns || []),
      reviewCycles: typeof data.reviewCycles === 'string' ? JSON.parse(data.reviewCycles) : (data.reviewCycles || []),
      clientDetails: typeof data.clientDetails === 'string' ? JSON.parse(data.clientDetails) : (data.clientDetails || {}),
      redFlags: typeof data.redFlags === 'string' ? JSON.parse(data.redFlags) : (data.redFlags || []),
    }

    return createSuccessResponse(teamMember)
  } catch (error: any) {
    return createErrorResponse(`Failed to fetch team member: ${error.message}`, 500)
  }
}
