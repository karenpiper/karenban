import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest) {
  if (!verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    if (!supabaseService) {
      return createErrorResponse('Supabase service client not configured', 500)
    }

    const { data, error } = await supabaseService
      .from('team_member_details')
      .select('name, morale, performance, redFlags, oneOnOnes, updatedAt')
      .order('name')

    if (error) {
      return createErrorResponse(`Database error: ${error.message}`, 500)
    }

    if (!data || data.length === 0) {
      return createSuccessResponse([])
    }

    const now = new Date()
    const pulse = data.map(member => {
      // Parse JSONB fields
      const redFlags = typeof member.redFlags === 'string' 
        ? JSON.parse(member.redFlags) 
        : (member.redFlags || [])
      const oneOnOnes = typeof member.oneOnOnes === 'string' 
        ? JSON.parse(member.oneOnOnes) 
        : (member.oneOnOnes || [])

      // Count open red flags
      const openRedFlags = Array.isArray(redFlags) 
        ? redFlags.filter((f: any) => f.status === 'open' || typeof f === 'string').length
        : 0

      // Find most recent 1:1
      let daysSinceLastOneOnOne: number | null = null
      if (Array.isArray(oneOnOnes) && oneOnOnes.length > 0) {
        const dates = oneOnOnes
          .map((o: any) => {
            const dateStr = o.date || o.createdAt
            return dateStr ? new Date(dateStr) : null
          })
          .filter((d: Date | null) => d !== null) as Date[]
        
        if (dates.length > 0) {
          const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())))
          daysSinceLastOneOnOne = Math.floor((now.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))
        }
      }

      return {
        name: member.name,
        morale: member.morale || null,
        performance: member.performance || null,
        redFlags: openRedFlags,
        daysSinceLastOneOnOne,
        lastUpdated: member.updatedAt
      }
    })

    return createSuccessResponse(pulse)
  } catch (error: any) {
    return createErrorResponse(`Failed to fetch team pulse: ${error.message}`, 500)
  }
}
