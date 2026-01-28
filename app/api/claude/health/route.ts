import { NextRequest } from 'next/server'
import { verifyApiKey, createErrorResponse, createSuccessResponse } from '@/lib/api/auth'
import { supabaseService } from '@/lib/supabase/service-client'

export async function GET(request: NextRequest) {
  // Optional API key check for health endpoint
  const apiKey = request.headers.get('x-api-key')
  if (apiKey && !verifyApiKey(request)) {
    return createErrorResponse('Invalid API key', 401)
  }

  try {
    if (!supabaseService) {
      return createErrorResponse('Supabase service client not configured. SUPABASE_SERVICE_ROLE_KEY is required.', 500)
    }

    // Test database connection
    const { data, error } = await supabaseService
      .from('team_member_details')
      .select('name')
      .limit(1)

    if (error) {
      return createErrorResponse(`Database connection failed: ${error.message}`, 500)
    }

    return createSuccessResponse({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return createErrorResponse(`Health check failed: ${error.message}`, 500)
  }
}
