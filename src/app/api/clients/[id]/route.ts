import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyAuthToken, createUnauthorizedResponse } from '@/lib/auth-middleware'

const COLLECTION = 'clients'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyAuthToken(request)
    if (!userId) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const { name, industry, email, phone, website, location, status } = body

    if (!name) {
      return NextResponse.json({ 
        error: 'name is required' 
      }, { status: 400 })
    }

    // Get the client document
    const docRef = adminDb.collection(COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientData = doc.data()
    if (clientData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const now = new Date().toISOString()
    await docRef.update({
      name,
      industry: industry || '',
      email: email || '',
      phone: phone || '',
      website: website || '',
      location: location || '',
      status: status || 'Active',
      updatedAt: now,
    })

    const updatedDoc = await docRef.get()
    return NextResponse.json({ id: updatedDoc.id, ...updatedDoc.data() })
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
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

    // Get the client document
    const docRef = adminDb.collection(COLLECTION).doc(params.id)
    const doc = await docRef.get()

    if (!doc.exists) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const clientData = doc.data()
    if (clientData?.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 })
  }
} 