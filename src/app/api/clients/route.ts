import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

const COLLECTION = 'clients'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    // Fetch only clients belonging to this user
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get()
    
    const clients = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        user_id: data.userId,
        name: data.name,
        industry: data.industry || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        location: data.location || '',
        status: data.status || 'Cold',
        employees_range: data.employees_range || '',
        revenue_range: data.revenue_range || '',
        notes: data.notes || '',
        created_at: data.createdAt,
        updated_at: data.updatedAt
      }
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Failed to fetch clients:', error)
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 })
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
      name,
      industry = '',
      email = '',
      phone = '',
      website = '',
      location = '',
      status = 'Cold',
      employees_range = '',
      revenue_range = '',
      notes = '',
    } = body

    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const docRef = await adminDb.collection(COLLECTION).add({
      userId, // Associate client with the authenticated user
      name,
      industry,
      email,
      phone,
      website,
      location,
      status,
      employees_range,
      revenue_range,
      notes,
      createdAt: now,
      updatedAt: now,
    })

    const newDoc = await docRef.get()
    return NextResponse.json({ id: newDoc.id, ...newDoc.data() }, { status: 201 })
  } catch (error) {
    console.error('Failed to create client:', error)
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
  }
}