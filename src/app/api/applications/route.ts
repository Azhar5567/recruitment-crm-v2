import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

const COLLECTION = 'applications'

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const clientId = searchParams.get('clientId')
    const candidateId = searchParams.get('candidateId')

    let query = adminDb.collection(COLLECTION).where('userId', '==', userId)

    // Apply filters
    if (jobId) {
      query = query.where('jobId', '==', jobId)
    }
    if (clientId) {
      query = query.where('clientId', '==', clientId)
    }
    if (candidateId) {
      query = query.where('candidateId', '==', candidateId)
    }

    const snapshot = await query.get()
    const applications = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Failed to fetch applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
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
      candidateId,
      jobId,
      clientId,
      status = 'New',
      notes = '',
      appliedAt,
    } = body

    if (!candidateId || !jobId || !clientId) {
      return NextResponse.json({ 
        error: 'candidateId, jobId, and clientId are required' 
      }, { status: 400 })
    }

    // Check if application already exists
    const existingQuery = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .where('candidateId', '==', candidateId)
      .where('jobId', '==', jobId)
      .get()

    if (!existingQuery.empty) {
      return NextResponse.json({ 
        error: 'Application already exists for this candidate and job' 
      }, { status: 409 })
    }

    const now = new Date().toISOString()
    const docRef = await adminDb.collection(COLLECTION).add({
      userId,
      candidateId,
      jobId,
      clientId,
      status,
      notes,
      appliedAt: appliedAt || now,
      statusHistory: [
        {
          status,
          timestamp: now,
          notes: 'Application created'
        }
      ],
      createdAt: now,
      updatedAt: now,
    })

    const newDoc = await docRef.get()
    return NextResponse.json({ id: newDoc.id, ...newDoc.data() }, { status: 201 })
  } catch (error) {
    console.error('Failed to create application:', error)
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
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
    const { id, status, notes } = body

    if (!id || !status) {
      return NextResponse.json({ 
        error: 'id and status are required' 
      }, { status: 400 })
    }

    // Get current application to verify ownership and get history
    const docRef = adminDb.collection(COLLECTION).doc(id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const currentData = doc.data()
    if (currentData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const statusHistory = currentData?.statusHistory || []
    
    // Add new status to history
    statusHistory.push({
      status,
      timestamp: now,
      notes: notes || `Status updated to ${status}`
    })

    await docRef.update({
      status,
      notes: notes || currentData?.notes || '',
      statusHistory,
      updatedAt: now,
    })

    const updatedDoc = await docRef.get()
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() })
  } catch (error) {
    console.error('Failed to update application:', error)
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 })
  }
}