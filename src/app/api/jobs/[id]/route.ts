import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

const COLLECTION = 'jobs'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Job Update Request ===')
    console.log('Job ID:', params.id)
    
    const userId = await verifyAuthToken(request)
    if (!userId) {
      console.log('Authentication failed')
      return createUnauthorizedResponse()
    }
    console.log('User ID:', userId)

    const body = await request.json()
    const { title, description, location, type, salary_min, salary_max, status, deadline } = body
    console.log('Update data:', { title, description, location, type, salary_min, salary_max, status, deadline })

    if (!title) {
      return NextResponse.json({ 
        error: 'title is required' 
      }, { status: 400 })
    }

    // Get the job document
    const docRef = adminDb.collection(COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      console.log('Job not found in database')
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobData = doc.data()
    console.log('Existing job data:', jobData)
    if (jobData?.userId !== userId) {
      console.log('Unauthorized: job userId:', jobData?.userId, 'request user_id:', userId)
      return NextResponse.json({ 
        error: 'Unauthorized - You can only edit jobs you created',
        details: `Job belongs to user ${jobData?.userId}, but you are user ${userId}`
      }, { status: 403 })
    }

    const now = new Date().toISOString()
    const updateData: Record<string, unknown> = {
      title,
      description: description || '',
      location: location || '',
      type: type || 'Full-time',
      salary_min: salary_min || null,
      salary_max: salary_max || null,
      status: status || 'Open',
      updated_at: now,
    }

    // Only add deadline if it's provided and not undefined
    if (deadline !== undefined) {
      updateData.deadline = deadline
    }

    await docRef.update(updateData)

    const updatedDoc = await docRef.get()
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() })
  } catch (error) {
    console.error('Failed to update job:', error)
    return NextResponse.json({ 
      error: 'Failed to update job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    // Get the job document
    const docRef = adminDb.collection(COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const jobData = doc.data()
    if (jobData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete job:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
} 