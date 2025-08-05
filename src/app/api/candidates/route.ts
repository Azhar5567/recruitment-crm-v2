import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

// Collection name
const COLLECTION = 'candidates'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Fetching Candidates ===')
    
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      console.log('Authentication failed - no userId')
      return createUnauthorizedResponse()
    }
    console.log('Authentication successful - userId:', userId)

    // Fetch only candidates belonging to this user
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get()
    
    console.log('Candidates found:', snapshot.docs.length)
    
    const candidates = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        user_id: data.userId,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || '',
        position: data.position || '',
        location: data.location || '',
        experience_years: data.experience_years || 0,
        status: data.status || 'New',
        rating: data.rating || 0,
        notes: data.notes || '',
        client: data.client || '',
        role: data.role || '',
        created_at: data.createdAt,
        updated_at: data.updatedAt
      }
    })
    return NextResponse.json(candidates)
  } catch (error) {
    console.error('Failed to fetch candidates:', error)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const {
      full_name,
      email,
      phone = '',
      position = '',
      location = '',
      experience_years = 0,
      status = 'New',
      rating = 0,
      notes = '',
      client = '',
      role = '',
    } = body

    if (!full_name || !email) {
      return NextResponse.json({ error: 'full_name and email are required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const docRef = await adminDb.collection(COLLECTION).add({
      userId, // Associate candidate with the authenticated user
      full_name,
      email,
      phone,
      position,
      location,
      experience_years,
      status,
      rating,
      notes,
      client,
      role,
      createdAt: now,
      updatedAt: now,
    })

    const newDoc = await docRef.get()
    return NextResponse.json({ id: newDoc.id, ...newDoc.data() }, { status: 201 })
  } catch (error) {
    console.error('Failed to create candidate:', error)
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 })
  }
}