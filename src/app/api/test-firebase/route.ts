import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(_request: NextRequest) {
  try {
    console.log('Testing Firebase Admin connection...')
    
    // Test if we can access the database
    const testCollection = adminDb.collection('test')
    console.log('Test collection accessed successfully')
    
    // Test if we can add a document
    const testDoc = await testCollection.add({
      test: true,
      timestamp: new Date().toISOString()
    })
    console.log('Test document added successfully:', testDoc.id)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Firebase Admin is working',
      testDocId: testDoc.id
    })
  } catch (error) {
    console.error('Firebase Admin test failed:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
} 