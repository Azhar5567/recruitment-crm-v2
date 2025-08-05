import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

const COLLECTION = 'jobs'

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    const snapshot = await adminDb
      .collection(COLLECTION)
      .where('userId', '==', userId)
      .get()
    
    const jobs = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        user_id: data.userId,
        client_id: data.client_id,
        title: data.title,
        description: data.description,
        location: data.location,
        type: data.type,
        salary_min: data.salary_min,
        salary_max: data.salary_max,
        status: data.status,
        applications_count: data.applications_count || 0,
        posted_date: data.posted_date,
        deadline: data.deadline,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    })
    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Job Creation Started ===')
    
    const userId = await verifyAuthToken(request)
    if (!userId) {
      console.log('Authentication failed - no userId')
      return createUnauthorizedResponse()
    }
    console.log('Authentication successful - userId:', userId)

    const body = await request.json()
    const { title, description, client_id, location = '', type = 'Full-time', salary_min, salary_max, status = 'Open', deadline } = body

    if (!title || !client_id) {
      console.log('Validation failed - missing title or client_id')
      return NextResponse.json({ error: 'title and client_id are required' }, { status: 400 })
    }

    console.log('Creating job with data:', { userId, title, client_id, type })

    const now = new Date().toISOString()
    const jobData: Record<string, unknown> = {
      userId,
      title,
      description: description || '',
      client_id,
      location,
      type,
      salary_min: salary_min ? parseInt(salary_min) : null,
      salary_max: salary_max ? parseInt(salary_max) : null,
      status,
      applications_count: 0,
      posted_date: now,
      created_at: now,
      updated_at: now,
    }

    // Only add deadline if it's provided and not undefined
    if (deadline && deadline !== undefined) {
      jobData.deadline = deadline
    }

    console.log('Job data to save:', jobData)
    console.log('Attempting to add document to Firestore...')

    const docRef = await adminDb.collection(COLLECTION).add(jobData)
    console.log('Document added successfully, docRef:', docRef.id)

    const newDoc = await docRef.get()
    const result = { id: newDoc.id, ...newDoc.data() }
    console.log('Job created successfully:', result)
    console.log('=== Job Creation Completed ===')
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('=== Job Creation Failed ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'No message')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('Full error object:', error)
    return NextResponse.json({ 
      error: 'Failed to create job', 
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: typeof error,
      fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
    }, { status: 500 })
  }
}
