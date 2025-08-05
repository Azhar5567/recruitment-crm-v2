import { NextRequest } from 'next/server'
import { getAuth } from 'firebase-admin/auth'

export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header or invalid format')
      return null
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('Verifying token...')
    const decodedToken = await getAuth().verifyIdToken(token)
    console.log('Token verified successfully for user:', decodedToken.uid)
    return decodedToken.uid
  } catch (error) {
    console.error('Failed to verify auth token:', error)
    return null
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized - Invalid or missing authentication token' }),
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}