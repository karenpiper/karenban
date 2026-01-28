import { NextRequest } from 'next/server'

export function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.CLAUDE_API_KEY

  if (!expectedKey) {
    console.error('CLAUDE_API_KEY environment variable is not set')
    return false
  }

  return apiKey === expectedKey
}

export function createErrorResponse(message: string, status: number = 400) {
  return Response.json(
    { success: false, error: message },
    { status }
  )
}

export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json(
    { success: true, data },
    { status }
  )
}
