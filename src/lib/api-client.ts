import { auth } from '@/lib/firebase'

export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    if (!auth?.currentUser) {
      return Promise.reject(new Error('User not authenticated'))
    }
    
    const token = await auth.currentUser.getIdToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return Promise.reject(new Error('Authentication failed'))
  }
}

export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAuthHeaders()
  
  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  })
}