import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

// Collection name for sheet-based candidates
const COLLECTION = 'candidate_sheets'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const clientName = searchParams.get('clientName')
    const jobTitle = searchParams.get('jobTitle')

    if (!clientName || !jobTitle) {
      return NextResponse.json({ 
        error: 'clientName and jobTitle are required' 
      }, { status: 400 })
    }

    // Create sheet name by combining client and job
    const sheetName = `${clientName}_${jobTitle}`

    // Fetch candidates for this specific sheet
    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('sheetName', '==', sheetName)
      .get()
    
    const candidates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return NextResponse.json(candidates)
  } catch (error) {
    console.error('Failed to fetch sheet candidates:', error)
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
      candidateName,
      email,
      status = 'New',
      clientName,
      jobTitle,
    } = body

    if (!candidateName || !email || !clientName || !jobTitle) {
      return NextResponse.json({ 
        error: 'candidateName, email, clientName, and jobTitle are required' 
      }, { status: 400 })
    }

    // Create sheet name by combining client and job
    const sheetName = `${clientName}_${jobTitle}`

    const now = new Date().toISOString()
    const candidateData = {
      userId,
      candidateName,
      email,
      status,
      clientName,
      jobTitle,
      sheetName,
      createdAt: now,
      updatedAt: now,
    }
    
    const docRef = await adminDb.collection(COLLECTION).add(candidateData)
    const newDoc = await docRef.get()
    const result = { id: newDoc.id, ...newDoc.data() }
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Failed to create sheet candidate:', error)
    return NextResponse.json({ 
      error: 'Failed to create candidate'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    
    const { id, candidateName, email, status } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Get current candidate to verify ownership
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const currentData = doc.data()
    if (currentData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    }

    if (candidateName !== undefined) updateData.candidateName = candidateName
    if (email !== undefined) updateData.email = email
    if (status !== undefined) updateData.status = status

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    const result = { id: updatedDoc.id, ...updatedDoc.data() }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to update sheet candidate:', error)
    return NextResponse.json({ 
      error: 'Failed to update candidate'
    }, { status: 500 })
  }
} 