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
    console.log('=== Sheet Candidate Creation Started ===')
    
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      console.log('Authentication failed - no userId')
      return createUnauthorizedResponse()
    }
    console.log('Authentication successful - userId:', userId)

    const body = await request.json()
    console.log('Request body:', body)
    
    const {
      candidateName,
      email,
      status = 'New',
      clientName,
      jobTitle,
    } = body

    if (!candidateName || !email || !clientName || !jobTitle) {
      console.log('Validation failed - missing required fields:', {
        candidateName: !!candidateName,
        email: !!email,
        clientName: !!clientName,
        jobTitle: !!jobTitle
      })
      return NextResponse.json({ 
        error: 'candidateName, email, clientName, and jobTitle are required' 
      }, { status: 400 })
    }

    // Create sheet name by combining client and job
    const sheetName = `${clientName}_${jobTitle}`
    console.log('Creating candidate with sheet name:', sheetName)

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
    
    console.log('Candidate data to save:', candidateData)
    const docRef = await adminDb.collection(COLLECTION).add(candidateData)
    console.log('Document added successfully, docRef:', docRef.id)

    const newDoc = await docRef.get()
    const result = { id: newDoc.id, ...newDoc.data() }
    console.log('Sheet candidate created successfully:', result)
    console.log('=== Sheet Candidate Creation Completed ===')
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('=== Sheet Candidate Creation Failed ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Failed to create candidate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== Sheet Candidate Update Started ===')
    
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      console.log('Authentication failed - no userId')
      return createUnauthorizedResponse()
    }
    console.log('Authentication successful - userId:', userId)

    const body = await request.json()
    console.log('Update request body:', body)
    
    const { id, candidateName, email, status } = body

    if (!id) {
      console.log('Validation failed - missing id')
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Get current candidate to verify ownership
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      console.log('Candidate not found:', id)
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const currentData = doc.data()
    console.log('Existing candidate data:', currentData)
    
    if (currentData?.userId !== userId) {
      console.log('Unauthorized: candidate userId:', currentData?.userId, 'request userId:', userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    }

    if (candidateName !== undefined) updateData.candidateName = candidateName
    if (email !== undefined) updateData.email = email
    if (status !== undefined) updateData.status = status

    console.log('Update data:', updateData)
    await docRef.update(updateData)
    console.log('Document updated successfully')

    const updatedDoc = await docRef.get()
    const result = { id: updatedDoc.id, ...updatedDoc.data() }
    console.log('Sheet candidate updated successfully:', result)
    console.log('=== Sheet Candidate Update Completed ===')
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('=== Sheet Candidate Update Failed ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({ 
      error: 'Failed to update candidate',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 